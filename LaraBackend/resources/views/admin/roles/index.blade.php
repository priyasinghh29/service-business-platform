@extends('layouts.admin')
@section('title', 'Roles & Permissions')
@section('content')
<h1 class="mt-4">Roles & Permissions</h1>
@if(session('success'))<div class="alert alert-success">{{ session('success') }}</div>@endif
<div class="card mb-4">
<div class="card-header d-flex justify-content-between"><span>Roles</span>
<a href="{{ route('admin.roles.create') }}" class="btn btn-primary btn-sm">Add Role</a></div>
<div class="card-body">
<table class="table table-bordered table-striped">
<thead><tr><th>Name</th><th>Slug</th><th>Permissions</th><th>Staff</th><th>Status</th><th>Actions</th></tr></thead>
<tbody>
@forelse($roles as $item)
<tr>
<td>{{ $item->name }}</td><td><code>{{ $item->slug }}</code></td>
<td>{{ $item->permissions_count }}</td><td>{{ $item->admins_count }}</td>
<td><span class="badge bg-{{ $item->status ? 'success' : 'secondary' }}">{{ $item->status ? 'Active' : 'Inactive' }}</span></td>
<td class="d-flex gap-1">
<a href="{{ route('admin.roles.edit', $item) }}" class="btn btn-sm btn-outline-primary">Edit</a>
<form method="POST" action="{{ route('admin.roles.toggle', $item) }}">@csrf<button class="btn btn-sm btn-outline-warning" type="submit">Toggle</button></form>
<form method="POST" action="{{ route('admin.roles.destroy', $item) }}" onsubmit="return confirm('Delete?')">@csrf @method('DELETE')<button class="btn btn-sm btn-outline-danger" type="submit">Delete</button></form>
</td></tr>
@empty<tr><td colspan="6" class="text-center text-muted">No roles yet.</td></tr>@endforelse
</tbody></table>
{{ $roles->links() }}
</div></div>
@endsection
