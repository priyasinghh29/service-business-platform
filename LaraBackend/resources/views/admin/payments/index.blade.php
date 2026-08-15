@extends('layouts.admin')
@section('title', 'Payments')
@section('content')
<h1 class="mt-4">Payments</h1>
@if(session('success'))<div class="alert alert-success">{{ session('success') }}</div>@endif
<div class="card mb-4">
    <div class="card-header d-flex justify-content-between align-items-center"><span>All Payments</span><a href="{{ route('admin.payments.create') }}" class="btn btn-primary btn-sm">Add</a></div>
    <div class="card-body">
        <form method="GET" class="row g-2 mb-3">
            <div class="col-md-4"><input type="text" name="q" value="{{ request('q') }}" class="form-control" placeholder="Search..."></div>
            <div class="col-md-2"><select name="status" class="form-select"><option value="">Status</option>@foreach(['pending','success','failed','refunded'] as $s)<option value="{{ $s }}" @selected(request('status')===$s)>{{ ucfirst($s) }}</option>@endforeach</select></div>
            <div class="col-md-2"><select name="gateway" class="form-select"><option value="">Gateway</option>@foreach(['manual','stripe','razorpay','paypal'] as $g)<option value="{{ $g }}" @selected(request('gateway')===$g)>{{ strtoupper($g) }}</option>@endforeach</select></div>
            <div class="col-md-2"><button class="btn btn-outline-secondary w-100" type="submit">Filter</button></div>
        </form>
        @include('admin.partials.bulk-toolbar', ['bulkRoute' => 'admin.payments.bulk'])
        <div class="table-responsive"><table class="table table-bordered table-striped align-middle">
            <thead><tr><th width="36"><input type="checkbox" id="bulk-master" onclick="toggleBulkAll(this)"></th><th>Number</th><th>Customer</th><th>Gateway</th><th>Amount</th><th>Status</th><th width="200">Actions</th></tr></thead>
            <tbody>
            @forelse($payments as $item)
            <tr>
                <td><input type="checkbox" class="bulk-check" value="{{ $item->id }}"></td>
                <td><code>{{ $item->payment_number }}</code></td>
                <td>{{ $item->user?->full_name }}</td>
                <td>{{ strtoupper($item->gateway) }}</td>
                <td>{{ $item->amount }} {{ $item->currency }}</td>
                <td>{{ $item->status }}</td>
                <td class="d-flex gap-1 flex-wrap">
                <a href="{{ route('admin.payments.edit', $item) }}" class="btn btn-sm btn-outline-primary">Edit</a>
                <form method="POST" action="{{ route('admin.payments.destroy', $item) }}" onsubmit="return confirm('Delete?')">@csrf @method('DELETE')<button class="btn btn-sm btn-outline-danger" type="submit">Delete</button></form>
            </td></tr>
            @empty<tr><td colspan="7" class="text-center text-muted">No records found.</td></tr>@endforelse
            </tbody>
        </table></div>
        {{ $payments->links() }}
    </div>
</div>
@endsection
