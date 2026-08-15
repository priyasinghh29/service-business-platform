@extends('layouts.admin')
@section('title', 'Add Booking')
@section('content')
<h1 class="mt-4">Add Booking</h1>
<div class="card mb-4"><div class="card-body">
    <form method="POST" action="{{ route('admin.bookings.store') }}">
        @csrf
        @include('admin.bookings._form')
        <button class="btn btn-primary" type="submit">Create</button>
        <a href="{{ route('admin.bookings.index') }}" class="btn btn-outline-secondary">Cancel</a>
    </form>
</div></div>
@endsection
