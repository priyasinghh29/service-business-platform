"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import KpiCard from "@/components/portal/KpiCard";
import StatusBadge from "@/components/portal/StatusBadge";

interface InvoiceRow {
  id: number;
  number: string;
  service: string;
  amount: number;
  amount_formatted: string;
  status: string;
  status_raw: string;
  due_on: string | null;
  issued_on: string | null;
  paid_on: string | null;
  can_pay: boolean;
  notes?: string | null;
  subtotal?: number;
  discount?: number;
  tax?: number;
  payments?: Array<{
    id: number;
    number: string;
    amount: number;
    gateway: string;
    status: string;
    paid_at: string | null;
  }>;
}

interface BillingVault {
  kpis: {
    total_outstanding: number;
    total_outstanding_formatted: string;
    outstanding_count: number;
    paid_this_year: number;
    paid_this_year_formatted: string;
    overdue_count: number;
    next_due_date: string;
  };
  invoices: InvoiceRow[];
  subscriptions: Array<{
    id: number;
    name: string;
    cadence: string;
    amount: number;
    amount_formatted: string;
    renews_on: string | null;
  }>;
  quotations: Array<{
    id: number;
    title: string;
    amount_formatted: string;
    status: string;
    valid_till: string | null;
  }>;
  payment_methods: Array<{
    id: number;
    label: string;
    detail: string | null;
    type: string;
    primary: boolean;
  }>;
  tax_documents: Array<{
    id: number;
    name: string;
    date: string | null;
    download_url: string | null;
    has_file: boolean;
  }>;
  summary: {
    invoices_this_year: number;
    active_subscriptions: number;
    pending_quotations: number;
  };
  support: { email: string; phone: string };
}

