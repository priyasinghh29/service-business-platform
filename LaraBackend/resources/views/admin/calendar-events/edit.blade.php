@extends('layouts.admin')
@section('title', 'Edit Calendar Event')
@section('content')
<h1 class="mt-4">Edit Calendar Event</h1>
<div class="card mb-4"><div class="card-body">
<form method="POST" action="{{ route('admin.calendar-events.update', $event) }}">@csrf @method('PUT')
@include('admin.calendar-events._form')
<button class="btn btn-primary" type="submit">Update</button>
<a href="{{ route('admin.calendar-events.index') }}" class="btn btn-outline-secondary">Cancel</a>
</form>
</div></div>
@endsection
