"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import {
  formatMoney,
  getApiErrorMessage,
  tomorrowIsoDate,
  unwrapData,
} from "@/lib/api-helpers";
import StatusBadge from "@/components/portal/StatusBadge";

interface BookingDetail {
  id: number;
  booking_number: string;
  booking_date?: string;
  booking_time?: string;
  package_name?: string | null;
  status: string;
  payment_status: string;
  subtotal?: number | string;
  discount?: number | string;
  total: number | string;
  customer_notes?: string | null;
  service?: { id: number; name: string; slug: string } | null;
  provider?: {
    business_name?: string | null;
    user?: { first_name?: string; last_name?: string } | null;
  } | null;
  invoice?: { id: number; invoice_number?: string; status?: string } | null;
}

export default function BookingDetailsPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState(tomorrowIsoDate());
  const [rescheduleTime, setRescheduleTime] = useState("10:00");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get(`/bookings/${id}`);
      setBooking(unwrapData<BookingDetail>(res.data));
    } catch (err) {
      setError(getApiErrorMessage(err, "Booking not found"));
      setBooking(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const cancel = async () => {
    if (!confirm("Cancel this booking?")) return;
    setBusy(true);
    setActionMsg(null);
    try {
      await apiClient.post(`/bookings/${id}/cancel`, { reason: "Cancelled by customer" });
      setActionMsg("Booking cancelled.");
      await load();
    } catch (err) {
      setActionMsg(getApiErrorMessage(err, "Unable to cancel"));
    } finally {
      setBusy(false);
    }
  };

  const reschedule = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setActionMsg(null);
    try {
      await apiClient.post(`/bookings/${id}/reschedule`, {
        booking_date: rescheduleDate,
        booking_time: rescheduleTime,
      });
      setActionMsg("Booking rescheduled.");
      await load();
    } catch (err) {
      setActionMsg(getApiErrorMessage(err, "Unable to reschedule"));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <p className="text-body-md text-on-surface-variant">Loading booking…</p>;
  }

  if (error || !booking) {
    return (
      <div>
        <p className="text-body-md text-rose-700">{error ?? "Not found"}</p>
        <Link href="/my-bookings" className="mt-3 inline-block text-primary hover:underline">
          Back to bookings
        </Link>
      </div>
    );
  }

  const providerName =
    booking.provider?.business_name ||
    `${booking.provider?.user?.first_name ?? ""} ${booking.provider?.user?.last_name ?? ""}`.trim() ||
    "Unassigned";

  const canAct = !["cancelled", "completed"].includes(booking.status);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <button
          type="button"
          onClick={() => router.push("/my-bookings")}
          className="mb-3 text-label-md text-primary hover:underline"
        >
          ← My Bookings
        </button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-headline-lg text-on-surface">{booking.booking_number}</h1>
            <p className="mt-1 text-body-md text-on-surface-variant">
              {booking.service?.name ?? "Service"}
              {booking.package_name ? ` · ${booking.package_name}` : ""}
            </p>
          </div>
          <StatusBadge label={booking.status} />
        </div>
      </div>

      {actionMsg && (
        <p className="rounded-lg bg-surface-container-low px-4 py-3 text-body-sm text-on-surface">
          {actionMsg}
        </p>
      )}

      <div className="grid gap-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-6 sm:grid-cols-2">
        <div>
          <p className="text-label-sm text-on-surface-variant">Date & time</p>
          <p className="mt-1 font-medium text-on-surface">
            {booking.booking_date ? String(booking.booking_date).slice(0, 10) : "—"}
            {booking.booking_time ? ` · ${String(booking.booking_time).slice(0, 5)}` : ""}
          </p>
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant">Provider</p>
          <p className="mt-1 font-medium text-on-surface">{providerName}</p>
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant">Payment</p>
          <p className="mt-1 font-medium capitalize text-on-surface">{booking.payment_status}</p>
        </div>
        <div>
          <p className="text-label-sm text-on-surface-variant">Total</p>
          <p className="mt-1 font-medium text-on-surface">{formatMoney(booking.total)}</p>
        </div>
        {booking.customer_notes && (
          <div className="sm:col-span-2">
            <p className="text-label-sm text-on-surface-variant">Notes</p>
            <p className="mt-1 text-body-sm text-on-surface">{booking.customer_notes}</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/my-services/${booking.id}`}
          className="rounded-lg border border-outline-variant px-4 py-2 text-label-md font-medium hover:bg-surface-container-low"
        >
          Open engagement / chat
        </Link>
        {booking.payment_status !== "paid" && Number(booking.total) > 0 && (
          <Link
            href={`/checkout?booking_id=${booking.id}`}
            className="rounded-lg bg-primary-container px-4 py-2 text-label-md font-medium text-on-primary hover:opacity-90"
          >
            Pay now
          </Link>
        )}
        {booking.invoice && (
          <Link
            href="/invoices"
            className="rounded-lg border border-outline-variant px-4 py-2 text-label-md font-medium hover:bg-surface-container-low"
          >
            View invoice
          </Link>
        )}
      </div>

      {canAct && (
        <div className="space-y-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-6">
          <h2 className="font-display text-headline-sm text-on-surface">Manage booking</h2>
          <form onSubmit={reschedule} className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-label-sm text-on-surface-variant">New date</label>
              <input
                type="date"
                required
                min={new Date().toISOString().slice(0, 10)}
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="rounded-lg border border-outline-variant/50 px-3 py-2 text-body-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-label-sm text-on-surface-variant">New time</label>
              <input
                type="time"
                required
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
                className="rounded-lg border border-outline-variant/50 px-3 py-2 text-body-sm"
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-primary-container px-4 py-2 text-label-md font-medium text-on-primary disabled:opacity-50"
            >
              Reschedule
            </button>
          </form>
          <button
            type="button"
            disabled={busy}
            onClick={cancel}
            className="rounded-lg border border-rose-200 px-4 py-2 text-label-md font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
          >
            Cancel booking
          </button>
        </div>
      )}
    </div>
  );
}
