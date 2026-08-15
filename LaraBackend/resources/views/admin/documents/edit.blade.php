@extends('layouts.admin')
@section('title', 'Edit Document')
@section('content')
<h1 class="mt-4">Edit Document</h1>
<div class="card mb-4"><div class="card-body">
<form method="POST" action="{{ route('admin.documents.update', $document) }}" enctype="multipart/form-data">@csrf @method('PUT')
@include('admin.documents._form')
<button class="btn btn-primary" type="submit">Update</button>
<a href="{{ route('admin.documents.index') }}" class="btn btn-outline-secondary">Cancel</a>
</form>
</div></div>
@endsection
