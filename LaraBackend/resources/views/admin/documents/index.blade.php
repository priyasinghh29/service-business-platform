@extends('layouts.admin')
@section('title', 'Documents')
@section('content')
<h1 class="mt-4">Documents</h1>
@if(session('success'))<div class="alert alert-success">{{ session('success') }}</div>@endif
<div class="card mb-4">
<div class="card-header d-flex justify-content-between align-items-center">
<span>Document Vault</span>
<a href="{{ route('admin.documents.create') }}" class="btn btn-primary btn-sm">Add / Request</a>
</div>
<div class="card-body">
<form method="GET" class="row g-2 mb-3">
<div class="col-md-4"><input type="text" name="q" value="{{ request('q') }}" class="form-control" placeholder="Search..."></div>
<div class="col-md-2"><select name="status" class="form-select"><option value="">Status</option>@foreach(['available','requested','pending','rejected'] as $s)<option value="{{ $s }}" @selected(request('status')===$s)>{{ ucfirst($s) }}</option>@endforeach</select></div>
<div class="col-md-2"><button class="btn btn-outline-secondary w-100" type="submit">Filter</button></div>
</form>
<table class="table table-bordered table-striped align-middle">
<thead><tr><th>Name</th><th>Customer</th><th>Folder</th><th>Status</th><th>Uploaded by</th><th>Due</th><th width="180">Actions</th></tr></thead>
<tbody>
@forelse($documents as $item)
<tr>
<td>{{ $item->name }}</td>
<td>{{ $item->user?->full_name }}</td>
<td>{{ $item->folder }}</td>
<td>{{ $item->status }}</td>
<td>{{ $item->uploaded_by ?: '—' }}</td>
<td>{{ $item->due_at?->format('Y-m-d') ?: '—' }}</td>
<td class="d-flex gap-1">
@if($item->file_path)
<a href="{{ route('admin.documents.download', $item) }}" class="btn btn-sm btn-outline-secondary">Download</a>
@endif
<a href="{{ route('admin.documents.edit', $item) }}" class="btn btn-sm btn-outline-primary">Edit</a>
<form method="POST" action="{{ route('admin.documents.destroy', $item) }}" onsubmit="return confirm('Delete?')">@csrf @method('DELETE')<button class="btn btn-sm btn-outline-danger" type="submit">Delete</button></form>
</td>
</tr>
@empty
<tr><td colspan="7" class="text-center text-muted">No documents found.</td></tr>
@endforelse
</tbody>
</table>
{{ $documents->links() }}
</div></div>
@endsection
