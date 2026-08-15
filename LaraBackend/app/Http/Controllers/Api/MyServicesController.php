<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Booking;
use App\Models\BookingMessage;
use App\Models\Document;
use App\Models\User;
use App\Services\AuditLogger;
use App\Support\ApiResponse;
use App\Support\BookingPresenter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class MyServicesController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $bookings = Booking::query()
            ->with([
                'service:id,name,slug,short_description,description,category_id,price',
                'service.category:id,name,slug',
                'provider.user:id,first_name,last_name,email_id,phone_number',
            ])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        $cards = $bookings->map(fn (Booking $b) => BookingPresenter::card($b));

        $stats = [
            'active' => $bookings->whereIn('status', ['pending', 'confirmed', 'rescheduled'])->count(),
            'completed' => $bookings->where('status', 'completed')->count(),
            'pending' => $bookings->where('status', 'pending')->count(),
            'overdue' => $bookings->filter(fn (Booking $b) => BookingPresenter::isOverdue($b))->count(),
            'upcoming' => $bookings->filter(fn (Booking $b) => BookingPresenter::isUpcoming($b))->count(),
        ];

        $categories = $cards
            ->pluck('category')
            ->filter()
            ->unique()
            ->sort()
            ->values()
            ->all();

        $deliverables = Document::query()
            ->where('user_id', $user->id)
            ->where('status', 'available')
            ->where('status_flag', true)
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn (Document $doc) => $this->mapDocument($doc));

        $activity = $this->activityForUser($user->id, $bookings->pluck('id')->all());

        return ApiResponse::success([
            'stats' => $stats,
            'categories' => $categories,
            'pipeline' => BookingPresenter::PIPELINE,
            'services' => $cards->values(),
            'deliverables' => $deliverables,
            'recent_activity' => $activity,
        ], 'My services retrieved');
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $booking = Booking::query()
            ->with([
                'service:id,name,slug,short_description,description,category_id,price,duration_minutes',
                'service.category:id,name,slug',
                'provider.user:id,first_name,last_name,email_id,phone_number',
                'invoice',
                'payments',
            ])
            ->where('user_id', $request->user()->id)
            ->find($id);

        if (! $booking) {
            return ApiResponse::error('Service not found', null, 404);
        }

        $documents = Document::query()
            ->where('user_id', $request->user()->id)
            ->where(function ($q) use ($booking) {
                $q->where('booking_id', $booking->id)
                    ->orWhere(function ($q2) use ($booking) {
                        $q2->whereNull('booking_id')
                            ->where('folder', $booking->service?->category?->name ?? 'General');
                    });
            })
            ->where('status_flag', true)
            ->latest()
            ->get();

        $messages = BookingMessage::query()
            ->where('booking_id', $booking->id)
            ->orderBy('created_at')
            ->get()
            ->map(fn (BookingMessage $m) => [
                'id' => $m->id,
                'author' => $m->author_name,
                'role' => $m->role,
                'message' => $m->message,
                'timestamp' => optional($m->created_at)->format('M j, Y · g:i A'),
                'created_at' => optional($m->created_at)->toIso8601String(),
            ]);

        $actionItems = $documents
            ->whereIn('status', ['pending', 'requested'])
            ->values()
            ->map(fn (Document $doc) => [
                'id' => 'doc-'.$doc->id,
                'title' => ($doc->status === 'requested' ? 'Upload: ' : 'Complete: ').$doc->name,
                'due_date' => optional($doc->due_at)->format('M j, Y') ?? 'Soon',
                'priority' => optional($doc->due_at)?->isPast() ? 'High' : 'Medium',
                'type' => 'document',
            ])
            ->all();

        if ($booking->payment_status !== 'paid' && $booking->invoice && in_array($booking->invoice->status, ['sent', 'overdue', 'draft'], true)) {
            array_unshift($actionItems, [
                'id' => 'inv-'.$booking->invoice->id,
                'title' => 'Pay invoice '.$booking->invoice->invoice_number,
                'due_date' => optional($booking->invoice->due_at)->format('M j, Y') ?? 'ASAP',
                'priority' => 'High',
                'type' => 'invoice',
            ]);
        }

        if ($booking->status === 'pending') {
            $actionItems[] = [
                'id' => 'bk-wait-'.$booking->id,
                'title' => 'Awaiting confirmation from Oknitech team',
                'due_date' => optional($booking->booking_date)->format('M j, Y') ?? 'Soon',
                'priority' => 'Low',
                'type' => 'booking',
            ];
        }

        $team = [];
        if ($booking->provider?->user) {
            $u = $booking->provider->user;
            $name = trim(($u->first_name ?? '').' '.($u->last_name ?? ''));
            $team[] = [
                'id' => $u->id,
                'name' => $name ?: 'Relationship Manager',
                'role' => 'Relationship Manager',
                'email' => $u->email_id,
                'phone' => $u->phone_number,
                'initials' => collect(explode(' ', $name))->filter()->map(fn ($p) => strtoupper($p[0] ?? ''))->take(2)->implode(''),
            ];
        }

        $invoice = $booking->invoice;
        $billing = $invoice ? [
            'id' => $invoice->id,
            'number' => $invoice->invoice_number,
            'amount' => (float) $invoice->total,
            'amount_formatted' => '₹'.number_format((float) $invoice->total, 0),
            'status' => match ($invoice->status) {
                'paid' => 'Paid',
                'overdue' => 'Overdue',
                'sent' => 'Outstanding',
                'draft' => 'Draft',
                default => ucfirst($invoice->status),
            },
            'due_on' => optional($invoice->due_at)->format('M j, Y'),
        ] : null;

        $starts = BookingPresenter::startsAt($booking);
        $meetings = [];
        if ($starts && ! in_array($booking->status, ['cancelled'], true)) {
            $meetings[] = [
                'id' => $booking->id,
                'title' => ($booking->service?->name ?? 'Service').' session',
                'date' => $starts->isToday() ? 'Today' : $starts->format('M j, Y'),
                'time' => $starts->format('g:i A'),
                'with' => BookingPresenter::providerName($booking),
                'mode' => 'Video Call',
                'starts_at' => $starts->toIso8601String(),
            ];
        }

        return ApiResponse::success([
            'service' => BookingPresenter::card($booking),
            'current_focus' => BookingPresenter::focusCopy($booking),
            'action_items' => array_values($actionItems),
            'milestones' => BookingPresenter::milestones($booking),
            'documents' => $documents->map(fn (Document $d) => $this->mapDocument($d))->values(),
            'messages' => $messages->values(),
            'activity' => $this->activityForBooking($booking),
            'assigned_team' => $team,
            'billing' => $billing,
            'meetings' => $meetings,
            'notes' => [
                'customer' => $booking->customer_notes,
                'admin' => $booking->admin_notes,
            ],
        ], 'Service workspace retrieved');
    }

    public function storeMessage(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $booking = Booking::query()
            ->where('user_id', $request->user()->id)
            ->find($id);

        if (! $booking) {
            return ApiResponse::error('Service not found', null, 404);
        }

        $user = $request->user();
        $name = trim(($user->first_name ?? '').' '.($user->last_name ?? '')) ?: 'You';

        $message = BookingMessage::create([
            'booking_id' => $booking->id,
            'user_id' => $user->id,
            'author_name' => $name,
            'role' => 'Client',
            'message' => $validated['message'],
        ]);

        AuditLogger::log('booking.message_sent', $booking, null, ['message_id' => $message->id]);

        return ApiResponse::success([
            'id' => $message->id,
            'author' => $message->author_name,
            'role' => $message->role,
            'message' => $message->message,
            'timestamp' => optional($message->created_at)->format('M j, Y · g:i A'),
            'created_at' => optional($message->created_at)->toIso8601String(),
        ], 'Message sent', 201);
    }

    private function mapDocument(Document $doc): array
    {
        $size = $doc->file_size
            ? ($doc->file_size >= 1048576
                ? round($doc->file_size / 1048576, 1).' MB'
                : round($doc->file_size / 1024).' KB')
            : null;

        return [
            'id' => $doc->id,
            'name' => $doc->name,
            'folder' => $doc->folder,
            'file_type' => $doc->file_type,
            'file_size' => $doc->file_size,
            'size' => $size,
            'uploaded_by' => $doc->uploaded_by,
            'uploaded_on' => optional($doc->created_at)->format('M j, Y'),
            'status' => $doc->status,
            'due_at' => optional($doc->due_at)?->format('M j, Y'),
            'booking_id' => $doc->booking_id,
            'download_url' => $doc->file_path ? asset('storage/'.$doc->file_path) : null,
        ];
    }

    private function activityForUser(int $userId, array $bookingIds): array
    {
        $items = [];

        $docs = Document::query()
            ->where('user_id', $userId)
            ->latest()
            ->limit(10)
            ->get();

        foreach ($docs as $doc) {
            $items[] = [
                'id' => 'doc-'.$doc->id,
                'actor' => $doc->uploaded_by ?: 'You',
                'action' => ($doc->status === 'requested' ? 'requested ' : 'uploaded ').$doc->name,
                'timestamp' => optional($doc->created_at)->diffForHumans(),
                'created_at' => optional($doc->created_at)->toIso8601String(),
            ];
        }

        if ($bookingIds) {
            $logs = AuditLog::query()
                ->where('subject_type', Booking::class)
                ->whereIn('subject_id', $bookingIds)
                ->latest()
                ->limit(15)
                ->get();

            foreach ($logs as $log) {
                $items[] = [
                    'id' => 'log-'.$log->id,
                    'actor' => $this->actorName($log),
                    'action' => str_replace(['booking.', '_'], ['', ' '], $log->action),
                    'timestamp' => optional($log->created_at)->diffForHumans(),
                    'created_at' => optional($log->created_at)->toIso8601String(),
                ];
            }
        }

        return collect($items)
            ->sortByDesc('created_at')
            ->take(10)
            ->values()
            ->all();
    }

    private function activityForBooking(Booking $booking): array
    {
        $items = [];

        $items[] = [
            'id' => 'created-'.$booking->id,
            'actor' => 'System',
            'action' => 'created booking '.$booking->booking_number,
            'timestamp' => optional($booking->created_at)->diffForHumans(),
            'created_at' => optional($booking->created_at)->toIso8601String(),
        ];

        $logs = AuditLog::query()
            ->where('subject_type', Booking::class)
            ->where('subject_id', $booking->id)
            ->latest()
            ->limit(20)
            ->get();

        foreach ($logs as $log) {
            $items[] = [
                'id' => 'log-'.$log->id,
                'actor' => $this->actorName($log),
                'action' => str_replace(['booking.', '_'], ['', ' '], $log->action),
                'timestamp' => optional($log->created_at)->diffForHumans(),
                'created_at' => optional($log->created_at)->toIso8601String(),
            ];
        }

        $docs = Document::query()
            ->where('booking_id', $booking->id)
            ->latest()
            ->get();

        foreach ($docs as $doc) {
            $items[] = [
                'id' => 'doc-'.$doc->id,
                'actor' => $doc->uploaded_by ?: 'You',
                'action' => ($doc->status === 'requested' ? 'requested ' : 'uploaded ').$doc->name,
                'timestamp' => optional($doc->created_at)->diffForHumans(),
                'created_at' => optional($doc->created_at)->toIso8601String(),
            ];
        }

        $messages = BookingMessage::query()
            ->where('booking_id', $booking->id)
            ->latest()
            ->limit(10)
            ->get();

        foreach ($messages as $msg) {
            $items[] = [
                'id' => 'msg-'.$msg->id,
                'actor' => $msg->author_name,
                'action' => 'sent a message',
                'timestamp' => optional($msg->created_at)->diffForHumans(),
                'created_at' => optional($msg->created_at)->toIso8601String(),
            ];
        }

        return collect($items)
            ->sortByDesc('created_at')
            ->take(20)
            ->values()
            ->all();
    }

    private function actorName(AuditLog $log): string
    {
        if ($log->actor_type === User::class && $log->actor_id) {
            $user = User::query()->find($log->actor_id);
            if ($user) {
                return trim(($user->first_name ?? '').' '.($user->last_name ?? '')) ?: 'User';
            }
        }

        return $log->actor_type ? class_basename($log->actor_type) : 'System';
    }
}
