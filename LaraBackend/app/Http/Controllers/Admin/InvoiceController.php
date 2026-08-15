<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\HandlesBulkActions;
use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\View\View;

class InvoiceController extends Controller
{
    use HandlesBulkActions;

    protected string $statusColumn = 'status_flag';

    protected function modelClass(): string
    {
        return Invoice::class;
    }

    public function index(Request $request): View
    {
        $query = Invoice::query()->with(['user', 'booking'])->latest();

        if ($request->filled('q')) {
            $q = $request->string('q');
            $query->where(function ($builder) use ($q) {
                $builder->where('invoice_number', 'like', "%{$q}%")
                    ->orWhereHas('user', fn ($u) => $u->where('email_id', 'like', "%{$q}%"));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $invoices = $query->paginate(15)->withQueryString();

        return view('admin.invoices.index', compact('invoices'));
    }

    public function create(): View
    {
        return view('admin.invoices.create', [
            'customers' => User::where('role', 'customer')->orderBy('first_name')->get(['id', 'first_name', 'last_name', 'email_id']),
            'bookings' => Booking::latest()->limit(100)->get(['id', 'booking_number', 'user_id', 'total']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validatedInvoice($request);
        $validated['discount'] = $validated['discount'] ?? 0;
        $validated['tax'] = $validated['tax'] ?? 0;
        $validated['status_flag'] = $request->boolean('status_flag', true);
        $validated['issued_at'] = $validated['issued_at'] ?? now();
        if (($validated['status'] ?? null) === 'paid' && empty($validated['paid_at'])) {
            $validated['paid_at'] = now();
        }

        $invoice = Invoice::create($validated);
        AuditLogger::log('invoice.created', $invoice, null, $invoice->toArray());

        return redirect()->route('admin.invoices.show', $invoice)->with('success', 'Invoice created successfully.');
    }

    public function show(Invoice $invoice): View
    {
        $invoice->load(['user', 'booking.service', 'payments']);

        return view('admin.invoices.show', compact('invoice'));
    }

    public function edit(Invoice $invoice): View
    {
        return view('admin.invoices.edit', [
            'invoice' => $invoice,
            'customers' => User::where('role', 'customer')->orderBy('first_name')->get(['id', 'first_name', 'last_name', 'email_id']),
            'bookings' => Booking::latest()->limit(100)->get(['id', 'booking_number', 'user_id', 'total']),
        ]);
    }

    public function update(Request $request, Invoice $invoice): RedirectResponse
    {
        $validated = $this->validatedInvoice($request, true);
        $old = $invoice->toArray();
        $validated['discount'] = $validated['discount'] ?? 0;
        $validated['tax'] = $validated['tax'] ?? 0;
        $validated['status_flag'] = $request->boolean('status_flag');
        if (($validated['status'] ?? null) === 'paid' && empty($validated['paid_at'])) {
            $validated['paid_at'] = $invoice->paid_at ?? now();
        }
        $invoice->update($validated);
        AuditLogger::log('invoice.updated', $invoice, $old, $invoice->fresh()->toArray());

        return redirect()->route('admin.invoices.show', $invoice)->with('success', 'Invoice updated successfully.');
    }

    public function destroy(Invoice $invoice): RedirectResponse
    {
        AuditLogger::log('invoice.deleted', $invoice, $invoice->toArray());
        $invoice->delete();

        return redirect()->route('admin.invoices.index')->with('success', 'Invoice deleted successfully.');
    }

    public function toggleStatus(Invoice $invoice): RedirectResponse
    {
        $invoice->update(['status_flag' => ! $invoice->status_flag]);
        AuditLogger::log('invoice.toggled', $invoice);

        return back()->with('success', 'Invoice visibility updated.');
    }

    public function markPaid(Invoice $invoice): RedirectResponse
    {
        $invoice->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        if ($invoice->booking) {
            $invoice->booking->update(['payment_status' => 'paid']);
        }

        Payment::create([
            'booking_id' => $invoice->booking_id,
            'invoice_id' => $invoice->id,
            'user_id' => $invoice->user_id,
            'gateway' => 'manual',
            'gateway_reference' => 'ADMIN-'.strtoupper(uniqid()),
            'amount' => $invoice->total,
            'currency' => 'INR',
            'status' => 'success',
            'paid_at' => now(),
            'status_flag' => true,
        ]);

        AuditLogger::log('invoice.marked_paid', $invoice);

        return back()->with('success', 'Invoice marked as paid.');
    }

    public function download(Invoice $invoice): Response
    {
        $invoice->load(['booking.service', 'user']);
        $html = $this->invoiceHtml($invoice);

        return response($html, 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.$invoice->invoice_number.'.html"',
        ]);
    }

    private function validatedInvoice(Request $request, bool $withPaidAt = false): array
    {
        $rules = [
            'booking_id' => ['nullable', 'exists:bookings,id'],
            'user_id' => ['required', 'exists:users,id'],
            'subtotal' => ['required', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'tax' => ['nullable', 'numeric', 'min:0'],
            'total' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'in:draft,sent,paid,overdue,cancelled'],
            'issued_at' => ['nullable', 'date'],
            'due_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
            'status_flag' => ['nullable', 'boolean'],
        ];
        if ($withPaidAt) {
            $rules['paid_at'] = ['nullable', 'date'];
        }

        return $request->validate($rules);
    }

    private function invoiceHtml(Invoice $invoice): string
    {
        $service = e($invoice->booking?->service?->name ?? 'Professional Services');
        $customer = e($invoice->user?->full_name ?: 'Customer');
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
body{font-family:Arial,sans-serif;color:#0b1c30;padding:40px;max-width:720px;margin:0 auto}
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
