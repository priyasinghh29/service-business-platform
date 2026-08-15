<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CalendarEvent;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class CalendarEventController extends Controller
{
    public function index(Request $request): View
    {
        $query = CalendarEvent::query()->with('user')->latest('event_date');

        if ($request->filled('q')) {
            $q = $request->string('q');
            $query->where(function ($builder) use ($q) {
                $builder->where('title', 'like', "%{$q}%")
                    ->orWhereHas('user', fn ($u) => $u->where('email_id', 'like', "%{$q}%")->orWhere('first_name', 'like', "%{$q}%"));
            });
        }

        if ($request->filled('type')) {
            $query->where('type', $request->string('type'));
        }

        $events = $query->paginate(20)->withQueryString();

        return view('admin.calendar-events.index', compact('events'));
    }

    public function create(): View
    {
        return view('admin.calendar-events.create', [
            'customers' => User::query()->where('role', 'customer')->orderBy('first_name')->get(['id', 'first_name', 'last_name', 'email_id']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validated($request);
        $event = CalendarEvent::create($validated);
        AuditLogger::log('calendar.event_created_admin', $event, null, $event->toArray());

        return redirect()->route('admin.calendar-events.index')->with('success', 'Calendar event created.');
    }

    public function edit(CalendarEvent $calendar_event): View
    {
        return view('admin.calendar-events.edit', [
            'event' => $calendar_event,
            'customers' => User::query()->where('role', 'customer')->orderBy('first_name')->get(['id', 'first_name', 'last_name', 'email_id']),
        ]);
    }

    public function update(Request $request, CalendarEvent $calendar_event): RedirectResponse
    {
        $validated = $this->validated($request);
        $old = $calendar_event->toArray();
        $calendar_event->update($validated);
        AuditLogger::log('calendar.event_updated_admin', $calendar_event, $old, $calendar_event->fresh()->toArray());

        return redirect()->route('admin.calendar-events.index')->with('success', 'Calendar event updated.');
    }

    public function destroy(CalendarEvent $calendar_event): RedirectResponse
    {
        AuditLogger::log('calendar.event_deleted_admin', $calendar_event, $calendar_event->toArray());
        $calendar_event->delete();

        return redirect()->route('admin.calendar-events.index')->with('success', 'Calendar event deleted.');
    }

    private function validated(Request $request): array
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'type' => ['required', 'in:meeting,deadline,rsvp'],
            'event_date' => ['required', 'date'],
            'event_time' => ['nullable', 'date_format:H:i'],
            'with_name' => ['nullable', 'string', 'max:255'],
            'mode' => ['nullable', 'string', 'max:100'],
            'priority' => ['nullable', 'in:Low,Medium,High'],
            'rsvp_status' => ['nullable', 'in:pending,accepted,declined'],
            'notes' => ['nullable', 'string'],
            'status_flag' => ['nullable', 'boolean'],
        ]);

        $validated['status_flag'] = $request->boolean('status_flag', true);
        if ($validated['type'] === 'rsvp' && empty($validated['rsvp_status'])) {
            $validated['rsvp_status'] = 'pending';
        }
        if ($validated['type'] !== 'rsvp') {
            $validated['rsvp_status'] = $validated['rsvp_status'] ?? null;
        }
        if ($validated['type'] !== 'deadline') {
            $validated['priority'] = $validated['priority'] ?? null;
        } else {
            $validated['priority'] = $validated['priority'] ?? 'Medium';
        }

        return $validated;
    }
}
