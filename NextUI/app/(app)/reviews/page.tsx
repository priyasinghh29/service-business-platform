"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { getApiErrorMessage, unwrapData } from "@/lib/api-helpers";
import StatusBadge from "@/components/portal/StatusBadge";

interface ReviewRow {
  id: number;
  rating: number;
  title?: string | null;
  comment?: string | null;
  is_approved?: boolean;
  service?: { id: number; name: string; slug: string } | null;
  booking?: { id: number; booking_number: string } | null;
}

interface ReviewableBooking {
  id: number;
  booking_number: string;
  service?: { id: number; name: string; slug: string } | null;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [reviewable, setReviewable] = useState<ReviewableBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/reviews/mine");
      const data = unwrapData<{ reviews: ReviewRow[]; reviewable_bookings: ReviewableBooking[] }>(
        res.data
      );
      setReviews(data.reviews ?? []);
      setReviewable(data.reviewable_bookings ?? []);
      if (!bookingId && data.reviewable_bookings?.[0]) {
        setBookingId(String(data.reviewable_bookings[0].id));
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load reviews"));
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const selected = reviewable.find((b) => String(b.id) === bookingId);
    if (!selected?.service?.id) {
      setMsg("Select a completed booking to review.");
      return;
    }
    setSubmitting(true);
    setMsg(null);
    try {
      await apiClient.post(`/services/${selected.service.id}/reviews`, {
        rating,
        title: title || undefined,
        comment: comment || undefined,
        booking_id: selected.id,
      });
      setMsg("Review submitted for approval. Thank you!");
      setTitle("");
      setComment("");
      await load();
    } catch (err) {
      setMsg(getApiErrorMessage(err, "Unable to submit review"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-headline-lg text-on-surface">Reviews</h1>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Rate completed services and track review status.
        </p>
      </div>

      {loading ? (
        <p className="text-body-md text-on-surface-variant">Loading…</p>
      ) : error ? (
        <p className="text-body-md text-rose-700">{error}</p>
      ) : (
        <>
          <section className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-6">
            <h2 className="mb-4 font-display text-headline-sm text-on-surface">Leave a review</h2>
            {reviewable.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">
                No completed bookings awaiting a review.{" "}
                <Link href="/my-bookings" className="text-primary hover:underline">
                  View bookings
                </Link>
              </p>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                {msg && <p className="text-body-sm text-on-surface-variant">{msg}</p>}
                <div>
                  <label className="mb-1.5 block text-label-md text-on-surface-variant">
                    Completed booking
                  </label>
                  <select
                    value={bookingId}
                    onChange={(e) => setBookingId(e.target.value)}
                    className="w-full rounded-lg border border-outline-variant/50 px-3.5 py-2.5 text-body-sm"
                  >
                    {reviewable.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.booking_number} — {b.service?.name ?? "Service"}
                      </option>
                    ))}
                  </select>
                </div>
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
                  className="rounded-lg bg-primary-container px-4 py-2 text-label-md font-medium text-on-primary disabled:opacity-50"
                >
                  {submitting ? "Submitting…" : "Submit review"}
                </button>
              </form>
            )}
          </section>

          <section>
            <h2 className="mb-4 font-display text-headline-sm text-on-surface">Your reviews</h2>
            {reviews.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">You haven’t submitted any reviews yet.</p>
            ) : (
              <ul className="space-y-3">
                {reviews.map((review) => (
                  <li
                    key={review.id}
                    className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-5"
                  >
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium text-on-surface">
                        {review.service?.name ?? "Service"} · {review.rating}/5
                      </p>
                      <StatusBadge label={review.is_approved ? "approved" : "pending review"} />
                    </div>
                    {review.title && <p className="text-body-sm font-medium">{review.title}</p>}
                    {review.comment && (
                      <p className="mt-1 text-body-sm text-on-surface-variant">{review.comment}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
