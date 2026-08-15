@php($staffMember = $staffMember ?? null)
<div class="row">
<div class="col-md-6 mb-3"><label class="form-label">First name</label><input type="text" name="first_name" value="{{ old('first_name', $staffMember->first_name ?? '') }}" class="form-control" required></div>
<div class="col-md-6 mb-3"><label class="form-label">Last name</label><input type="text" name="last_name" value="{{ old('last_name', $staffMember->last_name ?? '') }}" class="form-control"></div>
</div>
<div class="row">
<div class="col-md-6 mb-3"><label class="form-label">Email</label><input type="email" name="email_id" value="{{ old('email_id', $staffMember->email_id ?? '') }}" class="form-control" required></div>
<div class="col-md-6 mb-3"><label class="form-label">Phone</label><input type="text" name="phone_number" value="{{ old('phone_number', $staffMember->phone_number ?? '') }}" class="form-control"></div>
</div>
<div class="mb-3"><label class="form-label">Password {{ $staffMember ? '(leave blank to keep)' : '' }}</label><input type="password" name="password" class="form-control" {{ $staffMember ? '' : 'required' }}></div>
<div class="mb-3"><label class="form-label">Role</label>
<select name="role_id" class="form-select" required><option value="">Select role</option>@foreach($roles as $role)<option value="{{ $role->id }}" @selected(old('role_id', $staffMember->role_id ?? '')==$role->id)>{{ $role->name }}</option>@endforeach</select></div>
<div class="form-check mb-3"><input type="hidden" name="status" value="0"><input type="checkbox" name="status" value="1" class="form-check-input" id="status" @checked(old('status', $staffMember->status ?? true))><label class="form-check-label" for="status">Active</label></div>
