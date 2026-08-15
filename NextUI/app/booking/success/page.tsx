"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api-client";
import { getApiErrorMessage } from "@/lib/api-helpers";

function SuccessInner() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const bookingId = searchParams.get("booking_id");
  const { user } = useAuth();
  const [status, setStatus] = useState<"pending" | "ok" | "error">("pending");
  const [message, setMessage] = useState("Confirming your booking…");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!user) {
        setStatus("ok");
        setMessage("Booking confirmed. Sign in to view it in your portal.");
        return;
      }
      if (paymentId) {
        try {
          await apiClient.post("/payment/success", { payment_id: Number(paymentId) });
          if (!cancelled) {
            setStatus("ok");
            setMessage("Payment received. Your booking is confirmed.");
          }
          return;
        } catch (err) {
          if (!cancelled) {
            setStatus("error");
            setMessage(getApiErrorMessage(err, "Could not verify payment."));
          }
          return;
        }
      }
      if (!cancelled) {
        setStatus("ok");
        setMessage(
          bookingId
            ? "Your booking is confirmed. You can track progress in My Services."
            : "You're all set."
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, paymentId, bookingId]);

  return (
    <MarketingLayout>
      <section className="py-xxl">
        <div className="mx-auto max-w-lg px-margin-mobile text-center md:px-margin-desktop">
          <h1 className="mb-sm font-display text-headline-lg text-on-surface">
            {status === "error" ? "Payment issue" : "Booking successful"}
          </h1>
          <p className="mb-xl text-body-md text-on-surface-variant">{message}</p>
          <div className="flex flex-wrap justify-center gap-md">
            <Link
              href={bookingId ? `/my-services/${bookingId}` : "/my-services"}
              className="rounded-lg bg-primary-container px-lg py-sm font-medium text-label-md text-on-primary hover:opacity-90"
            >
              View My Services
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg border border-outline-variant px-lg py-sm font-medium text-label-md text-on-surface hover:bg-surface-container-low"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={<MarketingLayout><div className="p-10">Loading…</div></MarketingLayout>}>
      <SuccessInner />
    </Suspense>
  );
}
