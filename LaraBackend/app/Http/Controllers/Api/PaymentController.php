<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Setting;
use App\Services\AuditLogger;
use App\Services\PaymentGateways\PaymentGatewayClient;
use App\Services\PaymentGateways\StripeService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function checkout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'booking_id' => ['required', 'exists:bookings,id'],
            'gateway' => ['required', 'in:stripe,razorpay,paypal,manual'],
            'success_url' => ['nullable', 'url'],
            'cancel_url' => ['nullable', 'url'],
        ]);

        $booking = Booking::query()
            ->where('user_id', $request->user()->id)
            ->findOrFail($validated['booking_id']);

        if ($booking->payment_status === 'paid') {
            return ApiResponse::error('Booking already paid', null, 422);
        }

        $payment = Payment::create([
            'booking_id' => $booking->id,
            'user_id' => $request->user()->id,
            'gateway' => $validated['gateway'],
            'amount' => $booking->total,
            'currency' => (string) (Setting::getValue('currency', 'USD') ?: 'USD'),
            'status' => 'pending',
            'meta' => [
                'booking_number' => $booking->booking_number,
            ],
        ]);

        $successUrl = $validated['success_url'] ?? url('/booking/success');
        $cancelUrl = $validated['cancel_url'] ?? url('/booking/failed');

        $session = $validated['gateway'] === 'manual'
            ? $this->createManualSession($payment, $successUrl, $cancelUrl)
            : $this->createGatewaySession(
                $validated['gateway'],
                (float) $booking->total,
                $successUrl,
                $cancelUrl,
                $request->user()->id,
                'Booking '.$booking->booking_number,
                $payment
            );

        if (($session['status'] ?? '') === 'error') {
            $payment->update(['status' => 'failed', 'meta' => array_merge($payment->meta ?? [], $session)]);

            return ApiResponse::error($session['message'] ?? 'Checkout failed', $session, 502);
        }

        $payment->update([
            'gateway_reference' => $session['session_id'] ?? $session['order_id'] ?? null,
            'meta' => array_merge($payment->meta ?? [], $session),
        ]);

        AuditLogger::log('payment.checkout', $payment, null, $payment->toArray());

        return ApiResponse::success([
            'payment' => $payment->fresh(),
            'checkout' => $session,
        ], 'Payment session created');
    }

    public function success(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'payment_id' => ['required', 'exists:payments,id'],
            'gateway_reference' => ['nullable', 'string'],
        ]);

        $payment = Payment::query()
            ->where('user_id', $request->user()->id)
            ->findOrFail($validated['payment_id']);

        $old = $payment->toArray();

        $payment->update([
            'status' => 'success',
            'paid_at' => now(),
            'gateway_reference' => $validated['gateway_reference'] ?? $payment->gateway_reference,
        ]);

        if ($payment->booking) {
            $payment->booking->update([
                'payment_status' => 'paid',
                'status' => $payment->booking->status === 'pending' ? 'confirmed' : $payment->booking->status,
            ]);

            Invoice::firstOrCreate(
                ['booking_id' => $payment->booking_id],
                [
                    'user_id' => $payment->user_id,
                    'subtotal' => $payment->booking->subtotal,
                    'discount' => $payment->booking->discount,
                    'tax' => $payment->booking->tax,
                    'total' => $payment->booking->total,
                    'status' => 'paid',
                    'issued_at' => now(),
                    'paid_at' => now(),
                ]
            );
        }

        AuditLogger::log('payment.success', $payment, $old, $payment->fresh()->toArray());

        return ApiResponse::success($payment->fresh()->load('booking', 'invoice'), 'Payment verified');
    }

    public function failed(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'payment_id' => ['required', 'exists:payments,id'],
            'reason' => ['nullable', 'string'],
        ]);

        $payment = Payment::query()
            ->where('user_id', $request->user()->id)
            ->findOrFail($validated['payment_id']);

        $old = $payment->toArray();

        $payment->update([
            'status' => 'failed',
            'meta' => array_merge($payment->meta ?? [], ['failure_reason' => $validated['reason'] ?? null]),
        ]);

        if ($payment->booking) {
            $payment->booking->update(['payment_status' => 'failed']);
        }

        AuditLogger::log('payment.failed', $payment, $old, $payment->fresh()->toArray());

        return ApiResponse::success($payment->fresh(), 'Payment marked as failed');
    }

    private function createManualSession(Payment $payment, string $successUrl, string $cancelUrl): array
    {
        $append = function (string $url, array $params): string {
            $separator = str_contains($url, '?') ? '&' : '?';

            return $url.$separator.http_build_query($params);
        };

        $parts = parse_url($successUrl);
        $origin = null;
        if (! empty($parts['scheme']) && ! empty($parts['host'])) {
            $origin = $parts['scheme'].'://'.$parts['host'];
            if (! empty($parts['port'])) {
                $origin .= ':'.$parts['port'];
            }
        }
        $origin = $origin ?: rtrim((string) env('FRONTEND_URL', 'http://localhost:3000'), '/');

        $demoCheckoutUrl = $append($origin.'/pay/demo', [
            'payment_id' => $payment->id,
            'booking_id' => $payment->booking_id,
            'amount' => $payment->amount,
            'currency' => $payment->currency,
            'ref' => $payment->meta['booking_number'] ?? ('PAY-'.$payment->id),
        ]);

        return [
            'status' => 'success',
            'checkout_url' => $demoCheckoutUrl,
            'cancel_url' => $append($cancelUrl, [
                'payment_id' => $payment->id,
                'booking_id' => $payment->booking_id,
            ]),
            'session_id' => 'demo_'.$payment->id,
            'demo' => true,
            'gateway' => 'demo',
            'message' => 'Demo gateway session created.',
        ];
    }

    private function createGatewaySession(
        string $gateway,
        float $amount,
        string $successUrl,
        string $cancelUrl,
        int $userId,
        string $productName,
        Payment $payment
    ): array {
        if ($gateway === 'stripe') {
            if (PaymentGatewayClient::enabled()) {
                return PaymentGatewayClient::createStripeCheckout([
                    'amount' => $amount,
                    'success_url' => $successUrl,
                    'cancel_url' => $cancelUrl,
                    'user_id' => $userId,
                    'product_name' => $productName,
                    'payment_id' => $payment->id,
                ]) ?? ['status' => 'error', 'message' => 'Stripe gateway unavailable'];
            }

            return (new StripeService)->createCheckoutSession(
                $amount,
                $successUrl,
                $cancelUrl,
                $userId,
                $productName
            );
        }

        if ($gateway === 'paypal') {
            return PaymentGatewayClient::createPayPalOrder([
                'amount' => $amount,
                'success_url' => $successUrl,
                'cancel_url' => $cancelUrl,
                'payment_id' => $payment->id,
            ]) ?? ['status' => 'error', 'message' => 'PayPal gateway unavailable'];
        }

        return PaymentGatewayClient::createRazorpayOrder([
            'amount' => $amount,
            'success_url' => $successUrl,
            'cancel_url' => $cancelUrl,
            'payment_id' => $payment->id,
        ]) ?? ['status' => 'error', 'message' => 'Razorpay gateway unavailable'];
    }
}
