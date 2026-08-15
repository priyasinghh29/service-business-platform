<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Document;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentController extends Controller
{
    private const STORAGE_PLAN_BYTES = 10 * 1024 * 1024 * 1024; // 10 GB

    public function vault(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $documents = Document::query()
            ->where('user_id', $userId)
            ->where('status_flag', true)
            ->where('status', '!=', 'folder')
            ->latest()
            ->get();

        $available = $documents->where('status', 'available');
        $requests = $documents->whereIn('status', ['requested', 'pending'])->values();

        $usedBytes = (int) Document::query()
            ->where('user_id', $userId)
            ->where('status_flag', true)
            ->sum('file_size');

        $folderRows = Document::query()
            ->where('user_id', $userId)
            ->where('status_flag', true)
            ->where('status', '!=', 'folder')
            ->selectRaw('folder, COUNT(*) as count')
            ->groupBy('folder')
            ->orderBy('folder')
            ->get();

        $explicitFolders = Document::query()
            ->where('user_id', $userId)
            ->where('status', 'folder')
            ->where('status_flag', true)
            ->pluck('folder')
            ->filter()
            ->all();

        $folderMap = [];
        foreach ($folderRows as $row) {
            $name = $row->folder ?: 'General';
            $folderMap[$name] = (int) $row->count;
        }
        foreach ($explicitFolders as $name) {
            $folderMap[$name] = $folderMap[$name] ?? 0;
        }
        if ($folderMap === []) {
            $folderMap['General'] = 0;
        }

        $folders = collect($folderMap)
            ->map(fn ($count, $name) => ['name' => $name, 'count' => $count])
            ->sortBy('name')
            ->values()
            ->all();

        $activity = $documents
            ->take(12)
            ->map(fn (Document $doc) => [
                'id' => 'doc-'.$doc->id,
                'actor' => $doc->uploaded_by ?: 'You',
                'action' => match ($doc->status) {
                    'requested', 'pending' => 'requested '.$doc->name,
                    default => 'uploaded '.$doc->name,
                },
                'timestamp' => optional($doc->updated_at ?? $doc->created_at)->diffForHumans(),
                'created_at' => optional($doc->updated_at ?? $doc->created_at)->toIso8601String(),
            ])
            ->values()
            ->all();

        return ApiResponse::success([
            'storage' => [
                'used_bytes' => $usedBytes,
                'plan_bytes' => self::STORAGE_PLAN_BYTES,
                'used_label' => $this->formatBytes($usedBytes),
                'plan_label' => $this->formatBytes(self::STORAGE_PLAN_BYTES),
                'used_percent' => (int) min(100, round(($usedBytes / self::STORAGE_PLAN_BYTES) * 100)),
            ],
            'folders' => $folders,
            'pending_requests' => $requests->map(fn (Document $doc) => $this->mapDocument($doc))->values(),
            'files' => $available->map(fn (Document $doc) => $this->mapDocument($doc))->values(),
            'all_files' => $documents->map(fn (Document $doc) => $this->mapDocument($doc))->values(),
            'activity' => $activity,
            'bookings' => Booking::query()
                ->with('service:id,name')
                ->where('user_id', $userId)
                ->whereNotIn('status', ['cancelled'])
                ->latest()
                ->limit(20)
                ->get()
                ->map(fn (Booking $b) => [
                    'id' => $b->id,
                    'label' => ($b->service?->name ?? 'Service').' ('.$b->booking_number.')',
                ])
                ->values(),
        ], 'Document vault retrieved');
    }

    public function index(Request $request): JsonResponse
    {
        $documents = Document::query()
            ->where('user_id', $request->user()->id)
            ->where('status_flag', true)
            ->where('status', '!=', 'folder')
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->when($request->filled('folder'), fn ($q) => $q->where('folder', $request->string('folder')))
            ->latest()
            ->paginate((int) $request->input('per_page', 30));

        $documents->setCollection(
            $documents->getCollection()->map(fn (Document $doc) => $this->mapDocument($doc))
        );

        return ApiResponse::success($documents, 'Documents retrieved');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'folder' => ['nullable', 'string', 'max:100'],
            'booking_id' => ['nullable', 'integer', 'exists:bookings,id'],
            'request_id' => ['nullable', 'integer', 'exists:documents,id'],
            'file' => ['required', 'file', 'max:10240'],
        ]);

        if (! empty($validated['booking_id'])) {
            $ownsBooking = Booking::query()
                ->where('id', $validated['booking_id'])
                ->where('user_id', $request->user()->id)
                ->exists();

            if (! $ownsBooking) {
                return ApiResponse::error('Invalid booking', null, 422);
            }
        }

        $requestDoc = null;
        if (! empty($validated['request_id'])) {
            $requestDoc = Document::query()
                ->where('user_id', $request->user()->id)
                ->whereIn('status', ['requested', 'pending'])
                ->find($validated['request_id']);

            if (! $requestDoc) {
                return ApiResponse::error('Document request not found', null, 404);
            }
        }

        $file = $request->file('file');
        $path = $file->store('documents/'.$request->user()->id, 'public');
        $extension = strtolower($file->getClientOriginalExtension());
        $type = $this->fileTypeFromExtension($extension);

        if ($requestDoc) {
            if ($requestDoc->file_path) {
                Storage::disk('public')->delete($requestDoc->file_path);
            }

            $requestDoc->update([
                'name' => $validated['name'] ?? $file->getClientOriginalName() ?: $requestDoc->name,
                'folder' => $validated['folder'] ?? $requestDoc->folder ?? 'General',
                'booking_id' => $validated['booking_id'] ?? $requestDoc->booking_id,
                'file_path' => $path,
                'file_type' => $type,
                'file_size' => $file->getSize(),
                'uploaded_by' => $request->user()->first_name ?? 'You',
                'status' => 'available',
                'due_at' => null,
            ]);

            return ApiResponse::success($this->mapDocument($requestDoc->fresh()), 'Request fulfilled');
        }

        $document = Document::create([
            'user_id' => $request->user()->id,
            'booking_id' => $validated['booking_id'] ?? null,
            'name' => $validated['name'] ?? $file->getClientOriginalName(),
            'folder' => $validated['folder'] ?? 'General',
            'file_path' => $path,
            'file_type' => $type,
            'file_size' => $file->getSize(),
            'uploaded_by' => $request->user()->first_name ?? 'You',
            'status' => 'available',
        ]);

        return ApiResponse::success($this->mapDocument($document), 'Document uploaded', 201);
    }

    public function storeFolder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
        ]);

        $name = trim($validated['name']);

        $exists = Document::query()
            ->where('user_id', $request->user()->id)
            ->where('folder', $name)
            ->where('status_flag', true)
            ->exists();

        if ($exists) {
            return ApiResponse::success(['name' => $name], 'Folder already exists');
        }

        Document::create([
            'user_id' => $request->user()->id,
            'name' => $name,
            'folder' => $name,
            'uploaded_by' => $request->user()->first_name ?? 'You',
            'status' => 'folder',
            'file_type' => 'folder',
        ]);

        return ApiResponse::success(['name' => $name], 'Folder created', 201);
    }

    public function storeRequest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'folder' => ['nullable', 'string', 'max:100'],
            'booking_id' => ['nullable', 'integer', 'exists:bookings,id'],
            'due_at' => ['nullable', 'date'],
            'requested_by' => ['nullable', 'string', 'max:100'],
        ]);

        if (! empty($validated['booking_id'])) {
            $ownsBooking = Booking::query()
                ->where('id', $validated['booking_id'])
                ->where('user_id', $request->user()->id)
                ->exists();

            if (! $ownsBooking) {
                return ApiResponse::error('Invalid booking', null, 422);
            }
        }

        $document = Document::create([
            'user_id' => $request->user()->id,
            'booking_id' => $validated['booking_id'] ?? null,
            'name' => $validated['name'],
            'folder' => $validated['folder'] ?? 'General',
            'uploaded_by' => $validated['requested_by'] ?? 'You',
            'status' => 'requested',
            'due_at' => $validated['due_at'] ?? now()->addDays(7),
            'file_type' => 'pdf',
        ]);

        return ApiResponse::success($this->mapDocument($document), 'Document request created', 201);
    }

    public function share(Request $request, int $id): JsonResponse
    {
        $document = Document::query()
            ->where('user_id', $request->user()->id)
            ->where('status', 'available')
            ->find($id);

        if (! $document || ! $document->file_path) {
            return ApiResponse::error('Document not found', null, 404);
        }

        if (! $document->share_token) {
            $document->update([
                'share_token' => Str::random(40),
                'shared_at' => now(),
            ]);
            $document->refresh();
        }

        $url = '/api/documents/shared/'.$document->share_token;

        return ApiResponse::success([
            'id' => $document->id,
            'share_token' => $document->share_token,
            'share_url' => url($url),
            'share_path' => $url,
            'shared_at' => optional($document->shared_at)->toIso8601String(),
        ], 'Share link created');
    }

    public function download(Request $request, int $id): StreamedResponse|JsonResponse
    {
        $document = Document::query()
            ->where('user_id', $request->user()->id)
            ->where('status', 'available')
            ->find($id);

        if (! $document || ! $document->file_path || ! Storage::disk('public')->exists($document->file_path)) {
            return ApiResponse::error('File not available', null, 404);
        }

        return Storage::disk('public')->download($document->file_path, $document->name);
    }

    public function sharedDownload(string $token): StreamedResponse|JsonResponse
    {
        $document = Document::query()
            ->where('share_token', $token)
            ->where('status', 'available')
            ->first();

        if (! $document || ! $document->file_path || ! Storage::disk('public')->exists($document->file_path)) {
            return ApiResponse::error('Shared file not found', null, 404);
        }

        return Storage::disk('public')->download($document->file_path, $document->name);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $document = Document::query()
            ->where('user_id', $request->user()->id)
            ->find($id);

        if (! $document) {
            return ApiResponse::error('Document not found', null, 404);
        }

        if ($document->file_path) {
            Storage::disk('public')->delete($document->file_path);
        }

        $document->delete();

        return ApiResponse::success(null, 'Document deleted');
    }

    private function mapDocument(Document $doc): array
    {
        $size = $doc->file_size
            ? $this->formatBytes((int) $doc->file_size)
            : null;

        return [
            'id' => $doc->id,
            'name' => $doc->name,
            'folder' => $doc->folder ?: 'General',
            'file_type' => $doc->file_type,
            'file_size' => $doc->file_size,
            'size' => $size,
            'uploaded_by' => $doc->uploaded_by,
            'uploaded_on' => optional($doc->created_at)->format('M j, Y'),
            'status' => $doc->status,
            'due_at' => optional($doc->due_at)?->format('M j, Y'),
            'booking_id' => $doc->booking_id,
            'download_url' => $doc->status === 'available' && $doc->file_path
                ? url('/api/documents/'.$doc->id.'/download')
                : null,
            'has_file' => (bool) $doc->file_path,
            'share_token' => $doc->share_token,
        ];
    }

    private function fileTypeFromExtension(string $extension): string
    {
        return match (true) {
            in_array($extension, ['pdf'], true) => 'pdf',
            in_array($extension, ['doc', 'docx'], true) => 'doc',
            in_array($extension, ['xls', 'xlsx', 'csv'], true) => 'xls',
            in_array($extension, ['jpg', 'jpeg', 'png', 'gif', 'webp'], true) => 'img',
            default => 'other',
        };
    }

    private function formatBytes(int $bytes): string
    {
        if ($bytes >= 1073741824) {
            return round($bytes / 1073741824, 1).' GB';
        }
        if ($bytes >= 1048576) {
            return round($bytes / 1048576, 1).' MB';
        }
        if ($bytes >= 1024) {
            return round($bytes / 1024).' KB';
        }

        return $bytes.' B';
    }
}
