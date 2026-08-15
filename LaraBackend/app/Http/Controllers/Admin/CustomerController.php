<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\HandlesBulkActions;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules;
use Illuminate\View\View;

class CustomerController extends Controller
{
    use HandlesBulkActions;

    protected function modelClass(): string
    {
        return User::class;
    }

    protected function bulkQuery(Request $request)
    {
        return User::query()
            ->where('role', 'customer')
            ->whereIn('id', $request->input('ids', []));
    }

    public function show(User $customer): View
    {
        abort_unless($customer->role === 'customer', 404);

        $customer->loadCount(['bookings', 'documents']);
        $recentBookings = $customer->bookings()->with('service')->latest()->limit(8)->get();
        $openTickets = $customer->supportTickets()->whereNotIn('status', ['Resolved', 'Closed'])->count();

        return view('admin.customers.show', compact('customer', 'recentBookings', 'openTickets'));
    }

    public function index(Request $request): View
    {
        $query = User::query()->where('role', 'customer')->withCount('bookings')->latest();

        if ($request->filled('q')) {
            $q = $request->string('q');
            $query->where(function ($builder) use ($q) {
                $builder->where('first_name', 'like', "%{$q}%")
                    ->orWhere('last_name', 'like', "%{$q}%")
                    ->orWhere('email_id', 'like', "%{$q}%")
                    ->orWhere('phone_number', 'like', "%{$q}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->boolean('status'));
        }

        $customers = $query->paginate(15)->withQueryString();

        return view('admin.customers.index', compact('customers'));
    }

    public function create(): View
    {
        return view('admin.customers.create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'email_id' => ['required', 'email', 'unique:users,email_id'],
            'phone_number' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string'],
            'password' => ['required', Rules\Password::defaults()],
            'status' => ['nullable', 'boolean'],
        ]);

        $customer = User::create([
            ...$validated,
            'role' => 'customer',
            'status' => $request->boolean('status', true),
        ]);

        AuditLogger::log('customer.created', $customer, null, $customer->toArray());

        return redirect()->route('admin.customers.index')->with('success', 'Customer created successfully.');
    }

    public function edit(User $customer): View
    {
        abort_unless($customer->role === 'customer', 404);

        return view('admin.customers.edit', compact('customer'));
    }

    public function update(Request $request, User $customer): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'email_id' => ['required', 'email', 'unique:users,email_id,'.$customer->id],
            'phone_number' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string'],
            'password' => ['nullable', Rules\Password::defaults()],
            'status' => ['nullable', 'boolean'],
        ]);

        $old = $customer->toArray();
        $data = collect($validated)->except('password')->all();
        $data['status'] = $request->boolean('status');
        if (! empty($validated['password'])) {
            $data['password'] = $validated['password'];
        }
        $customer->update($data);

        AuditLogger::log('customer.updated', $customer, $old, $customer->fresh()->toArray());

        return redirect()->route('admin.customers.index')->with('success', 'Customer updated successfully.');
    }

    public function destroy(User $customer): RedirectResponse
    {
        AuditLogger::log('customer.deleted', $customer, $customer->toArray());
        $customer->delete();

        return redirect()->route('admin.customers.index')->with('success', 'Customer deleted successfully.');
    }

    public function toggleStatus(User $customer): RedirectResponse
    {
        $customer->update(['status' => ! $customer->status]);
        AuditLogger::log('customer.toggled', $customer);

        return back()->with('success', 'Customer status updated.');
    }
}
