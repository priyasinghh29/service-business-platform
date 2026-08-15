@php($setting = $setting ?? null)
<div class="mb-3"><label class="form-label">Group</label><input type="text" name="group" value="{{ old('group', $setting->group ?? 'general') }}" class="form-control" required></div>
<div class="mb-3"><label class="form-label">Key</label><input type="text" name="key" value="{{ old('key', $setting->key ?? '') }}" class="form-control" required></div>
<div class="mb-3"><label class="form-label">Value</label><textarea name="value" class="form-control" rows="3">{{ old('value', $setting->value ?? '') }}</textarea></div>
<div class="mb-3"><label class="form-label">Type</label>
<select name="type" class="form-select">@foreach(['string','boolean','json','number'] as $t)<option value="{{ $t }}" @selected(old('type', $setting->type ?? 'string')==$t)>{{ $t }}</option>@endforeach</select></div>
<div class="form-check mb-3"><input type="hidden" name="status" value="0"><input type="checkbox" name="status" value="1" class="form-check-input" id="status" @checked(old('status', $setting->status ?? true))><label class="form-check-label" for="status">Active</label></div>
