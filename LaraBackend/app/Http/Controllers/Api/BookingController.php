<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Coupon;
use App\Models\Service;
use App\Models\ServiceProvider;
use App\Services\AuditLogger;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $bookings = Booking::query()
            ->with(['service:id,name,slug,price', 'provider.user:id,first_name,last_name'])
            ->where('user_id', $request->user()->id)
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->latest()
            ->paginate((int) $request->input('per_page', 15));

        return ApiResponse::success($bookings, 'Bookings retrieved');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'service_id' => ['required', 'exists:services,id'],
            'provider_id' => ['nullable', 'exists:service_providers,id'],
            'booking_date' => ['required', 'date', 'after_or_equal:today'],
            'booking_time' => ['required', 'date_format:H:i'],
            'package_name' => ['nullable', 'string', 'max:255'],
            'coupon_code' => ['nullable', 'string', 'max:50'],
            'customer_notes' => ['nullable', 'string'],
            'address' => ['nullable', 'string'],
        ]);

        $service = Service::query()->active()->findOrFail($validated['service_id']);

        if (! empty($validated['provider_id'])) {
            ServiceProvider::query()->active()->findOrFail($validated['provider_id']);
        }

        $packageMultipliers = [
            'Standard' => 1.0,
            'Priority' => 1.25,
            'Premium' => 1.5,
        ];
        $packageName = $validated['package_name'] ?? 'Standard';
        if (! array_key_exists($packageName, $packageMultipliers)) {
            return ApiResponse::error('Invalid package selected', null, 422);
        }

        $subtotal = round((float) $service->price * $packageMultipliers[$packageName], 2);
        $discount = 0;
        $couponId = null;

        if (! empty($validated['coupon_code'])) {
            $coupon = Coupon::query()->where('code', $validated['coupon_code'])->first();
            if (! $coupon || ! $coupon->isValid($subtotal)) {
                return ApiResponse::error('Invalid or expired coupon', null, 422);
            }
            $discount = $coupon->calculateDiscount($subtotal);
            $couponId = $coupon->id;
            $coupon->increment('used_count');
        }

        $tax = round(($subtotal - $discount) * 0.0, 2);
        $total = max(0, $subtotal - $discount + $tax);

        $isComplimentary = $total <= 0;

        $booking = Booking::create([
            'user_id' => $request->user()->id,
            'service_id' => $service->id,
            'provider_id' => $validated['provider_id'] ?? null,
            'coupon_id' => $couponId,
            'booking_date' => $validated['booking_date'],
            'booking_time' => $validated['booking_time'],
            'duration_minutes' => $service->duration_minutes,
            'package_name' => $packageName,
            'subtotal' => $subtotal,
            'discount' => $discount,
            'tax' => $tax,
            'total' => $total,
            'status' => $isComplimentary ? 'confirmed' : 'pending',
            'payment_status' => $isComplimentary ? 'paid' : 'unpaid',
            'customer_notes' => $validated['customer_notes'] ?? null,
            'address' => $validated['address'] ?? $request->user()->address,
        ]);

        AuditLogger::log('booking.created', $booking, null, $booking->toArray());

        return ApiResponse::success(
            $booking->load(['service', 'provider.user']),
            'Booking created',
            201
        );
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $booking = Booking::query()
            ->with(['service', 'provider.user', 'coupon', 'invoice', 'payments'])
            ->where('user_id', $request->user()->id)
            ->find($id);

        if (! $booking) {
            return ApiResponse::error('Booking not found', null, 404);
        }

        return ApiResponse::success($booking, 'Booking retrieved');
    }

    public function cancel(Request $request, int $id): JsonResponse
    {
        $booking = Booking::query()
            ->where('user_id', $request->user()->id)
            ->find($id);

        if (! $booking) {
            return ApiResponse::error('Booking not found', null, 404);
        }

        if (in_array($booking->status, ['cancelled', 'completed'], true)) {
            return ApiResponse::error('Booking cannot be cancelled', null, 422);
        }

        $old = $booking->toArray();
        $booking->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
            'cancellation_reason' => $request->input('reason'),
        ]);

        AuditLogger::log('booking.cancelled', $booking, $old, $booking->toArray());

        return ApiResponse::success($booking->fresh(), 'Booking cancelled');
    }

    public function reschedule(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'booking_date' => ['required', 'date', 'after_or_equal:today'],
            'booking_time' => ['required', 'date_format:H:i'],
        ]);

        $booking = Booking::query()
            ->where('user_id', $request->user()->id)
            ->find($id);

        if (! $booking) {
            return ApiResponse::error('Booking not found', null, 404);
        }

        if (in_array($booking->status, ['cancelled', 'completed'], true)) {
            return ApiResponse::error('Booking cannot be rescheduled', null, 422);
        }

        $old = $booking->toArray();
        $booking->update([
            'booking_date' => $validated['booking_date'],
            'booking_time' => $validated['booking_time'],
            'status' => 'rescheduled',
        ]);

        AuditLogger::log('booking.rescheduled', $booking, $old, $booking->toArray());

        return ApiResponse::success($booking->fresh(), 'Booking rescheduled');
    }
}
