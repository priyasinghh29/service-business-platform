@php($review = $review ?? null)
<div class="row">
<div class="col-md-4 mb-3"><label class="form-label">Customer</label>
<select name="user_id" class="form-select" required>@foreach($customers as $c)<option value="{{ $c->id }}" @selected(old('user_id', $review->user_id ?? '')==$c->id)>{{ $c->full_name }}</option>@endforeach</select></div>
<div class="col-md-4 mb-3"><label class="form-label">Service</label>
<select name="service_id" class="form-select" required>@foreach($services as $s)<option value="{{ $s->id }}" @selected(old('service_id', $review->service_id ?? '')==$s->id)>{{ $s->name }}</option>@endforeach</select></div>
<div class="col-md-4 mb-3"><label class="form-label">Provider</label>
<select name="provider_id" class="form-select"><option value="">None</option>@foreach($providers as $p)<option value="{{ $p->id }}" @selected(old('provider_id', $review->provider_id ?? '')==$p->id)>{{ $p->user?->full_name }}</option>@endforeach</select></div>
</div>
<div class="row">
<div class="col-md-3 mb-3"><label class="form-label">Rating</label><input type="number" min="1" max="5" name="rating" value="{{ old('rating', $review->rating ?? 5) }}" class="form-control" required></div>
<div class="col-md-9 mb-3"><label class="form-label">Title</label><input type="text" name="title" value="{{ old('title', $review->title ?? '') }}" class="form-control"></div>
</div>
<div class="mb-3"><label class="form-label">Comment</label><textarea name="comment" class="form-control" rows="3">{{ old('comment', $review->comment ?? '') }}</textarea></div>
<div class="form-check mb-2"><input type="hidden" name="is_approved" value="0"><input type="checkbox" name="is_approved" value="1" class="form-check-input" id="is_approved" @checked(old('is_approved', $review->is_approved ?? false))><label class="form-check-label" for="is_approved">Approved</label></div>
<div class="form-check mb-3"><input type="hidden" name="status" value="0"><input type="checkbox" name="status" value="1" class="form-check-input" id="status" @checked(old('status', $review->status ?? true))><label class="form-check-label" for="status">Active</label></div>
