@extends('layouts.admin')
@section('title', 'Invoice '.$invoice->invoice_number)
@section('content')
<h1 class="mt-4">Invoice {{ $invoice->invoice_number }}</h1>
<ol class="breadcrumb mb-4">
<li class="breadcrumb-item"><a href="{{ route('admin.invoices.index') }}">Invoices</a></li>
<li class="breadcrumb-item active">{{ $invoice->invoice_number }}</li>
</ol>
@if(session('success'))<div class="alert alert-success">{{ session('success') }}</div>@endif
<div class="row">
<div class="col-lg-8">
<div class="card mb-4">
<div class="card-header d-flex justify-content-between"><span>Summary</span>
<div class="d-flex gap-2">
<a href="{{ route('admin.invoices.download', $invoice) }}" class="btn btn-sm btn-outline-secondary">Download</a>
<a href="{{ route('admin.invoices.edit', $invoice) }}" class="btn btn-sm btn-outline-primary">Edit</a>
</div></div>
<div class="card-body">
<p><strong>Customer:</strong> {{ $invoice->user?->full_name }} ({{ $invoice->user?->email_id }})</p>
<p><strong>Service:</strong> {{ $invoice->booking?->service?->name ?? 'Professional Services' }}</p>
<p><strong>Status:</strong> <span class="badge bg-{{ $invoice->status==='paid' ? 'success' : 'secondary' }}">{{ $invoice->status }}</span></p>
<p><strong>Issued:</strong> {{ optional($invoice->issued_at)->format('Y-m-d') }} · <strong>Due:</strong> {{ optional($invoice->due_at)->format('Y-m-d') ?: '—' }}</p>
<table class="table table-sm"><tr><td>Subtotal</td><td class="text-end">{{ number_format((float)$invoice->subtotal,2) }}</td></tr>
<tr><td>Discount</td><td class="text-end">{{ number_format((float)$invoice->discount,2) }}</td></tr>
<tr><td>Tax</td><td class="text-end">{{ number_format((float)$invoice->tax,2) }}</td></tr>
<tr><th>Total</th><th class="text-end">{{ number_format((float)$invoice->total,2) }}</th></tr></table>
@if($invoice->notes)<p class="text-muted">{{ $invoice->notes }}</p>@endif
</div></div>
<div class="card mb-4">
<div class="card-header">Payments</div>
<div class="card-body">
<table class="table table-sm mb-0"><thead><tr><th>Number</th><th>Gateway</th><th>Amount</th><th>Status</th><th>Paid</th></tr></thead>
<tbody>
@forelse($invoice->payments as $p)
<tr><td><code>{{ $p->payment_number }}</code></td><td>{{ $p->gateway }}</td><td>{{ $p->amount }}</td><td>{{ $p->status }}</td><td>{{ optional($p->paid_at)->format('Y-m-d H:i') }}</td></tr>
@empty<tr><td colspan="5" class="text-muted text-center">No payments yet.</td></tr>@endforelse
</tbody></table>
</div></div>
</div>
<div class="col-lg-4">
<div class="card mb-4">
<div class="card-header">Actions</div>
<div class="card-body d-grid gap-2">
@if($invoice->status !== 'paid')
<form method="POST" action="{{ route('admin.invoices.mark-paid', $invoice) }}">@csrf
<button class="btn btn-success" type="submit">Mark Paid</button>
</form>
@endif
<a href="{{ route('admin.payments.create', ['invoice_id' => $invoice->id, 'user_id' => $invoice->user_id]) }}" class="btn btn-outline-primary">Record Payment</a>
</div></div>
</div></div>
@endsection
