@extends('layouts.admin')
@section('title', 'Invoices')
@section('content')
<h1 class="mt-4">Invoices</h1>
@if(session('success'))<div class="alert alert-success">{{ session('success') }}</div>@endif
<div class="card mb-4">
    <div class="card-header d-flex justify-content-between align-items-center"><span>All Invoices</span><a href="{{ route('admin.invoices.create') }}" class="btn btn-primary btn-sm">Add</a></div>
    <div class="card-body">
        <form method="GET" class="row g-2 mb-3">
            <div class="col-md-4"><input type="text" name="q" value="{{ request('q') }}" class="form-control" placeholder="Search..."></div>
            <div class="col-md-2"><select name="status" class="form-select"><option value="">Status</option>@foreach(['draft','sent','paid','overdue','cancelled'] as $s)<option value="{{ $s }}" @selected(request('status')===$s)>{{ ucfirst($s) }}</option>@endforeach</select></div>
            <div class="col-md-2"><button class="btn btn-outline-secondary w-100" type="submit">Filter</button></div>
        </form>
        @include('admin.partials.bulk-toolbar', ['bulkRoute' => 'admin.invoices.bulk'])
        <div class="table-responsive"><table class="table table-bordered table-striped align-middle">
            <thead><tr><th width="36"><input type="checkbox" id="bulk-master" onclick="toggleBulkAll(this)"></th><th>Number</th><th>Customer</th><th>Total</th><th>Status</th><th>Issued</th><th width="280">Actions</th></tr></thead>
            <tbody>
            @forelse($invoices as $item)
            <tr>
                <td><input type="checkbox" class="bulk-check" value="{{ $item->id }}"></td>
                <td><a href="{{ route('admin.invoices.show', $item) }}"><code>{{ $item->invoice_number }}</code></a></td>
                <td>{{ $item->user?->full_name }}</td>
                <td>{{ $item->total }}</td>
                <td>{{ $item->status }}</td>
                <td>{{ optional($item->issued_at)->format('Y-m-d') }}</td>
                <td class="d-flex gap-1 flex-wrap">
                <a href="{{ route('admin.invoices.show', $item) }}" class="btn btn-sm btn-outline-secondary">View</a>
                <a href="{{ route('admin.invoices.download', $item) }}" class="btn btn-sm btn-outline-dark">PDF</a>
                <a href="{{ route('admin.invoices.edit', $item) }}" class="btn btn-sm btn-outline-primary">Edit</a>
                @if($item->status !== 'paid')
                <form method="POST" action="{{ route('admin.invoices.mark-paid', $item) }}">@csrf<button class="btn btn-sm btn-outline-success" type="submit">Mark Paid</button></form>
                @endif
                <form method="POST" action="{{ route('admin.invoices.destroy', $item) }}" onsubmit="return confirm('Delete?')">@csrf @method('DELETE')<button class="btn btn-sm btn-outline-danger" type="submit">Delete</button></form>
            </td></tr>
            @empty<tr><td colspan="7" class="text-center text-muted">No records found.</td></tr>@endforelse
            </tbody>
        </table></div>
        {{ $invoices->links() }}
    </div>
</div>
@endsection
