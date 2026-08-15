@extends('layouts.admin')
@section('title', $customer->full_name)
@section('content')
<h1 class="mt-4">{{ $customer->full_name }}</h1>
<ol class="breadcrumb mb-4">
<li class="breadcrumb-item"><a href="{{ route('admin.customers.index') }}">Customers</a></li>
<li class="breadcrumb-item active">{{ $customer->full_name }}</li>
</ol>
@if(session('success'))<div class="alert alert-success">{{ session('success') }}</div>@endif
<div class="row">
<div class="col-md-4"><div class="card mb-4"><div class="card-body">
<p><strong>Email:</strong> {{ $customer->email_id }}</p>
<p><strong>Phone:</strong> {{ $customer->phone_number ?: '—' }}</p>
<p><strong>Status:</strong> <span class="badge bg-{{ $customer->status ? 'success' : 'secondary' }}">{{ $customer->status ? 'Active' : 'Inactive' }}</span></p>
<p><strong>Bookings:</strong> {{ $customer->bookings_count }}</p>
<p><strong>Documents:</strong> {{ $customer->documents_count }}</p>
<p><strong>Open tickets:</strong> {{ $openTickets }}</p>
<a href="{{ route('admin.customers.edit', $customer) }}" class="btn btn-outline-primary btn-sm">Edit</a>
</div></div></div>
<div class="col-md-8"><div class="card mb-4"><div class="card-header">Recent bookings</div>
<div class="card-body"><table class="table table-sm mb-0"><thead><tr><th>Number</th><th>Service</th><th>Status</th><th>Total</th></tr></thead>
<tbody>
@forelse($recentBookings as $b)
<tr><td><a href="{{ route('admin.bookings.show', $b) }}"><code>{{ $b->booking_number }}</code></a></td><td>{{ $b->service?->name }}</td><td>{{ $b->status }}</td><td>{{ $b->total }}</td></tr>
@empty<tr><td colspan="4" class="text-muted text-center">No bookings.</td></tr>@endforelse
</tbody></table></div></div></div>
</div>
@endsection
