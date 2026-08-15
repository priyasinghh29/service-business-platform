@php($plan = $plan ?? null)
<div class="mb-3"><label class="form-label">Name</label><input type="text" name="name" value="{{ old('name', $plan->name ?? '') }}" class="form-control" required></div>
<div class="mb-3"><label class="form-label">Slug</label><input type="text" name="slug" value="{{ old('slug', $plan->slug ?? '') }}" class="form-control"></div>
<div class="mb-3"><label class="form-label">Description</label><textarea name="description" class="form-control" rows="2">{{ old('description', $plan->description ?? '') }}</textarea></div>
<div class="row">
<div class="col-md-6 mb-3"><label class="form-label">Price</label><input type="number" step="0.01" name="price" value="{{ old('price', $plan->price ?? 0) }}" class="form-control" required></div>
<div class="col-md-6 mb-3"><label class="form-label">Billing period</label>
<select name="billing_period" class="form-select"><option value="monthly" @selected(old('billing_period', $plan->billing_period ?? '')=='monthly')>Monthly</option><option value="yearly" @selected(old('billing_period', $plan->billing_period ?? '')=='yearly')>Yearly</option></select></div>
</div>
<div class="mb-3"><label class="form-label">Features (one per line)</label>
<textarea name="features" class="form-control" rows="5">{{ old('features', isset($plan) && is_array($plan->features) ? implode("\n", $plan->features) : '') }}</textarea></div>
<div class="form-check mb-2"><input type="hidden" name="is_featured" value="0"><input type="checkbox" name="is_featured" value="1" class="form-check-input" id="is_featured" @checked(old('is_featured', $plan->is_featured ?? false))><label class="form-check-label" for="is_featured">Featured</label></div>
<div class="form-check mb-3"><input type="hidden" name="status" value="0"><input type="checkbox" name="status" value="1" class="form-check-input" id="status" @checked(old('status', $plan->status ?? true))><label class="form-check-label" for="status">Active</label></div>
