@php($blog = $blog ?? null)
<div class="mb-3"><label class="form-label">Title</label><input type="text" name="title" value="{{ old('title', $blog->title ?? '') }}" class="form-control" required></div>
<div class="mb-3"><label class="form-label">Slug</label><input type="text" name="slug" value="{{ old('slug', $blog->slug ?? '') }}" class="form-control"></div>
<div class="mb-3"><label class="form-label">Excerpt</label><textarea name="excerpt" class="form-control" rows="2">{{ old('excerpt', $blog->excerpt ?? '') }}</textarea></div>
<div class="mb-3"><label class="form-label">Content</label><textarea name="content" class="form-control summernote" rows="8">{{ old('content', $blog->content ?? '') }}</textarea></div>
<div class="mb-3"><label class="form-label">Image URL</label><input type="text" name="image" value="{{ old('image', $blog->image ?? '') }}" class="form-control"></div>
<div class="mb-3"><label class="form-label">Published at</label><input type="datetime-local" name="published_at" value="{{ old('published_at', optional($blog->published_at ?? null)->format('Y-m-d\TH:i')) }}" class="form-control"></div>
<div class="form-check mb-3"><input type="hidden" name="status" value="0"><input type="checkbox" name="status" value="1" class="form-check-input" id="status" @checked(old('status', $blog->status ?? true))><label class="form-check-label" for="status">Active</label></div>
<script>$(function(){ $('.summernote').summernote({height:200}); });</script>
