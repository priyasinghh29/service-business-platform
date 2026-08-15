<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\HandlesBulkActions;
use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class RoleController extends Controller
{
    use HandlesBulkActions;

    protected function modelClass(): string
    {
        return Role::class;
    }

    public function index(Request $request): View
    {
        $query = Role::query()->withCount('permissions', 'admins')->latest();

        if ($request->filled('q')) {
            $q = $request->string('q');
            $query->where(function ($builder) use ($q) {
                $builder->where('name', 'like', "%{$q}%")->orWhere('slug', 'like', "%{$q}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->boolean('status'));
        }

        $roles = $query->paginate(15)->withQueryString();

        return view('admin.roles.index', compact('roles'));
    }

    public function create(): View
    {
        return view('admin.roles.create', [
            'permissions' => Permission::orderBy('module')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:roles,slug'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'boolean'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['exists:permissions,id'],
        ]);

        $validated['status'] = $request->boolean('status', true);
        $role = Role::create(collect($validated)->except('permissions')->all());
        $role->permissions()->sync($validated['permissions'] ?? []);
        AuditLogger::log('role.created', $role, null, $role->toArray());

        return redirect()->route('admin.roles.index')->with('success', 'Role created successfully.');
    }

    public function edit(Role $role): View
    {
        $role->load('permissions');

        return view('admin.roles.edit', [
            'role' => $role,
            'permissions' => Permission::orderBy('module')->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Role $role): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:roles,slug,'.$role->id],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'boolean'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['exists:permissions,id'],
        ]);

        $old = $role->toArray();
        $validated['status'] = $request->boolean('status');
        $role->update(collect($validated)->except('permissions')->all());
        $role->permissions()->sync($validated['permissions'] ?? []);
        AuditLogger::log('role.updated', $role, $old, $role->fresh()->toArray());

        return redirect()->route('admin.roles.index')->with('success', 'Role updated successfully.');
    }

    public function destroy(Role $role): RedirectResponse
    {
        if ($role->slug === 'super-admin') {
            return back()->with('error', 'The Super Admin role cannot be deleted.');
        }

        AuditLogger::log('role.deleted', $role, $role->toArray());
        $role->delete();

        return redirect()->route('admin.roles.index')->with('success', 'Role deleted successfully.');
    }

    public function toggleStatus(Role $role): RedirectResponse
    {
        if ($role->slug === 'super-admin' && $role->status) {
            return back()->with('error', 'The Super Admin role cannot be disabled.');
        }

        $role->update(['status' => ! $role->status]);
        AuditLogger::log('role.toggled', $role);

        return back()->with('success', 'Role status updated.');
    }
}
