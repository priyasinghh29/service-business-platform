@extends('layouts.admin')
@section('title', 'Add Blog')
@section('content')
<h1 class="mt-4">Add Blog</h1>
<div class="card mb-4"><div class="card-body">
    <form method="POST" action="{{ route('admin.blogs.store') }}">@csrf @include('admin.blogs._form')
        <button class="btn btn-primary" type="submit">Create</button>
        <a href="{{ route('admin.blogs.index') }}" class="btn btn-outline-secondary">Cancel</a>
    </form>
</div></div>
@endsection