export default function InvoicesPage() {
  const [data, setData] = useState<BillingVault | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [flashError, setFlashError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [viewInvoice, setViewInvoice] = useState<InvoiceRow | null>(null);
  const [payInvoice, setPayInvoice] = useState<InvoiceRow | null>(null);
  const [selectedMethodId, setSelectedMethodId] = useState<number | "">("");
  const [addMethodOpen, setAddMethodOpen] = useState(false);
  const [methodLabel, setMethodLabel] = useState("");
  const [methodDetail, setMethodDetail] = useState("");
  const [methodType, setMethodType] = useState("card");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/invoices/vault");
      const payload = (response.data?.data ?? response.data) as BillingVault;
      setData(payload);
      const primary = payload.payment_methods.find((m) => m.primary) ?? payload.payment_methods[0];
      setSelectedMethodId(primary?.id ?? "");
    } catch (err) {
      setError(
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ||
          (err as { message?: string })?.message ||
          "Failed to load billing"
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const notify = (ok?: string, err?: string) => {
    setFlash(ok ?? null);
    setFlashError(err ?? null);
  };

  const downloadBlob = async (url: string, filename: string) => {
    const response = await apiClient.get(url, { responseType: "blob" });
    const blob = new Blob([response.data]);
    const href = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(href);
  };

  const downloadStatement = async () => {
    setBusy(true);
    notify();
    try {
      await downloadBlob("/invoices/statement", `billing-statement-${new Date().toISOString().slice(0, 10)}.csv`);
      notify("Statement downloaded");
    } catch {
      notify(undefined, "Could not download statement");
    } finally {
      setBusy(false);
    }
  };

  const downloadInvoice = async (inv: InvoiceRow) => {
    setBusy(true);
    notify();
    try {
      await downloadBlob(`/invoices/${inv.id}/download`, `${inv.number}.html`);
      notify("Invoice downloaded");
    } catch {
      notify(undefined, "Could not download invoice");
    } finally {
      setBusy(false);
    }
  };

  const openView = async (inv: InvoiceRow) => {
    setBusy(true);
    notify();
    try {
      const response = await apiClient.get(`/invoices/${inv.id}`);
      setViewInvoice((response.data?.data ?? response.data) as InvoiceRow);
    } catch {
      notify(undefined, "Could not load invoice");
    } finally {
      setBusy(false);
    }
  };

  const confirmPay = async () => {
    if (!payInvoice) return;
    setBusy(true);
    notify();
    try {
      await apiClient.post(`/invoices/${payInvoice.id}/pay`, {
        payment_method_id: selectedMethodId || undefined,
        gateway: "manual",
      });
      setPayInvoice(null);
      notify(`Paid ${payInvoice.number} successfully`);
      await load();
    } catch (err) {
      notify(
        undefined,
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Payment failed"
      );
    } finally {
      setBusy(false);
    }
  };

  const addPaymentMethod = async () => {
    if (!methodLabel.trim()) return;
    setBusy(true);
    notify();
    try {
      await apiClient.post("/payment-methods", {
        label: methodLabel.trim(),
        detail: methodDetail.trim() || undefined,
        type: methodType,
        is_primary: (data?.payment_methods.length ?? 0) === 0,
      });
      setAddMethodOpen(false);
      setMethodLabel("");
      setMethodDetail("");
      notify("Payment method added");
      await load();
    } catch (err) {
      notify(
        undefined,
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Could not add method"
      );
    } finally {
      setBusy(false);
    }
  };

  const makePaymentTarget =
    data?.invoices.find((i) => i.can_pay) ?? null;

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-body-md text-on-surface-variant">Loading billing…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-8 text-center shadow-sm">
        <h1 className="font-display text-headline-md text-on-surface">Couldn’t load invoices</h1>
        <p className="mt-2 text-body-sm text-on-surface-variant">{error ?? "Unknown error"}</p>
        <button
          type="button"
          onClick={() => void load()}
          className="mt-5 rounded-lg bg-primary-container px-4 py-2 text-label-md font-medium text-on-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-headline-lg font-semibold text-on-surface">
            Invoices &amp; Billing
          </h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Manage payments, subscriptions, and billing documents.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void downloadStatement()}
            className="flex items-center gap-2 rounded-lg border border-outline-variant/50 px-4 py-2.5 text-label-md font-medium text-on-surface hover:bg-surface-container-low disabled:opacity-60"
          >
            
            Download Statement
          </button>
          <button
            type="button"
            disabled={busy || !makePaymentTarget}
            onClick={() => makePaymentTarget && setPayInvoice(makePaymentTarget)}
            className="flex items-center gap-2 rounded-lg bg-primary-container px-4 py-2.5 text-label-md font-medium text-on-primary hover:opacity-90 disabled:opacity-60"
          >
            
            Make Payment
          </button>
        </div>
      </div>

      {(flash || flashError) && (
        <div
          className={`rounded-lg border px-4 py-3 text-body-sm ${
            flash
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {flash || flashError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon="payments"
          label="Total Outstanding"
          value={data.kpis.total_outstanding_formatted}
          hint={`Across ${data.kpis.outstanding_count} invoice${data.kpis.outstanding_count === 1 ? "" : "s"}`}
          hintTone="negative"
        />
        <KpiCard
          icon="check"
          label="Paid This Year"
          value={data.kpis.paid_this_year_formatted}
          hint="On-time payments"
          hintTone="positive"
        />
        <KpiCard
          icon="warning"
          label="Overdue Invoices"
          value={String(data.kpis.overdue_count)}
          hint={data.kpis.overdue_count > 0 ? "Needs attention" : "All clear"}
          hintTone={data.kpis.overdue_count > 0 ? "warning" : "positive"}
        />
        <KpiCard
          icon="schedule"
          label="Next Due Date"
          value={data.kpis.next_due_date}
          hint="Outstanding invoice"
          hintTone="neutral"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-4 text-headline-sm font-semibold text-on-surface">Recent Invoices</h2>
            {data.invoices.length === 0 ? (
              <p className="py-6 text-center text-body-sm text-on-surface-variant">No invoices yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left">
                  <thead>
                    <tr className="border-b border-outline-variant/40 text-label-sm text-on-surface-variant">
                      <th className="pb-2 font-medium">Invoice</th>
                      <th className="pb-2 font-medium">Service</th>
                      <th className="pb-2 font-medium">Amount</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Due</th>
                      <th className="pb-2 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {data.invoices.map((inv) => (
                      <tr key={inv.id} className="text-body-sm text-on-surface">
                        <td className="py-3 pr-4 font-medium">{inv.number}</td>
                        <td className="py-3 pr-4 text-on-surface-variant">{inv.service}</td>
                        <td className="py-3 pr-4">{inv.amount_formatted}</td>
                        <td className="py-3 pr-4">
                          <StatusBadge label={inv.status} />
                        </td>
                        <td className="py-3 pr-4 text-on-surface-variant">{inv.due_on ?? "—"}</td>
                        <td className="py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {inv.can_pay && (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => setPayInvoice(inv)}
                                className="rounded-lg bg-primary-container px-2.5 py-1.5 text-label-sm font-medium text-on-primary hover:opacity-90 disabled:opacity-60"
                              >
                                Pay Now
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void openView(inv)}
                              className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                              aria-label="View invoice"
                            >
                              
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void downloadInvoice(inv)}
                              className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                              aria-label="Download invoice"
                            >
                              
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-4 text-headline-sm font-semibold text-on-surface">Active Subscriptions</h2>
            {data.subscriptions.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">No active subscriptions.</p>
            ) : (
              <ul className="space-y-3">
                {data.subscriptions.map((sub) => (
                  <li
                    key={sub.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-outline-variant/40 px-4 py-3"
                  >
                    <div>
                      <p className="text-body-sm font-medium text-on-surface">{sub.name}</p>
                      <p className="text-label-sm text-on-surface-variant">
                        {sub.cadence}
                        {sub.renews_on ? ` · Renews ${sub.renews_on}` : ""}
                      </p>
                    </div>
                    <p className="text-body-sm font-semibold text-on-surface">{sub.amount_formatted}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-4 text-headline-sm font-semibold text-on-surface">Open Quotations</h2>
            {data.quotations.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">No open quotations.</p>
            ) : (
              <ul className="space-y-3">
                {data.quotations.map((q) => (
                  <li
                    key={q.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-outline-variant/40 px-4 py-3"
                  >
                    <div>
                      <p className="text-body-sm font-medium text-on-surface">{q.title}</p>
                      <p className="text-label-sm text-on-surface-variant">
                        {q.valid_till ? `Valid till ${q.valid_till}` : "No expiry set"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="text-body-sm font-semibold text-on-surface">{q.amount_formatted}</p>
                      <StatusBadge label={q.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-headline-sm font-semibold text-on-surface">Payment Methods</h2>
              <button
                type="button"
                onClick={() => setAddMethodOpen(true)}
                className="text-label-sm font-medium text-primary hover:underline"
              >
                Add New
              </button>
            </div>
            {data.payment_methods.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">No payment methods saved.</p>
            ) : (
              <ul className="space-y-3">
                {data.payment_methods.map((pm) => (
                  <li
                    key={pm.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-outline-variant/40 px-3.5 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-body-sm font-medium text-on-surface">{pm.label}</p>
                        <p className="text-label-sm text-on-surface-variant">{pm.detail}</p>
                      </div>
                    </div>
                    {pm.primary && <StatusBadge label="Primary" tone="info" />}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-4 text-headline-sm font-semibold text-on-surface">Tax Documents</h2>
            {data.tax_documents.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">No tax documents yet.</p>
            ) : (
              <ul className="space-y-3">
                {data.tax_documents.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-body-sm text-on-surface">
                        
                        <span className="truncate">{doc.name}</span>
                      </div>
                      {doc.date && (
                        <p className="pl-6 text-label-sm text-on-surface-variant">{doc.date}</p>
                      )}
                    </div>
                    {doc.has_file ? (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void downloadBlob(`/documents/${doc.id}/download`, doc.name).then(
                            () => notify("Document downloaded"),
                            () => notify(undefined, "Download failed")
                          )
                        }
                        className="rounded-lg p-1.5 text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
                        aria-label={`Download ${doc.name}`}
                      >
                        
                      </button>
                    ) : (
                      <span className="text-label-sm text-on-surface-variant">Meta only</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-2 text-headline-sm font-semibold text-on-surface">Billing Support</h2>
            <p className="text-body-sm text-on-surface-variant">
              Have a billing question? We&apos;re here to help.
            </p>
            <p className="mt-3 text-label-sm text-on-surface-variant">{data.support.email}</p>
            <p className="text-label-sm text-on-surface-variant">{data.support.phone}</p>
            <a
              href={`mailto:${data.support.email}`}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant/50 py-2 text-label-md font-medium text-on-surface hover:bg-surface-container-low"
            >
              
              Contact Billing Team
            </a>
            <Link
              href="/support"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-outline-variant/50 py-2 text-label-md font-medium text-on-surface hover:bg-surface-container-low"
            >
              Open Support Centre
            </Link>
          </section>

          <section className="rounded-2xl border border-outline-variant/40 bg-primary-fixed p-5 shadow-sm">
            <h2 className="mb-3 text-headline-sm font-semibold text-on-surface">Quick Summary</h2>
            <div className="space-y-2 text-body-sm">
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Invoices this year</span>
                <span className="font-medium text-on-surface">{data.summary.invoices_this_year}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Active subscriptions</span>
                <span className="font-medium text-on-surface">{data.summary.active_subscriptions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-on-surface-variant">Pending quotations</span>
                <span className="font-medium text-on-surface">{data.summary.pending_quotations}</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      {payInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-xl">
            <h3 className="font-display text-headline-sm text-on-surface">Pay invoice</h3>
            <p className="mt-2 text-body-sm text-on-surface-variant">
              {payInvoice.number} · {payInvoice.service}
            </p>
            <p className="mt-3 font-display text-headline-md font-semibold text-on-surface">
              {payInvoice.amount_formatted}
            </p>
            <label className="mt-4 block text-label-sm text-on-surface-variant">
              Payment method
              <select
                value={selectedMethodId}
                onChange={(e) =>
                  setSelectedMethodId(e.target.value ? Number(e.target.value) : "")
                }
                className="mt-1 w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-body-sm outline-none focus:border-primary-container"
              >
                <option value="">Default / manual</option>
                {data.payment_methods.map((pm) => (
                  <option key={pm.id} value={pm.id}>
                    {pm.label}
                    {pm.primary ? " (Primary)" : ""}
                  </option>
                ))}
              </select>
            </label>
            <p className="mt-3 text-label-sm text-on-surface-variant">
              Demo mode: payment is recorded immediately without a live gateway charge.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setPayInvoice(null)}
                className="rounded-lg border border-outline-variant/50 px-4 py-2 text-label-md"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void confirmPay()}
                className="rounded-lg bg-primary-container px-4 py-2 text-label-md font-medium text-on-primary disabled:opacity-60"
              >
                {busy ? "Processing…" : "Confirm payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-headline-sm text-on-surface">{viewInvoice.number}</h3>
                <p className="text-body-sm text-on-surface-variant">{viewInvoice.service}</p>
              </div>
              <StatusBadge label={viewInvoice.status} />
            </div>
            <div className="mt-4 space-y-2 text-body-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Issued</span>
                <span>{viewInvoice.issued_on ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Due</span>
                <span>{viewInvoice.due_on ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Subtotal</span>
                <span>₹{(viewInvoice.subtotal ?? 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Discount</span>
                <span>₹{(viewInvoice.discount ?? 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Tax</span>
                <span>₹{(viewInvoice.tax ?? 0).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between border-t border-outline-variant/30 pt-2 font-semibold">
                <span>Total</span>
                <span>{viewInvoice.amount_formatted}</span>
              </div>
            </div>
            {viewInvoice.payments && viewInvoice.payments.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-label-md font-medium text-on-surface">Payments</p>
                <ul className="space-y-1 text-label-sm text-on-surface-variant">
                  {viewInvoice.payments.map((p) => (
                    <li key={p.id}>
                      {p.number} · ₹{p.amount.toLocaleString("en-IN")} · {p.status}
                      {p.paid_at ? ` · ${p.paid_at}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => void downloadInvoice(viewInvoice)}
                className="rounded-lg border border-outline-variant/50 px-4 py-2 text-label-md"
              >
                Download
              </button>
              {viewInvoice.can_pay && (
                <button
                  type="button"
                  onClick={() => {
                    setPayInvoice(viewInvoice);
                    setViewInvoice(null);
                  }}
                  className="rounded-lg bg-primary-container px-4 py-2 text-label-md font-medium text-on-primary"
                >
                  Pay Now
                </button>
              )}
              <button
                type="button"
                onClick={() => setViewInvoice(null)}
                className="rounded-lg border border-outline-variant/50 px-4 py-2 text-label-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {addMethodOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-xl">
            <h3 className="font-display text-headline-sm text-on-surface">Add payment method</h3>
            <div className="mt-4 space-y-3">
              <input
                value={methodLabel}
                onChange={(e) => setMethodLabel(e.target.value)}
                placeholder="Label (e.g. HDFC Credit Card)"
                className="w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-body-sm outline-none focus:border-primary-container"
              />
              <input
                value={methodDetail}
                onChange={(e) => setMethodDetail(e.target.value)}
                placeholder="Detail (e.g. •••• 4821)"
                className="w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-body-sm outline-none focus:border-primary-container"
              />
              <select
                value={methodType}
                onChange={(e) => setMethodType(e.target.value)}
                className="w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-body-sm outline-none focus:border-primary-container"
              >
                <option value="card">Card</option>
                <option value="bank">Bank</option>
                <option value="upi">UPI</option>
              </select>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAddMethodOpen(false)}
                className="rounded-lg border border-outline-variant/50 px-4 py-2 text-label-md"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!methodLabel.trim() || busy}
                onClick={() => void addPaymentMethod()}
                className="rounded-lg bg-primary-container px-4 py-2 text-label-md font-medium text-on-primary disabled:opacity-60"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
