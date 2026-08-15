@extends('layouts.admin')
@section('title', 'Reviews')
@section('content')
<h1 class="mt-4">Reviews</h1>
@if(session('success'))<div class="alert alert-success">{{ session('success') }}</div>@endif
<div class="card mb-4">
    <div class="card-header d-flex justify-content-between align-items-center"><span>All Reviews</span><a href="{{ route('admin.reviews.create') }}" class="btn btn-primary btn-sm">Add</a></div>
    <div class="card-body">
        <form method="GET" class="row g-2 mb-3">
            <div class="col-md-4"><input type="text" name="q" value="{{ request('q') }}" class="form-control" placeholder="Search..."></div>

            <div class="col-md-2"><button class="btn btn-outline-secondary w-100" type="submit">Filter</button></div>
        </form>
        <div class="table-responsive"><table class="table table-bordered table-striped align-middle">
            <thead><tr><th>User</th><th>Service</th><th>Rating</th><th>Approved</th><th>Status</th><th width="260">Actions</th></tr></thead>
            <tbody>
            @forelse($reviews as $item)
            <tr><td>{{ $item->user?->full_name }}</td><td>{{ $item->service?->name }}</td><td>{{ $item->rating }}/5</td><td>{{ $item->is_approved ? 'Yes' : 'No' }}</td><td><span class="badge bg-{{ $item->status ? 'success' : 'secondary' }}">{{ $item->status ? 'Active' : 'Inactive' }}</span></td><td class="d-flex gap-1 flex-wrap">
                @if(Route::has('admin.reviews.edit'))<a href="{{ route('admin.reviews.edit', $item) }}" class="btn btn-sm btn-outline-primary">Edit</a>@endif
                <form method="POST" action="{{ route('admin.reviews.approve', $item) }}">@csrf<button class="btn btn-sm btn-outline-success" type="submit">{{ $item->is_approved ? 'Unapprove' : 'Approve' }}</button></form>
                @if(Route::has('admin.reviews.toggle'))<form method="POST" action="{{ route('admin.reviews.toggle', $item) }}">@csrf<button class="btn btn-sm btn-outline-warning" type="submit">Toggle</button></form>@endif
                @if(Route::has('admin.reviews.destroy'))<form method="POST" action="{{ route('admin.reviews.destroy', $item) }}" onsubmit="return confirm('Delete?')">@csrf @method('DELETE')<button class="btn btn-sm btn-outline-danger" type="submit">Delete</button></form>@endif
            </td></tr>
            @empty<tr><td colspan="6" class="text-center text-muted">No records found.</td></tr>@endforelse
            </tbody>
        </table></div>
        {{ $reviews->links() }}
    </div>
</div>
@endsection
