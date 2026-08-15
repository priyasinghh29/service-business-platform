<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Document;
use App\Models\Invoice;
use App\Models\Setting;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $bookings = Booking::query()
            ->with([
                'service:id,name,slug,price',
                'provider.user:id,first_name,last_name,email_id,phone_number',
            ])
            ->where('user_id', $user->id)
            ->latest('booking_date')
            ->get();

        $invoices = Invoice::query()
            ->with(['booking.service:id,name'])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        $documents = Document::query()
            ->where('user_id', $user->id)
            ->where('status_flag', true)
            ->latest()
            ->get();

        $activeStatuses = ['pending', 'confirmed', 'rescheduled'];
        $activeBookings = $bookings->whereIn('status', $activeStatuses);

        $outstandingInvoices = $invoices->whereIn('status', ['sent', 'overdue', 'draft']);
        $outstandingTotal = (float) $outstandingInvoices->sum('total');
        $paidTotal = (float) $invoices->where('status', 'paid')->sum('total');
        $invoiceGrand = $paidTotal + $outstandingTotal;
        $paidPercent = $invoiceGrand > 0 ? (int) round(($paidTotal / $invoiceGrand) * 100) : 0;

        $nearestOutstanding = $outstandingInvoices
            ->sortBy(fn (Invoice $inv) => $inv->due_at?->timestamp ?? PHP_INT_MAX)
            ->first();

        $upcomingMeetings = $bookings
            ->filter(function (Booking $booking) {
                if (in_array($booking->status, ['cancelled', 'completed'], true)) {
                    return false;
                }

                $startsAt = $this->bookingStartsAt($booking);

                return $startsAt && $startsAt->isFuture();
            })
            ->sortBy(fn (Booking $b) => $this->bookingStartsAt($b)?->timestamp ?? PHP_INT_MAX)
            ->values();

        $nextMeeting = $upcomingMeetings->first();
        $pendingDocuments = $documents->whereIn('status', ['pending', 'requested']);

        $currentServices = $activeBookings
            ->take(5)
            ->values()
            ->map(fn (Booking $booking) => $this->mapService($booking));

        $progressOverview = $bookings
            ->reject(fn (Booking $b) => $b->status === 'cancelled')
            ->take(6)
            ->values()
            ->map(fn (Booking $booking) => [
                'id' => $booking->id,
                'name' => $booking->service?->name ?? 'Service',
                'progress' => $this->progressForStatus($booking->status),
            ]);

        $recentDocuments = $documents
            ->where('status', 'available')
            ->take(5)
            ->values()
            ->map(fn (Document $doc) => $this->mapDocument($doc));

        $pendingInvoice = $nearestOutstanding
            ? $this->mapInvoice($nearestOutstanding)
            : null;

        $tasks = $this->buildTasks($outstandingInvoices, $pendingDocuments, $activeBookings);

        $relationshipManager = $this->resolveRelationshipManager($bookings);

        $monthStart = now()->startOfMonth();
        $newThisMonth = $bookings
            ->filter(fn (Booking $b) => $b->created_at && $b->created_at->gte($monthStart))
            ->count();

        $data = [
            'greeting_name' => $user->first_name,
            'kpis' => [
                'active_services' => [
                    'value' => $activeBookings->count(),
                    'hint' => $newThisMonth > 0 ? "+{$newThisMonth} this month" : 'No new this month',
                    'hint_tone' => $newThisMonth > 0 ? 'positive' : 'neutral',
                ],
                'pending_documents' => [
                    'value' => $pendingDocuments->count(),
                    'hint' => $pendingDocuments->count() > 0 ? 'Requires attention' : 'All clear',
                    'hint_tone' => $pendingDocuments->count() > 0 ? 'warning' : 'positive',
                ],
                'outstanding_invoices' => [
                    'value' => round($outstandingTotal, 2),
                    'formatted' => '₹'.number_format($outstandingTotal, 0),
                    'hint' => $nearestOutstanding?->due_at
                        ? 'Due '.$nearestOutstanding->due_at->diffForHumans(null, true).' from now'
                        : ($outstandingTotal > 0 ? 'Payment pending' : 'Nothing due'),
                    'hint_tone' => $outstandingTotal > 0 ? 'negative' : 'positive',
                ],
                'upcoming_meetings' => [
                    'value' => $upcomingMeetings->count(),
                    'hint' => $nextMeeting
                        ? 'Next: '.$this->bookingStartsAt($nextMeeting)?->format('g:i A')
                        : 'No upcoming',
                    'hint_tone' => 'neutral',
                ],
            ],
            'current_services' => $currentServices,
            'progress_overview' => $progressOverview,
            'invoice_summary' => [
                'paid_percent' => $paidPercent,
                'outstanding_percent' => max(0, 100 - $paidPercent),
                'outstanding_total' => round($outstandingTotal, 2),
                'outstanding_formatted' => '₹'.number_format($outstandingTotal, 0),
                'paid_total' => round($paidTotal, 2),
            ],
            'recent_documents' => $recentDocuments,
            'relationship_manager' => $relationshipManager,
            'pending_invoice' => $pendingInvoice,
            'tasks' => $tasks,
            'upcoming_meetings' => $upcomingMeetings->take(5)->map(fn (Booking $b) => [
                'id' => $b->id,
                'title' => $b->service?->name ?? 'Meeting',
                'starts_at' => $this->bookingStartsAt($b)?->toIso8601String(),
                'date_label' => $this->bookingStartsAt($b)?->format('M j, Y'),
                'time_label' => $this->bookingStartsAt($b)?->format('g:i A'),
            ])->values(),
        ];

        return ApiResponse::success($data, 'Dashboard retrieved');
    }

    private function bookingStartsAt(Booking $booking): ?Carbon
    {
        if (! $booking->booking_date) {
            return null;
        }

        $time = $booking->booking_time ?: '09:00:00';

        try {
            return Carbon::parse($booking->booking_date->format('Y-m-d').' '.$time);
        } catch (\Throwable) {
            return Carbon::parse($booking->booking_date->format('Y-m-d'));
        }
    }

    private function progressForStatus(string $status): int
    {
        return match ($status) {
            'pending' => 15,
            'confirmed' => 55,
            'rescheduled' => 40,
            'completed' => 100,
            'cancelled' => 0,
            default => 25,
        };
    }

    private function statusLabel(string $status): string
    {
        return match ($status) {
            'pending' => 'Pending',
            'confirmed' => 'In Progress',
            'rescheduled' => 'Review',
            'completed' => 'Completed',
            'cancelled' => 'Cancelled',
            default => ucfirst($status),
        };
    }

    private function mapService(Booking $booking): array
    {
        $providerUser = $booking->provider?->user;

        return [
            'id' => $booking->id,
            'booking_number' => $booking->booking_number,
            'name' => $booking->service?->name ?? 'Service',
            'slug' => $booking->service?->slug,
            'status' => $this->statusLabel($booking->status),
            'status_raw' => $booking->status,
            'progress' => $this->progressForStatus($booking->status),
            'owner' => $providerUser
                ? trim(($providerUser->first_name ?? '').' '.($providerUser->last_name ?? ''))
                : 'Unassigned',
            'due_date' => optional($booking->booking_date)->format('M j, Y'),
            'booking_date' => optional($booking->booking_date)->toDateString(),
            'booking_time' => $booking->booking_time,
        ];
    }

    private function mapDocument(Document $doc): array
    {
        return [
            'id' => $doc->id,
            'name' => $doc->name,
            'folder' => $doc->folder,
            'file_type' => $doc->file_type,
            'file_size' => $doc->file_size,
            'uploaded_by' => $doc->uploaded_by,
            'uploaded_on' => optional($doc->created_at)->format('M j, Y'),
            'status' => $doc->status,
            'due_at' => optional($doc->due_at)?->format('M j, Y'),
        ];
    }

    private function mapInvoice(Invoice $invoice): array
    {
        return [
            'id' => $invoice->id,
            'number' => $invoice->invoice_number,
            'service' => $invoice->booking?->service?->name,
            'amount' => (float) $invoice->total,
            'amount_formatted' => '₹'.number_format((float) $invoice->total, 0),
            'status' => match ($invoice->status) {
                'paid' => 'Paid',
                'overdue' => 'Overdue',
                'sent' => 'Outstanding',
                'draft' => 'Draft',
                'cancelled' => 'Cancelled',
                default => ucfirst($invoice->status),
            },
            'status_raw' => $invoice->status,
            'issued_on' => optional($invoice->issued_at ?? $invoice->created_at)->format('M j, Y'),
            'due_on' => optional($invoice->due_at)->format('M j, Y'),
        ];
    }

    private function buildTasks($outstandingInvoices, $pendingDocuments, $activeBookings): array
    {
        $tasks = [];

        foreach ($pendingDocuments->take(3) as $doc) {
            $tasks[] = [
                'id' => 'doc-'.$doc->id,
                'title' => ($doc->status === 'requested' ? 'Upload: ' : 'Complete: ').$doc->name,
                'due_date' => optional($doc->due_at)->format('M j, Y') ?? 'Soon',
                'done' => false,
                'type' => 'document',
            ];
        }

        foreach ($outstandingInvoices->take(2) as $invoice) {
            $tasks[] = [
                'id' => 'inv-'.$invoice->id,
                'title' => 'Pay invoice '.$invoice->invoice_number,
                'due_date' => optional($invoice->due_at)->format('M j, Y') ?? 'ASAP',
                'done' => false,
                'type' => 'invoice',
            ];
        }

        foreach ($activeBookings->where('status', 'pending')->take(2) as $booking) {
            $tasks[] = [
                'id' => 'bk-'.$booking->id,
                'title' => 'Confirm booking: '.($booking->service?->name ?? 'Service'),
                'due_date' => optional($booking->booking_date)->format('M j, Y') ?? 'Soon',
                'done' => false,
                'type' => 'booking',
            ];
        }

        return array_slice($tasks, 0, 6);
    }

    private function resolveRelationshipManager($bookings): array
    {
        $providerUser = $bookings
            ->first(fn (Booking $b) => $b->provider?->user)?->provider?->user;

        if ($providerUser) {
            return [
                'name' => trim(($providerUser->first_name ?? '').' '.($providerUser->last_name ?? '')) ?: 'Account Manager',
                'role' => 'Relationship Manager',
                'email' => $providerUser->email_id,
                'phone' => $providerUser->phone_number,
            ];
        }

        return [
            'name' => Setting::getValue('rm_name', 'Oknitech Support'),
            'role' => Setting::getValue('rm_role', 'Relationship Manager'),
            'email' => Setting::getValue('rm_email', 'support@oknitech.serve'),
            'phone' => Setting::getValue('rm_phone', '+91 98765 43210'),
        ];
    }
}
