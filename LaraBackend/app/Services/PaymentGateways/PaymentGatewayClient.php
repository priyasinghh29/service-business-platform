<?php

namespace App\Services\PaymentGateways;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PaymentGatewayClient
{
    public static function baseUrl(): string
    {
        return rtrim((string) env('PAYMENT_GATEWAY_URL', 'http://127.0.0.1:8000'), '/');
    }

    public static function enabled(): bool
    {
        if (! filter_var(env('PAYMENT_GATEWAY_ENABLED', false), FILTER_VALIDATE_BOOLEAN)) {
            return false;
        }

        return trim((string) env('PAYMENT_GATEWAY_URL', '')) !== '';
    }

    /** @return array<string, mixed>|null */
    public static function createStripeCheckout(array $payload): ?array
    {
        return self::post('/api/stripe/checkout', $payload);
    }

    /** @return array<string, mixed>|null */
    public static function createPayPalOrder(array $payload): ?array
    {
        return self::post('/api/paypal/order', $payload);
    }

    /** @return array<string, mixed>|null */
    public static function createRazorpayOrder(array $payload): ?array
    {
        return self::post('/api/razorpay/order', $payload);
    }

    /** @return array<string, mixed>|null */
    private static function post(string $path, array $payload): ?array
    {
        $url = self::baseUrl().$path;

        try {
            $response = Http::timeout(30)
                ->acceptJson()
                ->asJson()
                ->post($url, $payload);

            if (! $response->successful()) {
                Log::error('[PaymentGatewayClient] upstream error', [
                    'url' => $url,
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return null;
            }

            return $response->json();
        } catch (\Throwable $e) {
            Log::error('[PaymentGatewayClient] request failed', [
                'url' => $url,
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }
}
