@php($page = $page ?? null)
<div class="mb-3"><label class="form-label">Title</label><input type="text" name="title" value="{{ old('title', $page->title ?? '') }}" class="form-control" required></div>
<div class="mb-3"><label class="form-label">Slug</label><input type="text" name="slug" value="{{ old('slug', $page->slug ?? '') }}" class="form-control"></div>
<div class="mb-3"><label class="form-label">Content</label><textarea name="content" class="form-control summernote" rows="8">{{ old('content', $page->content ?? '') }}</textarea></div>
<div class="mb-3"><label class="form-label">Meta title</label><input type="text" name="meta_title" value="{{ old('meta_title', $page->meta_title ?? '') }}" class="form-control"></div>
<div class="mb-3"><label class="form-label">Meta description</label><textarea name="meta_description" class="form-control" rows="2">{{ old('meta_description', $page->meta_description ?? '') }}</textarea></div>
<div class="form-check mb-3"><input type="hidden" name="status" value="0"><input type="checkbox" name="status" value="1" class="form-check-input" id="status" @checked(old('status', $page->status ?? true))><label class="form-check-label" for="status">Active</label></div>
<script>$(function(){ $('.summernote').summernote({height:200}); });</script>
