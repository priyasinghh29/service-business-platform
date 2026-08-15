@extends('layouts.admin')
@section('title', 'Add Calendar Event')
@section('content')
<h1 class="mt-4">Add Calendar Event</h1>
<div class="card mb-4"><div class="card-body">
<form method="POST" action="{{ route('admin.calendar-events.store') }}">@csrf
@include('admin.calendar-events._form')
<button class="btn btn-primary" type="submit">Create</button>
<a href="{{ route('admin.calendar-events.index') }}" class="btn btn-outline-secondary">Cancel</a>
</form>
</div></div>
@endsection
