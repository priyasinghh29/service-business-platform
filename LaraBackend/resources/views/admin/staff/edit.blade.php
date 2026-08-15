@extends('layouts.admin')
@section('title', 'Edit Staff')
@section('content')
<h1 class="mt-4">Edit Staff</h1>
<div class="card mb-4"><div class="card-body">
<form method="POST" action="{{ route('admin.staff.update', $staffMember) }}">@csrf @method('PUT') @include('admin.staff._form')
<button class="btn btn-primary" type="submit">Update</button>
<a href="{{ route('admin.staff.index') }}" class="btn btn-outline-secondary">Cancel</a>
</form></div></div>
@endsection
