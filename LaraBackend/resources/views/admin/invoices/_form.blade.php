@php($invoice = $invoice ?? null)
<div class="row">
<div class="col-md-6 mb-3"><label class="form-label">Customer</label>
<select name="user_id" class="form-select" required>@foreach($customers as $c)<option value="{{ $c->id }}" @selected(old('user_id', $invoice->user_id ?? '')==$c->id)>{{ $c->full_name }}</option>@endforeach</select></div>
<div class="col-md-6 mb-3"><label class="form-label">Booking</label>
<select name="booking_id" class="form-select"><option value="">None</option>@foreach($bookings as $b)<option value="{{ $b->id }}" @selected(old('booking_id', $invoice->booking_id ?? '')==$b->id)>{{ $b->booking_number }} ({{ $b->total }})</option>@endforeach</select></div>
</div>
<div class="row">
<div class="col-md-3 mb-3"><label class="form-label">Subtotal</label><input type="number" step="0.01" name="subtotal" value="{{ old('subtotal', $invoice->subtotal ?? 0) }}" class="form-control" required></div>
<div class="col-md-3 mb-3"><label class="form-label">Discount</label><input type="number" step="0.01" name="discount" value="{{ old('discount', $invoice->discount ?? 0) }}" class="form-control"></div>
<div class="col-md-3 mb-3"><label class="form-label">Tax</label><input type="number" step="0.01" name="tax" value="{{ old('tax', $invoice->tax ?? 0) }}" class="form-control"></div>
<div class="col-md-3 mb-3"><label class="form-label">Total</label><input type="number" step="0.01" name="total" value="{{ old('total', $invoice->total ?? 0) }}" class="form-control" required></div>
</div>
<div class="row">
<div class="col-md-4 mb-3"><label class="form-label">Status</label>
<select name="status" class="form-select">@foreach(['draft','sent','paid','overdue','cancelled'] as $s)<option value="{{ $s }}" @selected(old('status', $invoice->status ?? 'draft')==$s)>{{ ucfirst($s) }}</option>@endforeach</select></div>
<div class="col-md-4 mb-3"><label class="form-label">Issued at</label><input type="date" name="issued_at" value="{{ old('issued_at', optional($invoice->issued_at ?? null)->format('Y-m-d')) }}" class="form-control"></div>
<div class="col-md-4 mb-3"><label class="form-label">Due at</label><input type="date" name="due_at" value="{{ old('due_at', optional($invoice->due_at ?? null)->format('Y-m-d')) }}" class="form-control"></div>
</div>
@if(isset($invoice))
<div class="mb-3"><label class="form-label">Paid at</label><input type="date" name="paid_at" value="{{ old('paid_at', optional($invoice->paid_at ?? null)->format('Y-m-d')) }}" class="form-control"></div>
@endif
<div class="mb-3"><label class="form-label">Notes</label><textarea name="notes" class="form-control" rows="2">{{ old('notes', $invoice->notes ?? '') }}</textarea></div>
<div class="form-check mb-3"><input type="hidden" name="status_flag" value="0"><input type="checkbox" name="status_flag" value="1" class="form-check-input" id="status_flag" @checked(old('status_flag', $invoice->status_flag ?? true))><label for="status_flag" class="form-check-label">Active</label></div>
