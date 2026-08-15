@extends('layouts.admin')
@section('title', 'Edit Review')
@section('content')
<h1 class="mt-4">Edit Review</h1>
<div class="card mb-4"><div class="card-body">
    <form method="POST" action="{{ route('admin.reviews.update', $review) }}">@csrf @method('PUT') @include('admin.reviews._form')
        <button class="btn btn-primary" type="submit">Update</button>
        <a href="{{ route('admin.reviews.index') }}" class="btn btn-outline-secondary">Cancel</a>
    </form>
</div></div>
@endsection
