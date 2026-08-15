<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CalendarEvent;
use App\Models\Invoice;
use App\Models\Notification;
use App\Support\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    private const CATEGORIES = ['Service', 'Invoice', 'Document', 'Meeting', 'System'];

    private const DEFAULT_ACTIONS = [
        'Service' => ['View Service', '/my-services'],
        'Invoice' => ['View Invoice', '/invoices'],
        'Document' => ['View Documents', '/documents'],
        'Meeting' => ['View Calendar', '/calendar'],
        'System' => [null, '/settings'],
    ];

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $categoryFilter = $request->input('category');

        $query = Notification::query()
            ->where('user_id', $user->id)
            ->latest();

        if ($categoryFilter && $categoryFilter !== 'All') {
            $query->where('type', $categoryFilter);
        }

        $notifications = $query->limit(100)->get();
        $today = now()->startOfDay();

        $mapped = $notifications->map(fn (Notification $n) => $this->mapNotification($n, $today));

        $allForStats = Notification::query()
            ->where('user_id', $user->id)
            ->latest()
            ->limit(200)
            ->get();

        $unread = $allForStats->where('read', false)->count();
        $todayCount = $allForStats->filter(fn (Notification $n) => $n->created_at?->isSameDay($today))->count();
        $actionRequired = $allForStats->where('action_required', true)->where('read', false)->count();
        $highPriority = $allForStats->where('priority', 'High')->where('read', false)->count();

        $groups = ['Today', 'Yesterday', 'This Week', 'Earlier'];
        $grouped = collect($groups)->mapWithKeys(fn ($g) => [
            $g => $mapped->filter(fn ($n) => $n['group'] === $g)->values(),
        ]);

        $deadlines = CalendarEvent::query()
            ->where('user_id', $user->id)
            ->where('status_flag', true)
            ->where('type', 'deadline')
            ->where('event_date', '>=', $today->toDateString())
            ->orderBy('event_date')
            ->limit(5)
            ->get()
            ->map(fn (CalendarEvent $e) => [
                'id' => $e->id,
                'title' => $e->title,
                'date' => $e->event_date->equalTo($today)
                    ? 'Today'
                    : $e->event_date->format('M j, Y'),
                'priority' => $e->priority,
            ])
            ->values();

        $nextMeeting = CalendarEvent::query()
            ->where('user_id', $user->id)
            ->where('status_flag', true)
            ->whereIn('type', ['meeting', 'rsvp'])
            ->where(function ($q) {
                $q->whereNull('rsvp_status')->orWhere('rsvp_status', '!=', 'declined');
            })
            ->where('event_date', '>=', $today->toDateString())
            ->orderBy('event_date')
            ->orderBy('event_time')
            ->first();

        $nextMeetingPayload = null;
        if ($nextMeeting) {
            $nextMeetingPayload = [
                'id' => $nextMeeting->id,
                'title' => $nextMeeting->title,
                'date' => $nextMeeting->event_date->equalTo($today)
                    ? 'Today'
                    : $nextMeeting->event_date->format('M j, Y'),
                'time' => $nextMeeting->event_time
                    ? Carbon::parse($nextMeeting->event_time)->format('g:i A')
                    : null,
                'mode' => $nextMeeting->mode,
                'with' => $nextMeeting->with_name,
            ];
        }

        $outstanding = Invoice::query()
            ->where('user_id', $user->id)
            ->whereIn('status', ['outstanding', 'overdue', 'pending', 'unpaid'])
            ->count();

        $score = max(55, min(98, 100 - ($outstanding * 8) - ($actionRequired * 3)));
        $healthLabel = $score >= 90 ? 'Excellent' : ($score >= 75 ? 'Good' : ($score >= 60 ? 'Fair' : 'Needs Attention'));
        $healthNotes = $outstanding > 0
            ? "{$outstanding} invoice(s) pending payment. Stay on top of action items."
            : 'All compliance filings are on track.';

        return ApiResponse::success([
            'stats' => [
                'unread' => $unread,
                'today' => $todayCount,
                'action_required' => $actionRequired,
                'high_priority' => $highPriority,
            ],
            'categories' => array_merge(['All'], self::CATEGORIES),
            'notifications' => $mapped->values(),
            'grouped' => $grouped,
            'deadlines' => $deadlines,
            'next_meeting' => $nextMeetingPayload,
            'account_health' => [
                'score' => $score,
                'label' => $healthLabel,
                'notes' => $healthNotes,
            ],
        ], 'Notifications retrieved');
    }

    public function markAsRead(Request $request, int $id): JsonResponse
    {
        $notification = Notification::query()
            ->where('user_id', $request->user()->id)
            ->where('id', $id)
            ->first();

        if (! $notification) {
            return ApiResponse::error('Notification not found', null, 404);
        }

        $notification->update(['read' => true]);

        return ApiResponse::success(
            $this->mapNotification($notification->fresh(), now()->startOfDay()),
            'Notification marked as read'
        );
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        Notification::query()
            ->where('user_id', $request->user()->id)
            ->where('read', false)
            ->update(['read' => true]);

        return ApiResponse::success(null, 'All notifications marked as read');
    }

    private function mapNotification(Notification $n, Carbon $today): array
    {
        $category = $this->normalizeCategory($n->type);
        [$defaultLabel, $defaultHref] = self::DEFAULT_ACTIONS[$category] ?? [null, null];

        $created = $n->created_at?->copy() ?? now();
        $group = $this->groupFor($created, $today);

        return [
            'id' => $n->id,
            'title' => $n->title,
            'description' => $n->message,
            'category' => $category,
            'priority' => $n->priority ?: 'Medium',
            'read' => (bool) $n->read,
            'action_required' => (bool) $n->action_required,
            'action_label' => $n->action_label ?: $defaultLabel,
            'action_href' => $n->link ?: $defaultHref,
            'group' => $group,
            'time' => $this->timeLabel($created, $today),
            'created_at' => $created->toIso8601String(),
        ];
    }

    private function normalizeCategory(?string $type): string
    {
        $type = trim((string) $type);
        foreach (self::CATEGORIES as $cat) {
            if (strcasecmp($type, $cat) === 0) {
                return $cat;
            }
        }

        return match (strtolower($type)) {
            'service', 'booking', 'my-services' => 'Service',
            'invoice', 'billing', 'payment' => 'Invoice',
            'document', 'documents', 'vault' => 'Document',
            'meeting', 'calendar', 'rsvp' => 'Meeting',
            default => 'System',
        };
    }

    private function groupFor(Carbon $created, Carbon $today): string
    {
        if ($created->isSameDay($today)) {
            return 'Today';
        }
        if ($created->isSameDay($today->copy()->subDay())) {
            return 'Yesterday';
        }
        if ($created->greaterThanOrEqualTo($today->copy()->startOfWeek())) {
            return 'This Week';
        }

        return 'Earlier';
    }

    private function timeLabel(Carbon $created, Carbon $today): string
    {
        if ($created->isSameDay($today)) {
            return $created->format('g:i A');
        }
        if ($created->isSameDay($today->copy()->subDay())) {
            return 'Yesterday';
        }

        return $created->format('M j');
    }
}
