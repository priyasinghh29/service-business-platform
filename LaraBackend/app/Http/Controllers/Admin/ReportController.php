<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Payment;
use App\Models\Review;
use App\Models\Service;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\View\View;

class ReportController extends Controller
{
    public function index(Request $request): View
    {
        $from = $request->input('from', now()->subDays(30)->toDateString());
        $to = $request->input('to', now()->toDateString());

        $stats = [
            'bookings' => Booking::whereBetween('created_at', [$from, $to.' 23:59:59'])->count(),
            'revenue' => Payment::where('status', 'success')->whereBetween('created_at', [$from, $to.' 23:59:59'])->sum('amount'),
            'customers' => User::where('role', 'customer')->whereBetween('created_at', [$from, $to.' 23:59:59'])->count(),
            'reviews' => Review::whereBetween('created_at', [$from, $to.' 23:59:59'])->count(),
            'avg_rating' => round((float) Review::whereBetween('created_at', [$from, $to.' 23:59:59'])->avg('rating'), 2),
        ];

        $bookingsByStatus = Booking::select('status', DB::raw('count(*) as total'))
            ->whereBetween('created_at', [$from, $to.' 23:59:59'])
            ->groupBy('status')
            ->pluck('total', 'status');

        $topServices = Service::query()
            ->withCount(['bookings' => fn ($q) => $q->whereBetween('created_at', [$from, $to.' 23:59:59'])])
            ->orderByDesc('bookings_count')
            ->limit(10)
            ->get();

        $recentPayments = Payment::with('user')->where('status', 'success')
            ->whereBetween('created_at', [$from, $to.' 23:59:59'])
            ->latest()
            ->limit(10)
            ->get();

        return view('admin.reports.index', compact('stats', 'bookingsByStatus', 'topServices', 'recentPayments', 'from', 'to'));
    }
}
