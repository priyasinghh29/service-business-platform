@extends('layouts.admin')
@section('title', 'Subscription Plans')
@section('content')
<h1 class="mt-4">Subscription Plans</h1>
@if(session('success'))<div class="alert alert-success">{{ session('success') }}</div>@endif
<div class="card mb-4">
<div class="card-header d-flex justify-content-between"><span>Plans</span>
<a href="{{ route('admin.subscription-plans.create') }}" class="btn btn-primary btn-sm">Add</a></div>
<div class="card-body">
<table class="table table-bordered table-striped">
<thead><tr><th>Name</th><th>Price</th><th>Period</th><th>Featured</th><th>Status</th><th>Actions</th></tr></thead>
<tbody>
@forelse($plans as $item)
<tr>
<td>{{ $item->name }}</td><td>{{ $item->price }}</td><td>{{ $item->billing_period }}</td>
<td>{{ $item->is_featured ? 'Yes' : 'No' }}</td>
<td><span class="badge bg-{{ $item->status ? 'success' : 'secondary' }}">{{ $item->status ? 'Active' : 'Inactive' }}</span></td>
<td class="d-flex gap-1">
<a href="{{ route('admin.subscription-plans.edit', $item) }}" class="btn btn-sm btn-outline-primary">Edit</a>
<form method="POST" action="{{ route('admin.subscription-plans.toggle', $item) }}">@csrf<button class="btn btn-sm btn-outline-warning" type="submit">Toggle</button></form>
<form method="POST" action="{{ route('admin.subscription-plans.destroy', $item) }}" onsubmit="return confirm('Delete?')">@csrf @method('DELETE')<button class="btn btn-sm btn-outline-danger" type="submit">Delete</button></form>
</td></tr>
@empty<tr><td colspan="6" class="text-center text-muted">No plans yet.</td></tr>@endforelse
</tbody></table>
{{ $plans->links() }}
</div></div>
@endsection
