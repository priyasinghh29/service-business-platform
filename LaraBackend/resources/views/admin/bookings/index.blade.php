@extends('layouts.admin')
@section('title', 'Bookings')
@section('content')
<h1 class="mt-4">Bookings</h1>
@if(session('success'))<div class="alert alert-success">{{ session('success') }}</div>@endif
<div class="card mb-4">
    <div class="card-header d-flex justify-content-between align-items-center">
        <span>All Bookings</span>
        <a href="{{ route('admin.bookings.create') }}" class="btn btn-primary btn-sm">Add</a>
    </div>
    <div class="card-body">
        <form method="GET" class="row g-2 mb-3">
            <div class="col-md-4"><input type="text" name="q" value="{{ request('q') }}" class="form-control" placeholder="Search..."></div>
            <div class="col-md-2"><select name="status" class="form-select"><option value="">Status</option>@foreach(['pending','confirmed','completed','cancelled','rescheduled'] as $s)<option value="{{ $s }}" @selected(request('status')===$s)>{{ ucfirst($s) }}</option>@endforeach</select></div>
            <div class="col-md-2"><select name="payment_status" class="form-select"><option value="">Payment</option>@foreach(['unpaid','paid','failed','refunded'] as $s)<option value="{{ $s }}" @selected(request('payment_status')===$s)>{{ ucfirst($s) }}</option>@endforeach</select></div>
            <div class="col-md-2"><button class="btn btn-outline-secondary w-100" type="submit">Filter</button></div>
        </form>
        <div class="table-responsive">
            <table class="table table-bordered table-striped align-middle">
                <thead><tr><th>Number</th><th>Customer</th><th>Service</th><th>Date</th><th>Status</th><th>Payment</th><th>Total</th><th width="240">Actions</th></tr></thead>
                <tbody>
                    @forelse($bookings as $item)
                    <tr>
<td><a href="{{ route('admin.bookings.show', $item) }}"><code>{{ $item->booking_number }}</code></a></td>
<td>{{ $item->user?->full_name }}</td>
<td>{{ $item->service?->name }}</td>
<td>{{ $item->booking_date?->format('Y-m-d') }} {{ \Illuminate\Support\Str::of($item->booking_time)->substr(0,5) }}</td>
<td><span class="badge bg-secondary">{{ $item->status }}</span></td>
<td>{{ $item->payment_status }}</td>
<td>{{ $item->total }}</td>
                        <td class="d-flex gap-1 flex-wrap">
                            <a href="{{ route('admin.bookings.show', $item) }}" class="btn btn-sm btn-outline-secondary">Open</a>
                            <a href="{{ route('admin.bookings.edit', $item) }}" class="btn btn-sm btn-outline-primary">Edit</a>
                            <form method="POST" action="{{ route('admin.bookings.toggle', $item) }}">@csrf<button class="btn btn-sm btn-outline-warning" type="submit">Next Status</button></form>
                            <form method="POST" action="{{ route('admin.bookings.destroy', $item) }}" onsubmit="return confirm('Delete?')">@csrf @method('DELETE')<button class="btn btn-sm btn-outline-danger" type="submit">Delete</button></form>
                        </td>
                    </tr>
                    @empty
                    <tr><td colspan="8" class="text-center text-muted">No records found.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        {{ $bookings->links() }}
    </div>
</div>
@endsection
