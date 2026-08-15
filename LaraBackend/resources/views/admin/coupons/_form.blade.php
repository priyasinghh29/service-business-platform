@php($coupon = $coupon ?? null)
<div class="row">
<div class="col-md-4 mb-3"><label class="form-label">Code</label><input type="text" name="code" value="{{ old('code', $coupon->code ?? '') }}" class="form-control" required></div>
<div class="col-md-8 mb-3"><label class="form-label">Name</label><input type="text" name="name" value="{{ old('name', $coupon->name ?? '') }}" class="form-control" required></div>
</div>
<div class="row">
<div class="col-md-3 mb-3"><label class="form-label">Type</label><select name="type" class="form-select"><option value="percent" @selected(old('type', $coupon->type ?? '')=='percent')>Percent</option><option value="fixed" @selected(old('type', $coupon->type ?? '')=='fixed')>Fixed</option></select></div>
<div class="col-md-3 mb-3"><label class="form-label">Value</label><input type="number" step="0.01" name="value" value="{{ old('value', $coupon->value ?? '') }}" class="form-control" required></div>
<div class="col-md-3 mb-3"><label class="form-label">Min order</label><input type="number" step="0.01" name="min_order_amount" value="{{ old('min_order_amount', $coupon->min_order_amount ?? '') }}" class="form-control"></div>
<div class="col-md-3 mb-3"><label class="form-label">Max discount</label><input type="number" step="0.01" name="max_discount" value="{{ old('max_discount', $coupon->max_discount ?? '') }}" class="form-control"></div>
</div>
<div class="row">
<div class="col-md-4 mb-3"><label class="form-label">Usage limit</label><input type="number" name="usage_limit" value="{{ old('usage_limit', $coupon->usage_limit ?? '') }}" class="form-control"></div>
<div class="col-md-4 mb-3"><label class="form-label">Starts at</label><input type="datetime-local" name="starts_at" value="{{ old('starts_at', optional($coupon->starts_at ?? null)->format('Y-m-d\TH:i')) }}" class="form-control"></div>
<div class="col-md-4 mb-3"><label class="form-label">Expires at</label><input type="datetime-local" name="expires_at" value="{{ old('expires_at', optional($coupon->expires_at ?? null)->format('Y-m-d\TH:i')) }}" class="form-control"></div>
</div>
<div class="form-check mb-3"><input type="hidden" name="status" value="0"><input type="checkbox" name="status" value="1" class="form-check-input" id="status" @checked(old('status', $coupon->status ?? true))><label class="form-check-label" for="status">Active</label></div>
