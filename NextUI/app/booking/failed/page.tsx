"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api-client";

function FailedInner() {
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("payment_id");
  const bookingId = searchParams.get("booking_id");
  const { user } = useAuth();
  const [noted, setNoted] = useState(false);

  useEffect(() => {
    if (!user || !paymentId || noted) return;
    apiClient
      .post("/payment/failed", { payment_id: Number(paymentId), reason: "User cancelled or payment failed" })
      .finally(() => setNoted(true));
  }, [user, paymentId, noted]);

  return (
    <MarketingLayout>
      <section className="py-xxl">
        <div className="mx-auto max-w-lg px-margin-mobile text-center md:px-margin-desktop">
          <h1 className="mb-sm font-display text-headline-lg text-on-surface">Payment failed</h1>
          <p className="mb-xl text-body-md text-on-surface-variant">
            Your payment was not completed. You can retry checkout or keep the unpaid booking in My Services.
          </p>
          <div className="flex flex-wrap justify-center gap-md">
            {bookingId && (
              <Link
                href={`/checkout?booking_id=${bookingId}`}
                className="rounded-lg bg-primary-container px-lg py-sm font-medium text-label-md text-on-primary hover:opacity-90"
              >
                Retry checkout
              </Link>
            )}
            <Link
              href="/my-services"
              className="rounded-lg border border-outline-variant px-lg py-sm font-medium text-label-md text-on-surface hover:bg-surface-container-low"
            >
              My Services
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

export default function BookingFailedPage() {
  return (
    <Suspense fallback={<MarketingLayout><div className="p-10">Loading…</div></MarketingLayout>}>
      <FailedInner />
    </Suspense>
  );
}
