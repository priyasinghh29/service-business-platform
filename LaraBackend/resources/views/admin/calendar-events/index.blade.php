@extends('layouts.admin')
@section('title', 'Calendar Events')
@section('content')
<h1 class="mt-4">Calendar Events</h1>
@if(session('success'))<div class="alert alert-success">{{ session('success') }}</div>@endif
<div class="card mb-4">
<div class="card-header d-flex justify-content-between align-items-center">
<span>Meetings, Deadlines &amp; RSVPs</span>
<div class="d-flex gap-2">
<a href="{{ route('admin.calendar.index') }}" class="btn btn-outline-secondary btn-sm">Month View</a>
<a href="{{ route('admin.calendar-events.create') }}" class="btn btn-primary btn-sm">Add Event</a>
</div>
</div>
<div class="card-body">
<form method="GET" class="row g-2 mb-3">
<div class="col-md-4"><input type="text" name="q" value="{{ request('q') }}" class="form-control" placeholder="Search..."></div>
<div class="col-md-2"><select name="type" class="form-select"><option value="">Type</option>@foreach(['meeting','deadline','rsvp'] as $t)<option value="{{ $t }}" @selected(request('type')===$t)>{{ ucfirst($t) }}</option>@endforeach</select></div>
<div class="col-md-2"><button class="btn btn-outline-secondary w-100" type="submit">Filter</button></div>
</form>
<table class="table table-bordered table-striped align-middle">
<thead><tr><th>Date</th><th>Time</th><th>Title</th><th>Customer</th><th>Type</th><th>Priority / RSVP</th><th width="180">Actions</th></tr></thead>
<tbody>
@forelse($events as $item)
<tr>
<td>{{ $item->event_date?->format('Y-m-d') }}</td>
<td>{{ $item->event_time ? \Illuminate\Support\Str::of($item->event_time)->substr(0,5) : '—' }}</td>
<td>{{ $item->title }}</td>
<td>{{ $item->user?->full_name }}</td>
<td>{{ ucfirst($item->type) }}</td>
<td>{{ $item->type === 'deadline' ? ($item->priority ?: '—') : ($item->rsvp_status ?: '—') }}</td>
<td class="d-flex gap-1">
<a href="{{ route('admin.calendar-events.edit', $item) }}" class="btn btn-sm btn-outline-primary">Edit</a>
<form method="POST" action="{{ route('admin.calendar-events.destroy', $item) }}" onsubmit="return confirm('Delete?')">@csrf @method('DELETE')<button class="btn btn-sm btn-outline-danger" type="submit">Delete</button></form>
</td>
</tr>
@empty
<tr><td colspan="7" class="text-center text-muted">No events found.</td></tr>
@endforelse
</tbody>
</table>
{{ $events->links() }}
</div></div>
@endsection
