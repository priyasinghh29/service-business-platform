@extends('layouts.admin')
@section('title', 'Quotes')
@section('content')
<h1 class="mt-4">Quotes</h1>
@if(session('success'))<div class="alert alert-success">{{ session('success') }}</div>@endif
<div class="card mb-4">
    <div class="card-header d-flex justify-content-between align-items-center">
        <span>All Quotes</span>
        <a href="{{ route('admin.quotes.create') }}" class="btn btn-primary btn-sm">Add</a>
    </div>
    <div class="card-body">
        <form method="GET" class="row g-2 mb-3">
            <div class="col-md-4"><input type="text" name="q" value="{{ request('q') }}" class="form-control" placeholder="Search..."></div>
            <div class="col-md-2"><select name="status" class="form-select"><option value="">Status</option>@foreach(['pending','sent','accepted','rejected','expired'] as $s)<option value="{{ $s }}" @selected(request('status')===$s)>{{ ucfirst($s) }}</option>@endforeach</select></div>
            <div class="col-md-2"><button class="btn btn-outline-secondary w-100" type="submit">Filter</button></div>
        </form>
        @include('admin.partials.bulk-toolbar', ['bulkRoute' => 'admin.quotes.bulk'])
        <div class="table-responsive">
            <table class="table table-bordered table-striped align-middle">
                <thead><tr><th width="36"><input type="checkbox" id="bulk-master" onclick="toggleBulkAll(this)"></th><th>Number</th><th>Customer</th><th>Email</th><th>Amount</th><th>Status</th><th>Active</th><th width="200">Actions</th></tr></thead>
                <tbody>
                    @forelse($quotes as $item)
                    <tr>
                        <td><input type="checkbox" class="bulk-check" value="{{ $item->id }}"></td>
<td><code>{{ $item->quote_number }}</code></td>
<td>{{ $item->customer_name }}</td>
<td>{{ $item->customer_email }}</td>
<td>{{ $item->estimated_amount }}</td>
<td>{{ $item->status }}</td>
<td><span class="badge bg-{{ $item->status_flag ? 'success' : 'secondary' }}">{{ $item->status_flag ? 'Yes' : 'No' }}</span></td>
                        <td class="d-flex gap-1 flex-wrap">
                            <a href="{{ route('admin.quotes.edit', $item) }}" class="btn btn-sm btn-outline-primary">Edit</a>
                            <form method="POST" action="{{ route('admin.quotes.toggle', $item) }}">@csrf<button class="btn btn-sm btn-outline-warning" type="submit">{{ $item->status_flag ? 'Disable' : 'Enable' }}</button></form>
                            <form method="POST" action="{{ route('admin.quotes.destroy', $item) }}" onsubmit="return confirm('Delete?')">@csrf @method('DELETE')<button class="btn btn-sm btn-outline-danger" type="submit">Delete</button></form>
                        </td>
                    </tr>
                    @empty
                    <tr><td colspan="8" class="text-center text-muted">No records found.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        {{ $quotes->links() }}
    </div>
</div>
@endsection
