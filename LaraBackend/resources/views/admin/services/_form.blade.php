@php($service = $service ?? null)

<div class="mb-3">
    <label class="form-label">Category</label>
    <select name="category_id" class="form-select @error('category_id') is-invalid @enderror" required>
        <option value="">Select category</option>
        @foreach($categories as $category)
            <option value="{{ $category->id }}" @selected(old('category_id', $service->category_id ?? '') == $category->id)>
                {{ $category->name }}
            </option>
        @endforeach
    </select>
    @error('category_id')<div class="invalid-feedback">{{ $message }}</div>@enderror
</div>

<div class="mb-3">
    <label class="form-label">Name</label>
    <input type="text" name="name" value="{{ old('name', $service->name ?? '') }}" class="form-control @error('name') is-invalid @enderror" required>
    @error('name')<div class="invalid-feedback">{{ $message }}</div>@enderror
</div>

<div class="mb-3">
    <label class="form-label">Slug <span class="text-muted">(optional)</span></label>
    <input type="text" name="slug" value="{{ old('slug', $service->slug ?? '') }}" class="form-control @error('slug') is-invalid @enderror">
    @error('slug')<div class="invalid-feedback">{{ $message }}</div>@enderror
</div>

<div class="mb-3">
    <label class="form-label">Short description</label>
    <textarea name="short_description" rows="2" class="form-control @error('short_description') is-invalid @enderror">{{ old('short_description', $service->short_description ?? '') }}</textarea>
    @error('short_description')<div class="invalid-feedback">{{ $message }}</div>@enderror
</div>

<div class="mb-3">
    <label class="form-label">Description</label>
    <textarea name="description" rows="5" class="form-control @error('description') is-invalid @enderror">{{ old('description', $service->description ?? '') }}</textarea>
    @error('description')<div class="invalid-feedback">{{ $message }}</div>@enderror
</div>

<div class="row">
    <div class="col-md-4 mb-3">
        <label class="form-label">Price</label>
        <input type="number" step="0.01" min="0" name="price" value="{{ old('price', $service->price ?? '0') }}" class="form-control @error('price') is-invalid @enderror" required>
        @error('price')<div class="invalid-feedback">{{ $message }}</div>@enderror
    </div>
    <div class="col-md-4 mb-3">
        <label class="form-label">Duration (minutes)</label>
        <input type="number" min="1" name="duration_minutes" value="{{ old('duration_minutes', $service->duration_minutes ?? 60) }}" class="form-control @error('duration_minutes') is-invalid @enderror" required>
        @error('duration_minutes')<div class="invalid-feedback">{{ $message }}</div>@enderror
    </div>
    <div class="col-md-4 mb-3">
        <label class="form-label">Sort order</label>
        <input type="number" min="0" name="sort_order" value="{{ old('sort_order', $service->sort_order ?? 0) }}" class="form-control @error('sort_order') is-invalid @enderror">
        @error('sort_order')<div class="invalid-feedback">{{ $message }}</div>@enderror
    </div>
</div>

<div class="mb-3">
    <label class="form-label">Image URL</label>
    <input type="text" name="image" value="{{ old('image', $service->image ?? '') }}" class="form-control @error('image') is-invalid @enderror">
    @error('image')<div class="invalid-feedback">{{ $message }}</div>@enderror
</div>

<div class="mb-3 form-check">
    <input type="hidden" name="is_featured" value="0">
    <input type="checkbox" name="is_featured" value="1" class="form-check-input" id="is_featured" @checked(old('is_featured', $service->is_featured ?? false))>
    <label class="form-check-label" for="is_featured">Featured</label>
</div>

<div class="mb-3 form-check">
    <input type="hidden" name="status" value="0">
    <input type="checkbox" name="status" value="1" class="form-check-input" id="status" @checked(old('status', $service->status ?? true))>
    <label class="form-check-label" for="status">Active</label>
</div>
