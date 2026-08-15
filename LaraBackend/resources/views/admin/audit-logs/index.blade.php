@extends('layouts.admin')
@section('title', 'Audit Logs')
@section('content')
<h1 class="mt-4">Audit Logs</h1>
<div class="card mb-4"><div class="card-header">Activity</div><div class="card-body">
<form method="GET" class="row g-2 mb-3">
<div class="col-md-4"><input type="text" name="q" value="{{ request('q') }}" class="form-control" placeholder="Search action, subject, IP"></div>
<div class="col-md-3"><input type="text" name="action" value="{{ request('action') }}" class="form-control" placeholder="Action contains..."></div>
<div class="col-md-2"><button class="btn btn-outline-secondary w-100" type="submit">Filter</button></div>
</form>
<table class="table table-bordered table-striped table-sm">
<thead><tr><th>When</th><th>Action</th><th>Subject</th><th>Actor</th><th>IP</th><th></th></tr></thead>
<tbody>
@forelse($logs as $item)
<tr>
<td>{{ $item->created_at }}</td>
<td><code>{{ $item->action }}</code></td>
<td>{{ class_basename((string)$item->subject_type) }} #{{ $item->subject_id }}</td>
<td>{{ class_basename((string)$item->actor_type) }} #{{ $item->actor_id }}</td>
<td>{{ $item->ip_address }}</td>
<td><a href="{{ route('admin.audit-logs.show', $item) }}" class="btn btn-sm btn-outline-primary">View</a></td>
</tr>
@empty<tr><td colspan="6" class="text-center text-muted">No logs yet.</td></tr>@endforelse
</tbody></table>
{{ $logs->links() }}
</div></div>
@endsection
