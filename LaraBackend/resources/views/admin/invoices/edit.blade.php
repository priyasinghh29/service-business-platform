@extends('layouts.admin')
@section('title', 'Edit Invoice')
@section('content')
<h1 class="mt-4">Edit Invoice</h1>
<div class="card mb-4"><div class="card-body">
    <form method="POST" action="{{ route('admin.invoices.update', $invoice) }}">@csrf @method('PUT') @include('admin.invoices._form')
        <button class="btn btn-primary" type="submit">Update</button>
        <a href="{{ route('admin.invoices.index') }}" class="btn btn-outline-secondary">Cancel</a>
    </form>
</div></div>
@endsection
