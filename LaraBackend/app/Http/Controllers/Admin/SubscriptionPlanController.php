<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\HandlesBulkActions;
use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class SubscriptionPlanController extends Controller
{
    use HandlesBulkActions;

    protected function modelClass(): string
    {
        return SubscriptionPlan::class;
    }

    public function index(Request $request): View
    {
        $query = SubscriptionPlan::query()->latest();

        if ($request->filled('q')) {
            $q = $request->string('q');
            $query->where(function ($builder) use ($q) {
                $builder->where('name', 'like', "%{$q}%")->orWhere('slug', 'like', "%{$q}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->boolean('status'));
        }

        $plans = $query->paginate(15)->withQueryString();

        return view('admin.subscription-plans.index', compact('plans'));
    }

    public function create(): View
    {
        return view('admin.subscription-plans.create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:subscription_plans,slug'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'billing_period' => ['required', 'in:monthly,yearly'],
            'features' => ['nullable', 'string'],
            'is_featured' => ['nullable', 'boolean'],
            'status' => ['nullable', 'boolean'],
        ]);

        $validated['status'] = $request->boolean('status', true);
        $validated['is_featured'] = $request->boolean('is_featured');
        $validated['features'] = array_values(array_filter(array_map('trim', explode("\n", $validated['features'] ?? ''))));

        $plan = SubscriptionPlan::create($validated);
        AuditLogger::log('plan.created', $plan, null, $plan->toArray());

        return redirect()->route('admin.subscription-plans.index')->with('success', 'Plan created successfully.');
    }

    public function edit(SubscriptionPlan $subscription_plan): View
    {
        return view('admin.subscription-plans.edit', ['plan' => $subscription_plan]);
    }

    public function update(Request $request, SubscriptionPlan $subscription_plan): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:subscription_plans,slug,'.$subscription_plan->id],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'billing_period' => ['required', 'in:monthly,yearly'],
            'features' => ['nullable', 'string'],
            'is_featured' => ['nullable', 'boolean'],
            'status' => ['nullable', 'boolean'],
        ]);

        $old = $subscription_plan->toArray();
        $validated['status'] = $request->boolean('status');
        $validated['is_featured'] = $request->boolean('is_featured');
        $validated['features'] = array_values(array_filter(array_map('trim', explode("\n", $validated['features'] ?? ''))));
        $subscription_plan->update($validated);
        AuditLogger::log('plan.updated', $subscription_plan, $old, $subscription_plan->fresh()->toArray());

        return redirect()->route('admin.subscription-plans.index')->with('success', 'Plan updated successfully.');
    }

    public function destroy(SubscriptionPlan $subscription_plan): RedirectResponse
    {
        AuditLogger::log('plan.deleted', $subscription_plan, $subscription_plan->toArray());
        $subscription_plan->delete();

        return redirect()->route('admin.subscription-plans.index')->with('success', 'Plan deleted successfully.');
    }

    public function toggleStatus(SubscriptionPlan $subscription_plan): RedirectResponse
    {
        $subscription_plan->update(['status' => ! $subscription_plan->status]);
        AuditLogger::log('plan.toggled', $subscription_plan);

        return back()->with('success', 'Plan status updated.');
    }
}
