@extends('layouts.admin')
@section('title', 'Notifications')
@section('content')
<h1 class="mt-4">Notifications</h1>
@if(session('success'))<div class="alert alert-success">{{ session('success') }}</div>@endif
<div class="card mb-4">
<div class="card-header d-flex justify-content-between"><span>All Notifications</span>
<a href="{{ route('admin.notifications.create') }}" class="btn btn-primary btn-sm">Add</a></div>
<div class="card-body">
<form method="GET" class="row g-2 mb-3">
<div class="col-md-4"><input type="text" name="q" value="{{ request('q') }}" class="form-control" placeholder="Search..."></div>
<div class="col-md-2"><button class="btn btn-outline-secondary w-100" type="submit">Filter</button></div>
</form>
<table class="table table-bordered table-striped">
<thead><tr><th>User</th><th>Title</th><th>Type</th><th>Read</th><th>Actions</th></tr></thead>
<tbody>
@forelse($notifications as $item)
<tr>
<td>{{ $item->user?->full_name }}</td>
<td>{{ $item->title }}</td>
<td>{{ $item->type }}</td>
<td>{{ $item->read ? 'Yes' : 'No' }}</td>
<td class="d-flex gap-1">
<a href="{{ route('admin.notifications.edit', $item) }}" class="btn btn-sm btn-outline-primary">Edit</a>
<form method="POST" action="{{ route('admin.notifications.toggle', $item) }}">@csrf<button class="btn btn-sm btn-outline-warning" type="submit">Toggle Read</button></form>
<form method="POST" action="{{ route('admin.notifications.destroy', $item) }}" onsubmit="return confirm('Delete?')">@csrf @method('DELETE')<button class="btn btn-sm btn-outline-danger" type="submit">Delete</button></form>
</td></tr>
@empty<tr><td colspan="5" class="text-center text-muted">No notifications.</td></tr>@endforelse
</tbody></table>
{{ $notifications->links() }}
</div></div>
@endsection
