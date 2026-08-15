@extends('layouts.admin')
@section('title', 'Add Support Ticket')
@section('content')
<h1 class="mt-4">Add Support Ticket</h1>
<div class="card mb-4"><div class="card-body">
<form method="POST" action="{{ route('admin.support-tickets.store') }}">@csrf
@include('admin.support-tickets._form')
<button class="btn btn-primary" type="submit">Create</button>
<a href="{{ route('admin.support-tickets.index') }}" class="btn btn-outline-secondary">Cancel</a>
</form>
</div></div>
@endsection
