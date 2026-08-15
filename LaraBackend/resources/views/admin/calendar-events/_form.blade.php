@php($event = $event ?? null)
<div class="row">
<div class="col-md-6 mb-3"><label class="form-label">Customer</label>
<select name="user_id" class="form-select" required>
<option value="">Select</option>
@foreach($customers as $c)<option value="{{ $c->id }}" @selected(old('user_id', $event->user_id ?? '')==$c->id)>{{ $c->full_name }} ({{ $c->email_id }})</option>@endforeach
</select></div>
<div class="col-md-6 mb-3"><label class="form-label">Title</label>
<input type="text" name="title" value="{{ old('title', $event->title ?? '') }}" class="form-control" required></div>
</div>
<div class="row">
<div class="col-md-3 mb-3"><label class="form-label">Type</label>
<select name="type" class="form-select">@foreach(['meeting','deadline','rsvp'] as $t)<option value="{{ $t }}" @selected(old('type', $event->type ?? 'meeting')==$t)>{{ ucfirst($t) }}</option>@endforeach</select></div>
<div class="col-md-3 mb-3"><label class="form-label">Date</label>
<input type="date" name="event_date" value="{{ old('event_date', optional($event->event_date ?? null)->format('Y-m-d')) }}" class="form-control" required></div>
<div class="col-md-3 mb-3"><label class="form-label">Time</label>
<input type="time" name="event_time" value="{{ old('event_time', isset($event) && $event->event_time ? \Illuminate\Support\Str::of($event->event_time)->substr(0,5) : '') }}" class="form-control"></div>
<div class="col-md-3 mb-3"><label class="form-label">Priority</label>
<select name="priority" class="form-select"><option value="">—</option>@foreach(['Low','Medium','High'] as $p)<option value="{{ $p }}" @selected(old('priority', $event->priority ?? '')==$p)>{{ $p }}</option>@endforeach</select></div>
</div>
<div class="row">
<div class="col-md-4 mb-3"><label class="form-label">With</label>
<input type="text" name="with_name" value="{{ old('with_name', $event->with_name ?? '') }}" class="form-control"></div>
<div class="col-md-4 mb-3"><label class="form-label">Mode</label>
<select name="mode" class="form-select"><option value="">—</option>@foreach(['Video Call','Phone Call','In Person','Workshop'] as $m)<option value="{{ $m }}" @selected(old('mode', $event->mode ?? '')==$m)>{{ $m }}</option>@endforeach</select></div>
<div class="col-md-4 mb-3"><label class="form-label">RSVP status</label>
<select name="rsvp_status" class="form-select"><option value="">—</option>@foreach(['pending','accepted','declined'] as $r)<option value="{{ $r }}" @selected(old('rsvp_status', $event->rsvp_status ?? '')==$r)>{{ ucfirst($r) }}</option>@endforeach</select></div>
</div>
<div class="mb-3"><label class="form-label">Notes</label>
<textarea name="notes" class="form-control" rows="2">{{ old('notes', $event->notes ?? '') }}</textarea></div>
<div class="form-check mb-3">
<input type="hidden" name="status_flag" value="0">
<input type="checkbox" name="status_flag" value="1" class="form-check-input" id="status_flag" @checked(old('status_flag', $event->status_flag ?? true))>
<label class="form-check-label" for="status_flag">Active</label>
</div>
