<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\HandlesBulkActions;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Service;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class ServiceController extends Controller
{
    use HandlesBulkActions;

    protected function modelClass(): string
    {
        return Service::class;
    }

    public function index(Request $request): View
    {
        $query = Service::query()->with('category')->orderBy('sort_order')->orderBy('name');

        if ($request->filled('q')) {
            $q = $request->string('q');
            $query->where(function ($builder) use ($q) {
                $builder->where('name', 'like', "%{$q}%")
                    ->orWhere('slug', 'like', "%{$q}%");
            });
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->integer('category_id'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->boolean('status'));
        }

        $services = $query->paginate(15)->withQueryString();
        $categories = Category::orderBy('name')->get(['id', 'name']);

        return view('admin.services.index', compact('services', 'categories'));
    }

    public function create(): View
    {
        $categories = Category::orderBy('name')->get(['id', 'name']);

        return view('admin.services.create', compact('categories'));
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validated($request);
        $service = Service::create($validated);
        AuditLogger::log('service.created', $service, null, $service->toArray());

        return redirect()
            ->route('admin.services.index')
            ->with('success', 'Service created successfully.');
    }

    public function edit(Service $service): View
    {
        $categories = Category::orderBy('name')->get(['id', 'name']);

        return view('admin.services.edit', compact('service', 'categories'));
    }

    public function update(Request $request, Service $service): RedirectResponse
    {
        $validated = $this->validated($request, $service);
        $old = $service->toArray();
        $service->update($validated);
        AuditLogger::log('service.updated', $service, $old, $service->fresh()->toArray());

        return redirect()
            ->route('admin.services.index')
            ->with('success', 'Service updated successfully.');
    }

    public function destroy(Service $service): RedirectResponse
    {
        $old = $service->toArray();
        $service->delete();
        AuditLogger::log('service.deleted', null, $old, null);

        return redirect()
            ->route('admin.services.index')
            ->with('success', 'Service deleted successfully.');
    }

    public function toggleStatus(Service $service): RedirectResponse
    {
        $old = $service->toArray();
        $service->update(['status' => ! $service->status]);
        AuditLogger::log('service.toggle', $service, $old, $service->fresh()->toArray());

        return back()->with('success', 'Service status updated.');
    }

    private function validated(Request $request, ?Service $service = null): array
    {
        $validated = $request->validate([
            'category_id' => ['required', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:services,slug'.($service ? ','.$service->id : '')],
            'short_description' => ['nullable', 'string', 'max:500'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'duration_minutes' => ['required', 'integer', 'min:1'],
            'image' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_featured' => ['nullable', 'boolean'],
            'status' => ['nullable', 'boolean'],
        ]);

        $validated['is_featured'] = $request->boolean('is_featured');
        $validated['status'] = $request->boolean('status', true);
        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        return $validated;
    }
}
