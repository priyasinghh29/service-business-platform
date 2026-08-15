@php($quote = $quote ?? null)
<div class="row">
<div class="col-md-6 mb-3"><label class="form-label">Linked customer</label>
<select name="user_id" class="form-select"><option value="">None</option>
@foreach($customers as $c)<option value="{{ $c->id }}" @selected(old('user_id', $quote->user_id ?? '')==$c->id)>{{ $c->full_name }}</option>@endforeach
</select></div>
<div class="col-md-6 mb-3"><label class="form-label">Service</label>
<select name="service_id" class="form-select"><option value="">None</option>
@foreach($services as $s)<option value="{{ $s->id }}" @selected(old('service_id', $quote->service_id ?? '')==$s->id)>{{ $s->name }}</option>@endforeach
</select></div></div>
<div class="row">
<div class="col-md-4 mb-3"><label class="form-label">Customer name</label><input type="text" name="customer_name" value="{{ old('customer_name', $quote->customer_name ?? '') }}" class="form-control" required></div>
<div class="col-md-4 mb-3"><label class="form-label">Email</label><input type="email" name="customer_email" value="{{ old('customer_email', $quote->customer_email ?? '') }}" class="form-control" required></div>
<div class="col-md-4 mb-3"><label class="form-label">Phone</label><input type="text" name="customer_phone" value="{{ old('customer_phone', $quote->customer_phone ?? '') }}" class="form-control"></div>
</div>
<div class="mb-3"><label class="form-label">Message</label><textarea name="message" class="form-control" rows="3">{{ old('message', $quote->message ?? '') }}</textarea></div>
<div class="row">
<div class="col-md-4 mb-3"><label class="form-label">Estimated amount</label><input type="number" step="0.01" name="estimated_amount" value="{{ old('estimated_amount', $quote->estimated_amount ?? '') }}" class="form-control"></div>
<div class="col-md-4 mb-3"><label class="form-label">Status</label>
<select name="status" class="form-select">@foreach(['pending','sent','accepted','rejected','expired'] as $s)<option value="{{ $s }}" @selected(old('status', $quote->status ?? 'pending')==$s)>{{ ucfirst($s) }}</option>@endforeach</select></div>
<div class="col-md-4 mb-3"><label class="form-label">Valid until</label><input type="date" name="valid_until" value="{{ old('valid_until', optional($quote->valid_until ?? null)->format('Y-m-d')) }}" class="form-control"></div>
</div>
<div class="form-check mb-3"><input type="hidden" name="status_flag" value="0"><input type="checkbox" name="status_flag" value="1" class="form-check-input" id="status_flag" @checked(old('status_flag', $quote->status_flag ?? true))><label class="form-check-label" for="status_flag">Active</label></div>
