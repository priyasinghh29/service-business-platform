@extends('layouts.admin')
@section('title', 'Add Payment')
@section('content')
<h1 class="mt-4">Add Payment</h1>
<div class="card mb-4"><div class="card-body">
    <form method="POST" action="{{ route('admin.payments.store') }}">@csrf @include('admin.payments._form')
        <button class="btn btn-primary" type="submit">Create</button>
        <a href="{{ route('admin.payments.index') }}" class="btn btn-outline-secondary">Cancel</a>
    </form>
</div></div>
@endsection
