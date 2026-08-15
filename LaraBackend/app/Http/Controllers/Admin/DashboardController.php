<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Booking;
use App\Models\CalendarEvent;
use App\Models\Document;
use App\Models\Invoice;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\Service;
use App\Models\ServiceProvider;
use App\Models\SupportTicket;
use App\Models\User;

class DashboardController extends Controller
{
    public function index()
    {
        $totalUsers = User::where('role', 'customer')->count();
        $totalAdmins = Admin::count();
        $totalProviders = ServiceProvider::count();
        $totalServices = Service::count();
        $totalBookings = Booking::count();
        $revenue = Payment::where('status', 'success')->sum('amount');
        $pendingBookings = Booking::where('status', 'pending')->count();
        $recentBookings = Booking::with(['user', 'service'])->latest()->limit(8)->get();

        $openTickets = SupportTicket::whereNotIn('status', ['Resolved', 'Closed'])->count();
        $outstandingInvoices = Invoice::whereIn('status', ['outstanding', 'overdue', 'pending', 'unpaid', 'sent'])->count();
        $requestedDocs = Document::where('status', 'requested')->count();
        $unreadNotifications = Notification::where('read', false)->count();
        $upcomingEvents = CalendarEvent::where('status_flag', true)
            ->whereDate('event_date', '>=', now()->toDateString())
            ->count();
        $recentTickets = SupportTicket::with('user')->latest('updated_at')->limit(5)->get();

        return view('admin.dashboard', compact(
            'totalUsers',
            'totalAdmins',
            'totalProviders',
            'totalServices',
            'totalBookings',
            'revenue',
            'pendingBookings',
            'recentBookings',
            'openTickets',
            'outstandingInvoices',
            'requestedDocs',
            'unreadNotifications',
            'upcomingEvents',
            'recentTickets',
        ));
    }
}
