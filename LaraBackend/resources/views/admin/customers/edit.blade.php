@extends('layouts.admin')
@section('title', 'Edit Customer')
@section('content')
<h1 class="mt-4">Edit Customer</h1>
<div class="card mb-4"><div class="card-body">
    <form method="POST" action="{{ route('admin.customers.update', $customer) }}">
        @csrf
        @method('PUT')
        @include('admin.customers._form')
        <button class="btn btn-primary" type="submit">Update Customer</button>
        <a href="{{ route('admin.customers.index') }}" class="btn btn-outline-secondary">Cancel</a>
    </form>
</div></div>
@endsection
