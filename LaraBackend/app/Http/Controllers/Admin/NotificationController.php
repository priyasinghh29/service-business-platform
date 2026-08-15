<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class NotificationController extends Controller
{
    public function index(Request $request): View
    {
        $query = Notification::query()->with('user')->latest();

        if ($request->filled('q')) {
            $q = $request->string('q');
            $query->where(function ($builder) use ($q) {
                $builder->where('title', 'like', "%{$q}%")->orWhere('message', 'like', "%{$q}%");
            });
        }

        $notifications = $query->paginate(15)->withQueryString();

        return view('admin.notifications.index', compact('notifications'));
    }

    public function create(): View
    {
        return view('admin.notifications.create', [
            'customers' => User::orderBy('first_name')->get(['id', 'first_name', 'last_name', 'email_id']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'type' => ['nullable', 'string', 'max:50'],
            'priority' => ['nullable', 'in:Low,Medium,High'],
            'link' => ['nullable', 'string', 'max:255'],
            'action_label' => ['nullable', 'string', 'max:100'],
            'action_required' => ['nullable', 'boolean'],
        ]);

        $validated['type'] = $validated['type'] ?? 'System';
        $validated['priority'] = $validated['priority'] ?? 'Medium';
        $validated['action_required'] = $request->boolean('action_required');
        $notification = Notification::create($validated);
        AuditLogger::log('notification.created', $notification, null, $notification->toArray());

        return redirect()->route('admin.notifications.index')->with('success', 'Notification created successfully.');
    }

    public function edit(Notification $notification): View
    {
        return view('admin.notifications.edit', [
            'notification' => $notification,
            'customers' => User::orderBy('first_name')->get(['id', 'first_name', 'last_name', 'email_id']),
        ]);
    }

    public function update(Request $request, Notification $notification): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'message' => ['required', 'string'],
            'type' => ['nullable', 'string', 'max:50'],
            'priority' => ['nullable', 'in:Low,Medium,High'],
            'link' => ['nullable', 'string', 'max:255'],
            'action_label' => ['nullable', 'string', 'max:100'],
            'action_required' => ['nullable', 'boolean'],
        ]);

        $validated['priority'] = $validated['priority'] ?? 'Medium';
        $validated['action_required'] = $request->boolean('action_required');

        $old = $notification->toArray();
        $notification->update($validated);
        AuditLogger::log('notification.updated', $notification, $old, $notification->fresh()->toArray());

        return redirect()->route('admin.notifications.index')->with('success', 'Notification updated successfully.');
    }

    public function destroy(Notification $notification): RedirectResponse
    {
        AuditLogger::log('notification.deleted', $notification, $notification->toArray());
        $notification->delete();

        return redirect()->route('admin.notifications.index')->with('success', 'Notification deleted successfully.');
    }

    public function toggleStatus(Notification $notification): RedirectResponse
    {
        $notification->update(['read' => ! $notification->read]);

        return back()->with('success', 'Notification updated.');
    }
}
