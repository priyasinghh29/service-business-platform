<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\HandlesBulkActions;
use App\Http\Controllers\Controller;
use App\Models\ServiceProvider;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Illuminate\View\View;

class ProviderController extends Controller
{
    use HandlesBulkActions;

    protected function modelClass(): string
    {
        return ServiceProvider::class;
    }

    public function index(Request $request): View
    {
        $query = ServiceProvider::query()->with('user')->latest();

        if ($request->filled('q')) {
            $q = $request->string('q');
            $query->where(function ($builder) use ($q) {
                $builder->where('business_name', 'like', "%{$q}%")
                    ->orWhere('specialization', 'like', "%{$q}%")
                    ->orWhereHas('user', function ($u) use ($q) {
                        $u->where('first_name', 'like', "%{$q}%")
                            ->orWhere('last_name', 'like', "%{$q}%")
                            ->orWhere('email_id', 'like', "%{$q}%");
                    });
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->boolean('status'));
        }

        $providers = $query->paginate(15)->withQueryString();

        return view('admin.providers.index', compact('providers'));
    }

    public function create(): View
    {
        return view('admin.providers.create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'email_id' => ['required', 'email', 'unique:users,email_id'],
            'phone_number' => ['nullable', 'string', 'max:50'],
            'password' => ['required', Rules\Password::defaults()],
            'business_name' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string'],
            'specialization' => ['nullable', 'string', 'max:255'],
            'hourly_rate' => ['nullable', 'numeric', 'min:0'],
            'is_verified' => ['nullable', 'boolean'],
            'status' => ['nullable', 'boolean'],
        ]);

        $user = User::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'] ?? null,
            'email_id' => $validated['email_id'],
            'phone_number' => $validated['phone_number'] ?? null,
            'password' => $validated['password'],
            'role' => 'provider',
            'status' => true,
        ]);

        $provider = ServiceProvider::create([
            'user_id' => $user->id,
            'business_name' => $validated['business_name'] ?? null,
            'bio' => $validated['bio'] ?? null,
            'specialization' => $validated['specialization'] ?? null,
            'hourly_rate' => $validated['hourly_rate'] ?? null,
            'is_verified' => $request->boolean('is_verified'),
            'status' => $request->boolean('status', true),
        ]);

        AuditLogger::log('provider.created', $provider, null, $provider->toArray());

        return redirect()->route('admin.providers.index')->with('success', 'Provider created successfully.');
    }

    public function edit(ServiceProvider $provider): View
    {
        $provider->load('user');

        return view('admin.providers.edit', compact('provider'));
    }

    public function update(Request $request, ServiceProvider $provider): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'email_id' => ['required', 'email', 'unique:users,email_id,'.$provider->user_id],
            'phone_number' => ['nullable', 'string', 'max:50'],
            'password' => ['nullable', Rules\Password::defaults()],
            'business_name' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string'],
            'specialization' => ['nullable', 'string', 'max:255'],
            'hourly_rate' => ['nullable', 'numeric', 'min:0'],
            'is_verified' => ['nullable', 'boolean'],
            'status' => ['nullable', 'boolean'],
        ]);

        $old = $provider->toArray();

        $userData = [
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'] ?? null,
            'email_id' => $validated['email_id'],
            'phone_number' => $validated['phone_number'] ?? null,
            'role' => 'provider',
        ];
        if (! empty($validated['password'])) {
            $userData['password'] = $validated['password'];
        }
        $provider->user->update($userData);

        $provider->update([
            'business_name' => $validated['business_name'] ?? null,
            'bio' => $validated['bio'] ?? null,
            'specialization' => $validated['specialization'] ?? null,
            'hourly_rate' => $validated['hourly_rate'] ?? null,
            'is_verified' => $request->boolean('is_verified'),
            'status' => $request->boolean('status'),
        ]);

        AuditLogger::log('provider.updated', $provider, $old, $provider->fresh()->toArray());

        return redirect()->route('admin.providers.index')->with('success', 'Provider updated successfully.');
    }

    public function destroy(ServiceProvider $provider): RedirectResponse
    {
        AuditLogger::log('provider.deleted', $provider, $provider->toArray());
        $user = $provider->user;
        $provider->delete();
        if ($user) {
            $user->update(['role' => 'customer']);
        }

        return redirect()->route('admin.providers.index')->with('success', 'Provider deleted successfully.');
    }

    public function toggleStatus(ServiceProvider $provider): RedirectResponse
    {
        $provider->update(['status' => ! $provider->status]);
        AuditLogger::log('provider.toggled', $provider);

        return back()->with('success', 'Provider status updated.');
    }
}
