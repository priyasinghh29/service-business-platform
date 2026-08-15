<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\BookingMessage;
use App\Models\Service;
use App\Models\ServiceProvider;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class BookingController extends Controller
{
    private const STATUSES = ['pending', 'confirmed', 'rescheduled', 'completed', 'cancelled'];

    public function index(Request $request): View
    {
        $query = Booking::query()->with(['user', 'service', 'provider.user'])->latest();

        if ($request->filled('q')) {
            $q = $request->string('q');
            $query->where(function ($builder) use ($q) {
                $builder->where('booking_number', 'like', "%{$q}%")
                    ->orWhereHas('user', fn ($u) => $u->where('email_id', 'like', "%{$q}%")->orWhere('first_name', 'like', "%{$q}%"));
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->string('payment_status'));
        }

        $bookings = $query->paginate(15)->withQueryString();

        return view('admin.bookings.index', compact('bookings'));
    }

    public function create(): View
    {
        return view('admin.bookings.create', [
            'customers' => User::query()->where('role', 'customer')->orderBy('first_name')->get(['id', 'first_name', 'last_name', 'email_id']),
            'services' => Service::query()->orderBy('name')->get(['id', 'name', 'price']),
            'providers' => ServiceProvider::query()->with('user')->active()->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validatedBooking($request);
        $service = Service::findOrFail($validated['service_id']);
        $validated['duration_minutes'] = $service->duration_minutes;
        $validated['discount'] = $validated['discount'] ?? 0;
        $validated['tax'] = $validated['tax'] ?? 0;

        $booking = Booking::create($validated);
        AuditLogger::log('booking.created', $booking, null, $booking->toArray());

        return redirect()->route('admin.bookings.show', $booking)->with('success', 'Booking created successfully.');
    }

    public function show(Booking $booking): View
    {
        $booking->load(['user', 'service', 'provider.user', 'invoice', 'messages' => fn ($q) => $q->latest()]);

        return view('admin.bookings.show', [
            'booking' => $booking,
            'statuses' => self::STATUSES,
        ]);
    }

    public function edit(Booking $booking): View
    {
        return view('admin.bookings.edit', [
            'booking' => $booking,
            'customers' => User::query()->where('role', 'customer')->orderBy('first_name')->get(['id', 'first_name', 'last_name', 'email_id']),
            'services' => Service::query()->orderBy('name')->get(['id', 'name', 'price']),
            'providers' => ServiceProvider::query()->with('user')->get(),
        ]);
    }

    public function update(Request $request, Booking $booking): RedirectResponse
    {
        $validated = $this->validatedBooking($request);
        $old = $booking->toArray();
        $validated['discount'] = $validated['discount'] ?? 0;
        $validated['tax'] = $validated['tax'] ?? 0;
        $booking->update($validated);
        AuditLogger::log('booking.updated', $booking, $old, $booking->fresh()->toArray());

        return redirect()->route('admin.bookings.show', $booking)->with('success', 'Booking updated successfully.');
    }

    public function destroy(Booking $booking): RedirectResponse
    {
        AuditLogger::log('booking.deleted', $booking, $booking->toArray());
        $booking->delete();

        return redirect()->route('admin.bookings.index')->with('success', 'Booking deleted successfully.');
    }

    public function toggleStatus(Booking $booking): RedirectResponse
    {
        $flow = self::STATUSES;
        $idx = array_search($booking->status, $flow, true);
        $next = $flow[(($idx === false ? 0 : $idx) + 1) % count($flow)];
        $booking->update([
            'status' => $next,
            'cancelled_at' => $next === 'cancelled' ? now() : null,
        ]);
        AuditLogger::log('booking.toggled', $booking);

        return back()->with('success', "Booking status set to {$next}.");
    }

    public function updateStatus(Request $request, Booking $booking): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:'.implode(',', self::STATUSES)],
            'payment_status' => ['nullable', 'in:unpaid,paid,failed,refunded'],
            'admin_notes' => ['nullable', 'string'],
        ]);

        $data = [
            'status' => $validated['status'],
            'cancelled_at' => $validated['status'] === 'cancelled' ? ($booking->cancelled_at ?? now()) : null,
        ];
        if (array_key_exists('payment_status', $validated) && $validated['payment_status']) {
            $data['payment_status'] = $validated['payment_status'];
        }
        if (array_key_exists('admin_notes', $validated)) {
            $data['admin_notes'] = $validated['admin_notes'];
        }

        $booking->update($data);
        AuditLogger::log('booking.status_updated', $booking);

        return back()->with('success', 'Booking status updated.');
    }

    public function reply(Request $request, Booking $booking): RedirectResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
        ]);

        BookingMessage::create([
            'booking_id' => $booking->id,
            'user_id' => null,
            'author_name' => auth('admin')->user()?->full_name ?: 'Admin',
            'role' => 'admin',
            'message' => $validated['message'],
        ]);

        return back()->with('success', 'Message posted to service workspace.');
    }

    private function validatedBooking(Request $request): array
    {
        return $request->validate([
            'user_id' => ['required', 'exists:users,id'],
            'service_id' => ['required', 'exists:services,id'],
            'provider_id' => ['nullable', 'exists:service_providers,id'],
            'booking_date' => ['required', 'date'],
            'booking_time' => ['required'],
            'package_name' => ['nullable', 'string', 'max:255'],
            'subtotal' => ['required', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'tax' => ['nullable', 'numeric', 'min:0'],
            'total' => ['required', 'numeric', 'min:0'],
            'status' => ['required', 'in:'.implode(',', self::STATUSES)],
            'payment_status' => ['required', 'in:unpaid,paid,failed,refunded'],
            'customer_notes' => ['nullable', 'string'],
            'admin_notes' => ['nullable', 'string'],
            'address' => ['nullable', 'string'],
        ]);
    }
}
