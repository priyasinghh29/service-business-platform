<?php

namespace App\Services\PaymentGateways;

use Illuminate\Support\Facades\Log;
use Stripe\Checkout\Session;
use Stripe\Stripe;

class StripeService
{
    public function createCheckoutSession(
        float $amount,
        string $successUrl,
        string $cancelUrl,
        ?int $userId = null,
        string $productName = 'Payment'
    ): array {
        $min = 0.50;
        $max = 10000.00;

        if ($amount < $min || $amount > $max) {
            throw new \InvalidArgumentException("Amount must be between {$min} and {$max} USD.");
        }

        $amountCents = (int) round($amount * 100);

        try {
            Stripe::setApiKey(env('STRIPE_SK'));

            $sessionData = [
                'line_items' => [[
                    'price_data' => [
                        'currency' => 'usd',
                        'product_data' => ['name' => $productName],
                        'unit_amount' => $amountCents,
                    ],
                    'quantity' => 1,
                ]],
                'mode' => 'payment',
                'success_url' => $successUrl,
                'cancel_url' => $cancelUrl,
            ];

            if ($userId) {
                $sessionData['metadata'] = [
                    'user_id' => $userId,
                    'type' => 'checkout',
                    'internal_ref' => 'PAY-'.strtoupper(uniqid()),
                    'amount' => $amount,
                    'currency' => 'USD',
                ];
            }

            $session = Session::create($sessionData);

            Log::info('Stripe checkout session created', [
                'session_id' => $session->id,
                'user_id' => $userId,
            ]);

            return [
                'status' => 'success',
                'checkout_url' => $session->url,
                'session_id' => $session->id,
                'amount' => $amount,
                'currency' => 'USD',
            ];
        } catch (\Throwable $e) {
            Log::error('Stripe checkout failed', ['error' => $e->getMessage()]);

            return [
                'status' => 'error',
                'message' => 'Payment initiation failed. Try again later.',
                'error' => $e->getMessage(),
            ];
        }
    }
}
