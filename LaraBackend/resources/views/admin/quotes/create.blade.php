@extends('layouts.admin')
@section('title', 'Add Quote')
@section('content')
<h1 class="mt-4">Add Quote</h1>
<div class="card mb-4"><div class="card-body">
    <form method="POST" action="{{ route('admin.quotes.store') }}">
        @csrf
        @include('admin.quotes._form')
        <button class="btn btn-primary" type="submit">Create</button>
        <a href="{{ route('admin.quotes.index') }}" class="btn btn-outline-secondary">Cancel</a>
    </form>
</div></div>
@endsection
