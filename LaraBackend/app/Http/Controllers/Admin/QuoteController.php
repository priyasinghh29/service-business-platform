<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Admin\Concerns\HandlesBulkActions;
use App\Http\Controllers\Controller;
use App\Models\Quote;
use App\Models\Service;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class QuoteController extends Controller
{
    use HandlesBulkActions;

    protected string $statusColumn = 'status_flag';

    protected function modelClass(): string
    {
        return Quote::class;
    }

    public function index(Request $request): View
    {
        $query = Quote::query()->with(['user', 'service'])->latest();

        if ($request->filled('q')) {
            $q = $request->string('q');
            $query->where(function ($builder) use ($q) {
                $builder->where('quote_number', 'like', "%{$q}%")
                    ->orWhere('customer_name', 'like', "%{$q}%")
                    ->orWhere('customer_email', 'like', "%{$q}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        $quotes = $query->paginate(15)->withQueryString();

        return view('admin.quotes.index', compact('quotes'));
    }

    public function create(): View
    {
        return view('admin.quotes.create', [
            'customers' => User::orderBy('first_name')->get(['id', 'first_name', 'last_name', 'email_id']),
            'services' => Service::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['nullable', 'exists:users,id'],
            'service_id' => ['nullable', 'exists:services,id'],
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_email' => ['required', 'email'],
            'customer_phone' => ['nullable', 'string', 'max:50'],
            'message' => ['nullable', 'string'],
            'estimated_amount' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', 'string'],
            'valid_until' => ['nullable', 'date'],
            'status_flag' => ['nullable', 'boolean'],
        ]);

        $validated['status_flag'] = $request->boolean('status_flag', true);
        $quote = Quote::create($validated);
        AuditLogger::log('quote.created', $quote, null, $quote->toArray());

        return redirect()->route('admin.quotes.index')->with('success', 'Quote created successfully.');
    }

    public function edit(Quote $quote): View
    {
        return view('admin.quotes.edit', [
            'quote' => $quote,
            'customers' => User::orderBy('first_name')->get(['id', 'first_name', 'last_name', 'email_id']),
            'services' => Service::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function update(Request $request, Quote $quote): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => ['nullable', 'exists:users,id'],
            'service_id' => ['nullable', 'exists:services,id'],
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_email' => ['required', 'email'],
            'customer_phone' => ['nullable', 'string', 'max:50'],
            'message' => ['nullable', 'string'],
            'estimated_amount' => ['nullable', 'numeric', 'min:0'],
            'status' => ['required', 'string'],
            'valid_until' => ['nullable', 'date'],
            'status_flag' => ['nullable', 'boolean'],
        ]);

        $old = $quote->toArray();
        $validated['status_flag'] = $request->boolean('status_flag');
        $quote->update($validated);
        AuditLogger::log('quote.updated', $quote, $old, $quote->fresh()->toArray());

        return redirect()->route('admin.quotes.index')->with('success', 'Quote updated successfully.');
    }

    public function destroy(Quote $quote): RedirectResponse
    {
        AuditLogger::log('quote.deleted', $quote, $quote->toArray());
        $quote->delete();

        return redirect()->route('admin.quotes.index')->with('success', 'Quote deleted successfully.');
    }

    public function toggleStatus(Quote $quote): RedirectResponse
    {
        $quote->update(['status_flag' => ! $quote->status_flag]);
        AuditLogger::log('quote.toggled', $quote);

        return back()->with('success', 'Quote status updated.');
    }
}
