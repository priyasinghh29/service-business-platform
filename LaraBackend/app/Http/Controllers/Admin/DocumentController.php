<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Document;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\View\View;

class DocumentController extends Controller
{
    public function index(Request $request): View
    {
        $query = Document::query()->with(['user', 'booking.service'])->latest();

        if ($request->filled('q')) {
            $q = $request->string('q');
            $query->where(function ($builder) use ($q) {
                $builder->where('name', 'like', "%{$q}%")
                    ->orWhere('folder', 'like', "%{$q}%")
                    ->orWhereHas('user', fn ($u) => $u->where('email_id', 'like', "%{$q}%")->orWhere('first_name', 'like', "%{$q}%"));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $documents = $query->paginate(20)->withQueryString();

        return view('admin.documents.index', compact('documents'));
    }

    public function create(): View
    {
        return view('admin.documents.create', [
            'customers' => User::query()->where('role', 'customer')->orderBy('first_name')->get(['id', 'first_name', 'last_name', 'email_id']),
            'bookings' => Booking::query()->with('service')->latest()->limit(100)->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'booking_id' => ['nullable', 'exists:bookings,id'],
            'name' => ['required', 'string', 'max:255'],
            'folder' => ['nullable', 'string', 'max:100'],
            'status' => ['required', 'string', 'max:50'],
            'due_at' => ['nullable', 'date'],
            'file' => ['nullable', 'file', 'max:10240'],
        ]);

        $path = null;
        $fileType = null;
        $fileSize = null;
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $path = $file->store('documents', 'public');
            $fileType = $file->getClientOriginalExtension();
            $fileSize = $file->getSize();
        }

        $document = Document::create([
            'user_id' => $validated['user_id'],
            'booking_id' => $validated['booking_id'] ?? null,
            'name' => $validated['name'],
            'folder' => $validated['folder'] ?? 'General',
            'file_path' => $path,
            'file_type' => $fileType,
            'file_size' => $fileSize,
            'uploaded_by' => auth('admin')->user()?->full_name ?: 'Admin',
            'status' => $validated['status'],
            'due_at' => $validated['due_at'] ?? null,
            'status_flag' => true,
        ]);

        AuditLogger::log('document.created_admin', $document, null, $document->toArray());

        return redirect()->route('admin.documents.index')->with('success', 'Document created.');
    }

    public function edit(Document $document): View
    {
        return view('admin.documents.edit', [
            'document' => $document,
            'customers' => User::query()->where('role', 'customer')->orderBy('first_name')->get(['id', 'first_name', 'last_name', 'email_id']),
            'bookings' => Booking::query()->with('service')->latest()->limit(100)->get(),
        ]);
    }

    public function update(Request $request, Document $document): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'booking_id' => ['nullable', 'exists:bookings,id'],
            'name' => ['required', 'string', 'max:255'],
            'folder' => ['nullable', 'string', 'max:100'],
            'status' => ['required', 'string', 'max:50'],
            'due_at' => ['nullable', 'date'],
            'file' => ['nullable', 'file', 'max:10240'],
        ]);

        $old = $document->toArray();
        $data = [
            'user_id' => $validated['user_id'],
            'booking_id' => $validated['booking_id'] ?? null,
            'name' => $validated['name'],
            'folder' => $validated['folder'] ?? 'General',
            'status' => $validated['status'],
            'due_at' => $validated['due_at'] ?? null,
        ];

        if ($request->hasFile('file')) {
            if ($document->file_path) {
                Storage::disk('public')->delete($document->file_path);
            }
            $file = $request->file('file');
            $data['file_path'] = $file->store('documents', 'public');
            $data['file_type'] = $file->getClientOriginalExtension();
            $data['file_size'] = $file->getSize();
            $data['uploaded_by'] = auth('admin')->user()?->full_name ?: 'Admin';
        }

        $document->update($data);
        AuditLogger::log('document.updated_admin', $document, $old, $document->fresh()->toArray());

        return redirect()->route('admin.documents.index')->with('success', 'Document updated.');
    }

    public function destroy(Document $document): RedirectResponse
    {
        AuditLogger::log('document.deleted_admin', $document, $document->toArray());
        if ($document->file_path) {
            Storage::disk('public')->delete($document->file_path);
        }
        $document->delete();

        return redirect()->route('admin.documents.index')->with('success', 'Document deleted.');
    }

    public function download(Document $document)
    {
        if (! $document->file_path || ! Storage::disk('public')->exists($document->file_path)) {
            return back()->with('error', 'No file attached to this document.');
        }

        return Storage::disk('public')->download(
            $document->file_path,
            $document->name.($document->file_type ? '.'.$document->file_type : '')
        );
    }
}
