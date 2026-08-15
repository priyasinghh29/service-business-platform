@extends('layouts.admin')
@section('title', 'Staff')
@section('content')
<h1 class="mt-4">Staff</h1>
@if(session('success'))<div class="alert alert-success">{{ session('success') }}</div>@endif
<div class="card mb-4">
    <div class="card-header d-flex justify-content-between align-items-center"><span>All Staff</span><a href="{{ route('admin.staff.create') }}" class="btn btn-primary btn-sm">Add</a></div>
    <div class="card-body">
        <form method="GET" class="row g-2 mb-3">
            <div class="col-md-4"><input type="text" name="q" value="{{ request('q') }}" class="form-control" placeholder="Search..."></div>

            <div class="col-md-2"><button class="btn btn-outline-secondary w-100" type="submit">Filter</button></div>
        </form>
        <div class="table-responsive"><table class="table table-bordered table-striped align-middle">
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th width="260">Actions</th></tr></thead>
            <tbody>
            @forelse($staff as $item)
            <tr><td>{{ $item->full_name }}</td><td>{{ $item->email_id }}</td><td>{{ $item->role?->name ?? '—' }}</td><td><span class="badge bg-{{ $item->status ? 'success' : 'secondary' }}">{{ $item->status ? 'Active' : 'Inactive' }}</span></td><td class="d-flex gap-1 flex-wrap">
                @if(Route::has('admin.staff.edit'))<a href="{{ route('admin.staff.edit', $item) }}" class="btn btn-sm btn-outline-primary">Edit</a>@endif

                @if(Route::has('admin.staff.toggle'))<form method="POST" action="{{ route('admin.staff.toggle', $item) }}">@csrf<button class="btn btn-sm btn-outline-warning" type="submit">Toggle</button></form>@endif
                @if(Route::has('admin.staff.destroy'))<form method="POST" action="{{ route('admin.staff.destroy', $item) }}" onsubmit="return confirm('Delete?')">@csrf @method('DELETE')<button class="btn btn-sm btn-outline-danger" type="submit">Delete</button></form>@endif
            </td></tr>
            @empty<tr><td colspan="5" class="text-center text-muted">No records found.</td></tr>@endforelse
            </tbody>
        </table></div>
        {{ $staff->links() }}
    </div>
</div>
@endsection
