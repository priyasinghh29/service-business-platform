@extends('layouts.admin')
@section('title', 'Edit Role')
@section('content')
<h1 class="mt-4">Edit Role</h1>
<div class="card mb-4"><div class="card-body">
<form method="POST" action="{{ route('admin.roles.update', $role) }}">@csrf @method('PUT') @include('admin.roles._form')
<button class="btn btn-primary">Update</button>
<a href="{{ route('admin.roles.index') }}" class="btn btn-outline-secondary">Cancel</a>
</form></div></div>
@endsection
