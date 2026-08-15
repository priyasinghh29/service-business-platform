@extends('layouts.admin')
@section('title', 'Service Providers')
@section('content')
<h1 class="mt-4">Service Providers</h1>
@if(session('success'))<div class="alert alert-success">{{ session('success') }}</div>@endif
<div class="card mb-4">
    <div class="card-header d-flex justify-content-between align-items-center">
        <span>All Service Providers</span>
        <a href="{{ route('admin.providers.create') }}" class="btn btn-primary btn-sm">Add</a>
    </div>
    <div class="card-body">
        <form method="GET" class="row g-2 mb-3">
            <div class="col-md-4"><input type="text" name="q" value="{{ request('q') }}" class="form-control" placeholder="Search..."></div>
            <div class="col-md-3"><select name="status" class="form-select"><option value="">All statuses</option><option value="1" @selected(request('status') === '1')>Active</option><option value="0" @selected(request('status') === '0')>Inactive</option></select></div>
            <div class="col-md-2"><button class="btn btn-outline-secondary w-100" type="submit">Filter</button></div>
        </form>
        @include('admin.partials.bulk-toolbar', ['bulkRoute' => 'admin.providers.bulk'])
        <div class="table-responsive">
            <table class="table table-bordered table-striped align-middle">
                <thead>
                    <tr>
                        <th width="36"><input type="checkbox" id="bulk-master" onclick="toggleBulkAll(this)"></th>
                        <th>Name</th><th>Business</th><th>Specialization</th><th>Rate</th><th>Status</th><th width="220">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($providers as $item)
                        <tr>
                            <td><input type="checkbox" class="bulk-check" value="{{ $item->id }}"></td>
                            <td>{{ $item->user?->full_name }}<br><small class="text-muted">{{ $item->user?->email_id }}</small></td>
                            <td>{{ $item->business_name }}</td>
                            <td>{{ $item->specialization }}</td>
                            <td>{{ $item->hourly_rate }}</td>
                            <td><span class="badge bg-{{ $item->status ? 'success' : 'secondary' }}">{{ $item->status ? 'Active' : 'Inactive' }}</span></td>
                            <td class="d-flex gap-1 flex-wrap">
                                <a href="{{ route('admin.providers.edit', $item) }}" class="btn btn-sm btn-outline-primary">Edit</a>
                                <form method="POST" action="{{ route('admin.providers.toggle', $item) }}">@csrf<button class="btn btn-sm btn-outline-warning" type="submit">{{ $item->status ? 'Disable' : 'Enable' }}</button></form>
                                <form method="POST" action="{{ route('admin.providers.destroy', $item) }}" onsubmit="return confirm('Delete this record?')">@csrf @method('DELETE')<button class="btn btn-sm btn-outline-danger" type="submit">Delete</button></form>
                            </td>
                        </tr>
                    @empty
                        <tr><td colspan="7" class="text-center text-muted">No records found.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        {{ $providers->links() }}
    </div>
</div>
@endsection
