@php($customer = $customer ?? null)
<div class="row">
    <div class="col-md-6 mb-3">
        <label class="form-label">First name</label>
        <input type="text" name="first_name" value="{{ old('first_name', $customer->first_name ?? '') }}" class="form-control" required>
    </div>
    <div class="col-md-6 mb-3">
        <label class="form-label">Last name</label>
        <input type="text" name="last_name" value="{{ old('last_name', $customer->last_name ?? '') }}" class="form-control">
    </div>
</div>
<div class="row">
    <div class="col-md-6 mb-3">
        <label class="form-label">Email</label>
        <input type="email" name="email_id" value="{{ old('email_id', $customer->email_id ?? '') }}" class="form-control" required>
    </div>
    <div class="col-md-6 mb-3">
        <label class="form-label">Phone</label>
        <input type="text" name="phone_number" value="{{ old('phone_number', $customer->phone_number ?? '') }}" class="form-control">
    </div>
</div>
<div class="mb-3">
    <label class="form-label">Address</label>
    <textarea name="address" rows="2" class="form-control">{{ old('address', $customer->address ?? '') }}</textarea>
</div>
<div class="mb-3">
    <label class="form-label">Password {{ $customer ? '(leave blank to keep)' : '' }}</label>
    <input type="password" name="password" class="form-control" {{ $customer ? '' : 'required' }}>
</div>
<div class="form-check mb-3">
    <input type="hidden" name="status" value="0">
    <input type="checkbox" name="status" value="1" class="form-check-input" id="status" @checked(old('status', $customer->status ?? true))>
    <label class="form-check-label" for="status">Active</label>
</div>
