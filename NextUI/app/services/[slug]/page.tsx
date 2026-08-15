"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import FaqAccordion from "@/components/marketing/FaqAccordion";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api-client";
import { fetchPublicApi, formatMoney, getApiErrorMessage } from "@/lib/api-helpers";
import type { CatalogReview, CatalogService } from "@/lib/catalog-types";

function serviceFaqs(service: CatalogService) {
  const name = service.name;
  return [
    {
      question: `What is included in ${name}?`,
      answer:
        service.short_description ||
        service.description ||
        `Our specialists deliver ${name} end-to-end, with clear milestones and portal updates.`,
    },
    {
      question: "How do I book and pay?",
      answer:
        "Choose a date, package, and provider, then complete checkout. You’ll track status, documents, and invoices in the client portal.",
    },
    {
      question: "Can I reschedule or cancel?",
      answer:
        "Yes. Open the booking in My Bookings or My Services to reschedule or cancel before work is completed, subject to the service policy.",
    },
    {
      question: "How long does delivery take?",
      answer: service.duration_minutes
        ? `Typical sessions run about ${service.duration_minutes} minutes. Full engagement timelines are confirmed after booking.`
        : "Timelines depend on the package and document readiness. Your relationship manager confirms the schedule after booking.",
    },
  ];
}

interface Paginated<T> {
  data: T[];
}

