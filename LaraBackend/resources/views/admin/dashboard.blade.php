@extends('layouts.admin')

@section('title', 'Admin Dashboard')

@section('content')

<h1 class="mt-4">Dashboard</h1>
<ol class="breadcrumb mb-4">
    <li class="breadcrumb-item active">Dashboard</li>
</ol>

<div class="row">
    <div class="col-xl-3 col-md-6">
        <div class="card bg-primary text-white mb-4">
            <div class="card-body">
                <h4>{{ $totalUsers }}</h4>
                <small>Customers</small>
            </div>
            <div class="card-footer d-flex align-items-center justify-content-between">
                <a class="small text-white stretched-link" href="{{ route('admin.customers.index') }}">View</a>
            </div>
        </div>
    </div>
    <div class="col-xl-3 col-md-6">
        <div class="card bg-warning text-dark mb-4">
            <div class="card-body">
                <h4>{{ $totalBookings }}</h4>
                <small>Bookings ({{ $pendingBookings }} pending)</small>
            </div>
            <div class="card-footer d-flex align-items-center justify-content-between">
                <a class="small text-dark stretched-link" href="{{ route('admin.bookings.index') }}">View</a>
            </div>
        </div>
    </div>
    <div class="col-xl-3 col-md-6">
        <div class="card bg-danger text-white mb-4">
            <div class="card-body">
                <h4>{{ $openTickets }}</h4>
                <small>Open support tickets</small>
            </div>
            <div class="card-footer d-flex align-items-center justify-content-between">
                <a class="small text-white stretched-link" href="{{ route('admin.support-tickets.index') }}">View</a>
            </div>
        </div>
    </div>
    <div class="col-xl-3 col-md-6">
        <div class="card bg-dark text-white mb-4">
            <div class="card-body">
                <h4>{{ number_format((float) $revenue, 2) }}</h4>
                <small>Revenue</small>
            </div>
            <div class="card-footer d-flex align-items-center justify-content-between">
                <a class="small text-white stretched-link" href="{{ route('admin.payments.index') }}">View</a>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-md-3">
        <div class="card mb-4"><div class="card-body">
            <div class="text-muted">Outstanding invoices</div>
            <div class="fs-3">{{ $outstandingInvoices }}</div>
            <a href="{{ route('admin.invoices.index') }}" class="small">Manage invoices</a>
        </div></div>
    </div>
    <div class="col-md-3">
        <div class="card mb-4"><div class="card-body">
            <div class="text-muted">Doc requests</div>
            <div class="fs-3">{{ $requestedDocs }}</div>
            <a href="{{ route('admin.documents.index') }}" class="small">Manage documents</a>
        </div></div>
    </div>
    <div class="col-md-3">
        <div class="card mb-4"><div class="card-body">
            <div class="text-muted">Upcoming calendar events</div>
            <div class="fs-3">{{ $upcomingEvents }}</div>
            <a href="{{ route('admin.calendar-events.index') }}" class="small">Manage events</a>
        </div></div>
    </div>
    <div class="col-md-3">
        <div class="card mb-4"><div class="card-body">
            <div class="text-muted">Unread notifications</div>
            <div class="fs-3">{{ $unreadNotifications }}</div>
            <a href="{{ route('admin.notifications.index') }}" class="small">Manage notifications</a>
        </div></div>
    </div>
</div>

<div class="row">
    <div class="col-lg-7">
        <div class="card mt-2 mb-4">
            <div class="card-header">Recent bookings</div>
            <div class="card-body">
                <table class="table table-sm table-striped mb-0">
                    <thead>
                        <tr>
                            <th>Number</th>
                            <th>Customer</th>
                            <th>Service</th>
                            <th>Status</th>
                            <th>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($recentBookings as $booking)
                            <tr>
                                <td><code>{{ $booking->booking_number }}</code></td>
                                <td>{{ $booking->user?->full_name }}</td>
                                <td>{{ $booking->service?->name }}</td>
                                <td>{{ $booking->status }}</td>
                                <td>{{ $booking->total }}</td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="5" class="text-muted text-center">No bookings yet.</td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <div class="col-lg-5">
        <div class="card mt-2 mb-4">
            <div class="card-header d-flex justify-content-between">
                <span>Recent support tickets</span>
                <a href="{{ route('admin.support-tickets.index') }}" class="small">All</a>
            </div>
            <div class="card-body">
                <table class="table table-sm table-striped mb-0">
                    <thead><tr><th>Ticket</th><th>Customer</th><th>Status</th></tr></thead>
                    <tbody>
                        @forelse($recentTickets as $ticket)
                            <tr>
                                <td><a href="{{ route('admin.support-tickets.show', $ticket) }}">{{ $ticket->subject }}</a></td>
                                <td>{{ $ticket->user?->full_name }}</td>
                                <td>{{ $ticket->status }}</td>
                            </tr>
                        @empty
                            <tr><td colspan="3" class="text-muted text-center">No tickets yet.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

@endsection
