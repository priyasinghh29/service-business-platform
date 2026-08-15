@extends('layouts.admin')
@section('title', 'Edit Booking')
@section('content')
<h1 class="mt-4">Edit Booking</h1>
<div class="card mb-4"><div class="card-body">
    <form method="POST" action="{{ route('admin.bookings.update', $booking) }}">
        @csrf
        @method('PUT')
        @include('admin.bookings._form')
        <button class="btn btn-primary" type="submit">Update</button>
        <a href="{{ route('admin.bookings.index') }}" class="btn btn-outline-secondary">Cancel</a>
    </form>
</div></div>
@endsection
