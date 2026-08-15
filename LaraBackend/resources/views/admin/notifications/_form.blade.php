@php($notification = $notification ?? null)
<div class="mb-3"><label class="form-label">User</label>
<select name="user_id" class="form-select" required>@foreach($customers as $c)<option value="{{ $c->id }}" @selected(old('user_id', $notification->user_id ?? '')==$c->id)>{{ $c->full_name }} ({{ $c->email_id }})</option>@endforeach</select></div>
<div class="mb-3"><label class="form-label">Title</label><input type="text" name="title" value="{{ old('title', $notification->title ?? '') }}" class="form-control" required></div>
<div class="mb-3"><label class="form-label">Category</label>
<select name="type" class="form-select" required>
@foreach(['Service','Invoice','Document','Meeting','System'] as $cat)
<option value="{{ $cat }}" @selected(old('type', $notification->type ?? 'System')==$cat)>{{ $cat }}</option>
@endforeach
</select></div>
<div class="mb-3"><label class="form-label">Priority</label>
<select name="priority" class="form-select">
@foreach(['Low','Medium','High'] as $p)
<option value="{{ $p }}" @selected(old('priority', $notification->priority ?? 'Medium')==$p)>{{ $p }}</option>
@endforeach
</select></div>
<div class="mb-3"><label class="form-label">Message</label><textarea name="message" class="form-control" rows="4" required>{{ old('message', $notification->message ?? '') }}</textarea></div>
<div class="mb-3"><label class="form-label">Link (portal path)</label><input type="text" name="link" value="{{ old('link', $notification->link ?? '') }}" class="form-control" placeholder="/invoices"></div>
<div class="mb-3"><label class="form-label">Action label</label><input type="text" name="action_label" value="{{ old('action_label', $notification->action_label ?? '') }}" class="form-control" placeholder="Pay Now"></div>
<div class="form-check mb-3">
<input type="checkbox" name="action_required" value="1" class="form-check-input" id="action_required" @checked(old('action_required', $notification->action_required ?? false))>
<label class="form-check-label" for="action_required">Action required</label>
</div>
