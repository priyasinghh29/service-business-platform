<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Models\Quote;
use App\Models\Setting;
use App\Models\Subscription;
use App\Services\AuditLogger;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

class InvoiceController extends Controller
{
    public function vault(Request $request): JsonResponse
    {
        $user = $request->user();

        $invoices = Invoice::query()
            ->with(['booking.service:id,name,slug'])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        $outstanding = $invoices->whereIn('status', ['sent', 'overdue', 'draft']);
        $paid = $invoices->where('status', 'paid');
        $overdue = $invoices->filter(function (Invoice $inv) {
            if ($inv->status === 'overdue') {
                return true;
            }

            return in_array($inv->status, ['sent', 'draft'], true)
                && $inv->due_at
                && $inv->due_at->isPast();
        });

        $nextDue = $outstanding
            ->sortBy(fn (Invoice $inv) => $inv->due_at?->timestamp ?? PHP_INT_MAX)
            ->first();

        $paidThisYear = $paid
            ->filter(fn (Invoice $inv) => ($inv->paid_at ?? $inv->updated_at)?->year === now()->year)
            ->sum('total');

        $quotes = Quote::query()
            ->with('service:id,name')
            ->where(function ($q) use ($user) {
                $q->where('user_id', $user->id)
                    ->orWhere('customer_email', $user->email_id);
            })
            ->whereIn('status', ['pending', 'sent'])
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (Quote $q) => [
                'id' => $q->id,
                'number' => $q->quote_number,
                'title' => $q->service?->name ?? ($q->message ? Str::limit($q->message, 60) : 'Service quotation'),
                'amount' => (float) ($q->estimated_amount ?? 0),
                'amount_formatted' => '₹'.number_format((float) ($q->estimated_amount ?? 0), 0),
                'status' => match ($q->status) {
                    'sent' => 'Awaiting Approval',
                    'pending' => 'Under Review',
                    default => ucfirst($q->status),
                },
                'valid_till' => optional($q->valid_until)->format('M j, Y'),
            ]);

        $subscriptions = Subscription::query()
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->where('status_flag', true)
            ->latest()
            ->get()
            ->map(fn (Subscription $s) => [
                'id' => $s->id,
                'name' => $s->name,
                'cadence' => $s->cadence,
                'amount' => (float) $s->amount,
                'amount_formatted' => '₹'.number_format((float) $s->amount, 0),
                'renews_on' => optional($s->renews_at)->format('M j, Y'),
                'status' => $s->status,
            ]);

        $paymentMethods = PaymentMethod::query()
            ->where('user_id', $user->id)
            ->where('status', true)
            ->orderByDesc('is_primary')
            ->get()
            ->map(fn (PaymentMethod $pm) => [
                'id' => $pm->id,
                'label' => $pm->label,
                'detail' => $pm->detail,
                'type' => $pm->type,
                'primary' => $pm->is_primary,
            ]);