export default function ServiceDetailPage() {
  const params = useParams();
  const slug = String(params.slug ?? "");
  const { user } = useAuth();
  const [service, setService] = useState<CatalogService | null>(null);
  const [reviews, setReviews] = useState<CatalogReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [reviewMsg, setReviewMsg] = useState<string | null>(null);
  const [reviewErr, setReviewErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const data = await fetchPublicApi<CatalogService>(`/services/${slug}`);
      if (cancelled) return;
      setService(data);
      if (data?.id) {
        const reviewPage = await fetchPublicApi<Paginated<CatalogReview> | CatalogReview[]>(
          `/services/${data.id}/reviews`
        );
        if (!cancelled) {
          const list = Array.isArray(reviewPage)
            ? reviewPage
            : Array.isArray(reviewPage?.data)
              ? reviewPage.data
              : [];
          setReviews(list);
        }
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const submitReview = async (e: FormEvent) => {
    e.preventDefault();
    if (!service) return;
    setSubmitting(true);
    setReviewMsg(null);
    setReviewErr(null);
    try {
      await apiClient.post(`/services/${service.id}/reviews`, {
        rating,
        title: title || undefined,
        comment: comment || undefined,
      });
      setReviewMsg("Review submitted for approval. Thank you!");
      setTitle("");
      setComment("");
    } catch (err) {
      setReviewErr(getApiErrorMessage(err, "Unable to submit review."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MarketingLayout>
        <div className="mx-auto max-w-4xl px-margin-mobile py-xxl text-on-surface-variant">Loading service…</div>
      </MarketingLayout>
    );
  }

  if (!service) {
    return (
      <MarketingLayout>
        <div className="mx-auto max-w-4xl px-margin-mobile py-xxl">
          <h1 className="font-display text-headline-md">Service not found</h1>
          <Link href="/services" className="mt-4 inline-block text-primary hover:underline">
            Back to services
          </Link>
        </div>
      </MarketingLayout>
    );
  }

  return (
    <MarketingLayout>
      <div className="border-b border-outline-variant/30 bg-surface-container-lowest">
        <div className="mx-auto max-w-7xl px-margin-mobile py-md md:px-margin-desktop">
          <nav className="flex items-center gap-xs text-body-sm text-on-surface-variant">
            <Link href="/" className="hover:text-primary">
              Home
            </Link>
            <span>/</span>
            <Link href="/services" className="hover:text-primary">
              Services
            </Link>
            <span>/</span>
            <span className="font-medium text-on-surface">{service.name}</span>
          </nav>
        </div>
      </div>

      <section className="bg-gradient-to-b from-surface-container-low to-background py-xxl">
        <div className="mx-auto grid max-w-7xl gap-xxl px-margin-mobile md:px-margin-desktop lg:grid-cols-2">
          <div>
            {service.category?.name && (
              <span className="mb-lg inline-block rounded-lg bg-primary/10 px-md py-xs text-label-sm font-bold uppercase tracking-wide text-primary">
                {service.category.name}
              </span>
            )}
            <h1 className="mb-lg font-display text-[2rem] font-bold tracking-tight text-on-surface md:text-headline-lg">
              {service.name}
            </h1>
            <p className="mb-xl max-w-lg text-body-lg text-on-surface-variant">
              {service.short_description || service.description}
            </p>
            <div className="flex flex-wrap gap-md">
              <Link
                href={`/book/${service.slug}`}
                className="rounded-lg bg-primary-container px-lg py-sm font-medium text-label-md text-on-primary hover:opacity-90"
              >
                Book now
              </Link>
              <Link
                href="/book-consultation"
                className="rounded-lg border border-outline-variant bg-surface-container-lowest px-lg py-sm font-medium text-label-md text-on-surface hover:bg-surface-container-low"
              >
                Book consultation
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-xl shadow-sm">
            <div className="grid grid-cols-2 gap-lg text-center">
              <div>
                
                <div className="font-display text-headline-md text-on-surface">{formatMoney(service.price)}</div>
                <div className="text-label-sm text-on-surface-variant">Starting price</div>
              </div>
              <div>
                
                <div className="font-display text-headline-md text-on-surface">
                  {service.duration_minutes ?? "—"} min
                </div>
                <div className="text-label-sm text-on-surface-variant">Typical duration</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {service.description && (
        <section className="pb-xxl">
          <div className="mx-auto max-w-3xl px-margin-mobile md:px-margin-desktop">
            <h2 className="mb-lg font-display text-headline-md text-on-surface">About this service</h2>
            <div className="whitespace-pre-wrap text-body-md text-on-surface-variant">{service.description}</div>
          </div>
        </section>
      )}

      <section className="pb-xxl">
        <div className="mx-auto max-w-3xl px-margin-mobile md:px-margin-desktop">
          <h2 className="mb-xl font-display text-headline-md text-on-surface">Frequently asked questions</h2>
          <FaqAccordion items={serviceFaqs(service)} />
        </div>
      </section>

      <section className="bg-surface-container-low py-xxl">
        <div className="mx-auto max-w-3xl px-margin-mobile md:px-margin-desktop">
          <h2 className="mb-xl font-display text-headline-md text-on-surface">Reviews</h2>
          {reviews.length === 0 ? (
            <p className="mb-xl text-body-md text-on-surface-variant">No approved reviews yet.</p>
          ) : (
            <ul className="mb-xl space-y-md">
              {reviews.map((review) => (
                <li
                  key={review.id}
                  className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-lg"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="font-medium text-on-surface">
                      {review.user
                        ? `${review.user.first_name ?? ""} ${review.user.last_name ?? ""}`.trim() || "Client"
                        : "Client"}
                    </p>
                    <span className="text-label-sm text-primary">{review.rating}/5</span>
                  </div>
                  {review.title && <p className="text-body-sm font-medium text-on-surface">{review.title}</p>}
                  {review.comment && <p className="mt-1 text-body-sm text-on-surface-variant">{review.comment}</p>}
                </li>
              ))}
            </ul>
          )}

          {user ? (
            <form onSubmit={submitReview} className="space-y-md rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-xl">
              <h3 className="font-display text-headline-sm text-on-surface">Leave a review</h3>
              {reviewMsg && <p className="text-body-sm text-emerald-700">{reviewMsg}</p>}
              {reviewErr && <p className="text-body-sm text-rose-700">{reviewErr}</p>}
              <div>
                <label className="mb-1.5 block text-label-md text-on-surface-variant">Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full rounded-lg border border-outline-variant/50 px-3.5 py-2.5 text-body-sm"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} stars
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-label-md text-on-surface-variant">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant/50 px-3.5 py-2.5 text-body-sm"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-label-md text-on-surface-variant">Comment</label>
                <textarea
                  rows={3}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-lg border border-outline-variant/50 px-3.5 py-2.5 text-body-sm"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-primary-container px-lg py-sm text-label-md font-medium text-on-primary disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Submit review"}
              </button>
            </form>
          ) : (
            <p className="text-body-sm text-on-surface-variant">
              <Link href={`/login?redirect=/services/${slug}`} className="text-primary hover:underline">
                Sign in
              </Link>{" "}
              to leave a review.
            </p>
          )}
        </div>
      </section>
    </MarketingLayout>
  );
}
