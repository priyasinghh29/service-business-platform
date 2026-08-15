@extends('layouts.admin')
@section('title', 'Support Tickets')
@section('content')
<h1 class="mt-4">Support Tickets</h1>
@if(session('success'))<div class="alert alert-success">{{ session('success') }}</div>@endif
<div class="card mb-4">
<div class="card-header d-flex justify-content-between align-items-center">
<span>All Tickets</span>
<a href="{{ route('admin.support-tickets.create') }}" class="btn btn-primary btn-sm">Add</a>
</div>
<div class="card-body">
<form method="GET" class="row g-2 mb-3">
<div class="col-md-4"><input type="text" name="q" value="{{ request('q') }}" class="form-control" placeholder="Search ticket / customer..."></div>
<div class="col-md-2"><select name="status" class="form-select"><option value="">Status</option>@foreach(['Open','In Progress','Waiting on You','Resolved','Closed'] as $s)<option value="{{ $s }}" @selected(request('status')===$s)>{{ $s }}</option>@endforeach</select></div>
<div class="col-md-2"><select name="priority" class="form-select"><option value="">Priority</option>@foreach(['Low','Medium','High'] as $s)<option value="{{ $s }}" @selected(request('priority')===$s)>{{ $s }}</option>@endforeach</select></div>
<div class="col-md-2"><button class="btn btn-outline-secondary w-100" type="submit">Filter</button></div>
</form>
<div class="table-responsive">
<table class="table table-bordered table-striped align-middle">
<thead><tr><th>Number</th><th>Customer</th><th>Subject</th><th>Category</th><th>Priority</th><th>Status</th><th>Updated</th><th width="200">Actions</th></tr></thead>
<tbody>
@forelse($tickets as $item)
<tr>
<td><code>{{ $item->ticket_number }}</code></td>
<td>{{ $item->user?->full_name }}</td>
<td>{{ $item->subject }}</td>
<td>{{ $item->category }}</td>
<td>{{ $item->priority }}</td>
<td>{{ $item->status }}</td>
<td>{{ $item->updated_at?->format('Y-m-d H:i') }}</td>
<td class="d-flex gap-1 flex-wrap">
<a href="{{ route('admin.support-tickets.show', $item) }}" class="btn btn-sm btn-outline-primary">Open</a>
<a href="{{ route('admin.support-tickets.edit', $item) }}" class="btn btn-sm btn-outline-secondary">Edit</a>
<form method="POST" action="{{ route('admin.support-tickets.destroy', $item) }}" onsubmit="return confirm('Delete?')">@csrf @method('DELETE')<button class="btn btn-sm btn-outline-danger" type="submit">Delete</button></form>
</td>
</tr>
@empty
<tr><td colspan="8" class="text-center text-muted">No tickets found.</td></tr>
@endforelse
</tbody>
</table>
</div>
{{ $tickets->links() }}
</div></div>
@endsection
