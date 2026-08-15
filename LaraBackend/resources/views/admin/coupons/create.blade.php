@extends('layouts.admin')
@section('title', 'Add Coupon')
@section('content')
<h1 class="mt-4">Add Coupon</h1>
<div class="card mb-4"><div class="card-body">
    <form method="POST" action="{{ route('admin.coupons.store') }}">@csrf @include('admin.coupons._form')
        <button class="btn btn-primary" type="submit">Create</button>
        <a href="{{ route('admin.coupons.index') }}" class="btn btn-outline-secondary">Cancel</a>
    </form>
</div></div>
@endsection
