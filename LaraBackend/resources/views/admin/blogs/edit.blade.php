@extends('layouts.admin')
@section('title', 'Edit Blog')
@section('content')
<h1 class="mt-4">Edit Blog</h1>
<div class="card mb-4"><div class="card-body">
    <form method="POST" action="{{ route('admin.blogs.update', $blog) }}">@csrf @method('PUT') @include('admin.blogs._form')
        <button class="btn btn-primary" type="submit">Update</button>
        <a href="{{ route('admin.blogs.index') }}" class="btn btn-outline-secondary">Cancel</a>
    </form>
</div></div>
@endsection
