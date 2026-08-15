<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\CalendarEvent;
use App\Models\CalendarIntegration;
use App\Services\AuditLogger;
use App\Support\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    private const DEFAULT_INTEGRATIONS = [
        ['provider' => 'google', 'name' => 'Google Calendar'],
        ['provider' => 'outlook', 'name' => 'Outlook Calendar'],
        ['provider' => 'apple', 'name' => 'Apple Calendar'],
    ];

    public function vault(Request $request): JsonResponse
    {
        $user = $request->user();
        $year = (int) $request->input('year', now()->year);
        $month = (int) $request->input('month', now()->month);

        if ($month < 1 || $month > 12) {
            return ApiResponse::error('Invalid month', null, 422);
        }

        $monthStart = Carbon::create($year, $month, 1)->startOfMonth();
        $monthEnd = (clone $monthStart)->endOfMonth();
        $today = now()->startOfDay();

        $this->ensureIntegrations($user->id);

        $events = CalendarEvent::query()
            ->where('user_id', $user->id)
            ->where('status_flag', true)
            ->whereBetween('event_date', [$monthStart->toDateString(), $monthEnd->toDateString()])
            ->orderBy('event_date')
            ->orderBy('event_time')
            ->get()
            ->map(fn (CalendarEvent $e) => $this->mapEvent($e, $today))
            ->values();

        // Include service bookings for the month as meetings when no linked calendar event exists.
        $bookingIdsLinked = CalendarEvent::query()
            ->where('user_id', $user->id)
            ->whereNotNull('booking_id')
            ->pluck('booking_id')
            ->all();

        $bookings = Booking::query()
            ->with(['service:id,name', 'provider.user:id,first_name,last_name'])
            ->where('user_id', $user->id)
            ->whereNotIn('status', ['cancelled'])
            ->whereBetween('booking_date', [$monthStart->toDateString(), $monthEnd->toDateString()])
            ->when($bookingIdsLinked !== [], fn ($q) => $q->whereNotIn('id', $bookingIdsLinked))
            ->orderBy('booking_date')
            ->orderBy('booking_time')
            ->get()
            ->map(fn (Booking $b) => $this->mapBooking($b, $today))
            ->values();

        $all = $events->concat($bookings)
            ->sortBy(fn ($e) => ($e['date'] ?? '').' '.($e['time'] ?? ''))
            ->values();

        $upcomingWindow = CalendarEvent::query()
            ->where('user_id', $user->id)
            ->where('status_flag', true)
            ->where('event_date', '>=', $today->toDateString())
            ->whereIn('type', ['meeting', 'rsvp'])
            ->where(function ($q) {
                $q->whereNull('rsvp_status')
                    ->orWhere('rsvp_status', '!=', 'declined');
            })
            ->orderBy('event_date')
            ->orderBy('event_time')
            ->limit(8)
            ->get()
            ->map(fn (CalendarEvent $e) => $this->mapEvent($e, $today));

        $upcomingBookings = Booking::query()
            ->with(['service:id,name', 'provider.user:id,first_name,last_name'])
            ->where('user_id', $user->id)
            ->whereNotIn('status', ['cancelled', 'completed'])
            ->where('booking_date', '>=', $today->toDateString())
            ->when($bookingIdsLinked !== [], fn ($q) => $q->whereNotIn('id', $bookingIdsLinked))
            ->orderBy('booking_date')
            ->orderBy('booking_time')
            ->limit(8)
            ->get()
            ->map(fn (Booking $b) => $this->mapBooking($b, $today));

        $upcomingMeetings = $upcomingWindow
            ->concat($upcomingBookings)
            ->filter(fn ($e) => $e['type'] === 'meeting' || ($e['rsvp_status'] ?? null) === 'accepted')
            ->sortBy(fn ($e) => ($e['date'] ?? '').' '.($e['time'] ?? ''))
            ->unique(fn ($e) => $e['source'].'-'.$e['id'])
            ->take(6)
            ->values();

        $deadlines = CalendarEvent::query()
            ->where('user_id', $user->id)
            ->where('status_flag', true)
            ->where('type', 'deadline')
            ->where('event_date', '>=', $today->toDateString())
            ->orderBy('event_date')
            ->limit(8)
            ->get()
            ->map(fn (CalendarEvent $e) => $this->mapEvent($e, $today))
            ->values();

        $pendingRsvps = CalendarEvent::query()
            ->where('user_id', $user->id)
            ->where('status_flag', true)
            ->where('type', 'rsvp')
            ->where('rsvp_status', 'pending')
            ->where('event_date', '>=', $today->toDateString())
            ->orderBy('event_date')
            ->get()
            ->map(fn (CalendarEvent $e) => $this->mapEvent($e, $today))
            ->values();

        $todaySchedule = $all
            ->filter(fn ($e) => $e['date'] === $today->toDateString()
                && $e['type'] !== 'deadline'
                && ($e['rsvp_status'] ?? null) !== 'declined')
            ->values();

        $integrations = CalendarIntegration::query()
            ->where('user_id', $user->id)
            ->orderBy('id')
            ->get()
            ->map(fn (CalendarIntegration $i) => [
                'id' => $i->provider,
                'name' => $i->name,
                'connected' => $i->connected,
            ])
            ->values();

        return ApiResponse::success([
            'year' => $year,
            'month' => $month,
            'month_label' => $monthStart->format('F Y'),
            'today' => $today->toDateString(),
            'today_day' => (int) $today->day,
            'is_current_month' => $year === (int) $today->year && $month === (int) $today->month,
            'events' => $all,
            'today_schedule' => $todaySchedule,
            'upcoming_meetings' => $upcomingMeetings,
            'deadlines' => $deadlines,
            'pending_rsvps' => $pendingRsvps,
            'integrations' => $integrations,
        ], 'Calendar retrieved');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:meeting,deadline,rsvp'],
            'event_date' => ['required', 'date'],
            'event_time' => ['nullable', 'date_format:H:i'],
            'with_name' => ['nullable', 'string', 'max:255'],
            'mode' => ['nullable', 'string', 'max:100'],
            'priority' => ['nullable', 'in:Low,Medium,High'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $type = $validated['type'];
        $event = CalendarEvent::create([
            'user_id' => $request->user()->id,
            'title' => $validated['title'],
            'type' => $type,
            'event_date' => $validated['event_date'],
            'event_time' => $validated['event_time'] ?? null,
            'with_name' => $validated['with_name'] ?? null,
            'mode' => $validated['mode'] ?? ($type === 'meeting' ? 'Video Call' : null),
            'priority' => $validated['priority'] ?? ($type === 'deadline' ? 'Medium' : null),
            'rsvp_status' => $type === 'rsvp' ? 'pending' : null,
            'notes' => $validated['notes'] ?? null,
        ]);

        AuditLogger::log('calendar.event_created', $event, null, $event->toArray());

        return ApiResponse::success(
            $this->mapEvent($event, now()->startOfDay()),
            'Event created',
            201
        );
    }

    public function rsvp(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'response' => ['required', 'in:accept,decline'],
        ]);

        $event = CalendarEvent::query()
            ->where('user_id', $request->user()->id)
            ->where('type', 'rsvp')
            ->find($id);

        if (! $event) {
            return ApiResponse::error('RSVP not found', null, 404);
        }

        $status = $validated['response'] === 'accept' ? 'accepted' : 'declined';
        $event->update([
            'rsvp_status' => $status,
            'type' => $status === 'accepted' ? 'meeting' : 'rsvp',
        ]);

        AuditLogger::log('calendar.rsvp_'.$status, $event);

        return ApiResponse::success(
            $this->mapEvent($event->fresh(), now()->startOfDay()),
            $status === 'accepted' ? 'Invitation accepted' : 'Invitation declined'
        );
    }

    public function toggleIntegration(Request $request, string $provider): JsonResponse
    {
        if (! in_array($provider, ['google', 'outlook', 'apple'], true)) {
            return ApiResponse::error('Unknown calendar provider', null, 404);
        }

        $this->ensureIntegrations($request->user()->id);

        $integration = CalendarIntegration::query()
            ->where('user_id', $request->user()->id)
            ->where('provider', $provider)
            ->firstOrFail();

        $integration->update(['connected' => ! $integration->connected]);

        return ApiResponse::success([
            'id' => $integration->provider,
            'name' => $integration->name,
            'connected' => $integration->connected,
        ], $integration->connected ? 'Calendar connected' : 'Calendar disconnected');
    }

    private function ensureIntegrations(int $userId): void
    {
        foreach (self::DEFAULT_INTEGRATIONS as $i => $def) {
            CalendarIntegration::firstOrCreate(
                ['user_id' => $userId, 'provider' => $def['provider']],
                [
                    'name' => $def['name'],
                    'connected' => $i === 0, // Google connected by default for demo
                ]
            );
        }
    }

    private function mapEvent(CalendarEvent $event, Carbon $today): array
    {
        $date = $event->event_date->copy()->startOfDay();
        $timeLabel = $event->event_time
            ? Carbon::parse($event->event_time)->format('g:i A')
            : null;

        return [
            'id' => $event->id,
            'source' => 'calendar',
            'booking_id' => $event->booking_id,
            'title' => $event->title,
            'type' => $event->type,
            'date' => $date->toDateString(),
            'day' => (int) $date->day,
            'month_short' => $date->format('M'),
            'time' => $timeLabel,
            'with' => $event->with_name,
            'mode' => $event->mode,
            'priority' => $event->priority,
            'rsvp_status' => $event->rsvp_status,
            'date_label' => $this->dateLabel($date, $today),
            'notes' => $event->notes,
        ];
    }

    private function mapBooking(Booking $booking, Carbon $today): array
    {
        $date = $booking->booking_date->copy()->startOfDay();
        $providerUser = $booking->provider?->user;
        $with = $providerUser
            ? trim(($providerUser->first_name ?? '').' '.($providerUser->last_name ?? ''))
            : 'Account Manager';
        $timeLabel = $booking->booking_time
            ? Carbon::parse($booking->booking_time)->format('g:i A')
            : null;

        return [
            'id' => 'booking-'.$booking->id,
            'source' => 'booking',
            'booking_id' => $booking->id,
            'title' => ($booking->service?->name ?? 'Service').' appointment',
            'type' => 'meeting',
            'date' => $date->toDateString(),
            'day' => (int) $date->day,
            'month_short' => $date->format('M'),
            'time' => $timeLabel,
            'with' => $with ?: 'Account Manager',
            'mode' => 'Video Call',
            'priority' => null,
            'rsvp_status' => null,
            'date_label' => $this->dateLabel($date, $today),
            'notes' => $booking->customer_notes,
        ];
    }

    private function dateLabel(Carbon $date, Carbon $today): string
    {
        if ($date->equalTo($today)) {
            return 'Today';
        }
        if ($date->equalTo($today->copy()->addDay())) {
            return 'Tomorrow';
        }

        return $date->format('M j, Y');
    }
}
