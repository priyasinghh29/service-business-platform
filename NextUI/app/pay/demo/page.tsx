"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/lib/api-client";
import { formatMoney, getApiErrorMessage } from "@/lib/api-helpers";

function DemoPayInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const paymentId = searchParams.get("payment_id");
  const bookingId = searchParams.get("booking_id");
  const amount = Number(searchParams.get("amount") ?? 0);
  const currency = (searchParams.get("currency") ?? "INR").toUpperCase();
  const ref = searchParams.get("ref") ?? (paymentId ? `PAY-${paymentId}` : "DEMO");

  const [cardName, setCardName] = useState("Priya Singh");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvv, setCvv] = useState("123");
  const [busy, setBusy] = useState<"pay" | "fail" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const masked = useMemo(() => {
    const digits = cardNumber.replace(/\D/g, "");
    if (digits.length < 4) return "•••• •••• •••• ••••";
    return `•••• •••• •••• ${digits.slice(-4)}`;
  }, [cardNumber]);

  const formatCard = (value: string) =>
    value
      .replace(/\D/g, "")
      .slice(0, 16)
      .replace(/(\d{4})(?=\d)/g, "$1 ")
      .trim();

  const pay = async (outcome: "success" | "failed") => {
    if (!paymentId) {
      setError("Missing payment session. Restart checkout.");
      return;
    }

    // Prefer live auth state; fall back to token so we never bounce a paying client to login.
    const hasSession = Boolean(user) || Boolean(localStorage.getItem("token"));
    if (!hasSession) {
      router.replace(
        `/login?redirect=${encodeURIComponent(`/pay/demo?${searchParams.toString()}`)}`
      );
      return;
    }

    if (isLoading) {
      setError("Restoring your session… try Pay again in a moment.");
      return;
    }

    setBusy(outcome === "success" ? "pay" : "fail");
    setError(null);

    try {
      await new Promise((r) => setTimeout(r, 900));

      if (outcome === "success") {
        await apiClient.post("/payment/success", {
          payment_id: Number(paymentId),
          gateway_reference: `demo_${paymentId}_${Date.now()}`,
        });
        // Omit payment_id so the success page does not re-verify and risk a false 401 logout.
        router.replace(`/booking/success?booking_id=${bookingId ?? ""}&demo=1`);
      } else {
        await apiClient.post("/payment/failed", {
          payment_id: Number(paymentId),
          reason: "Simulated decline on demo gateway",
        });
        router.replace(`/booking/failed?booking_id=${bookingId ?? ""}&demo=1`);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Demo payment failed to complete."));
      setBusy(null);
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void pay("success");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b1220] text-slate-300">
        Loading secure checkout…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,#1e293b_0%,#0b1220_55%)] px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
              Oknitech Pay
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Demo Gateway</h1>
          </div>
          <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-200">
            Sandbox
          </span>
        </div>

        <div className="mb-4 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-slate-400">Amount due</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">
                {currency === "INR" || currency === "USD"
                  ? formatMoney(amount)
                  : `${currency} ${amount.toFixed(2)}`}
              </p>
            </div>
            <div className="text-right text-xs text-slate-400">
              <p>Reference</p>
              <p className="mt-1 font-mono text-slate-200">{ref}</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            This is a dummy gateway for demos. No real charge is made.
          </p>
        </div>

        <div className="mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-950 p-5 shadow-xl ring-1 ring-white/10">
          <p className="text-xs uppercase tracking-widest text-slate-300">Virtual card</p>
          <p className="mt-6 font-mono text-lg tracking-widest text-white">{masked}</p>
          <div className="mt-6 flex justify-between text-sm">
            <div>
              <p className="text-[10px] uppercase text-slate-400">Cardholder</p>
              <p className="mt-0.5 text-slate-100">{cardName || "YOUR NAME"}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase text-slate-400">Expires</p>
              <p className="mt-0.5 text-slate-100">{expiry || "MM/YY"}</p>
            </div>
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/70 p-5 shadow-2xl backdrop-blur"
        >
          {error && (
            <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">Name on card</label>
            <input
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none ring-emerald-400/40 focus:ring-2"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-300">Card number</label>
            <input
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCard(e.target.value))}
              inputMode="numeric"
              autoComplete="cc-number"
              className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 font-mono text-sm text-white outline-none ring-emerald-400/40 focus:ring-2"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">Expiry</label>
              <input
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                placeholder="MM/YY"
                className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none ring-emerald-400/40 focus:ring-2"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-300">CVV</label>
              <input
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                inputMode="numeric"
                className="w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2.5 text-sm text-white outline-none ring-emerald-400/40 focus:ring-2"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy !== null}
            className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-60"
          >
            {busy === "pay" ? "Processing payment…" : "Pay securely"}
          </button>

          <button
            type="button"
            disabled={busy !== null}
            onClick={() => void pay("failed")}
            className="w-full rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/5 disabled:opacity-60"
          >
            {busy === "fail" ? "Declining…" : "Simulate payment failure"}
          </button>

          <Link
            href={
              bookingId
                ? `/checkout?booking_id=${bookingId}`
                : "/my-bookings"
            }
            className="block text-center text-xs text-slate-400 hover:text-slate-200"
          >
            Cancel and return
          </Link>
        </form>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-slate-500">
          Secured demo checkout · Test card 4242… · For manager walkthroughs only
        </p>
      </div>
    </div>
  );
}

export default function DemoPayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0b1220] text-slate-300">
          Loading gateway…
        </div>
      }
    >
      <DemoPayInner />
    </Suspense>
  );
}
