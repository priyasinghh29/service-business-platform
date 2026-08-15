@extends('layouts.admin')
@section('title', 'Add Review')
@section('content')
<h1 class="mt-4">Add Review</h1>
<div class="card mb-4"><div class="card-body">
    <form method="POST" action="{{ route('admin.reviews.store') }}">@csrf @include('admin.reviews._form')
        <button class="btn btn-primary" type="submit">Create</button>
        <a href="{{ route('admin.reviews.index') }}" class="btn btn-outline-secondary">Cancel</a>
    </form>
</div></div>
@endsection
