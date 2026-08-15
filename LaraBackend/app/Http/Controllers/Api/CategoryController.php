<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $categories = Category::query()
            ->active()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->withCount(['services' => fn ($q) => $q->active()])
            ->get();

        return ApiResponse::success($categories, 'Categories retrieved');
    }

    public function show(string $slug): JsonResponse
    {
        $category = Category::query()
            ->active()
            ->where('slug', $slug)
            ->with(['services' => fn ($q) => $q->active()->orderBy('sort_order')->orderBy('name')])
            ->first();

        if (! $category) {
            return ApiResponse::error('Category not found', null, 404);
        }

        return ApiResponse::success($category, 'Category retrieved');
    }
}
