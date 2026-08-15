@extends('layouts.admin')
@section('title', 'Calendar')
@section('content')
<h1 class="mt-4">Operations Calendar</h1>
<div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
<form method="GET" class="row g-2">
<div class="col-auto"><select name="month" class="form-select">@for($m=1;$m<=12;$m++)<option value="{{ $m }}" @selected($month==$m)>{{ DateTime::createFromFormat('!m', $m)->format('F') }}</option>@endfor</select></div>
<div class="col-auto"><select name="year" class="form-select">@for($y=now()->year-1;$y<=now()->year+2;$y++)<option value="{{ $y }}" @selected($year==$y)>{{ $y }}</option>@endfor</select></div>
<div class="col-auto"><button class="btn btn-primary" type="submit">Go</button></div>
</form>
<a href="{{ route('admin.calendar-events.index') }}" class="btn btn-outline-primary btn-sm">Manage Events</a>
</div>
<div class="row">
@for($day=1; $day <= $start->daysInMonth; $day++)
@php($date = $start->copy()->day($day)->format('Y-m-d'))
<div class="col-md-3 mb-3">
<div class="card h-100">
<div class="card-header py-2"><strong>{{ $day }}</strong> <small class="text-muted">{{ $start->copy()->day($day)->format('D') }}</small></div>
<div class="card-body p-2">
@forelse(($bookings[$date] ?? []) as $booking)
<div class="border rounded p-2 mb-2 small border-primary">
<div><strong>{{ \Illuminate\Support\Str::of($booking->booking_time)->substr(0,5) }}</strong> — {{ $booking->service?->name }}</div>
<div>{{ $booking->user?->full_name }}</div>
<span class="badge bg-secondary">booking · {{ $booking->status }}</span>
</div>
@empty
@endforelse
@forelse(($events[$date] ?? []) as $event)
<div class="border rounded p-2 mb-2 small border-success">
<div><strong>{{ $event->event_time ? \Illuminate\Support\Str::of($event->event_time)->substr(0,5) : 'All day' }}</strong> — {{ $event->title }}</div>
<div>{{ $event->user?->full_name }}</div>
<span class="badge bg-success">{{ $event->type }}</span>
</div>
@empty
@endforelse
@if(empty($bookings[$date] ?? []) && empty($events[$date] ?? []))
<span class="text-muted small">No items</span>
@endif
</div></div></div>
@endfor
</div>
@endsection
