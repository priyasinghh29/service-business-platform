"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api-client";
import { formatMoney, getApiErrorMessage, unwrapData } from "@/lib/api-helpers";

interface BookingDetail {
  id: number;
  booking_number?: string;
  booking_date?: string;
  booking_time?: string;
  package_name?: string | null;
  subtotal?: number | string;
  discount?: number | string;
  tax?: number | string;
  total?: number | string;
  payment_status?: string;
  status?: string;
  service?: { id: number; name: string; slug?: string; price?: number | string };
}

const GATEWAYS = [
  {
    id: "manual",
    label: "Demo Gateway",
    blurb: "Sandbox checkout for demos — no real charge",
    badge: "Ready",
    enabled: true,
  },
  {
    id: "stripe",
    label: "Stripe",
    blurb: "Cards & wallets (live keys required)",
    badge: "Keys needed",
    enabled: false,
  },
  {
    id: "razorpay",
    label: "Razorpay",
    blurb: "UPI, cards, netbanking (live keys required)",
    badge: "Keys needed",
    enabled: false,
  },
  {
    id: "paypal",
    label: "PayPal",
    blurb: "PayPal wallet (live keys required)",
    badge: "Keys needed",
    enabled: false,
  },
] as const;

function CheckoutInner() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [gateway, setGateway] = useState<(typeof GATEWAYS)[number]["id"]>("manual");

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(`/checkout?booking_id=${bookingId ?? ""}`)}`);
    }
  }, [authLoading, user, router, bookingId]);

  useEffect(() => {
    if (!bookingId || !user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/bookings/${bookingId}`);
        const data = unwrapData<BookingDetail>(res.data);
        if (!cancelled) {
          setBooking(data);
          if (data.payment_status === "paid") {
            router.replace(`/booking/success?booking_id=${data.id}`);
          }
        }
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, "Booking not found."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookingId, user, router]);

  const pay = async () => {
    if (!booking) return;
    const selected = GATEWAYS.find((g) => g.id === gateway);
    if (!selected?.enabled) {
      setError("That gateway needs API keys. Use Demo Gateway for this walkthrough.");
      return;
    }

    setPaying(true);
    setError(null);
    try {
      const origin = window.location.origin;
      const res = await apiClient.post("/payment/checkout", {
        booking_id: booking.id,
        gateway: "manual",
        success_url: `${origin}/booking/success`,
        cancel_url: `${origin}/booking/failed`,
      });
      const data = unwrapData<{
        payment: { id: number; amount?: number | string; currency?: string };
        checkout: { checkout_url?: string };
      }>(res.data);

      // Stay in the SPA so AuthProvider does not remount and look "logged out".
      const params = new URLSearchParams({
        payment_id: String(data.payment.id),
        booking_id: String(booking.id),
        amount: String(data.payment.amount ?? booking.total ?? 0),
        currency: String(data.payment.currency ?? "INR"),
        ref: booking.booking_number ?? `PAY-${data.payment.id}`,
      });
      router.push(`/pay/demo?${params.toString()}`);
    } catch (err) {
      setError(getApiErrorMessage(err, "Checkout failed."));
      setPaying(false);
    }
  };

  return (
    <MarketingLayout>
      <section className="py-xxl">
        <div className="mx-auto max-w-lg px-margin-mobile md:px-margin-desktop">
          <p className="mb-2 text-label-sm font-semibold uppercase tracking-wide text-primary">
            Secure checkout
          </p>
          <h1 className="mb-2 font-display text-headline-lg text-on-surface">Checkout</h1>
          <p className="mb-8 text-body-md text-on-surface-variant">
            Confirm payment to finalize your booking.
          </p>

          {loading || authLoading ? (
            <p className="text-body-md text-on-surface-variant">Loading…</p>
          ) : error && !booking ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-body-sm text-rose-700">
              {error}
            </div>
          ) : booking ? (
            <div className="space-y-5 rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-xl shadow-sm">
              {error && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-body-sm text-rose-700">
                  {error}
                </div>
              )}

              <div>
                <p className="text-label-sm text-on-surface-variant">Service</p>
                <p className="text-body-lg font-medium text-on-surface">
                  {booking.service?.name ?? "Service"}
                </p>
                {booking.package_name && (
                  <p className="text-label-sm text-on-surface-variant">{booking.package_name} package</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-body-sm">
                <div>
                  <p className="text-on-surface-variant">Date</p>
                  <p className="text-on-surface">{booking.booking_date}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant">Time</p>
                  <p className="text-on-surface">{booking.booking_time}</p>
                </div>
                <div>
                  <p className="text-on-surface-variant">Booking #</p>
                  <p className="text-on-surface">{booking.booking_number ?? booking.id}</p>
                </div>
              </div>

              <div className="space-y-1 border-t border-outline-variant/40 pt-4 text-body-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatMoney(booking.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>−{formatMoney(booking.discount)}</span>
                </div>
                <div className="flex justify-between font-semibold text-on-surface">
                  <span>Total due</span>
                  <span>{formatMoney(booking.total)}</span>
                </div>
              </div>

              <div>
                <p className="mb-2 text-label-md font-medium text-on-surface">Payment method</p>
                <div className="space-y-2">
                  {GATEWAYS.map((g) => (
                    <label
                      key={g.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3.5 py-3 ${
                        gateway === g.id
                          ? "border-primary bg-primary/5"
                          : "border-outline-variant/50"
                      } ${!g.enabled ? "opacity-60" : ""}`}
                    >
                      <input
                        type="radio"
                        name="gateway"
                        className="mt-1"
                        checked={gateway === g.id}
                        disabled={!g.enabled}
                        onChange={() => setGateway(g.id)}
                      />
                      <span className="flex-1">
                        <span className="flex items-center gap-2">
                          <span className="font-medium text-on-surface">{g.label}</span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                              g.enabled
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-surface-container-high text-on-surface-variant"
                            }`}
                          >
                            {g.badge}
                          </span>
                        </span>
                        <span className="mt-0.5 block text-label-sm text-on-surface-variant">
                          {g.blurb}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={pay}
                disabled={paying}
                className="w-full rounded-lg bg-primary-container px-lg py-sm font-medium text-label-md text-on-primary hover:opacity-90 disabled:opacity-50"
              >
                {paying ? "Opening gateway…" : "Continue to payment"}
              </button>
              <Link
                href="/my-bookings"
                className="block text-center text-label-md text-primary hover:underline"
              >
                Pay later
              </Link>
            </div>
          ) : null}
        </div>
      </section>
    </MarketingLayout>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <MarketingLayout>
          <div className="p-10">Loading checkout…</div>
        </MarketingLayout>
      }
    >
      <CheckoutInner />
    </Suspense>
  );
}
