<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\HandlesBulkActions;
use App\Http\Controllers\Controller;
use App\Models\Blog;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class BlogController extends Controller
{
    use HandlesBulkActions;

    protected function modelClass(): string
    {
        return Blog::class;
    }

    public function index(Request $request): View
    {
        $query = Blog::query()->with('author')->latest();

        if ($request->filled('q')) {
            $q = $request->string('q');
            $query->where(function ($builder) use ($q) {
                $builder->where('title', 'like', "%{$q}%")->orWhere('slug', 'like', "%{$q}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->boolean('status'));
        }

        $blogs = $query->paginate(15)->withQueryString();

        return view('admin.blogs.index', compact('blogs'));
    }

    public function create(): View
    {
        return view('admin.blogs.create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:blogs,slug'],
            'excerpt' => ['nullable', 'string'],
            'content' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'max:255'],
            'published_at' => ['nullable', 'date'],
            'status' => ['nullable', 'boolean'],
        ]);

        $validated['status'] = $request->boolean('status', true);
        $validated['author_id'] = Auth::guard('admin')->id();
        $blog = Blog::create($validated);
        AuditLogger::log('blog.created', $blog, null, $blog->toArray());

        return redirect()->route('admin.blogs.index')->with('success', 'Blog created successfully.');
    }

    public function edit(Blog $blog): View
    {
        return view('admin.blogs.edit', compact('blog'));
    }

    public function update(Request $request, Blog $blog): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:blogs,slug,'.$blog->id],
            'excerpt' => ['nullable', 'string'],
            'content' => ['nullable', 'string'],
            'image' => ['nullable', 'string', 'max:255'],
            'published_at' => ['nullable', 'date'],
            'status' => ['nullable', 'boolean'],
        ]);

        $old = $blog->toArray();
        $validated['status'] = $request->boolean('status');
        $blog->update($validated);
        AuditLogger::log('blog.updated', $blog, $old, $blog->fresh()->toArray());

        return redirect()->route('admin.blogs.index')->with('success', 'Blog updated successfully.');
    }

    public function destroy(Blog $blog): RedirectResponse
    {
        AuditLogger::log('blog.deleted', $blog, $blog->toArray());
        $blog->delete();

        return redirect()->route('admin.blogs.index')->with('success', 'Blog deleted successfully.');
    }

    public function toggleStatus(Blog $blog): RedirectResponse
    {
        $blog->update(['status' => ! $blog->status]);
        AuditLogger::log('blog.toggled', $blog);

        return back()->with('success', 'Blog status updated.');
    }
}
