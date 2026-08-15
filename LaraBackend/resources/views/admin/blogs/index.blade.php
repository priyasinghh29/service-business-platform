@extends('layouts.admin')
@section('title', 'Blogs')
@section('content')
<h1 class="mt-4">Blogs</h1>
@if(session('success'))<div class="alert alert-success">{{ session('success') }}</div>@endif
<div class="card mb-4">
    <div class="card-header d-flex justify-content-between align-items-center"><span>All Blogs</span><a href="{{ route('admin.blogs.create') }}" class="btn btn-primary btn-sm">Add</a></div>
    <div class="card-body">
        <form method="GET" class="row g-2 mb-3">
            <div class="col-md-4"><input type="text" name="q" value="{{ request('q') }}" class="form-control" placeholder="Search..."></div>

            <div class="col-md-2"><button class="btn btn-outline-secondary w-100" type="submit">Filter</button></div>
        </form>
        <div class="table-responsive"><table class="table table-bordered table-striped align-middle">
            <thead><tr><th>Title</th><th>Author</th><th>Published</th><th>Status</th><th width="260">Actions</th></tr></thead>
            <tbody>
            @forelse($blogs as $item)
            <tr><td>{{ $item->title }}</td><td>{{ $item->author?->first_name ?? '—' }}</td><td>{{ optional($item->published_at)->format('Y-m-d') }}</td><td><span class="badge bg-{{ $item->status ? 'success' : 'secondary' }}">{{ $item->status ? 'Active' : 'Inactive' }}</span></td><td class="d-flex gap-1 flex-wrap">
                @if(Route::has('admin.blogs.edit'))<a href="{{ route('admin.blogs.edit', $item) }}" class="btn btn-sm btn-outline-primary">Edit</a>@endif

                @if(Route::has('admin.blogs.toggle'))<form method="POST" action="{{ route('admin.blogs.toggle', $item) }}">@csrf<button class="btn btn-sm btn-outline-warning" type="submit">Toggle</button></form>@endif
                @if(Route::has('admin.blogs.destroy'))<form method="POST" action="{{ route('admin.blogs.destroy', $item) }}" onsubmit="return confirm('Delete?')">@csrf @method('DELETE')<button class="btn btn-sm btn-outline-danger" type="submit">Delete</button></form>@endif
            </td></tr>
            @empty<tr><td colspan="5" class="text-center text-muted">No records found.</td></tr>@endforelse
            </tbody>
        </table></div>
        {{ $blogs->links() }}
    </div>
</div>
@endsection
