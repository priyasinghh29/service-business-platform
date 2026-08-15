<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ServiceProvider;
use App\Services\AuditLogger;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProviderController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $providers = ServiceProvider::query()
            ->active()
            ->with('user:id,first_name,last_name,profile_pic')
            ->when($request->filled('q'), function ($q) use ($request) {
                $term = $request->string('q');
                $q->where(function ($builder) use ($term) {
                    $builder->where('business_name', 'like', "%{$term}%")
                        ->orWhere('specialization', 'like', "%{$term}%")
                        ->orWhereHas('user', function ($user) use ($term) {
                            $user->where('first_name', 'like', "%{$term}%")
                                ->orWhere('last_name', 'like', "%{$term}%");
                        });
                });
            })
            ->orderByDesc('rating_avg')
            ->orderBy('business_name')
            ->paginate((int) $request->input('per_page', 20));

        return ApiResponse::success($providers, 'Providers retrieved');
    }

    public function profile(Request $request): JsonResponse
    {
        $user = $request->user();

        $provider = ServiceProvider::query()
            ->with('user:id,first_name,last_name,email_id,phone_number,profile_pic')
            ->where('user_id', $user->id)
            ->first();

        if (! $provider) {
            return ApiResponse::error('Provider profile not found', null, 404);
        }

        return ApiResponse::success($provider, 'Provider profile retrieved');
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'business_name' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string'],
            'specialization' => ['nullable', 'string', 'max:255'],
            'hourly_rate' => ['nullable', 'numeric', 'min:0'],
            'first_name' => ['sometimes', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'phone_number' => ['nullable', 'string', 'max:50'],
        ]);

        $provider = ServiceProvider::query()->firstOrCreate(
            ['user_id' => $user->id],
            ['status' => true]
        );

        $old = $provider->toArray();

        $provider->update(collect($validated)->only([
            'business_name', 'bio', 'specialization', 'hourly_rate',
        ])->all());

        $user->update(collect($validated)->only([
            'first_name', 'last_name', 'phone_number',
        ])->all());

        if ($user->role !== 'provider') {
            $user->update(['role' => 'provider']);
        }

        AuditLogger::log('provider.updated', $provider, $old, $provider->fresh()->toArray());

        return ApiResponse::success(
            $provider->fresh()->load('user:id,first_name,last_name,email_id,phone_number,profile_pic'),
            'Provider profile updated'
        );
    }

    public function availability(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'availability' => ['required', 'array'],
            'availability.*.day' => ['required', 'string'],
            'availability.*.slots' => ['required', 'array'],
        ]);

        $provider = ServiceProvider::query()->where('user_id', $request->user()->id)->first();

        if (! $provider) {
            return ApiResponse::error('Provider profile not found', null, 404);
        }

        $old = $provider->toArray();
        $provider->update(['availability' => $validated['availability']]);

        AuditLogger::log('provider.availability', $provider, $old, $provider->fresh()->toArray());

        return ApiResponse::success($provider->fresh(), 'Availability updated');
    }
}
