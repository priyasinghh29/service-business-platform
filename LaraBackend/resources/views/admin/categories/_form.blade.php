@php($category = $category ?? null)

<div class="mb-3">
    <label class="form-label">Name</label>
    <input type="text" name="name" value="{{ old('name', $category->name ?? '') }}" class="form-control @error('name') is-invalid @enderror" required>
    @error('name')<div class="invalid-feedback">{{ $message }}</div>@enderror
</div>

<div class="mb-3">
    <label class="form-label">Slug <span class="text-muted">(optional)</span></label>
    <input type="text" name="slug" value="{{ old('slug', $category->slug ?? '') }}" class="form-control @error('slug') is-invalid @enderror">
    @error('slug')<div class="invalid-feedback">{{ $message }}</div>@enderror
</div>

<div class="mb-3">
    <label class="form-label">Description</label>
    <textarea name="description" rows="3" class="form-control @error('description') is-invalid @enderror">{{ old('description', $category->description ?? '') }}</textarea>
    @error('description')<div class="invalid-feedback">{{ $message }}</div>@enderror
</div>

<div class="mb-3">
    <label class="form-label">Image URL</label>
    <input type="text" name="image" value="{{ old('image', $category->image ?? '') }}" class="form-control @error('image') is-invalid @enderror">
    @error('image')<div class="invalid-feedback">{{ $message }}</div>@enderror
</div>

<div class="mb-3">
    <label class="form-label">Sort order</label>
    <input type="number" name="sort_order" min="0" value="{{ old('sort_order', $category->sort_order ?? 0) }}" class="form-control @error('sort_order') is-invalid @enderror">
    @error('sort_order')<div class="invalid-feedback">{{ $message }}</div>@enderror
</div>

<div class="mb-3 form-check">
    <input type="hidden" name="status" value="0">
    <input type="checkbox" name="status" value="1" class="form-check-input" id="status" @checked(old('status', $category->status ?? true))>
    <label class="form-check-label" for="status">Active</label>
</div>
