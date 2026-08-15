@extends('layouts.admin')
@section('title', 'Edit Quote')
@section('content')
<h1 class="mt-4">Edit Quote</h1>
<div class="card mb-4"><div class="card-body">
    <form method="POST" action="{{ route('admin.quotes.update', $quote) }}">
        @csrf
        @method('PUT')
        @include('admin.quotes._form')
        <button class="btn btn-primary" type="submit">Update</button>
        <a href="{{ route('admin.quotes.index') }}" class="btn btn-outline-secondary">Cancel</a>
    </form>
</div></div>
@endsection
