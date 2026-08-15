"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { apiClient } from "@/lib/api-client";
import { fetchPublicApi, getApiErrorMessage } from "@/lib/api-helpers";
import type { BrandingSettings } from "@/lib/catalog-types";
import { useAuth } from "@/context/AuthContext";

export default function ContactPage() {
  const { user } = useAuth();
  const [branding, setBranding] = useState<BrandingSettings | null>(null);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPublicApi<BrandingSettings>("/branding").then((data) => {
      if (data) setBranding(data);
    });
    if (user) {
      setForm((f) => ({
        ...f,
        name: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
        email: user.email_id ?? "",
      }));
    }
  }, [user]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus(null);
    setError(null);
    setLoading(true);

    try {
      if (!user) {
        setError("Please sign in to send a message through the portal, or email us directly.");
        return;
      }

      await apiClient.post("/support/tickets", {
        subject: form.subject || "Contact form inquiry",
        category: "General",
        priority: "Medium",
        description: `From: ${form.name} <${form.email}>\n\n${form.message}`,
      });
      setStatus("Your message was sent. Our team will reply in Support.");
      setForm((f) => ({ ...f, subject: "", message: "" }));
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to send message."));
    } finally {
      setLoading(false);
    }
  };

  const supportEmail = branding?.support_email ?? "info@oknitech.serve";
  const supportPhone = branding?.support_phone ?? "+1 (800) 555-0123";

  return (
    <MarketingLayout>
      <section className="bg-gradient-to-b from-surface-container-low to-background py-xxl">
        <div className="mx-auto grid max-w-7xl gap-xxl px-margin-mobile md:grid-cols-2 md:px-margin-desktop">
          <div>
            <span className="mb-lg inline-block rounded-lg bg-primary/10 px-md py-xs text-label-sm font-bold uppercase tracking-wide text-primary">
              Contact
            </span>
            <h1 className="mb-lg font-display text-[2rem] font-bold tracking-tight text-on-surface md:text-headline-lg">
              Talk to our team
            </h1>
            <p className="mb-xl text-body-lg text-on-surface-variant">
              Questions about compliance, tax, or legal services? Reach out and we will point you to the right specialist.
            </p>
            <ul className="space-y-md text-body-md text-on-surface-variant">
              <li className="flex items-center gap-sm">
                
                <a href={`mailto:${supportEmail}`} className="hover:text-primary">
                  {supportEmail}
                </a>
              </li>
              <li className="flex items-center gap-sm">
                
                {supportPhone}
              </li>
            </ul>
            <p className="mt-xl text-body-sm text-on-surface-variant">
              Prefer a scheduled call?{" "}
              <Link href="/book-consultation" className="font-medium text-primary hover:underline">
                Book a complimentary consultation
              </Link>
              .
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            className="rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-xl shadow-sm space-y-md"
          >
            {error && <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-body-sm text-rose-700">{error}</div>}
            {status && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-body-sm text-emerald-700">
                {status}
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-label-md font-medium text-on-surface-variant">Name</label>
              <input
                className="w-full rounded-lg border border-outline-variant/50 px-3.5 py-2.5 text-body-sm outline-none focus:border-primary-container"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-label-md font-medium text-on-surface-variant">Email</label>
              <input
                type="email"
                className="w-full rounded-lg border border-outline-variant/50 px-3.5 py-2.5 text-body-sm outline-none focus:border-primary-container"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-label-md font-medium text-on-surface-variant">Subject</label>
              <input
                className="w-full rounded-lg border border-outline-variant/50 px-3.5 py-2.5 text-body-sm outline-none focus:border-primary-container"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-label-md font-medium text-on-surface-variant">Message</label>
              <textarea
                rows={5}
                className="w-full rounded-lg border border-outline-variant/50 px-3.5 py-2.5 text-body-sm outline-none focus:border-primary-container"
                value={form.message}
                onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                required
              />
            </div>
            {!user && (
              <p className="text-label-sm text-on-surface-variant">
                <Link href="/login?redirect=/contact" className="text-primary hover:underline">
                  Sign in
                </Link>{" "}
                to submit through the portal, or email {supportEmail}.
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary-container px-lg py-sm font-medium text-label-md text-on-primary hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Sending…" : "Send Message"}
            </button>
          </form>
        </div>
      </section>
    </MarketingLayout>
  );
}
