@extends('layouts.admin')
@section('title', 'Add Setting')
@section('content')
<h1 class="mt-4">Add Setting</h1>
<div class="card mb-4"><div class="card-body">
<form method="POST" action="{{ route('admin.settings.store') }}">@csrf @include('admin.settings._form')
<button class="btn btn-primary">Create</button>
<a href="{{ route('admin.settings.index') }}" class="btn btn-outline-secondary">Cancel</a>
</form></div></div>
@endsection
