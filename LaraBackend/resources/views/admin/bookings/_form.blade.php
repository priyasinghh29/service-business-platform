@php($booking = $booking ?? null)
<div class="row">
<div class="col-md-6 mb-3"><label class="form-label">Customer</label>
<select name="user_id" class="form-select" required>
<option value="">Select</option>
@foreach($customers as $c)<option value="{{ $c->id }}" @selected(old('user_id', $booking->user_id ?? '')==$c->id)>{{ $c->full_name }} ({{ $c->email_id }})</option>@endforeach
</select></div>
<div class="col-md-6 mb-3"><label class="form-label">Service</label>
<select name="service_id" class="form-select" required>
<option value="">Select</option>
@foreach($services as $s)<option value="{{ $s->id }}" @selected(old('service_id', $booking->service_id ?? '')==$s->id)>{{ $s->name }} ({{ $s->price }})</option>@endforeach
</select></div></div>
<div class="row">
<div class="col-md-6 mb-3"><label class="form-label">Provider</label>
<select name="provider_id" class="form-select"><option value="">None</option>
@foreach($providers as $p)<option value="{{ $p->id }}" @selected(old('provider_id', $booking->provider_id ?? '')==$p->id)>{{ $p->user?->full_name }} — {{ $p->business_name }}</option>@endforeach
</select></div>
<div class="col-md-3 mb-3"><label class="form-label">Date</label><input type="date" name="booking_date" value="{{ old('booking_date', optional($booking->booking_date ?? null)->format('Y-m-d')) }}" class="form-control" required></div>
<div class="col-md-3 mb-3"><label class="form-label">Time</label><input type="time" name="booking_time" value="{{ old('booking_time', isset($booking) ? \Illuminate\Support\Str::of($booking->booking_time)->substr(0,5) : '') }}" class="form-control" required></div>
</div>
<div class="mb-3"><label class="form-label">Package</label><input type="text" name="package_name" value="{{ old('package_name', $booking->package_name ?? '') }}" class="form-control"></div>
<div class="row">
<div class="col-md-3 mb-3"><label class="form-label">Subtotal</label><input type="number" step="0.01" name="subtotal" value="{{ old('subtotal', $booking->subtotal ?? 0) }}" class="form-control" required></div>
<div class="col-md-3 mb-3"><label class="form-label">Discount</label><input type="number" step="0.01" name="discount" value="{{ old('discount', $booking->discount ?? 0) }}" class="form-control"></div>
<div class="col-md-3 mb-3"><label class="form-label">Tax</label><input type="number" step="0.01" name="tax" value="{{ old('tax', $booking->tax ?? 0) }}" class="form-control"></div>
<div class="col-md-3 mb-3"><label class="form-label">Total</label><input type="number" step="0.01" name="total" value="{{ old('total', $booking->total ?? 0) }}" class="form-control" required></div>
</div>
<div class="row">
<div class="col-md-6 mb-3"><label class="form-label">Status</label>
<select name="status" class="form-select">@foreach(['pending','confirmed','completed','cancelled','rescheduled'] as $s)<option value="{{ $s }}" @selected(old('status', $booking->status ?? 'pending')==$s)>{{ ucfirst($s) }}</option>@endforeach</select></div>
<div class="col-md-6 mb-3"><label class="form-label">Payment status</label>
<select name="payment_status" class="form-select">@foreach(['unpaid','paid','failed','refunded'] as $s)<option value="{{ $s }}" @selected(old('payment_status', $booking->payment_status ?? 'unpaid')==$s)>{{ ucfirst($s) }}</option>@endforeach</select></div>
</div>
<div class="mb-3"><label class="form-label">Address</label><textarea name="address" class="form-control" rows="2">{{ old('address', $booking->address ?? '') }}</textarea></div>
<div class="mb-3"><label class="form-label">Customer notes</label><textarea name="customer_notes" class="form-control" rows="2">{{ old('customer_notes', $booking->customer_notes ?? '') }}</textarea></div>
<div class="mb-3"><label class="form-label">Admin notes</label><textarea name="admin_notes" class="form-control" rows="2">{{ old('admin_notes', $booking->admin_notes ?? '') }}</textarea></div>
