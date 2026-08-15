"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { greeting } from "@/lib/greeting";
import { apiClient } from "@/lib/api-client";
import KpiCard from "@/components/portal/KpiCard";
import StatusBadge from "@/components/portal/StatusBadge";

type HintTone = "positive" | "warning" | "negative" | "neutral";

interface Kpi {
  value: number;
  formatted?: string;
  hint: string;
  hint_tone: HintTone;
}

interface DashboardService {
  id: number;
  name: string;
  status: string;
  progress: number;
  owner: string;
  due_date: string | null;
}

interface ProgressItem {
  id: number;
  name: string;
  progress: number;
}

interface DashboardDocument {
  id: number;
  name: string;
  uploaded_on: string | null;
}

interface RelationshipManager {
  name: string;
  role: string;
  email: string | null;
  phone: string | null;
}

interface PendingInvoice {
  id: number;
  number: string;
  amount: number;
  amount_formatted: string;
  due_on: string | null;
}

interface Task {
  id: string;
  title: string;
  due_date: string;
  done: boolean;
}

interface DashboardData {
  greeting_name?: string;
  kpis: {
    active_services: Kpi;
    pending_documents: Kpi;
    outstanding_invoices: Kpi;
    upcoming_meetings: Kpi;
  };
  current_services: DashboardService[];
  progress_overview: ProgressItem[];
  invoice_summary: {
    paid_percent: number;
    outstanding_percent: number;
    outstanding_total: number;
    outstanding_formatted: string;
  };
  recent_documents: DashboardDocument[];
  relationship_manager: RelationshipManager;
  pending_invoice: PendingInvoice | null;
  tasks: Task[];
}

