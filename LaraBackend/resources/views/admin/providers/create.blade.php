@extends('layouts.admin')
@section('title', 'Add Provider')
@section('content')
<h1 class="mt-4">Add Provider</h1>
<div class="card mb-4"><div class="card-body">
    <form method="POST" action="{{ route('admin.providers.store') }}">
        @csrf

        @include('admin.providers._form')
        <button class="btn btn-primary" type="submit">Create Provider</button>
        <a href="{{ route('admin.providers.index') }}" class="btn btn-outline-secondary">Cancel</a>
    </form>
</div></div>
@endsection
