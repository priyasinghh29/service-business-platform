@extends('layouts.admin')
@section('title', 'Add Document')
@section('content')
<h1 class="mt-4">Add / Request Document</h1>
<div class="card mb-4"><div class="card-body">
<form method="POST" action="{{ route('admin.documents.store') }}" enctype="multipart/form-data">@csrf
@include('admin.documents._form')
<button class="btn btn-primary" type="submit">Save</button>
<a href="{{ route('admin.documents.index') }}" class="btn btn-outline-secondary">Cancel</a>
</form>
</div></div>
@endsection
