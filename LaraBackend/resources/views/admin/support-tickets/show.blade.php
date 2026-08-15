@extends('layouts.admin')
@section('title', 'Ticket '.$ticket->ticket_number)
@section('content')
<h1 class="mt-4">{{ $ticket->subject }}</h1>
<ol class="breadcrumb mb-4">
<li class="breadcrumb-item"><a href="{{ route('admin.support-tickets.index') }}">Support Tickets</a></li>
<li class="breadcrumb-item active">{{ $ticket->ticket_number }}</li>
</ol>
@if(session('success'))<div class="alert alert-success">{{ session('success') }}</div>@endif

<div class="row">
<div class="col-lg-8">
<div class="card mb-4">
<div class="card-header">Conversation</div>
<div class="card-body" style="max-height: 480px; overflow-y: auto;">
@forelse($ticket->messages as $msg)
<div class="border rounded p-3 mb-3 {{ $msg->role === 'Support' ? 'bg-light' : '' }}">
<div class="d-flex justify-content-between small text-muted mb-1">
<strong>{{ $msg->author_name }} · {{ $msg->role }}</strong>
<span>{{ $msg->created_at?->format('M j, Y g:i A') }}</span>
</div>
<div>{{ $msg->message }}</div>
</div>
@empty
<p class="text-muted mb-0">No messages yet.</p>
@endforelse
</div>
</div>

<div class="card mb-4">
<div class="card-header">Reply as Support</div>
<div class="card-body">
<form method="POST" action="{{ route('admin.support-tickets.reply', $ticket) }}">@csrf
<div class="mb-3"><textarea name="message" class="form-control" rows="4" required placeholder="Type your reply..."></textarea></div>
<div class="row g-2 align-items-end">
<div class="col-md-4">
<label class="form-label">Set status</label>
<select name="status" class="form-select">
@foreach(['In Progress','Waiting on You','Resolved','Closed'] as $s)
<option value="{{ $s }}" @selected($ticket->status === $s)>{{ $s }}</option>
@endforeach
</select>
</div>
<div class="col-md-4"><button class="btn btn-primary" type="submit">Send Reply</button></div>
</div>
</form>
</div>
</div>
</div>

<div class="col-lg-4">
<div class="card mb-4">
<div class="card-header">Ticket Details</div>
<div class="card-body">
<p><strong>Number:</strong> <code>{{ $ticket->ticket_number }}</code></p>
<p><strong>Customer:</strong> {{ $ticket->user?->full_name }}<br><small class="text-muted">{{ $ticket->user?->email_id }}</small></p>
<p><strong>Category:</strong> {{ $ticket->category }}</p>
<p><strong>Priority:</strong> {{ $ticket->priority }}</p>
<p><strong>Status:</strong> {{ $ticket->status }}</p>
<p><strong>Created:</strong> {{ $ticket->created_at?->format('Y-m-d H:i') }}</p>
@if($ticket->description)
<p><strong>Description:</strong><br>{{ $ticket->description }}</p>
@endif
<a href="{{ route('admin.support-tickets.edit', $ticket) }}" class="btn btn-outline-primary btn-sm">Edit Ticket</a>
</div>
</div>
</div>
</div>
@endsection
