@extends('layouts.admin')

@section('title', 'Add Service')

@section('content')
<h1 class="mt-4">Add Service</h1>
<ol class="breadcrumb mb-4">
    <li class="breadcrumb-item"><a href="{{ route('admin.dashboard') }}">Dashboard</a></li>
    <li class="breadcrumb-item"><a href="{{ route('admin.services.index') }}">Services</a></li>
    <li class="breadcrumb-item active">Add</li>
</ol>

<div class="card mb-4">
    <div class="card-body">
        <form method="POST" action="{{ route('admin.services.store') }}">
            @csrf
            @include('admin.services._form')
            <button type="submit" class="btn btn-primary">Create Service</button>
            <a href="{{ route('admin.services.index') }}" class="btn btn-outline-secondary">Cancel</a>
        </form>
    </div>
</div>
@endsection
