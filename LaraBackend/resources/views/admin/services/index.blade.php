@extends('layouts.admin')

@section('title', 'Services')

@section('content')
<h1 class="mt-4">Services</h1>
<ol class="breadcrumb mb-4">
    <li class="breadcrumb-item"><a href="{{ route('admin.dashboard') }}">Dashboard</a></li>
    <li class="breadcrumb-item active">Services</li>
</ol>

@if(session('success'))
    <div class="alert alert-success">{{ session('success') }}</div>
@endif

<div class="card mb-4">
    <div class="card-header d-flex justify-content-between align-items-center">
        <span>All Services</span>
        <a href="{{ route('admin.services.create') }}" class="btn btn-primary btn-sm">Add Service</a>
    </div>
    <div class="card-body">
        <form method="GET" class="row g-2 mb-3">
            <div class="col-md-3">
                <input type="text" name="q" value="{{ request('q') }}" class="form-control" placeholder="Search name or slug">
            </div>
            <div class="col-md-3">
                <select name="category_id" class="form-select">
                    <option value="">All categories</option>
                    @foreach($categories as $category)
                        <option value="{{ $category->id }}" @selected(request('category_id') == $category->id)>{{ $category->name }}</option>
                    @endforeach
                </select>
            </div>
            <div class="col-md-2">
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

        @include('admin.partials.bulk-toolbar', ['bulkRoute' => 'admin.services.bulk'])

        <div class="table-responsive">
            <table class="table table-bordered table-striped align-middle">
                <thead>
                    <tr>
                        <th width="36"><input type="checkbox" id="bulk-master" onclick="toggleBulkAll(this)"></th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Duration</th>
                        <th>Featured</th>
                        <th>Status</th>
                        <th width="180">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($services as $service)
                        <tr>
                            <td><input type="checkbox" class="bulk-check" value="{{ $service->id }}"></td>
                            <td>{{ $service->name }}</td>
                            <td>{{ $service->category?->name }}</td>
                            <td>${{ number_format($service->price, 2) }}</td>
                            <td>{{ $service->duration_minutes }} min</td>
                            <td>{{ $service->is_featured ? 'Yes' : 'No' }}</td>
                            <td>
                                <span class="badge bg-{{ $service->status ? 'success' : 'secondary' }}">
                                    {{ $service->status ? 'Active' : 'Inactive' }}
                                </span>
                            </td>
                            <td class="d-flex gap-1 flex-wrap">
                                <a href="{{ route('admin.services.edit', $service) }}" class="btn btn-sm btn-outline-primary">Edit</a>
                                <form method="POST" action="{{ route('admin.services.toggle', $service) }}">
                                    @csrf
                                    <button class="btn btn-sm btn-outline-warning" type="submit">Toggle</button>
                                </form>
                                <form method="POST" action="{{ route('admin.services.destroy', $service) }}" onsubmit="return confirm('Delete this service?')">
                                    @csrf
                                    @method('DELETE')
                                    <button class="btn btn-sm btn-outline-danger" type="submit">Delete</button>
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="8" class="text-center text-muted">No services yet.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>

        {{ $services->links() }}
    </div>
</div>
@endsection
