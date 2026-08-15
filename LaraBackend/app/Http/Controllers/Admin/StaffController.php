<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\HandlesBulkActions;
use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Role;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules;
use Illuminate\View\View;

class StaffController extends Controller
{
    use HandlesBulkActions;

    protected function modelClass(): string
    {
        return Admin::class;
    }

    public function index(Request $request): View
    {
        $query = Admin::query()->with('role')->latest();

        if ($request->filled('q')) {
            $q = $request->string('q');
            $query->where(function ($builder) use ($q) {
                $builder->where('first_name', 'like', "%{$q}%")
                    ->orWhere('last_name', 'like', "%{$q}%")
                    ->orWhere('email_id', 'like', "%{$q}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->boolean('status'));
        }

        $staff = $query->paginate(15)->withQueryString();

        return view('admin.staff.index', compact('staff'));
    }

    public function create(): View
    {
        return view('admin.staff.create', [
            'roles' => Role::query()->where('status', true)->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'email_id' => ['required', 'email', 'unique:admins,email_id'],
            'phone_number' => ['nullable', 'string', 'max:50'],
            'password' => ['required', Rules\Password::defaults()],
            'role_id' => ['required', 'exists:roles,id'],
            'status' => ['nullable', 'boolean'],
        ]);

        $validated['status'] = $request->boolean('status', true);
        $admin = Admin::create($validated);
        AuditLogger::log('staff.created', $admin, null, $admin->toArray());

        return redirect()->route('admin.staff.index')->with('success', 'Staff member created successfully.');
    }

    public function edit(Admin $staff): View
    {
        return view('admin.staff.edit', [
            'staffMember' => $staff,
            'roles' => Role::query()->where('status', true)->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Admin $staff): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'email_id' => ['required', 'email', 'unique:admins,email_id,'.$staff->id],
            'phone_number' => ['nullable', 'string', 'max:50'],
            'password' => ['nullable', Rules\Password::defaults()],
            'role_id' => ['required', 'exists:roles,id'],
            'status' => ['nullable', 'boolean'],
        ]);

        $old = $staff->toArray();
        $data = collect($validated)->except('password')->all();
        $data['status'] = $request->boolean('status');
        if (! empty($validated['password'])) {
            $data['password'] = $validated['password'];
        }
        $staff->update($data);
        AuditLogger::log('staff.updated', $staff, $old, $staff->fresh()->toArray());

        return redirect()->route('admin.staff.index')->with('success', 'Staff member updated successfully.');
    }

    public function destroy(Admin $staff): RedirectResponse
    {
        if ($staff->id === auth('admin')->id()) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        if (Admin::query()->where('status', true)->count() <= 1 && $staff->status) {
            return back()->with('error', 'Cannot delete the last active admin.');
        }

        AuditLogger::log('staff.deleted', $staff, $staff->toArray());
        $staff->delete();

        return redirect()->route('admin.staff.index')->with('success', 'Staff member deleted successfully.');
    }

    public function toggleStatus(Admin $staff): RedirectResponse
    {
        if ($staff->id === auth('admin')->id() && $staff->status) {
            return back()->with('error', 'You cannot disable your own account.');
        }

        if ($staff->status && Admin::query()->where('status', true)->count() <= 1) {
            return back()->with('error', 'Cannot disable the last active admin.');
        }

        $staff->update(['status' => ! $staff->status]);
        AuditLogger::log('staff.toggled', $staff);

        return back()->with('success', 'Staff status updated.');
    }
}