const todayLabel = new Date().toLocaleDateString("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/dashboard");
      const payload = response.data?.data ?? response.data;
      setData(payload as DashboardData);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ||
        (err as { message?: string })?.message ||
        "Failed to load dashboard";
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-body-md text-on-surface-variant">Loading dashboard…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-8 text-center shadow-sm">
        <h1 className="font-display text-headline-md text-on-surface">Couldn’t load dashboard</h1>
        <p className="mt-2 text-body-sm text-on-surface-variant">{error ?? "Unknown error"}</p>
        <button
          type="button"
          onClick={() => void loadDashboard()}
          className="mt-5 rounded-lg bg-primary-container px-4 py-2 text-label-md font-medium text-on-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  const { kpis, invoice_summary: invoiceSummary, relationship_manager: rm, pending_invoice: pendingInvoice } =
    data;
  const displayName = data.greeting_name || user?.first_name || "there";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-headline-lg font-semibold text-on-surface">
          {greeting()}, {displayName}
        </h1>
        <p className="mt-1 text-body-sm text-on-surface-variant">{todayLabel}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon="work"
          label="Active Services"
          value={String(kpis.active_services.value)}
          hint={kpis.active_services.hint}
          hintTone={kpis.active_services.hint_tone}
        />
        <KpiCard
          icon="description"
          label="Pending Documents"
          value={String(kpis.pending_documents.value)}
          hint={kpis.pending_documents.hint}
          hintTone={kpis.pending_documents.hint_tone}
        />
        <KpiCard
          icon="payments"
          label="Outstanding Invoices"
          value={kpis.outstanding_invoices.formatted ?? `₹${kpis.outstanding_invoices.value}`}
          hint={kpis.outstanding_invoices.hint}
          hintTone={kpis.outstanding_invoices.hint_tone}
        />
        <KpiCard
          icon="calendar_today"
          label="Upcoming Meetings"
          value={String(kpis.upcoming_meetings.value)}
          hint={kpis.upcoming_meetings.hint}
          hintTone={kpis.upcoming_meetings.hint_tone}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-headline-sm font-semibold text-on-surface">Current Services</h2>
              <Link
                href="/my-services"
                className="flex items-center gap-1 text-label-md font-medium text-primary hover:underline"
              >
                View all
                
              </Link>
            </div>
            {data.current_services.length === 0 ? (
              <p className="py-6 text-center text-body-sm text-on-surface-variant">
                No active services yet.{" "}
                <Link href="/book-consultation" className="text-primary hover:underline">
                  Book a consultation
                </Link>
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left">
                  <thead>
                    <tr className="border-b border-outline-variant/40 text-label-sm text-on-surface-variant">
                      <th className="pb-2 font-medium">Service</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Progress</th>
                      <th className="pb-2 font-medium">Owner</th>
                      <th className="pb-2 font-medium">Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {data.current_services.map((service) => (
                      <tr key={service.id} className="text-body-sm text-on-surface">
                        <td className="py-3 pr-4">
                          <Link
                            href={`/my-services/${service.id}`}
                            className="font-medium text-on-surface hover:text-primary hover:underline"
                          >
                            {service.name}
                          </Link>
                        </td>
                        <td className="py-3 pr-4">
                          <StatusBadge label={service.status} />
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-container-high">
                              <div
                                className="h-full rounded-full bg-primary-container"
                                style={{ width: `${service.progress}%` }}
                              />
                            </div>
                            <span className="text-label-sm text-on-surface-variant">
                              {service.progress}%
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-on-surface-variant">{service.owner}</td>
                        <td className="py-3 text-on-surface-variant">{service.due_date ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-4 text-headline-sm font-semibold text-on-surface">
              Service Progress Overview
            </h2>
            {data.progress_overview.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">No services to show yet.</p>
            ) : (
              <div className="space-y-4">
                {data.progress_overview.map((item) => (
                  <div key={item.id}>
                    <div className="mb-1.5 flex items-center justify-between text-body-sm">
                      <span className="text-on-surface">{item.name}</span>
                      <span className="text-on-surface-variant">{item.progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-container-high">
                      <div
                        className={`h-full rounded-full ${
                          item.progress === 100 ? "bg-emerald-500" : "bg-primary-container"
                        }`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
              <h2 className="mb-4 text-headline-sm font-semibold text-on-surface">Invoice Summary</h2>
              <div className="flex items-center gap-5">
                <div
                  className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(#0052ff ${invoiceSummary.paid_percent * 3.6}deg, #dce9ff 0deg)`,
                  }}
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-surface-container-lowest">
                    <span className="text-headline-sm font-semibold text-on-surface">
                      {invoiceSummary.paid_percent}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2 text-body-sm">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary-container" />
                    <span className="text-on-surface-variant">
                      Paid — {invoiceSummary.paid_percent}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-surface-container-high" />
                    <span className="text-on-surface-variant">
                      Outstanding — {invoiceSummary.outstanding_percent}%
                    </span>
                  </div>
                  <p className="pt-1 font-medium text-on-surface">
                    {invoiceSummary.outstanding_formatted} due
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-headline-sm font-semibold text-on-surface">Recent Documents</h2>
                <Link href="/documents" className="text-label-sm font-medium text-primary hover:underline">
                  View all
                </Link>
              </div>
              {data.recent_documents.length === 0 ? (
                <p className="text-body-sm text-on-surface-variant">No documents uploaded yet.</p>
              ) : (
                <table className="w-full text-left">
                  <tbody className="divide-y divide-outline-variant/30">
                    {data.recent_documents.map((doc) => (
                      <tr key={doc.id} className="text-body-sm">
                        <td className="flex items-center gap-2 py-2.5 pr-2 text-on-surface">
                          
                          <span className="truncate">{doc.name}</span>
                        </td>
                        <td className="py-2.5 text-right text-label-sm text-on-surface-variant">
                          {doc.uploaded_on ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-4 text-headline-sm font-semibold text-on-surface">
              Relationship Manager
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-label-md font-semibold text-primary">
                {initials(rm.name)}
              </div>
              <div>
                <p className="text-body-sm font-medium text-on-surface">{rm.name}</p>
                <p className="text-label-sm text-on-surface-variant">{rm.role}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-label-sm text-on-surface-variant">
              {rm.email && <p>{rm.email}</p>}
              {rm.phone && <p>{rm.phone}</p>}
            </div>
            {rm.email ? (
              <a
                href={`mailto:${rm.email}`}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant/50 py-2 text-label-md font-medium text-on-surface hover:bg-surface-container-low"
              >
                
                Message
              </a>
            ) : (
              <Link
                href="/support"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant/50 py-2 text-label-md font-medium text-on-surface hover:bg-surface-container-low"
              >
                
                Message
              </Link>
            )}
          </section>

          {pendingInvoice && (
            <section className="rounded-2xl border border-outline-variant/40 bg-primary-fixed p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-headline-sm font-semibold text-on-surface">Pending Invoice</h2>
                
              </div>
              <p className="mt-2 font-display text-headline-md font-semibold text-on-surface">
                {pendingInvoice.amount_formatted}
              </p>
              <p className="text-label-sm text-on-surface-variant">
                {pendingInvoice.number}
                {pendingInvoice.due_on ? ` · Due ${pendingInvoice.due_on}` : ""}
              </p>
              <Link
                href="/invoices"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container py-2.5 text-label-md font-medium text-on-primary hover:opacity-90"
              >
                Pay Now
              </Link>
            </section>
          )}

          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-headline-sm font-semibold text-on-surface">Tasks</h2>
              <span className="rounded-full bg-primary-fixed px-2 py-0.5 text-label-sm font-medium text-primary">
                {data.tasks.length}
              </span>
            </div>
            {data.tasks.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">You’re all caught up.</p>
            ) : (
              <ul className="space-y-3">
                {data.tasks.map((task) => (
                  <li key={task.id} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 rounded border-outline-variant text-primary"
                      readOnly
                      checked={task.done}
                    />
                    <div>
                      <p className="text-body-sm text-on-surface">{task.title}</p>
                      <p className="text-label-sm text-on-surface-variant">Due {task.due_date}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-4 text-headline-sm font-semibold text-on-surface">Quick Shortcuts</h2>
            <div className="grid grid-cols-3 gap-2">
              <Link
                href="/documents"
                className="flex flex-col items-center gap-1.5 rounded-lg border border-outline-variant/50 py-3 text-center hover:bg-surface-container-low"
              >
                
                <span className="text-label-sm text-on-surface-variant">Upload</span>
              </Link>
              <Link
                href="/invoices"
                className="flex flex-col items-center gap-1.5 rounded-lg border border-outline-variant/50 py-3 text-center hover:bg-surface-container-low"
              >
                
                <span className="text-label-sm text-on-surface-variant">Pay</span>
              </Link>
              <Link
                href="/book-consultation"
                className="flex flex-col items-center gap-1.5 rounded-lg border border-outline-variant/50 py-3 text-center hover:bg-surface-container-low"
              >
                
                <span className="text-label-sm text-on-surface-variant">Book</span>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
