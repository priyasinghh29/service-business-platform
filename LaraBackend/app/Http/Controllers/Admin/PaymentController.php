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
use Illuminate\View\View;

class PaymentController extends Controller
{
    use HandlesBulkActions;

    protected string $statusColumn = 'status_flag';

    protected function modelClass(): string
    {
        return Payment::class;
    }

    public function index(Request $request): View
    {
        $query = Payment::query()->with(['user', 'booking', 'invoice'])->latest();

        if ($request->filled('q')) {
            $q = $request->string('q');
            $query->where(function ($builder) use ($q) {
                $builder->where('payment_number', 'like', "%{$q}%")
                    ->orWhere('gateway_reference', 'like', "%{$q}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('gateway')) {
            $query->where('gateway', $request->string('gateway'));
        }

        $payments = $query->paginate(15)->withQueryString();

        return view('admin.payments.index', compact('payments'));
    }

    public function create(): View
    {
        return view('admin.payments.create', [
            'customers' => User::where('role', 'customer')->orderBy('first_name')->get(['id', 'first_name', 'last_name', 'email_id']),
            'bookings' => Booking::latest()->limit(100)->get(['id', 'booking_number', 'total']),
            'invoices' => Invoice::latest()->limit(100)->get(['id', 'invoice_number', 'total']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'booking_id' => ['nullable', 'exists:bookings,id'],
            'invoice_id' => ['nullable', 'exists:invoices,id'],
            'user_id' => ['required', 'exists:users,id'],
            'gateway' => ['required', 'in:stripe,razorpay,paypal,manual'],
            'gateway_reference' => ['nullable', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'currency' => ['required', 'string', 'max:10'],
            'status' => ['required', 'in:pending,success,failed,refunded'],
            'paid_at' => ['nullable', 'date'],
            'status_flag' => ['nullable', 'boolean'],
        ]);

        $validated['status_flag'] = $request->boolean('status_flag', true);
        if ($validated['status'] === 'success' && empty($validated['paid_at'])) {
            $validated['paid_at'] = now();
        }
        $payment = Payment::create($validated);
        $this->syncRelatedRecords($payment);
        AuditLogger::log('payment.created', $payment, null, $payment->toArray());

        return redirect()->route('admin.payments.index')->with('success', 'Payment created successfully.');
    }

    public function edit(Payment $payment): View
    {
        return view('admin.payments.edit', [
            'payment' => $payment,
            'customers' => User::where('role', 'customer')->orderBy('first_name')->get(['id', 'first_name', 'last_name', 'email_id']),
            'bookings' => Booking::latest()->limit(100)->get(['id', 'booking_number', 'total']),
            'invoices' => Invoice::latest()->limit(100)->get(['id', 'invoice_number', 'total']),
        ]);
    }

    public function update(Request $request, Payment $payment): RedirectResponse
    {
        $validated = $request->validate([
            'booking_id' => ['nullable', 'exists:bookings,id'],
            'invoice_id' => ['nullable', 'exists:invoices,id'],
            'user_id' => ['required', 'exists:users,id'],
            'gateway' => ['required', 'in:stripe,razorpay,paypal,manual'],
            'gateway_reference' => ['nullable', 'string', 'max:255'],
            'amount' => ['required', 'numeric', 'min:0'],
            'currency' => ['required', 'string', 'max:10'],
            'status' => ['required', 'in:pending,success,failed,refunded'],
            'paid_at' => ['nullable', 'date'],
            'status_flag' => ['nullable', 'boolean'],
        ]);

        $old = $payment->toArray();
        $validated['status_flag'] = $request->boolean('status_flag');
        if ($validated['status'] === 'success' && empty($validated['paid_at'])) {
            $validated['paid_at'] = $payment->paid_at ?? now();
        }
        $payment->update($validated);
        $this->syncRelatedRecords($payment->fresh());
        AuditLogger::log('payment.updated', $payment, $old, $payment->fresh()->toArray());

        return redirect()->route('admin.payments.index')->with('success', 'Payment updated successfully.');
    }

    public function destroy(Payment $payment): RedirectResponse
    {
        AuditLogger::log('payment.deleted', $payment, $payment->toArray());
        $payment->delete();

        return redirect()->route('admin.payments.index')->with('success', 'Payment deleted successfully.');
    }

    public function toggleStatus(Payment $payment): RedirectResponse
    {
        $payment->update(['status_flag' => ! $payment->status_flag]);
        AuditLogger::log('payment.toggled', $payment);

        return back()->with('success', 'Payment status updated.');
    }

    private function syncRelatedRecords(Payment $payment): void
    {
        if ($payment->status !== 'success') {
            return;
        }

        if ($payment->invoice_id) {
            Invoice::where('id', $payment->invoice_id)->update([
                'status' => 'paid',
                'paid_at' => $payment->paid_at ?? now(),
            ]);
        }

        if ($payment->booking_id) {
            Booking::where('id', $payment->booking_id)->update([
                'payment_status' => 'paid',
            ]);
        }
    }
}
