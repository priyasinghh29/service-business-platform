<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Service::query()
            ->active()
            ->with('category:id,name,slug')
            ->orderBy('sort_order')
            ->orderBy('name');

        if ($request->filled('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('slug', $request->string('category'))
                    ->orWhere('id', $request->input('category'));
            });
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->input('min_price'));
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->input('max_price'));
        }

        if ($request->boolean('featured')) {
            $query->featured();
        }

        $services = $query->paginate((int) $request->input('per_page', 12));

        return ApiResponse::success($services, 'Services retrieved');
    }

    public function show(string $slug): JsonResponse
    {
        $service = Service::query()
            ->active()
            ->with('category:id,name,slug,description')
            ->where('slug', $slug)
            ->first();

        if (! $service) {
            return ApiResponse::error('Service not found', null, 404);
        }

        return ApiResponse::success($service, 'Service retrieved');
    }

    public function featured(Request $request): JsonResponse
    {
        $services = Service::query()
            ->active()
            ->featured()
            ->with('category:id,name,slug')
            ->orderBy('sort_order')
            ->orderBy('name')
            ->limit((int) $request->input('limit', 8))
            ->get();

        return ApiResponse::success($services, 'Featured services retrieved');
    }

    public function search(Request $request): JsonResponse
    {
        $q = trim((string) $request->input('q', ''));

        if ($q === '') {
            return ApiResponse::error('Search query is required', null, 422);
        }

        $services = Service::query()
            ->active()
            ->with('category:id,name,slug')
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                    ->orWhere('short_description', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%");
            })
            ->orderBy('name')
            ->paginate((int) $request->input('per_page', 12));

        return ApiResponse::success($services, 'Search results');
    }
}
