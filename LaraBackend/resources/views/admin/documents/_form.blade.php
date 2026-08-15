@php($document = $document ?? null)
<div class="row">
<div class="col-md-6 mb-3"><label class="form-label">Customer</label>
<select name="user_id" class="form-select" required>
<option value="">Select</option>
@foreach($customers as $c)<option value="{{ $c->id }}" @selected(old('user_id', $document->user_id ?? '')==$c->id)>{{ $c->full_name }} ({{ $c->email_id }})</option>@endforeach
</select></div>
<div class="col-md-6 mb-3"><label class="form-label">Linked booking</label>
<select name="booking_id" class="form-select">
<option value="">None</option>
@foreach($bookings as $b)<option value="{{ $b->id }}" @selected(old('booking_id', $document->booking_id ?? '')==$b->id)>{{ $b->booking_number }} — {{ $b->service?->name }}</option>@endforeach
</select></div>
</div>
<div class="row">
<div class="col-md-6 mb-3"><label class="form-label">Name</label>
<input type="text" name="name" value="{{ old('name', $document->name ?? '') }}" class="form-control" required></div>
<div class="col-md-3 mb-3"><label class="form-label">Folder</label>
<input type="text" name="folder" value="{{ old('folder', $document->folder ?? 'General') }}" class="form-control"></div>
<div class="col-md-3 mb-3"><label class="form-label">Status</label>
<select name="status" class="form-select">@foreach(['available','requested','pending','rejected'] as $s)<option value="{{ $s }}" @selected(old('status', $document->status ?? 'requested')==$s)>{{ ucfirst($s) }}</option>@endforeach</select></div>
</div>
<div class="row">
<div class="col-md-4 mb-3"><label class="form-label">Due date</label>
<input type="date" name="due_at" value="{{ old('due_at', optional($document->due_at ?? null)->format('Y-m-d')) }}" class="form-control"></div>
<div class="col-md-8 mb-3"><label class="form-label">File {{ isset($document) && $document->file_path ? '(optional replace)' : '(optional)' }}</label>
<input type="file" name="file" class="form-control"></div>
</div>
@if(isset($document) && $document->file_path)
<p class="small text-muted">Current file: <code>{{ $document->file_path }}</code></p>
@endif
