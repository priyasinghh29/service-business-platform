@extends('layouts.admin')

@section('title', 'Categories')

@section('content')
<h1 class="mt-4">Categories</h1>
<ol class="breadcrumb mb-4">
    <li class="breadcrumb-item"><a href="{{ route('admin.dashboard') }}">Dashboard</a></li>
    <li class="breadcrumb-item active">Categories</li>
</ol>

@if(session('success'))
    <div class="alert alert-success">{{ session('success') }}</div>
@endif

<div class="card mb-4">
    <div class="card-header d-flex justify-content-between align-items-center">
        <span>All Categories</span>
        <a href="{{ route('admin.categories.create') }}" class="btn btn-primary btn-sm">Add Category</a>
    </div>
    <div class="card-body">
        <form method="GET" class="row g-2 mb-3">
            <div class="col-md-4">
                <input type="text" name="q" value="{{ request('q') }}" class="form-control" placeholder="Search name or slug">
            </div>
            <div class="col-md-3">
                <select name="status" class="form-select">
                    <option value="">All statuses</option>
                    <option value="1" @selected(request('status') === '1')>Active</option>
                    <option value="0" @selected(request('status') === '0')>Inactive</option>
                </select>
            </div>
            <div class="col-md-2">
                <button class="btn btn-outline-secondary w-100" type="submit">Filter</button>
            </div>
        </form>

        @include('admin.partials.bulk-toolbar', ['bulkRoute' => 'admin.categories.bulk'])

        <div class="table-responsive">
            <table class="table table-bordered table-striped align-middle">
                <thead>
                    <tr>
                        <th width="36"><input type="checkbox" id="bulk-master" onclick="toggleBulkAll(this)"></th>
                        <th>Name</th>
                        <th>Slug</th>
                        <th>Services</th>
                        <th>Order</th>
                        <th>Status</th>
                        <th width="180">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($categories as $category)
                        <tr>
                            <td><input type="checkbox" class="bulk-check" value="{{ $category->id }}"></td>
                            <td>{{ $category->name }}</td>
                            <td><code>{{ $category->slug }}</code></td>
                            <td>{{ $category->services_count }}</td>
                            <td>{{ $category->sort_order }}</td>
                            <td>
                                <span class="badge bg-{{ $category->status ? 'success' : 'secondary' }}">
                                    {{ $category->status ? 'Active' : 'Inactive' }}
                                </span>
                            </td>
                            <td class="d-flex gap-1 flex-wrap">
                                <a href="{{ route('admin.categories.edit', $category) }}" class="btn btn-sm btn-outline-primary">Edit</a>
                                <form method="POST" action="{{ route('admin.categories.toggle', $category) }}">
                                    @csrf
                                    <button class="btn btn-sm btn-outline-warning" type="submit">Toggle</button>
                                </form>
                                <form method="POST" action="{{ route('admin.categories.destroy', $category) }}" onsubmit="return confirm('Delete this category?')">
                                    @csrf
                                    @method('DELETE')
                                    <button class="btn btn-sm btn-outline-danger" type="submit">Delete</button>
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="7" class="text-center text-muted">No categories yet.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        {{ $categories->links() }}
    </div>
</div>
@endsection
