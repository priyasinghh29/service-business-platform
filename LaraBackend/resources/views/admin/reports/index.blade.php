@extends('layouts.admin')
@section('title', 'Reports')
@section('content')
<h1 class="mt-4">Reports</h1>
<form method="GET" class="row g-2 mb-4">
<div class="col-md-3"><label class="form-label">From</label><input type="date" name="from" value="{{ $from }}" class="form-control"></div>
<div class="col-md-3"><label class="form-label">To</label><input type="date" name="to" value="{{ $to }}" class="form-control"></div>
<div class="col-md-2 align-self-end"><button class="btn btn-primary w-100" type="submit">Apply</button></div>
</form>
<div class="row mb-4">
@foreach(['bookings'=>'Bookings','revenue'=>'Revenue','customers'=>'New Customers','reviews'=>'Reviews','avg_rating'=>'Avg Rating'] as $key=>$label)
<div class="col-md-2 mb-3"><div class="card"><div class="card-body"><div class="text-muted small">{{ $label }}</div><div class="fs-4 fw-bold">{{ $stats[$key] }}</div></div></div></div>
@endforeach
</div>
<div class="row">
<div class="col-md-6 mb-4">
<div class="card"><div class="card-header">Bookings by status</div><div class="card-body">
<table class="table table-sm"><tbody>
@forelse($bookingsByStatus as $status => $total)
<tr><td>{{ ucfirst($status) }}</td><td class="text-end">{{ $total }}</td></tr>
@empty<tr><td class="text-muted">No data</td></tr>@endforelse
</tbody></table>
</div></div></div>
<div class="col-md-6 mb-4">
<div class="card"><div class="card-header">Top services</div><div class="card-body">
<table class="table table-sm"><thead><tr><th>Service</th><th>Bookings</th></tr></thead><tbody>
@foreach($topServices as $service)
<tr><td>{{ $service->name }}</td><td>{{ $service->bookings_count }}</td></tr>
@endforeach
</tbody></table>
</div></div></div>
</div>
<div class="card mb-4"><div class="card-header">Recent successful payments</div><div class="card-body">
<table class="table table-bordered"><thead><tr><th>Payment</th><th>Customer</th><th>Amount</th><th>Gateway</th><th>Date</th></tr></thead>
<tbody>
@forelse($recentPayments as $payment)
<tr>
<td><code>{{ $payment->payment_number }}</code></td>
<td>{{ $payment->user?->full_name }}</td>
<td>{{ $payment->amount }} {{ $payment->currency }}</td>
<td>{{ strtoupper($payment->gateway) }}</td>
<td>{{ $payment->created_at?->format('Y-m-d H:i') }}</td>
</tr>
@empty<tr><td colspan="5" class="text-muted text-center">No payments</td></tr>@endforelse
</tbody></table>
</div></div>
@endsection
