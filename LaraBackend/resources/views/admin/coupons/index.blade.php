@extends('layouts.admin')
@section('title', 'Coupons')
@section('content')
<h1 class="mt-4">Coupons</h1>
@if(session('success'))<div class="alert alert-success">{{ session('success') }}</div>@endif
<div class="card mb-4">
    <div class="card-header d-flex justify-content-between align-items-center"><span>All Coupons</span><a href="{{ route('admin.coupons.create') }}" class="btn btn-primary btn-sm">Add</a></div>
    <div class="card-body">
        <form method="GET" class="row g-2 mb-3">
            <div class="col-md-4"><input type="text" name="q" value="{{ request('q') }}" class="form-control" placeholder="Search..."></div>

            <div class="col-md-2"><button class="btn btn-outline-secondary w-100" type="submit">Filter</button></div>
        </form>
        <div class="table-responsive"><table class="table table-bordered table-striped align-middle">
            <thead><tr><th>Code</th><th>Name</th><th>Type</th><th>Value</th><th>Used</th><th>Status</th><th width="240">Actions</th></tr></thead>
            <tbody>
            @forelse($coupons as $item)
            <tr><td><code>{{ $item->code }}</code></td><td>{{ $item->name }}</td><td>{{ $item->type }}</td><td>{{ $item->value }}</td><td>{{ $item->used_count }}{{ $item->usage_limit ? '/'.$item->usage_limit : '' }}</td><td><span class="badge bg-{{ $item->status ? 'success' : 'secondary' }}">{{ $item->status ? 'Active' : 'Inactive' }}</span></td><td class="d-flex gap-1 flex-wrap">
                @if(Route::has('admin.coupons.edit'))<a href="{{ route('admin.coupons.edit', $item) }}" class="btn btn-sm btn-outline-primary">Edit</a>@endif

                @if(Route::has('admin.coupons.toggle'))<form method="POST" action="{{ route('admin.coupons.toggle', $item) }}">@csrf<button class="btn btn-sm btn-outline-warning" type="submit">Toggle</button></form>@endif
                @if(Route::has('admin.coupons.destroy'))<form method="POST" action="{{ route('admin.coupons.destroy', $item) }}" onsubmit="return confirm('Delete?')">@csrf @method('DELETE')<button class="btn btn-sm btn-outline-danger" type="submit">Delete</button></form>@endif
            </td></tr>
            @empty<tr><td colspan="7" class="text-center text-muted">No records found.</td></tr>@endforelse
            </tbody>
        </table></div>
        {{ $coupons->links() }}
    </div>
</div>
@endsection
