<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\HandlesBulkActions;
use App\Http\Controllers\Controller;
use App\Models\CmsPage;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class CmsPageController extends Controller
{
    use HandlesBulkActions;

    protected function modelClass(): string
    {
        return CmsPage::class;
    }

    public function index(Request $request): View
    {
        $query = CmsPage::query()->latest();

        if ($request->filled('q')) {
            $q = $request->string('q');
            $query->where(function ($builder) use ($q) {
                $builder->where('title', 'like', "%{$q}%")->orWhere('slug', 'like', "%{$q}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->boolean('status'));
        }

        $pages = $query->paginate(15)->withQueryString();

        return view('admin.cms-pages.index', compact('pages'));
    }

    public function create(): View
    {
        return view('admin.cms-pages.create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:cms_pages,slug'],
            'content' => ['nullable', 'string'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string'],
            'status' => ['nullable', 'boolean'],
        ]);

        $validated['status'] = $request->boolean('status', true);
        $page = CmsPage::create($validated);
        AuditLogger::log('cms.created', $page, null, $page->toArray());

        return redirect()->route('admin.cms-pages.index')->with('success', 'CMS page created successfully.');
    }

    public function edit(CmsPage $cms_page): View
    {
        return view('admin.cms-pages.edit', ['page' => $cms_page]);
    }

    public function update(Request $request, CmsPage $cms_page): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:cms_pages,slug,'.$cms_page->id],
            'content' => ['nullable', 'string'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string'],
            'status' => ['nullable', 'boolean'],
        ]);

        $old = $cms_page->toArray();
        $validated['status'] = $request->boolean('status');
        $cms_page->update($validated);
        AuditLogger::log('cms.updated', $cms_page, $old, $cms_page->fresh()->toArray());

        return redirect()->route('admin.cms-pages.index')->with('success', 'CMS page updated successfully.');
    }

    public function destroy(CmsPage $cms_page): RedirectResponse
    {
        AuditLogger::log('cms.deleted', $cms_page, $cms_page->toArray());
        $cms_page->delete();

        return redirect()->route('admin.cms-pages.index')->with('success', 'CMS page deleted successfully.');
    }

    public function toggleStatus(CmsPage $cms_page): RedirectResponse
    {
        $cms_page->update(['status' => ! $cms_page->status]);
        AuditLogger::log('cms.toggled', $cms_page);

        return back()->with('success', 'CMS page status updated.');
    }
}
