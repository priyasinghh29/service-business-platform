<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingMessage;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $bookingIds = Booking::query()
            ->where('user_id', $userId)
            ->pluck('id');

        $latestByBooking = BookingMessage::query()
            ->whereIn('booking_id', $bookingIds)
            ->latest()
            ->get()
            ->groupBy('booking_id')
            ->map(fn ($msgs) => $msgs->first());

        $bookings = Booking::query()
            ->with(['service:id,name,slug', 'provider.user:id,first_name,last_name'])
            ->whereIn('id', $latestByBooking->keys())
            ->get()
            ->keyBy('id');

        $threads = $latestByBooking
            ->map(function (BookingMessage $message) use ($bookings) {
                $booking = $bookings->get($message->booking_id);
                if (! $booking) {
                    return null;
                }

                return [
                    'booking_id' => $booking->id,
                    'booking_number' => $booking->booking_number,
                    'service_name' => $booking->service?->name,
                    'provider_name' => $booking->provider?->user
                        ? trim(($booking->provider->user->first_name ?? '').' '.($booking->provider->user->last_name ?? ''))
                        : null,
                    'last_message' => $message->message,
                    'last_message_at' => $message->created_at,
                    'sender_role' => $message->role,
                    'author_name' => $message->author_name,
                ];
            })
            ->filter()
            ->sortByDesc('last_message_at')
            ->values();

        return ApiResponse::success(['threads' => $threads], 'Messages retrieved');
    }
}
