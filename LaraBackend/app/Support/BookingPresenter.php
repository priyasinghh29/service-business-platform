<?php

namespace App\Support;

use App\Models\Booking;
use Illuminate\Support\Carbon;

class BookingPresenter
{
    public const PIPELINE = ['Consult', 'Proposal', 'Submission', 'Review', 'Complete'];

    public static function progress(string $status): int
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

    public static function statusLabel(string $status): string
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

    public static function stage(string $status): string
    {
        return match ($status) {
            'pending' => 'Consult',
            'confirmed' => 'Submission',
            'rescheduled' => 'Review',
            'completed' => 'Complete',
            'cancelled' => 'Consult',
            default => 'Proposal',
        };
    }

    public static function stageIndex(string $status): int
    {
        $stage = self::stage($status);
        $idx = array_search($stage, self::PIPELINE, true);

        return $idx === false ? 0 : $idx;
    }

    public static function startsAt(Booking $booking): ?Carbon
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

    public static function providerName(Booking $booking): string
    {
        $user = $booking->provider?->user;
        if (! $user) {
            return 'Unassigned';
        }

        return trim(($user->first_name ?? '').' '.($user->last_name ?? '')) ?: 'Unassigned';
    }

    public static function isOverdue(Booking $booking): bool
    {
        if (in_array($booking->status, ['completed', 'cancelled'], true)) {
            return false;
        }

        $starts = self::startsAt($booking);

        return $starts ? $starts->isPast() : false;
    }

    public static function isUpcoming(Booking $booking): bool
    {
        if (in_array($booking->status, ['completed', 'cancelled'], true)) {
            return false;
        }

        $starts = self::startsAt($booking);

        return $starts ? $starts->isFuture() : false;
    }

    public static function card(Booking $booking): array
    {
        return [
            'id' => $booking->id,
            'booking_number' => $booking->booking_number,
            'name' => $booking->service?->name ?? 'Service',
            'slug' => $booking->service?->slug,
            'category' => $booking->service?->category?->name ?? 'General',
            'description' => $booking->service?->short_description
                ?? $booking->service?->description
                ?? $booking->customer_notes
                ?? 'Professional service engagement.',
            'status' => self::statusLabel($booking->status),
            'status_raw' => $booking->status,
            'progress' => self::progress($booking->status),
            'stage' => self::stage($booking->status),
            'pipeline' => self::PIPELINE,
            'owner' => self::providerName($booking),
            'due_date' => optional($booking->booking_date)->format('M j, Y'),
            'booking_date' => optional($booking->booking_date)->toDateString(),
            'booking_time' => $booking->booking_time
                ? Carbon::parse($booking->booking_time)->format('g:i A')
                : null,
            'package_name' => $booking->package_name,
            'payment_status' => $booking->payment_status,
            'total' => (float) $booking->total,
            'total_formatted' => '₹'.number_format((float) $booking->total, 0),
            'is_overdue' => self::isOverdue($booking),
            'is_upcoming' => self::isUpcoming($booking),
            'can_cancel' => ! in_array($booking->status, ['cancelled', 'completed'], true),
            'can_reschedule' => ! in_array($booking->status, ['cancelled', 'completed'], true),
        ];
    }

    public static function focusCopy(Booking $booking): string
    {
        return match ($booking->status) {
            'pending' => 'Your request is awaiting confirmation. Our team will review the details and assign a specialist shortly.',
            'confirmed' => 'Work is in progress. Your specialist is actively handling this engagement and will update you on milestones.',
            'rescheduled' => 'This engagement was rescheduled and is under review. Please confirm the new timing works for you.',
            'completed' => 'This engagement is complete. You can download deliverables and leave a review if you wish.',
            'cancelled' => 'This engagement was cancelled. Contact support if you need to reopen or book again.',
            default => 'Your service engagement is being processed by the Oknitech team.',
        };
    }

    public static function milestones(Booking $booking): array
    {
        $stageIdx = self::stageIndex($booking->status);
        $completed = $booking->status === 'completed';

        $client = [
            ['id' => 'ct1', 'title' => 'Submit booking requirements', 'done' => true],
            ['id' => 'ct2', 'title' => 'Share required documents', 'done' => $stageIdx >= 1 || $completed],
            ['id' => 'ct3', 'title' => 'Approve engagement proposal', 'done' => $stageIdx >= 2 || $completed],
            ['id' => 'ct4', 'title' => 'Confirm final deliverables', 'done' => $completed],
        ];

        $firm = [
            ['id' => 'ft1', 'title' => 'Assign relationship manager', 'done' => (bool) $booking->provider_id || $stageIdx >= 1 || $completed],
            ['id' => 'ft2', 'title' => 'Prepare service proposal', 'done' => $stageIdx >= 1 || $completed],
            ['id' => 'ft3', 'title' => 'Execute / file engagement', 'done' => $stageIdx >= 2 || $completed],
            ['id' => 'ft4', 'title' => 'Internal quality review', 'done' => $stageIdx >= 3 || $completed],
            ['id' => 'ft5', 'title' => 'Deliver final output', 'done' => $completed],
        ];

        return ['client_tasks' => $client, 'firm_tasks' => $firm];
    }
}
