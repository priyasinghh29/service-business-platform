"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api-client";
import {
  fetchPublicApi,
  formatMoney,
  getApiErrorMessage,
  tomorrowIsoDate,
  unwrapData,
} from "@/lib/api-helpers";
import type { CatalogService } from "@/lib/catalog-types";

const PACKAGES = [
  { name: "Standard", multiplier: 1, blurb: "Standard delivery timeline" },
  { name: "Priority", multiplier: 1.25, blurb: "Faster turnaround (+25%)" },
  { name: "Premium", multiplier: 1.5, blurb: "Dedicated priority desk (+50%)" },
] as const;

interface ProviderOption {
  id: number;
  business_name?: string | null;
  specialization?: string | null;
  rating_avg?: number | string | null;
  user?: { first_name?: string; last_name?: string } | null;
}

interface PaginatedProviders {
  data: ProviderOption[];
}

export default function BookServicePage() {
  const params = useParams();
  const slug = String(params.slug ?? "");
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [service, setService] = useState<CatalogService | null>(null);
  const [providers, setProviders] = useState<ProviderOption[]>([]);
  const [providerId, setProviderId] = useState("");
  const [packageName, setPackageName] = useState<(typeof PACKAGES)[number]["name"]>("Standard");
  const [bookingDate, setBookingDate] = useState(tomorrowIsoDate());
  const [bookingTime, setBookingTime] = useState("10:00");
  const [couponCode, setCouponCode] = useState("");
  const [discountPreview, setDiscountPreview] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [data, providerPage] = await Promise.all([
        fetchPublicApi<CatalogService>(`/services/${slug}`),
        fetchPublicApi<PaginatedProviders | ProviderOption[]>("/providers?per_page=50"),
      ]);
      if (!cancelled) {
        setService(data);
        const list = Array.isArray(providerPage)
          ? providerPage
          : Array.isArray(providerPage?.data)
            ? providerPage.data
            : [];
        setProviders(list);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(`/book/${slug}`)}`);
    }
  }, [authLoading, user, router, slug]);

  const selectedPackage = useMemo(
    () => PACKAGES.find((p) => p.name === packageName) ?? PACKAGES[0],
    [packageName]
  );

  const packagePrice = useMemo(() => {
    if (!service) return 0;
    return Math.round(Number(service.price) * selectedPackage.multiplier * 100) / 100;
  }, [service, selectedPackage]);

  useEffect(() => {
    setDiscountPreview(null);
    setCouponMsg(null);
  }, [packageName]);

  const validateCoupon = async () => {
    if (!service || !couponCode.trim()) return;
    setCouponMsg(null);
    try {
      const res = await apiClient.post("/coupons/validate", {
        code: couponCode.trim(),
        amount: packagePrice,
      });
      const data = unwrapData<{ discount: number | null }>(res.data);
      setDiscountPreview(data.discount);
      setCouponMsg(data.discount != null ? `Discount: ${formatMoney(data.discount)}` : "Coupon valid");
    } catch (err) {
      setDiscountPreview(null);
      setCouponMsg(getApiErrorMessage(err, "Invalid coupon"));
    }
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!service) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiClient.post("/bookings", {
        service_id: service.id,
        provider_id: providerId ? Number(providerId) : undefined,
        package_name: packageName,
        booking_date: bookingDate,
        booking_time: bookingTime,
        coupon_code: couponCode.trim() || undefined,
        customer_notes: notes || undefined,
      });
      const booking = unwrapData<{ id: number; total: number | string; payment_status: string }>(
        res.data
      );
      if (booking.payment_status === "paid" || Number(booking.total) <= 0) {
        router.push(`/booking/success?booking_id=${booking.id}`);
      } else {
        router.push(`/checkout?booking_id=${booking.id}`);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to create booking."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <MarketingLayout>
        <div className="mx-auto max-w-xl px-margin-mobile py-xxl text-body-md text-on-surface-variant">
          Loading booking…
        </div>
      </MarketingLayout>
    );
  }

  if (!service) {
    return (
      <MarketingLayout>
        <div className="mx-auto max-w-xl px-margin-mobile py-xxl">
          <h1 className="font-display text-headline-md text-on-surface">Service not found</h1>
          <Link href="/services" className="mt-4 inline-block text-primary hover:underline">
            Back to services
          </Link>
        </div>
      </MarketingLayout>
    );
  }

  const estimated = Math.max(0, packagePrice - (discountPreview ?? 0));

  return (
    <MarketingLayout>
      <section className="py-xxl">
        <div className="mx-auto max-w-xl px-margin-mobile md:px-margin-desktop">
          <p className="mb-2 text-label-sm uppercase tracking-wide text-primary">Book service</p>
          <h1 className="mb-2 font-display text-headline-lg text-on-surface">{service.name}</h1>
          <p className="mb-8 text-body-md text-on-surface-variant">
            {service.short_description || service.description}
          </p>

          <form
            onSubmit={onSubmit}
            className="space-y-5 rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-xl shadow-sm"
          >
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-body-sm text-rose-700">
                {error}
              </div>
            )}

            <div>
              <label className="mb-1.5 block text-label-md font-medium text-on-surface-variant">
                Package
              </label>
              <div className="space-y-2">
                {PACKAGES.map((pkg) => (
                  <label
                    key={pkg.name}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3.5 py-3 ${
                      packageName === pkg.name
                        ? "border-primary bg-primary/5"
                        : "border-outline-variant/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="package"
                      className="mt-1"
                      checked={packageName === pkg.name}
                      onChange={() => setPackageName(pkg.name)}
                    />
                    <span className="flex-1">
                      <span className="block font-medium text-on-surface">
                        {pkg.name}{" "}
                        <span className="text-primary">
                          {formatMoney(Number(service.price) * pkg.multiplier)}
                        </span>
                      </span>
                      <span className="text-label-sm text-on-surface-variant">{pkg.blurb}</span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-label-md font-medium text-on-surface-variant">
                Provider
              </label>
              <select
                value={providerId}
                onChange={(e) => setProviderId(e.target.value)}
                className="w-full rounded-lg border border-outline-variant/50 px-3.5 py-2.5 text-body-sm outline-none focus:border-primary-container"
              >
                <option value="">Any available provider</option>
                {providers.map((provider) => {
                  const label =
                    provider.business_name ||
                    `${provider.user?.first_name ?? ""} ${provider.user?.last_name ?? ""}`.trim() ||
                    `Provider #${provider.id}`;
                  const rating =
                    provider.rating_avg != null ? ` · ${Number(provider.rating_avg).toFixed(1)}★` : "";
                  return (
                    <option key={provider.id} value={provider.id}>
                      {label}
                      {provider.specialization ? ` — ${provider.specialization}` : ""}
                      {rating}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-label-md font-medium text-on-surface-variant">
                Date
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().slice(0, 10)}
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full rounded-lg border border-outline-variant/50 px-3.5 py-2.5 text-body-sm outline-none focus:border-primary-container"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-label-md font-medium text-on-surface-variant">
                Time
              </label>
              <input
                type="time"
                required
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                className="w-full rounded-lg border border-outline-variant/50 px-3.5 py-2.5 text-body-sm outline-none focus:border-primary-container"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-label-md font-medium text-on-surface-variant">
                Coupon code
              </label>
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="WELCOME10"
                  className="w-full rounded-lg border border-outline-variant/50 px-3.5 py-2.5 text-body-sm outline-none focus:border-primary-container"
                />
                <button
                  type="button"
                  onClick={validateCoupon}
                  className="shrink-0 rounded-lg border border-outline-variant px-4 py-2 text-label-md font-medium hover:bg-surface-container-low"
                >
                  Apply
                </button>
              </div>
              {couponMsg && <p className="mt-1 text-label-sm text-on-surface-variant">{couponMsg}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-label-md font-medium text-on-surface-variant">
                Notes
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-outline-variant/50 px-3.5 py-2.5 text-body-sm outline-none focus:border-primary-container"
              />
            </div>

            <div className="rounded-lg bg-surface-container-low px-4 py-3 text-body-sm">
              <div className="flex justify-between">
                <span>
                  {packageName} package
                </span>
                <span>{formatMoney(packagePrice)}</span>
              </div>
              {discountPreview != null && discountPreview > 0 && (
                <div className="mt-1 flex justify-between text-emerald-700">
                  <span>Discount</span>
                  <span>−{formatMoney(discountPreview)}</span>
                </div>
              )}
              <div className="mt-2 flex justify-between font-semibold text-on-surface">
                <span>Estimated total</span>
                <span>{formatMoney(estimated)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-primary-container px-lg py-sm font-medium text-label-md text-on-primary hover:opacity-90 disabled:opacity-50"
            >
              {submitting
                ? "Creating booking…"
                : packagePrice <= 0
                  ? "Confirm booking"
                  : "Continue to checkout"}
            </button>
          </form>
        </div>
      </section>
    </MarketingLayout>
  );
}
