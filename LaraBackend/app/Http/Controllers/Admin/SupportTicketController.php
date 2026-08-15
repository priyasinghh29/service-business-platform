<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class SupportTicketController extends Controller
{
    public function index(Request $request): View
    {
        $query = SupportTicket::query()->with('user')->latest('updated_at');

        if ($request->filled('q')) {
            $q = $request->string('q');
            $query->where(function ($builder) use ($q) {
                $builder->where('ticket_number', 'like', "%{$q}%")
                    ->orWhere('subject', 'like', "%{$q}%")
                    ->orWhereHas('user', fn ($u) => $u->where('email_id', 'like', "%{$q}%")->orWhere('first_name', 'like', "%{$q}%"));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->string('priority'));
        }

        $tickets = $query->paginate(15)->withQueryString();

        return view('admin.support-tickets.index', compact('tickets'));
    }

    public function create(): View
    {
        return view('admin.support-tickets.create', [
            'customers' => User::query()->where('role', 'customer')->orderBy('first_name')->get(['id', 'first_name', 'last_name', 'email_id']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'subject' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'priority' => ['required', 'in:Low,Medium,High'],
            'status' => ['required', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
        ]);

        $ticket = SupportTicket::create($validated);

        if (! empty($validated['description'])) {
            SupportTicketMessage::create([
                'support_ticket_id' => $ticket->id,
                'user_id' => $validated['user_id'],
                'author_name' => 'Customer',
                'role' => 'Client',
                'message' => $validated['description'],
            ]);
        }

        AuditLogger::log('support.ticket_created_admin', $ticket, null, $ticket->toArray());

        return redirect()->route('admin.support-tickets.show', $ticket)->with('success', 'Ticket created.');
    }

    public function show(SupportTicket $support_ticket): View
    {
        $support_ticket->load(['user', 'messages' => fn ($q) => $q->orderBy('created_at')]);

        return view('admin.support-tickets.show', [
            'ticket' => $support_ticket,
        ]);
    }

    public function edit(SupportTicket $support_ticket): View
    {
        return view('admin.support-tickets.edit', [
            'ticket' => $support_ticket,
            'customers' => User::query()->where('role', 'customer')->orderBy('first_name')->get(['id', 'first_name', 'last_name', 'email_id']),
        ]);
    }

    public function update(Request $request, SupportTicket $support_ticket): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'subject' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'priority' => ['required', 'in:Low,Medium,High'],
            'status' => ['required', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
        ]);

        $old = $support_ticket->toArray();

        if ($validated['status'] === 'Resolved' && ! $support_ticket->resolved_at) {
            $validated['resolved_at'] = now();
        }
        if ($validated['status'] !== 'Resolved') {
            $validated['resolved_at'] = null;
        }

        $support_ticket->update($validated);
        AuditLogger::log('support.ticket_updated_admin', $support_ticket, $old, $support_ticket->fresh()->toArray());

        return redirect()->route('admin.support-tickets.show', $support_ticket)->with('success', 'Ticket updated.');
    }

    public function destroy(SupportTicket $support_ticket): RedirectResponse
    {
        AuditLogger::log('support.ticket_deleted_admin', $support_ticket, $support_ticket->toArray());
        $support_ticket->delete();

        return redirect()->route('admin.support-tickets.index')->with('success', 'Ticket deleted.');
    }

    public function reply(Request $request, SupportTicket $support_ticket): RedirectResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
            'status' => ['nullable', 'string', 'max:50'],
        ]);

        SupportTicketMessage::create([
            'support_ticket_id' => $support_ticket->id,
            'user_id' => null,
            'author_name' => auth('admin')->user()?->full_name ?: 'Support Desk',
            'role' => 'Support',
            'message' => $validated['message'],
        ]);

        $updates = [];
        if (! $support_ticket->first_responded_at) {
            $updates['first_responded_at'] = now();
        }
        $updates['status'] = $validated['status'] ?? 'In Progress';
        if (($updates['status'] ?? null) === 'Resolved') {
            $updates['resolved_at'] = now();
        }
        $support_ticket->update($updates);
        $support_ticket->touch();

        AuditLogger::log('support.ticket_replied_admin', $support_ticket);

        return back()->with('success', 'Reply sent.');
    }
}
