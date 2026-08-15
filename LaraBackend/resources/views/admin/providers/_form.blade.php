@php($provider = $provider ?? null)
@php($user = $provider->user ?? null)
<div class="row">
    <div class="col-md-6 mb-3">
        <label class="form-label">First name</label>
        <input type="text" name="first_name" value="{{ old('first_name', $user->first_name ?? '') }}" class="form-control" required>
    </div>
    <div class="col-md-6 mb-3">
        <label class="form-label">Last name</label>
        <input type="text" name="last_name" value="{{ old('last_name', $user->last_name ?? '') }}" class="form-control">
    </div>
</div>
<div class="row">
    <div class="col-md-6 mb-3">
        <label class="form-label">Email</label>
        <input type="email" name="email_id" value="{{ old('email_id', $user->email_id ?? '') }}" class="form-control" required>
    </div>
    <div class="col-md-6 mb-3">
        <label class="form-label">Phone</label>
        <input type="text" name="phone_number" value="{{ old('phone_number', $user->phone_number ?? '') }}" class="form-control">
    </div>
</div>
<div class="mb-3">
    <label class="form-label">Password {{ $provider ? '(leave blank to keep)' : '' }}</label>
    <input type="password" name="password" class="form-control" {{ $provider ? '' : 'required' }}>
</div>
<div class="mb-3">
    <label class="form-label">Business name</label>
    <input type="text" name="business_name" value="{{ old('business_name', $provider->business_name ?? '') }}" class="form-control">
</div>
<div class="mb-3">
    <label class="form-label">Specialization</label>
    <input type="text" name="specialization" value="{{ old('specialization', $provider->specialization ?? '') }}" class="form-control">
</div>
<div class="mb-3">
    <label class="form-label">Hourly rate</label>
    <input type="number" step="0.01" name="hourly_rate" value="{{ old('hourly_rate', $provider->hourly_rate ?? '') }}" class="form-control">
</div>
<div class="mb-3">
    <label class="form-label">Bio</label>
    <textarea name="bio" rows="3" class="form-control">{{ old('bio', $provider->bio ?? '') }}</textarea>
</div>
<div class="form-check mb-2">
    <input type="hidden" name="is_verified" value="0">
    <input type="checkbox" name="is_verified" value="1" class="form-check-input" id="is_verified" @checked(old('is_verified', $provider->is_verified ?? false))>
    <label class="form-check-label" for="is_verified">Verified</label>
</div>
<div class="form-check mb-3">
    <input type="hidden" name="status" value="0">
    <input type="checkbox" name="status" value="1" class="form-check-input" id="status" @checked(old('status', $provider->status ?? true))>
    <label class="form-check-label" for="status">Active</label>
</div>
