@extends('layouts.admin')
@section('title', 'Edit Notification')
@section('content')
<h1 class="mt-4">Edit Notification</h1>
<div class="card mb-4"><div class="card-body">
<form method="POST" action="{{ route('admin.notifications.update', $notification) }}">@csrf @method('PUT') @include('admin.notifications._form')
<button class="btn btn-primary">Update</button>
<a href="{{ route('admin.notifications.index') }}" class="btn btn-outline-secondary">Cancel</a>
</form></div></div>
@endsection
