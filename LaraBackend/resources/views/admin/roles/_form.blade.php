@php($role = $role ?? null)
<div class="mb-3"><label class="form-label">Name</label><input type="text" name="name" value="{{ old('name', $role->name ?? '') }}" class="form-control" required></div>
<div class="mb-3"><label class="form-label">Slug</label><input type="text" name="slug" value="{{ old('slug', $role->slug ?? '') }}" class="form-control"></div>
<div class="mb-3"><label class="form-label">Description</label><textarea name="description" class="form-control" rows="2">{{ old('description', $role->description ?? '') }}</textarea></div>
<div class="mb-3"><label class="form-label">Permissions</label>
<div class="row">
@foreach($permissions->groupBy('module') as $module => $perms)
<div class="col-md-4 mb-3">
<strong>{{ $module ?: 'General' }}</strong>
@foreach($perms as $perm)
<div class="form-check">
<input class="form-check-input" type="checkbox" name="permissions[]" value="{{ $perm->id }}" id="perm{{ $perm->id }}"
@checked(in_array($perm->id, old('permissions', isset($role) ? $role->permissions->pluck('id')->all() : [])))>
<label class="form-check-label" for="perm{{ $perm->id }}">{{ $perm->name }}</label>
</div>
@endforeach
</div>
@endforeach
</div></div>
<div class="form-check mb-3"><input type="hidden" name="status" value="0"><input type="checkbox" name="status" value="1" class="form-check-input" id="status" @checked(old('status', $role->status ?? true))><label class="form-check-label" for="status">Active</label></div>
