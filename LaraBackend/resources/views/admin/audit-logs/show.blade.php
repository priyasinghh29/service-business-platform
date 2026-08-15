@extends('layouts.admin')
@section('title', 'Audit Log Detail')
@section('content')
<h1 class="mt-4">Audit Log #{{ $log->id }}</h1>
<a href="{{ route('admin.audit-logs.index') }}" class="btn btn-outline-secondary mb-3">Back</a>
<div class="card mb-4"><div class="card-body">
<dl class="row mb-0">
<dt class="col-sm-3">Action</dt><dd class="col-sm-9"><code>{{ $log->action }}</code></dd>
<dt class="col-sm-3">Actor</dt><dd class="col-sm-9">{{ $log->actor_type }} #{{ $log->actor_id }}</dd>
<dt class="col-sm-3">Subject</dt><dd class="col-sm-9">{{ $log->subject_type }} #{{ $log->subject_id }}</dd>
<dt class="col-sm-3">IP</dt><dd class="col-sm-9">{{ $log->ip_address }}</dd>
<dt class="col-sm-3">User agent</dt><dd class="col-sm-9"><small>{{ $log->user_agent }}</small></dd>
<dt class="col-sm-3">Old values</dt><dd class="col-sm-9"><pre class="bg-light p-2">{{ json_encode($log->old_values, JSON_PRETTY_PRINT) }}</pre></dd>
<dt class="col-sm-3">New values</dt><dd class="col-sm-9"><pre class="bg-light p-2">{{ json_encode($log->new_values, JSON_PRETTY_PRINT) }}</pre></dd>
</dl>
</div></div>
@endsection
