"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { formatMoney, getApiErrorMessage, unwrapData } from "@/lib/api-helpers";
import StatusBadge from "@/components/portal/StatusBadge";

interface BookingRow {
  id: number;
  booking_number: string;
  booking_date?: string;
  booking_time?: string;
  package_name?: string | null;
  status: string;
  payment_status: string;
  total: number | string;
  service?: { id: number; name: string; slug: string } | null;
  provider?: { user?: { first_name?: string; last_name?: string } | null } | null;
}

interface PaginatedBookings {
  data: BookingRow[];
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ per_page: "30" });
      if (status !== "all") params.set("status", status);
      const res = await apiClient.get(`/bookings?${params.toString()}`);
      const page = unwrapData<PaginatedBookings | BookingRow[]>(res.data);
      const list = Array.isArray(page) ? page : Array.isArray(page?.data) ? page.data : [];
      setBookings(list);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load bookings"));
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-headline-lg text-on-surface">My Bookings</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Booking history, status, and invoices.
          </p>
        </div>
        <Link
          href="/services"
          className="rounded-lg bg-primary-container px-4 py-2 text-label-md font-medium text-on-primary hover:opacity-90"
        >
          Book a service
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {["all", "pending", "confirmed", "rescheduled", "completed", "cancelled"].map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`rounded-lg px-3 py-1.5 text-label-md capitalize ${
              status === s
                ? "bg-primary-fixed text-primary font-medium"
                : "text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-body-md text-on-surface-variant">Loading bookings…</p>
      ) : error ? (
        <p className="text-body-md text-rose-700">{error}</p>
      ) : bookings.length === 0 ? (
        <div className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-8 text-center">
          <p className="text-body-md text-on-surface-variant">No bookings yet.</p>
          <Link href="/services" className="mt-3 inline-block text-primary hover:underline">
            Browse services
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest">
          <table className="w-full text-left text-body-sm">
            <thead className="border-b border-outline-variant/30 bg-surface-container-low text-label-sm text-on-surface-variant">
              <tr>
                <th className="px-4 py-3 font-medium">Booking</th>
                <th className="px-4 py-3 font-medium">Service</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-outline-variant/20 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-on-surface">{booking.booking_number}</p>
                    {booking.package_name && (
                      <p className="text-label-sm text-on-surface-variant">{booking.package_name}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-on-surface">{booking.service?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-on-surface-variant">
                    {booking.booking_date
                      ? String(booking.booking_date).slice(0, 10)
                      : "—"}
                    {booking.booking_time ? ` · ${String(booking.booking_time).slice(0, 5)}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge label={booking.status} />
                  </td>
                  <td className="px-4 py-3 font-medium text-on-surface">
                    {formatMoney(booking.total)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/my-bookings/${booking.id}`}
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      Details 
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
