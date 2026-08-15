<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Setting;
use App\Models\SupportArticle;
use App\Models\SupportTicket;
use App\Models\SupportTicketMessage;
use App\Services\AuditLogger;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupportController extends Controller
{
    public function vault(Request $request): JsonResponse
    {
        $user = $request->user();

        $tickets = SupportTicket::query()
            ->where('user_id', $user->id)
            ->where('status_flag', true)
            ->latest('updated_at')
            ->get();

        $open = $tickets->where('status', 'Open')->count();
        $inProgress = $tickets->where('status', 'In Progress')->count();
        $waiting = $tickets->where('status', 'Waiting on You')->count();
        $resolvedThisMonth = $tickets
            ->filter(fn (SupportTicket $t) => $t->status === 'Resolved'
                && $t->resolved_at
                && $t->resolved_at->isCurrentMonth())
            ->count();

        $responseMinutes = SupportTicket::query()
            ->where('user_id', $user->id)
            ->whereNotNull('first_responded_at')
            ->get()
            ->map(fn (SupportTicket $t) => $t->created_at->diffInMinutes($t->first_responded_at))
            ->filter(fn ($m) => $m >= 0)
            ->avg();

        $avgResponse = $responseMinutes !== null
            ? (round($responseMinutes / 60, 1).' hrs')
            : '—';

        $articles = SupportArticle::query()
            ->where('status', true)
            ->where('is_faq', false)
            ->orderBy('sort_order')
            ->orderByDesc('reads')
            ->limit(12)
            ->get()
            ->map(fn (SupportArticle $a) => $this->mapArticle($a));

        $faqs = SupportArticle::query()
            ->where('status', true)
            ->where('is_faq', true)
            ->orderBy('sort_order')
            ->get()
            ->map(fn (SupportArticle $a) => [
                'id' => (string) $a->id,
                'q' => $a->title,
                'a' => $a->faq_answer ?: strip_tags((string) $a->content),
            ]);

        $rmBooking = Booking::query()
            ->with('provider.user:id,first_name,last_name,email_id,phone_number')
            ->where('user_id', $user->id)
            ->whereNotNull('provider_id')
            ->latest()
            ->first();

        $rmUser = $rmBooking?->provider?->user;
        $relationshipManager = $rmUser ? [
            'name' => trim(($rmUser->first_name ?? '').' '.($rmUser->last_name ?? '')) ?: 'Account Manager',
            'role' => 'Relationship Manager',
            'email' => $rmUser->email_id,
            'phone' => $rmUser->phone_number,
            'availability' => Setting::getValue('support_hours', 'Mon–Sat, 9:30 AM – 6:30 PM IST'),
        ] : [
            'name' => Setting::getValue('rm_name', 'Oknitech Support'),
            'role' => Setting::getValue('rm_role', 'Relationship Manager'),
            'email' => Setting::getValue('rm_email', 'support@oknitech.serve'),
            'phone' => Setting::getValue('rm_phone', '+91 1800 123 4567'),
            'availability' => Setting::getValue('support_hours', 'Mon–Sat, 9:30 AM – 6:30 PM IST'),
        ];

        $maintenanceEnabled = (bool) Setting::getValue('support_maintenance_enabled', false);
        $maintenanceMessage = Setting::getValue(
            'support_maintenance_message',
            'The client portal will undergo scheduled maintenance soon. Some features may be temporarily unavailable.'
        );

        return ApiResponse::success([
            'maintenance' => [
                'enabled' => $maintenanceEnabled,
                'message' => $maintenanceMessage,
            ],
            'kpis' => [
                'open' => $open,
                'in_progress' => $inProgress,
                'waiting_on_you' => $waiting,
                'resolved_this_month' => $resolvedThisMonth,
                'avg_response_time' => $avgResponse,
            ],
            'tickets' => $tickets->map(fn (SupportTicket $t) => $this->mapTicket($t))->values(),
            'knowledge_base' => $articles,
            'faqs' => $faqs,
            'relationship_manager' => $relationshipManager,
            'contacts' => [
                'working_hours' => Setting::getValue('support_hours', 'Mon–Sat, 9:30 AM – 6:30 PM IST'),
                'email' => Setting::getValue('support_email', 'support@oknitech.serve'),
                'phone' => Setting::getValue('support_phone', '+91 1800 123 4567'),
            ],
            'categories' => [
                'General',
                'Tax & Compliance',
                'Billing',
                'Documents',
                'Technical',
                'Live Chat',
            ],
        ], 'Support centre retrieved');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:100'],
            'priority' => ['nullable', 'in:Low,Medium,High'],
            'description' => ['nullable', 'string', 'max:5000'],
            'channel' => ['nullable', 'in:ticket,chat'],
        ]);

        $user = $request->user();
        $name = trim(($user->first_name ?? '').' '.($user->last_name ?? '')) ?: 'You';
        $isChat = ($validated['channel'] ?? 'ticket') === 'chat';

        $ticket = SupportTicket::create([
            'user_id' => $user->id,
            'subject' => $validated['subject'],
            'category' => $validated['category'] ?? ($isChat ? 'Live Chat' : 'General'),
            'priority' => $validated['priority'] ?? ($isChat ? 'High' : 'Medium'),
            'status' => 'Open',
            'description' => $validated['description'] ?? null,
        ]);

        if (! empty($validated['description'])) {
            SupportTicketMessage::create([
                'support_ticket_id' => $ticket->id,
                'user_id' => $user->id,
                'author_name' => $name,
                'role' => 'Client',
                'message' => $validated['description'],
            ]);
        }

        // Auto-ack from support so chat feels live.
        SupportTicketMessage::create([
            'support_ticket_id' => $ticket->id,
            'user_id' => null,
            'author_name' => 'Support Desk',
            'role' => 'Support',
            'message' => $isChat
                ? 'Thanks for reaching out. A support specialist will join this chat shortly.'
                : 'Thanks for submitting your ticket. Our team will review and respond soon.',
        ]);

        $ticket->update([
            'status' => 'In Progress',
            'first_responded_at' => now(),
        ]);

        AuditLogger::log('support.ticket_created', $ticket, null, $ticket->toArray());

        return ApiResponse::success(
            $this->mapTicket($ticket->fresh()->load('messages')),
            'Support ticket created',
            201
        );
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $ticket = SupportTicket::query()
            ->with('messages')
            ->where('user_id', $request->user()->id)
            ->find($id);

        if (! $ticket) {
            return ApiResponse::error('Ticket not found', null, 404);
        }

        return ApiResponse::success($this->mapTicket($ticket, true), 'Ticket retrieved');
    }

    public function reply(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $ticket = SupportTicket::query()
            ->where('user_id', $request->user()->id)
            ->find($id);

        if (! $ticket) {
            return ApiResponse::error('Ticket not found', null, 404);
        }

        if (in_array($ticket->status, ['Resolved', 'Closed'], true)) {
            $ticket->update(['status' => 'Waiting on You', 'resolved_at' => null]);
        } elseif ($ticket->status === 'Open') {
            $ticket->update(['status' => 'Waiting on You']);
        }

        $user = $request->user();
        $name = trim(($user->first_name ?? '').' '.($user->last_name ?? '')) ?: 'You';

        $message = SupportTicketMessage::create([
            'support_ticket_id' => $ticket->id,
            'user_id' => $user->id,
            'author_name' => $name,
            'role' => 'Client',
            'message' => $validated['message'],
        ]);

        $ticket->touch();

        return ApiResponse::success([
            'id' => $message->id,
            'author' => $message->author_name,
            'role' => $message->role,
            'message' => $message->message,
            'timestamp' => optional($message->created_at)->format('M j, Y · g:i A'),
            'ticket_status' => $ticket->fresh()->status,
        ], 'Reply sent', 201);
    }

    public function resolve(Request $request, int $id): JsonResponse
    {
        $ticket = SupportTicket::query()
            ->where('user_id', $request->user()->id)
            ->find($id);

        if (! $ticket) {
            return ApiResponse::error('Ticket not found', null, 404);
        }

        $ticket->update([
            'status' => 'Resolved',
            'resolved_at' => now(),
        ]);

        SupportTicketMessage::create([
            'support_ticket_id' => $ticket->id,
            'author_name' => 'System',
            'role' => 'System',
            'message' => 'Ticket marked as resolved by customer.',
        ]);

        return ApiResponse::success($this->mapTicket($ticket->fresh()), 'Ticket resolved');
    }

    public function showArticle(Request $request, int $id): JsonResponse
    {
        $article = SupportArticle::query()
            ->where('status', true)
            ->find($id);

        if (! $article) {
            return ApiResponse::error('Article not found', null, 404);
        }

        $article->increment('reads');

        return ApiResponse::success($this->mapArticle($article->fresh(), true), 'Article retrieved');
    }

    private function mapTicket(SupportTicket $ticket, bool $detailed = false): array
    {
        $data = [
            'id' => $ticket->id,
            'number' => $ticket->ticket_number,
            'subject' => $ticket->subject,
            'category' => $ticket->category,
            'priority' => $ticket->priority,
            'status' => $ticket->status,
            'description' => $ticket->description,
            'updated_on' => optional($ticket->updated_at)->format('M j, Y'),
            'created_on' => optional($ticket->created_at)->format('M j, Y'),
        ];

        if ($detailed || $ticket->relationLoaded('messages')) {
            $data['messages'] = $ticket->messages
                ->sortBy('created_at')
                ->values()
                ->map(fn (SupportTicketMessage $m) => [
                    'id' => $m->id,
                    'author' => $m->author_name,
                    'role' => $m->role,
                    'message' => $m->message,
                    'timestamp' => optional($m->created_at)->format('M j, Y · g:i A'),
                ])
                ->all();
        }

        return $data;
    }

    private function mapArticle(SupportArticle $article, bool $detailed = false): array
    {
        $data = [
            'id' => $article->id,
            'title' => $article->title,
            'slug' => $article->slug,
            'category' => $article->category,
            'reads' => $article->reads >= 1000
                ? round($article->reads / 1000, 1).'k'
                : (string) $article->reads,
            'reads_count' => $article->reads,
        ];

        if ($detailed) {
            $data['content'] = $article->content;
        }

        return $data;
    }
}
