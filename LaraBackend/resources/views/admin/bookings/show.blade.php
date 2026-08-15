@extends('layouts.admin')
@section('title', 'Booking '.$booking->booking_number)
@section('content')
<h1 class="mt-4">{{ $booking->service?->name ?? 'Booking' }}</h1>
<ol class="breadcrumb mb-4">
<li class="breadcrumb-item"><a href="{{ route('admin.bookings.index') }}">Bookings</a></li>
<li class="breadcrumb-item active">{{ $booking->booking_number }}</li>
</ol>
@if(session('success'))<div class="alert alert-success">{{ session('success') }}</div>@endif
<div class="row">
<div class="col-lg-8">
<div class="card mb-4">
<div class="card-header d-flex justify-content-between"><span>Details</span>
<a href="{{ route('admin.bookings.edit', $booking) }}" class="btn btn-sm btn-outline-primary">Edit</a></div>
<div class="card-body">
<div class="row">
<div class="col-md-6"><p><strong>Number:</strong> <code>{{ $booking->booking_number }}</code></p>
<p><strong>Customer:</strong> {{ $booking->user?->full_name }}<br><small>{{ $booking->user?->email_id }}</small></p>
<p><strong>Provider:</strong> {{ $booking->provider?->user?->full_name ?: '—' }}</p></div>
<div class="col-md-6"><p><strong>Date:</strong> {{ $booking->booking_date?->format('Y-m-d') }} {{ \Illuminate\Support\Str::of($booking->booking_time)->substr(0,5) }}</p>
<p><strong>Status:</strong> <span class="badge bg-secondary">{{ $booking->status }}</span></p>
<p><strong>Payment:</strong> {{ $booking->payment_status }} · Total {{ $booking->total }}</p>
@if($booking->invoice)<p><strong>Invoice:</strong> <a href="{{ route('admin.invoices.show', $booking->invoice) }}">{{ $booking->invoice->invoice_number }}</a></p>@endif
</div></div>
@if($booking->customer_notes)<p><strong>Customer notes:</strong><br>{{ $booking->customer_notes }}</p>@endif
@if($booking->admin_notes)<p><strong>Admin notes:</strong><br>{{ $booking->admin_notes }}</p>@endif
</div></div>

<div class="card mb-4">
<div class="card-header">Workspace messages</div>
<div class="card-body" style="max-height:360px;overflow:auto">
@forelse($booking->messages as $msg)
<div class="border rounded p-2 mb-2"><small class="text-muted">{{ $msg->author_name }} · {{ $msg->role }} · {{ $msg->created_at?->format('M j, g:i A') }}</small>
<div>{{ $msg->message }}</div></div>
@empty<p class="text-muted mb-0">No messages yet.</p>@endforelse
</div>
<div class="card-footer">
<form method="POST" action="{{ route('admin.bookings.reply', $booking) }}">@csrf
<div class="input-group"><input type="text" name="message" class="form-control" placeholder="Reply to customer..." required>
<button class="btn btn-primary" type="submit">Send</button></div>
</form>
</div>
</div>
</div>
<div class="col-lg-4">
<div class="card mb-4">
<div class="card-header">Update status</div>
<div class="card-body">
<form method="POST" action="{{ route('admin.bookings.status', $booking) }}">@csrf
<div class="mb-3"><label class="form-label">Status</label>
<select name="status" class="form-select">@foreach($statuses as $s)<option value="{{ $s }}" @selected($booking->status===$s)>{{ ucfirst($s) }}</option>@endforeach</select></div>
<div class="mb-3"><label class="form-label">Payment</label>
<select name="payment_status" class="form-select">@foreach(['unpaid','paid','failed','refunded'] as $s)<option value="{{ $s }}" @selected($booking->payment_status===$s)>{{ ucfirst($s) }}</option>@endforeach</select></div>
<div class="mb-3"><label class="form-label">Admin notes</label>
<textarea name="admin_notes" class="form-control" rows="3">{{ $booking->admin_notes }}</textarea></div>
<button class="btn btn-primary w-100" type="submit">Save</button>
</form>
</div></div>
</div></div>
@endsection
