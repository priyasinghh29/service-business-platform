@extends('layouts.admin')
@section('title', 'Edit CMS Page')
@section('content')
<h1 class="mt-4">Edit CMS Page</h1>
<div class="card mb-4"><div class="card-body">
<form method="POST" action="{{ route('admin.cms-pages.update', $page) }}">@csrf @method('PUT') @include('admin.cms-pages._form')
<button class="btn btn-primary" type="submit">Update</button>
<a href="{{ route('admin.cms-pages.index') }}" class="btn btn-outline-secondary">Cancel</a>
</form></div></div>
@endsection
