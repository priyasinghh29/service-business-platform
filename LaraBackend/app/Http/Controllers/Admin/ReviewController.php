<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\HandlesBulkActions;
use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\Service;
use App\Models\ServiceProvider;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ReviewController extends Controller
{
    use HandlesBulkActions;

    protected function modelClass(): string
    {
        return Review::class;
    }

    public function index(Request $request): View
    {
        $query = Review::query()->with(['user', 'service', 'provider'])->latest();

        if ($request->filled('q')) {
            $q = $request->string('q');
            $query->where(function ($builder) use ($q) {
                $builder->where('title', 'like', "%{$q}%")->orWhere('comment', 'like', "%{$q}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->boolean('status'));
        }

        if ($request->filled('approved')) {
            $query->where('is_approved', $request->boolean('approved'));
        }

        $reviews = $query->paginate(15)->withQueryString();

        return view('admin.reviews.index', compact('reviews'));
    }

    public function create(): View
    {
        return view('admin.reviews.create', [
            'customers' => User::orderBy('first_name')->get(['id', 'first_name', 'last_name']),
            'services' => Service::orderBy('name')->get(['id', 'name']),
            'providers' => ServiceProvider::with('user')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'service_id' => ['required', 'exists:services,id'],
            'provider_id' => ['nullable', 'exists:service_providers,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title' => ['nullable', 'string', 'max:255'],
            'comment' => ['nullable', 'string'],
            'is_approved' => ['nullable', 'boolean'],
            'status' => ['nullable', 'boolean'],
        ]);

        $validated['is_approved'] = $request->boolean('is_approved');
        $validated['status'] = $request->boolean('status', true);
        $review = Review::create($validated);
        AuditLogger::log('review.created', $review, null, $review->toArray());

        return redirect()->route('admin.reviews.index')->with('success', 'Review created successfully.');
    }

    public function edit(Review $review): View
    {
        return view('admin.reviews.edit', [
            'review' => $review,
            'customers' => User::orderBy('first_name')->get(['id', 'first_name', 'last_name']),
            'services' => Service::orderBy('name')->get(['id', 'name']),
            'providers' => ServiceProvider::with('user')->get(),
        ]);
    }

    public function update(Request $request, Review $review): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'service_id' => ['required', 'exists:services,id'],
            'provider_id' => ['nullable', 'exists:service_providers,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title' => ['nullable', 'string', 'max:255'],
            'comment' => ['nullable', 'string'],
            'is_approved' => ['nullable', 'boolean'],
            'status' => ['nullable', 'boolean'],
        ]);

        $old = $review->toArray();
        $validated['is_approved'] = $request->boolean('is_approved');
        $validated['status'] = $request->boolean('status');
        $review->update($validated);
        AuditLogger::log('review.updated', $review, $old, $review->fresh()->toArray());

        return redirect()->route('admin.reviews.index')->with('success', 'Review updated successfully.');
    }

    public function destroy(Review $review): RedirectResponse
    {
        AuditLogger::log('review.deleted', $review, $review->toArray());
        $review->delete();

        return redirect()->route('admin.reviews.index')->with('success', 'Review deleted successfully.');
    }

    public function toggleStatus(Review $review): RedirectResponse
    {
        $review->update(['status' => ! $review->status]);
        AuditLogger::log('review.toggled', $review);

        return back()->with('success', 'Review status updated.');
    }

    public function approve(Review $review): RedirectResponse
    {
        $review->update(['is_approved' => ! $review->is_approved]);
        AuditLogger::log('review.approved', $review);

        return back()->with('success', 'Review approval updated.');
    }
}
