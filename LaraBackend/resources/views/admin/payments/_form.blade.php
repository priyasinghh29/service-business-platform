@php($payment = $payment ?? null)
<div class="row">
<div class="col-md-4 mb-3"><label class="form-label">Customer</label>
<select name="user_id" class="form-select" required>@foreach($customers as $c)<option value="{{ $c->id }}" @selected(old('user_id', $payment->user_id ?? '')==$c->id)>{{ $c->full_name }}</option>@endforeach</select></div>
<div class="col-md-4 mb-3"><label class="form-label">Booking</label>
<select name="booking_id" class="form-select"><option value="">None</option>@foreach($bookings as $b)<option value="{{ $b->id }}" @selected(old('booking_id', $payment->booking_id ?? '')==$b->id)>{{ $b->booking_number }}</option>@endforeach</select></div>
<div class="col-md-4 mb-3"><label class="form-label">Invoice</label>
<select name="invoice_id" class="form-select"><option value="">None</option>@foreach($invoices as $i)<option value="{{ $i->id }}" @selected(old('invoice_id', $payment->invoice_id ?? '')==$i->id)>{{ $i->invoice_number }}</option>@endforeach</select></div>
</div>
<div class="row">
<div class="col-md-3 mb-3"><label class="form-label">Gateway</label>
<select name="gateway" class="form-select">@foreach(['manual','stripe','razorpay','paypal'] as $g)<option value="{{ $g }}" @selected(old('gateway', $payment->gateway ?? 'manual')==$g)>{{ strtoupper($g) }}</option>@endforeach</select></div>
<div class="col-md-3 mb-3"><label class="form-label">Reference</label><input type="text" name="gateway_reference" value="{{ old('gateway_reference', $payment->gateway_reference ?? '') }}" class="form-control"></div>
<div class="col-md-2 mb-3"><label class="form-label">Amount</label><input type="number" step="0.01" name="amount" value="{{ old('amount', $payment->amount ?? 0) }}" class="form-control" required></div>
<div class="col-md-2 mb-3"><label class="form-label">Currency</label><input type="text" name="currency" value="{{ old('currency', $payment->currency ?? 'USD') }}" class="form-control" required></div>
<div class="col-md-2 mb-3"><label class="form-label">Status</label>
<select name="status" class="form-select">@foreach(['pending','success','failed','refunded'] as $s)<option value="{{ $s }}" @selected(old('status', $payment->status ?? 'pending')==$s)>{{ ucfirst($s) }}</option>@endforeach</select></div>
</div>
<div class="mb-3"><label class="form-label">Paid at</label><input type="datetime-local" name="paid_at" value="{{ old('paid_at', optional($payment->paid_at ?? null)->format('Y-m-d\TH:i')) }}" class="form-control"></div>
<div class="form-check mb-3"><input type="hidden" name="status_flag" value="0"><input type="checkbox" name="status_flag" value="1" class="form-check-input" id="status_flag" @checked(old('status_flag', $payment->status_flag ?? true))><label class="form-check-label" for="status_flag">Active</label></div>