        $taxDocuments = Document::query()
            ->where('user_id', $user->id)
            ->where('status', 'available')
            ->where('status_flag', true)
            ->where(function ($q) {
                $q->where('folder', 'like', '%Tax%')
                    ->orWhere('name', 'like', '%Form%')
                    ->orWhere('name', 'like', '%TDS%')
                    ->orWhere('name', 'like', '%16%');
            })
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (Document $doc) => [
                'id' => $doc->id,
                'name' => $doc->name,
                'date' => optional($doc->created_at)->format('M j, Y'),
                'download_url' => $doc->file_path ? '/api/documents/'.$doc->id.'/download' : null,
                'has_file' => (bool) $doc->file_path,
            ]);

        return ApiResponse::success([
            'kpis' => [
                'total_outstanding' => round((float) $outstanding->sum('total'), 2),
                'total_outstanding_formatted' => '₹'.number_format((float) $outstanding->sum('total'), 0),
                'outstanding_count' => $outstanding->count(),
                'paid_this_year' => round((float) $paidThisYear, 2),
                'paid_this_year_formatted' => '₹'.number_format((float) $paidThisYear, 0),
                'overdue_count' => $overdue->count(),
                'next_due_date' => optional($nextDue?->due_at)->format('M j, Y') ?? '—',
            ],
            'invoices' => $invoices->map(fn (Invoice $inv) => $this->mapInvoice($inv))->values(),
            'subscriptions' => $subscriptions->values(),
            'quotations' => $quotes->values(),
            'payment_methods' => $paymentMethods->values(),
            'tax_documents' => $taxDocuments->values(),
            'summary' => [
                'invoices_this_year' => $invoices->filter(
                    fn (Invoice $inv) => ($inv->issued_at ?? $inv->created_at)?->year === now()->year
                )->count(),
                'active_subscriptions' => $subscriptions->count(),
                'pending_quotations' => $quotes->count(),
            ],
            'support' => [
                'email' => Setting::getValue('billing_email', Setting::getValue('rm_email', 'billing@oknitech.serve')),
                'phone' => Setting::getValue('billing_phone', Setting::getValue('rm_phone', '+91 1800 123 4567')),
            ],
        ], 'Billing vault retrieved');
    }

    public function index(Request $request): JsonResponse
    {
        $invoices = Invoice::query()
            ->with(['booking.service:id,name,slug'])
            ->where('user_id', $request->user()->id)
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->latest()
            ->paginate((int) $request->input('per_page', 20));

        $invoices->setCollection(
            $invoices->getCollection()->map(fn (Invoice $inv) => $this->mapInvoice($inv))
        );

        return ApiResponse::success($invoices, 'Invoices retrieved');
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $invoice = Invoice::query()
            ->with(['booking.service', 'payments'])
            ->where('user_id', $request->user()->id)
            ->find($id);

        if (! $invoice) {
            return ApiResponse::error('Invoice not found', null, 404);
        }

        return ApiResponse::success($this->mapInvoice($invoice, true), 'Invoice retrieved');
    }

    public function pay(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'payment_method_id' => ['nullable', 'integer', 'exists:payment_methods,id'],
            'gateway' => ['nullable', 'in:manual,stripe,razorpay,paypal'],
        ]);

        $invoice = Invoice::query()
            ->with('booking')
            ->where('user_id', $request->user()->id)
            ->find($id);

        if (! $invoice) {
            return ApiResponse::error('Invoice not found', null, 404);
        }

        if ($invoice->status === 'paid') {
            return ApiResponse::error('Invoice already paid', null, 422);
        }

        if ($invoice->status === 'cancelled') {
            return ApiResponse::error('Cancelled invoice cannot be paid', null, 422);
        }

        $method = null;
        if (! empty($validated['payment_method_id'])) {
            $method = PaymentMethod::query()
                ->where('user_id', $request->user()->id)
                ->where('status', true)
                ->find($validated['payment_method_id']);

            if (! $method) {
                return ApiResponse::error('Invalid payment method', null, 422);
            }
        } else {
            $method = PaymentMethod::query()
                ->where('user_id', $request->user()->id)
                ->where('status', true)
                ->orderByDesc('is_primary')
                ->first();
        }

        $old = $invoice->toArray();
        $gateway = $validated['gateway'] ?? 'manual';

        $payment = Payment::create([
            'booking_id' => $invoice->booking_id,
            'invoice_id' => $invoice->id,
            'user_id' => $request->user()->id,
            'gateway' => $gateway,
            'gateway_reference' => 'MANUAL-'.strtoupper(Str::random(10)),
            'amount' => $invoice->total,
            'currency' => 'INR',
            'status' => 'success',
            'paid_at' => now(),
            'meta' => [
                'payment_method_id' => $method?->id,
                'payment_method_label' => $method?->label,
                'mode' => 'portal_pay_now',
            ],
        ]);

        $invoice->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        if ($invoice->booking) {
            $invoice->booking->update([
                'payment_status' => 'paid',
                'status' => $invoice->booking->status === 'pending' ? 'confirmed' : $invoice->booking->status,
            ]);
        }

        AuditLogger::log('invoice.paid', $invoice, $old, $invoice->fresh()->toArray());

        return ApiResponse::success([
            'invoice' => $this->mapInvoice($invoice->fresh()->load(['booking.service', 'payments'])),
            'payment' => $payment,
        ], 'Invoice paid successfully');
    }

    public function download(Request $request, int $id): Response|JsonResponse
    {
        $invoice = Invoice::query()
            ->with(['booking.service', 'user'])
            ->where('user_id', $request->user()->id)
            ->find($id);

        if (! $invoice) {
            return ApiResponse::error('Invoice not found', null, 404);
        }

        $html = $this->invoiceHtml($invoice);

        return response($html, 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.$invoice->invoice_number.'.html"',
        ]);
    }

    public function statement(Request $request): Response
    {
        $invoices = Invoice::query()
            ->with(['booking.service:id,name'])
            ->where('user_id', $request->user()->id)
            ->orderBy('created_at')
            ->get();

        $lines = [
            'Invoice Number,Service,Status,Subtotal,Discount,Tax,Total,Issued At,Due At,Paid At',
        ];

        foreach ($invoices as $inv) {
            $lines[] = implode(',', [
                $inv->invoice_number,
                '"'.str_replace('"', '""', $inv->booking?->service?->name ?? '').'"',
                $inv->status,
                $inv->subtotal,
                $inv->discount,
                $inv->tax,
                $inv->total,
                optional($inv->issued_at)->toDateString() ?? '',
                optional($inv->due_at)->toDateString() ?? '',
                optional($inv->paid_at)->toDateString() ?? '',
            ]);
        }

        $csv = implode("\n", $lines)."\n";

        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="billing-statement-'.now()->format('Y-m-d').'.csv"',
        ]);
    }

    public function storePaymentMethod(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'label' => ['required', 'string', 'max:120'],
            'detail' => ['nullable', 'string', 'max:120'],
            'type' => ['nullable', 'in:card,bank,upi'],
            'is_primary' => ['nullable', 'boolean'],
        ]);

        $isPrimary = (bool) ($validated['is_primary'] ?? false);

        if ($isPrimary) {
            PaymentMethod::query()
                ->where('user_id', $request->user()->id)
                ->update(['is_primary' => false]);
        } elseif (! PaymentMethod::query()->where('user_id', $request->user()->id)->where('status', true)->exists()) {
            $isPrimary = true;
        }

        $method = PaymentMethod::create([
            'user_id' => $request->user()->id,
            'label' => $validated['label'],
            'detail' => $validated['detail'] ?? null,
            'type' => $validated['type'] ?? 'card',
            'is_primary' => $isPrimary,
            'status' => true,
        ]);

        return ApiResponse::success([
            'id' => $method->id,
            'label' => $method->label,
            'detail' => $method->detail,
            'type' => $method->type,
            'primary' => $method->is_primary,
        ], 'Payment method added', 201);
    }

    private function mapInvoice(Invoice $invoice, bool $detailed = false): array
    {
        $status = $invoice->status;
        if (in_array($status, ['sent', 'draft'], true) && $invoice->due_at?->isPast()) {
            $statusLabel = 'Overdue';
        } else {
            $statusLabel = match ($status) {
                'paid' => 'Paid',
                'overdue' => 'Overdue',
                'sent' => 'Outstanding',
                'draft' => 'Draft',
                'cancelled' => 'Cancelled',
                default => ucfirst($status),
            };
        }

        $data = [
            'id' => $invoice->id,
            'number' => $invoice->invoice_number,
            'service' => $invoice->booking?->service?->name ?? 'Professional Services',
            'amount' => (float) $invoice->total,
            'amount_formatted' => '₹'.number_format((float) $invoice->total, 0),
            'subtotal' => (float) $invoice->subtotal,
            'discount' => (float) $invoice->discount,
            'tax' => (float) $invoice->tax,
            'status' => $statusLabel,
            'status_raw' => $invoice->status,
            'issued_on' => optional($invoice->issued_at ?? $invoice->created_at)->format('M j, Y'),
            'due_on' => optional($invoice->due_at)->format('M j, Y'),
            'paid_on' => optional($invoice->paid_at)->format('M j, Y'),
            'notes' => $invoice->notes,
            'can_pay' => ! in_array($invoice->status, ['paid', 'cancelled'], true),
            'booking_id' => $invoice->booking_id,
        ];

        if ($detailed) {
            $data['payments'] = $invoice->payments?->map(fn (Payment $p) => [
                'id' => $p->id,
                'number' => $p->payment_number,
                'amount' => (float) $p->amount,
                'gateway' => $p->gateway,
                'status' => $p->status,
                'paid_at' => optional($p->paid_at)->format('M j, Y g:i A'),
            ])->values() ?? [];
        }

        return $data;
    }

    private function invoiceHtml(Invoice $invoice): string
    {
        $service = e($invoice->booking?->service?->name ?? 'Professional Services');
        $customer = e(trim(($invoice->user?->first_name ?? '').' '.($invoice->user?->last_name ?? '')) ?: 'Customer');
        $number = e($invoice->invoice_number);
        $status = e($invoice->status);
        $issued = e(optional($invoice->issued_at ?? $invoice->created_at)->format('M j, Y') ?? '—');
        $due = e(optional($invoice->due_at)->format('M j, Y') ?? '—');
        $subtotal = number_format((float) $invoice->subtotal, 2);
        $discount = number_format((float) $invoice->discount, 2);
        $tax = number_format((float) $invoice->tax, 2);
        $total = number_format((float) $invoice->total, 2);
        $notes = e($invoice->notes ?? '');

        return <<<HTML
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>{$number}</title>
<style>
body{font-family:Inter,Arial,sans-serif;color:#0b1c30;padding:40px;max-width:720px;margin:0 auto}
h1{color:#003ec7;margin-bottom:4px}
.meta,.table{width:100%;border-collapse:collapse;margin-top:24px}
.table th,.table td{border-bottom:1px solid #c3c5d9;padding:10px 0;text-align:left}
.total{font-size:20px;font-weight:700}
.badge{display:inline-block;background:#dde1ff;color:#003ec7;padding:4px 10px;border-radius:8px;font-size:12px}
</style></head><body>
<h1>Oknitech Serve</h1>
<p>Tax Invoice</p>
<p class="badge">{$status}</p>
<table class="meta">
<tr><td><strong>Invoice</strong><br>{$number}</td><td><strong>Bill To</strong><br>{$customer}</td></tr>
<tr><td><strong>Issued</strong><br>{$issued}</td><td><strong>Due</strong><br>{$due}</td></tr>
</table>
<table class="table">
<thead><tr><th>Description</th><th>Amount (₹)</th></tr></thead>
<tbody>
<tr><td>{$service}</td><td>{$subtotal}</td></tr>
<tr><td>Discount</td><td>{$discount}</td></tr>
<tr><td>Tax</td><td>{$tax}</td></tr>
<tr><td class="total">Total</td><td class="total">{$total}</td></tr>
</tbody>
</table>
<p style="margin-top:24px;color:#434656">{$notes}</p>
</body></html>
HTML;
    }
}
