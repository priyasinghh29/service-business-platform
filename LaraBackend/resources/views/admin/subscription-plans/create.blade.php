@extends('layouts.admin')
@section('title', 'Add Plan')
@section('content')
<h1 class="mt-4">Add Plan</h1>
<div class="card mb-4"><div class="card-body">
<form method="POST" action="{{ route('admin.subscription-plans.store') }}">@csrf @include('admin.subscription-plans._form')
<button class="btn btn-primary">Create</button>
<a href="{{ route('admin.subscription-plans.index') }}" class="btn btn-outline-secondary">Cancel</a>
</form></div></div>
@endsection
