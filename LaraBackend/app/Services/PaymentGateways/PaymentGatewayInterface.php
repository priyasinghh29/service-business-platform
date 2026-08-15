<?php

namespace App\Services\PaymentGateways;

interface PaymentGatewayInterface
{
    public function charge(float $amount, array $data): array;
}
