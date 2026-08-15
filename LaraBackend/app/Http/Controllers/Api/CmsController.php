<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CmsPage;
use App\Models\Coupon;
use App\Models\Setting;
use App\Models\SubscriptionPlan;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CmsController extends Controller
{
    public function page(string $slug): JsonResponse
    {
        $page = CmsPage::query()->active()->where('slug', $slug)->first();

        if (! $page) {
            return ApiResponse::error('Page not found', null, 404);
        }

        return ApiResponse::success($page, 'Page retrieved');
    }

    public function branding(): JsonResponse
    {
        $keys = [
            'brand_name', 'logo_url', 'primary_color', 'secondary_color',
            'currency', 'support_email', 'support_phone', 'timezone',
        ];

        $settings = Setting::query()
            ->whereIn('key', $keys)
            ->where('status', true)
            ->get()
            ->mapWithKeys(fn ($s) => [$s->key => Setting::getValue($s->key)]);

        return ApiResponse::success($settings, 'Branding settings retrieved');
    }

    public function plans(): JsonResponse
    {
        $plans = SubscriptionPlan::query()->active()->orderBy('price')->get();

        return ApiResponse::success($plans, 'Subscription plans retrieved');
    }

    public function validateCoupon(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string'],
            'amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        $coupon = Coupon::query()->where('code', $validated['code'])->first();
        $amount = (float) ($validated['amount'] ?? 0);

        if (! $coupon || ! $coupon->isValid($amount > 0 ? $amount : null)) {
            return ApiResponse::error('Invalid coupon', null, 422);
        }

        return ApiResponse::success([
            'coupon' => $coupon,
            'discount' => $amount > 0 ? $coupon->calculateDiscount($amount) : null,
        ], 'Coupon valid');
    }
}
