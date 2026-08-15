@extends('layouts.admin')
@section('title', 'Settings')
@section('content')
<h1 class="mt-4">Settings</h1>
@if(session('success'))<div class="alert alert-success">{{ session('success') }}</div>@endif
<div class="card mb-4">
<div class="card-header d-flex justify-content-between"><span>White-label & App Settings</span>
<a href="{{ route('admin.settings.create') }}" class="btn btn-primary btn-sm">Add Setting</a></div>
<div class="card-body">
<form method="POST" action="{{ route('admin.settings.bulk') }}" id="settings-bulk-form">@csrf
<table class="table table-bordered align-middle">
<thead><tr><th>Group</th><th>Key</th><th>Value</th><th>Type</th><th>Active</th><th>Actions</th></tr></thead>
<tbody>
@forelse($settings as $setting)
<tr>
<td>{{ $setting->group }}</td>
<td><code>{{ $setting->key }}</code></td>
<td><input type="text" name="settings[{{ $setting->id }}]" value="{{ $setting->value }}" class="form-control form-control-sm" form="settings-bulk-form"></td>
<td>{{ $setting->type }}</td>
<td><span class="badge bg-{{ $setting->status ? 'success' : 'secondary' }}">{{ $setting->status ? 'Yes' : 'No' }}</span></td>
<td class="d-flex gap-1">
<a href="{{ route('admin.settings.edit', $setting) }}" class="btn btn-sm btn-outline-primary">Edit</a>
<button class="btn btn-sm btn-outline-warning" type="submit" form="toggle-setting-{{ $setting->id }}">{{ $setting->status ? 'Disable' : 'Enable' }}</button>
</td></tr>
@empty<tr><td colspan="6" class="text-center text-muted">No settings yet.</td></tr>@endforelse
</tbody></table>
<button class="btn btn-success" type="submit">Save All Values</button>
</form>
@foreach($settings as $setting)
<form method="POST" action="{{ route('admin.settings.toggle', $setting) }}" id="toggle-setting-{{ $setting->id }}" class="d-none">@csrf</form>
@endforeach
{{ $settings->links() }}
</div></div>
@endsection
