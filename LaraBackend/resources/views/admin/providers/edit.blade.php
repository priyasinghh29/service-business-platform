@extends('layouts.admin')
@section('title', 'Edit Provider')
@section('content')
<h1 class="mt-4">Edit Provider</h1>
<div class="card mb-4"><div class="card-body">
    <form method="POST" action="{{ route('admin.providers.update', $provider) }}">
        @csrf
        @method('PUT')
        @include('admin.providers._form')
        <button class="btn btn-primary" type="submit">Update Provider</button>
        <a href="{{ route('admin.providers.index') }}" class="btn btn-outline-secondary">Cancel</a>
    </form>
</div></div>
@endsection
