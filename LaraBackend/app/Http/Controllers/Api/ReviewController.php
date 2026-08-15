<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Review;
use App\Models\Service;
use App\Models\ServiceProvider;
use App\Services\AuditLogger;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function mine(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $reviews = Review::query()
            ->with(['service:id,name,slug', 'booking:id,booking_number,status'])
            ->where('user_id', $userId)
            ->latest()
            ->get();

        $reviewable = Booking::query()
            ->with('service:id,name,slug')
            ->where('user_id', $userId)
            ->where('status', 'completed')
            ->whereDoesntHave('review')
            ->latest()
            ->limit(20)
            ->get();

        return ApiResponse::success([
            'reviews' => $reviews,
            'reviewable_bookings' => $reviewable,
        ], 'My reviews retrieved');
    }

    public function index(Request $request, int $id): JsonResponse
    {
        $service = Service::query()->active()->find($id);
        if (! $service) {
            return ApiResponse::error('Service not found', null, 404);
        }

        $reviews = Review::query()
            ->approved()
            ->with('user:id,first_name,last_name,profile_pic')
            ->where('service_id', $id)
            ->latest()
            ->paginate((int) $request->input('per_page', 15));

        return ApiResponse::success($reviews, 'Reviews retrieved');
    }

    public function store(Request $request, int $id): JsonResponse
    {
        $service = Service::query()->active()->find($id);
        if (! $service) {
            return ApiResponse::error('Service not found', null, 404);
        }

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title' => ['nullable', 'string', 'max:255'],
            'comment' => ['nullable', 'string'],
            'booking_id' => ['nullable', 'exists:bookings,id'],
            'provider_id' => ['nullable', 'exists:service_providers,id'],
        ]);

        if (! empty($validated['booking_id'])) {
            $booking = Booking::query()
                ->where('user_id', $request->user()->id)
                ->where('service_id', $id)
                ->find($validated['booking_id']);

            if (! $booking) {
                return ApiResponse::error('Booking not found for this service', null, 422);
            }
        }

        $review = Review::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'service_id' => $id,
                'booking_id' => $validated['booking_id'] ?? null,
            ],
            [
                'provider_id' => $validated['provider_id'] ?? null,
                'rating' => $validated['rating'],
                'title' => $validated['title'] ?? null,
                'comment' => $validated['comment'] ?? null,
                'is_approved' => false,
                'status' => true,
            ]
        );

        if (! empty($validated['provider_id'])) {
            $this->refreshProviderRating((int) $validated['provider_id']);
        }

        AuditLogger::log('review.created', $review, null, $review->toArray());

        return ApiResponse::success($review, 'Review submitted', 201);
    }

    private function refreshProviderRating(int $providerId): void
    {
        $stats = Review::query()
            ->approved()
            ->where('provider_id', $providerId)
            ->selectRaw('AVG(rating) as avg_rating, COUNT(*) as total')
            ->first();

        ServiceProvider::query()->where('id', $providerId)->update([
            'rating_avg' => round((float) ($stats->avg_rating ?? 0), 2),
            'rating_count' => (int) ($stats->total ?? 0),
        ]);
    }
}
