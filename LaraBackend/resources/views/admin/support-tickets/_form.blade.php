@php($ticket = $ticket ?? null)
<div class="row">
<div class="col-md-6 mb-3"><label class="form-label">Customer</label>
<select name="user_id" class="form-select" required>
<option value="">Select</option>
@foreach($customers as $c)<option value="{{ $c->id }}" @selected(old('user_id', $ticket->user_id ?? '')==$c->id)>{{ $c->full_name }} ({{ $c->email_id }})</option>@endforeach
</select></div>
<div class="col-md-6 mb-3"><label class="form-label">Subject</label>
<input type="text" name="subject" value="{{ old('subject', $ticket->subject ?? '') }}" class="form-control" required></div>
</div>
<div class="row">
<div class="col-md-4 mb-3"><label class="form-label">Category</label>
<select name="category" class="form-select">@foreach(['General','Tax & Compliance','Billing','Documents','Technical','Live Chat','Audit & Assurance'] as $c)<option value="{{ $c }}" @selected(old('category', $ticket->category ?? 'General')==$c)>{{ $c }}</option>@endforeach</select></div>
<div class="col-md-4 mb-3"><label class="form-label">Priority</label>
<select name="priority" class="form-select">@foreach(['Low','Medium','High'] as $p)<option value="{{ $p }}" @selected(old('priority', $ticket->priority ?? 'Medium')==$p)>{{ $p }}</option>@endforeach</select></div>
<div class="col-md-4 mb-3"><label class="form-label">Status</label>
<select name="status" class="form-select">@foreach(['Open','In Progress','Waiting on You','Resolved','Closed'] as $s)<option value="{{ $s }}" @selected(old('status', $ticket->status ?? 'Open')==$s)>{{ $s }}</option>@endforeach</select></div>
</div>
<div class="mb-3"><label class="form-label">Description</label>
<textarea name="description" class="form-control" rows="3">{{ old('description', $ticket->description ?? '') }}</textarea></div>
