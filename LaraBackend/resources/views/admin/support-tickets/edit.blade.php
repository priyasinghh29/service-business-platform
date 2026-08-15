@extends('layouts.admin')
@section('title', 'Edit Support Ticket')
@section('content')
<h1 class="mt-4">Edit Support Ticket</h1>
<div class="card mb-4"><div class="card-body">
<form method="POST" action="{{ route('admin.support-tickets.update', $ticket) }}">@csrf @method('PUT')
@include('admin.support-tickets._form')
<button class="btn btn-primary" type="submit">Update</button>
<a href="{{ route('admin.support-tickets.show', $ticket) }}" class="btn btn-outline-secondary">Cancel</a>
</form>
</div></div>
@endsection
