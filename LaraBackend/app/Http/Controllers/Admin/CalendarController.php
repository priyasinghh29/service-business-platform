<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\CalendarEvent;
use Illuminate\Http\Request;
use Illuminate\View\View;

class CalendarController extends Controller
{
    public function index(Request $request): View
    {
        $month = (int) $request->input('month', now()->month);
        $year = (int) $request->input('year', now()->year);

        $start = now()->setDate($year, $month, 1)->startOfMonth();
        $end = (clone $start)->endOfMonth();

        $bookings = Booking::query()
            ->with(['user', 'service', 'provider.user'])
            ->whereBetween('booking_date', [$start->toDateString(), $end->toDateString()])
            ->orderBy('booking_date')
            ->orderBy('booking_time')
            ->get()
            ->groupBy(fn ($b) => $b->booking_date->format('Y-m-d'));

        $events = CalendarEvent::query()
            ->with('user')
            ->where('status_flag', true)
            ->whereBetween('event_date', [$start->toDateString(), $end->toDateString()])
            ->orderBy('event_date')
            ->orderBy('event_time')
            ->get()
            ->groupBy(fn ($e) => $e->event_date->format('Y-m-d'));

        return view('admin.calendar.index', compact('bookings', 'events', 'month', 'year', 'start'));
    }
}
