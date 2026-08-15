@extends('layouts.admin')
@section('title', 'Add Customer')
@section('content')
<h1 class="mt-4">Add Customer</h1>
<div class="card mb-4"><div class="card-body">
    <form method="POST" action="{{ route('admin.customers.store') }}">
        @csrf

        @include('admin.customers._form')
        <button class="btn btn-primary" type="submit">Create Customer</button>
        <a href="{{ route('admin.customers.index') }}" class="btn btn-outline-secondary">Cancel</a>
    </form>
</div></div>
@endsection
