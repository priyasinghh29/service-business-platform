@extends('layouts.admin')
@section('title', 'Edit Coupon')
@section('content')
<h1 class="mt-4">Edit Coupon</h1>
<div class="card mb-4"><div class="card-body">
    <form method="POST" action="{{ route('admin.coupons.update', $coupon) }}">@csrf @method('PUT') @include('admin.coupons._form')
        <button class="btn btn-primary" type="submit">Update</button>
        <a href="{{ route('admin.coupons.index') }}" class="btn btn-outline-secondary">Cancel</a>
    </form>
</div></div>
@endsection
