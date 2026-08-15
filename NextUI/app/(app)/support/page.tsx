"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import StatusBadge from "@/components/portal/StatusBadge";

interface Ticket {
  id: number;
  number: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  description?: string | null;
  updated_on: string;
  messages?: Array<{
    id: number;
    author: string;
    role: string;
    message: string;
    timestamp: string;
  }>;
}

interface SupportVault {
  maintenance: { enabled: boolean; message: string };
  kpis: {
    open: number;
    in_progress: number;
    waiting_on_you: number;
    resolved_this_month: number;
    avg_response_time: string;
  };
  tickets: Ticket[];
  knowledge_base: Array<{
    id: number;
    title: string;
    category: string | null;
    reads: string;
    content?: string;
  }>;
  faqs: Array<{ id: string; q: string; a: string }>;
  relationship_manager: {
    name: string;
    role: string;
    email: string | null;
    phone: string | null;
    availability: string;
  };
  contacts: {
    working_hours: string;
    email: string;
    phone: string;
  };
  categories: string[];
}

type Modal = "ticket" | "chat" | "ticketDetail" | "article" | null;

export default function SupportPage() {
  const [data, setData] = useState<SupportVault | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [flashError, setFlashError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [modal, setModal] = useState<Modal>(null);

  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("General");
  const [priority, setPriority] = useState("Medium");
  const [description, setDescription] = useState("");

  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [reply, setReply] = useState("");
  const [article, setArticle] = useState<{
    id: number;
    title: string;
    category: string | null;
    content?: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/support");
      const payload = (response.data?.data ?? response.data) as SupportVault;
      setData(payload);
      if (!openFaq && payload.faqs[0]) setOpenFaq(payload.faqs[0].id);
    } catch (err) {
      setError(
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ||
          (err as { message?: string })?.message ||
          "Failed to load support centre"
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [openFaq]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const notify = (ok?: string, err?: string) => {
    setFlash(ok ?? null);
    setFlashError(err ?? null);
  };

  const createTicket = async (channel: "ticket" | "chat") => {
    if (!subject.trim() && channel === "ticket") return;
    if (!description.trim() && channel === "chat") return;

    setBusy(true);
    notify();
    try {
      const response = await apiClient.post("/support/tickets", {
        subject:
          subject.trim() ||
          (channel === "chat" ? "Live chat request" : "Support request"),
        category: channel === "chat" ? "Live Chat" : category,
        priority: channel === "chat" ? "High" : priority,
        description: description.trim() || undefined,
        channel,
      });
      const created = (response.data?.data ?? response.data) as Ticket;
      setModal(null);
      setSubject("");
      setDescription("");
      setPriority("Medium");
      setCategory("General");
      notify(channel === "chat" ? "Live chat started" : "Ticket created");
      await load();
      await openTicket(created.id);
    } catch (err) {
      notify(
        undefined,
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Could not create ticket"
      );
    } finally {
      setBusy(false);
    }
  };

  const openTicket = async (id: number) => {
    setBusy(true);
    notify();
    try {
      const response = await apiClient.get(`/support/tickets/${id}`);
      setActiveTicket((response.data?.data ?? response.data) as Ticket);
      setModal("ticketDetail");
      setReply("");
    } catch {
      notify(undefined, "Could not open ticket");
    } finally {
      setBusy(false);
    }
  };

  const sendReply = async () => {
    if (!activeTicket || !reply.trim()) return;
    setBusy(true);
    notify();
    try {
      await apiClient.post(`/support/tickets/${activeTicket.id}/reply`, {
        message: reply.trim(),
      });
      setReply("");
      const response = await apiClient.get(`/support/tickets/${activeTicket.id}`);
      setActiveTicket((response.data?.data ?? response.data) as Ticket);
      await load();
    } catch (err) {
      notify(
        undefined,
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Reply failed"
      );
    } finally {
      setBusy(false);
    }
  };

  const resolveTicket = async () => {
    if (!activeTicket) return;
    setBusy(true);
    notify();
    try {
      await apiClient.post(`/support/tickets/${activeTicket.id}/resolve`);
      notify("Ticket resolved");
      setModal(null);
      setActiveTicket(null);
      await load();
    } catch (err) {
      notify(
        undefined,
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Could not resolve"
      );
    } finally {
      setBusy(false);
    }
  };

  const openArticle = async (id: number) => {
    setBusy(true);
    try {
      const response = await apiClient.get(`/support/articles/${id}`);
      setArticle((response.data?.data ?? response.data) as typeof article);
      setModal("article");
    } catch {
      notify(undefined, "Could not load article");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-body-md text-on-surface-variant">Loading support centre…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-8 text-center shadow-sm">
        <h1 className="font-display text-headline-md text-on-surface">Couldn’t load support</h1>
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

  const rm = data.relationship_manager;
  const initials = rm.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="space-y-6">
      {data.maintenance.enabled && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          
          <div>
            <p className="text-body-sm font-medium text-amber-800">Scheduled Maintenance</p>
            <p className="text-label-sm text-amber-700">{data.maintenance.message}</p>
          </div>
        </div>
      )}

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

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-headline-lg font-semibold text-on-surface">
            Support Centre
          </h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Get help, track tickets, and explore resources.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setSubject("Live chat request");
              setDescription("");
              setModal("chat");
            }}
            className="flex items-center gap-2 rounded-lg border border-outline-variant/50 px-4 py-2.5 text-label-md font-medium text-on-surface hover:bg-surface-container-low"
          >
            
            Start Live Chat
          </button>
          <button
            type="button"
            onClick={() => {
              setSubject("");
              setDescription("");
              setCategory("General");
              setPriority("Medium");
              setModal("ticket");
            }}
            className="flex items-center gap-2 rounded-lg bg-primary-container px-4 py-2.5 text-label-md font-medium text-on-primary hover:opacity-90"
          >
            
            Create Support Ticket
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Open Tickets", value: data.kpis.open },
          { label: "In Progress", value: data.kpis.in_progress },
          { label: "Resolved This Month", value: data.kpis.resolved_this_month },
          { label: "Avg. Response Time", value: data.kpis.avg_response_time },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-sm"
          >
            <p className="font-display text-headline-md font-semibold text-on-surface">{kpi.value}</p>
            <p className="mt-1 text-label-sm text-on-surface-variant">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-4 text-headline-sm font-semibold text-on-surface">Active Tickets</h2>
            {data.tickets.length === 0 ? (
              <p className="py-6 text-center text-body-sm text-on-surface-variant">
                No tickets yet. Create one to get help from our team.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left">
                  <thead>
                    <tr className="border-b border-outline-variant/40 text-label-sm text-on-surface-variant">
                      <th className="pb-2 font-medium">Subject</th>
                      <th className="pb-2 font-medium">Category</th>
                      <th className="pb-2 font-medium">Priority</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {data.tickets.map((t) => (
                      <tr
                        key={t.id}
                        className="cursor-pointer text-body-sm text-on-surface hover:bg-surface-container-low"
                        onClick={() => void openTicket(t.id)}
                      >
                        <td className="py-3 pr-4 font-medium">
                          <span className="text-primary hover:underline">{t.subject}</span>
                          <p className="text-label-sm text-on-surface-variant">{t.number}</p>
                        </td>
                        <td className="py-3 pr-4 text-on-surface-variant">{t.category}</td>
                        <td className="py-3 pr-4">
                          <StatusBadge label={t.priority} />
                        </td>
                        <td className="py-3 pr-4">
                          <StatusBadge label={t.status} />
                        </td>
                        <td className="py-3 text-on-surface-variant">{t.updated_on}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-4 text-headline-sm font-semibold text-on-surface">Knowledge Base</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {data.knowledge_base.map((kb) => (
                <button
                  key={kb.id}
                  type="button"
                  onClick={() => void openArticle(kb.id)}
                  className="flex flex-col items-start gap-2 rounded-lg border border-outline-variant/40 p-4 text-left hover:bg-surface-container-low"
                >
                  
                  <p className="text-body-sm font-medium text-on-surface">{kb.title}</p>
                  <p className="text-label-sm text-on-surface-variant">
                    {kb.category} · {kb.reads} reads
                  </p>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-4 text-headline-sm font-semibold text-on-surface">
              Frequently Asked Questions
            </h2>
            <div className="divide-y divide-outline-variant/30">
              {data.faqs.map((faq) => {
                const isOpen = openFaq === faq.id;
                return (
                  <div key={faq.id} className="py-3">
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                      className="flex w-full items-center justify-between gap-3 text-left"
                    >
                      <span className="text-body-sm font-medium text-on-surface">{faq.q}</span>
                      
                    </button>
                    {isOpen && (
                      <p className="mt-2 text-body-sm text-on-surface-variant">{faq.a}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-4 text-headline-sm font-semibold text-on-surface">
              Your Relationship Manager
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-label-md font-semibold text-primary">
                {initials || "RM"}
              </div>
              <div>
                <p className="text-body-sm font-medium text-on-surface">{rm.name}</p>
                <p className="text-label-sm text-on-surface-variant">{rm.role}</p>
              </div>
            </div>
            <p className="mt-3 text-label-sm text-on-surface-variant">{rm.availability}</p>
            {rm.email && (
              <a
                href={`mailto:${rm.email}`}
                className="mt-3 inline-flex text-label-sm font-medium text-primary hover:underline"
              >
                {rm.email}
              </a>
            )}
          </section>

          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-3 text-headline-sm font-semibold text-on-surface">Contact &amp; Hours</h2>
            <div className="space-y-2.5 text-body-sm">
              <div className="flex items-center gap-2 text-on-surface-variant">
                
                {data.contacts.working_hours}
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant">
                
                {data.contacts.email}
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant">
                
                {data.contacts.phone}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-outline-variant/40 bg-primary-fixed p-5 shadow-sm">
            
            <h2 className="mt-2 text-headline-sm font-semibold text-on-surface">Need Immediate Help?</h2>
            <p className="mt-1 text-body-sm text-on-surface-variant">
              Start a live chat ticket — our desk auto-acknowledges within moments.
            </p>
            <button
              type="button"
              onClick={() => {
                setSubject("Live chat request");
                setDescription("");
                setModal("chat");
              }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container py-2.5 text-label-md font-medium text-on-primary hover:opacity-90"
            >
              Start Live Chat
            </button>
          </section>

          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-4 text-headline-sm font-semibold text-on-surface">Recommended Articles</h2>
            <ul className="space-y-3">
              {data.knowledge_base.slice(0, 3).map((kb) => (
                <li key={kb.id}>
                  <button
                    type="button"
                    onClick={() => void openArticle(kb.id)}
                    className="flex w-full items-center gap-2 text-left text-body-sm text-on-surface hover:text-primary"
                  >
                    
                    <span className="truncate">{kb.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {(modal === "ticket" || modal === "chat") && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-xl">
            <h3 className="font-display text-headline-sm text-on-surface">
              {modal === "chat" ? "Start Live Chat" : "Create Support Ticket"}
            </h3>
            <div className="mt-4 space-y-3">
              {modal === "ticket" && (
                <>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Subject"
                    className="w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-body-sm outline-none focus:border-primary-container"
                  />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-body-sm outline-none focus:border-primary-container"
                  >
                    {data.categories
                      .filter((c) => c !== "Live Chat")
                      .map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                  </select>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-body-sm outline-none focus:border-primary-container"
                  >
                    {["Low", "Medium", "High"].map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </>
              )}
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={modal === "chat" ? "How can we help?" : "Describe your issue"}
                rows={4}
                className="w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-body-sm outline-none focus:border-primary-container"
              />
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-lg border border-outline-variant/50 px-4 py-2 text-label-md"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={
                  busy ||
                  (modal === "ticket" ? !subject.trim() : !description.trim())
                }
                onClick={() => void createTicket(modal === "chat" ? "chat" : "ticket")}
                className="rounded-lg bg-primary-container px-4 py-2 text-label-md font-medium text-on-primary disabled:opacity-60"
              >
                {busy ? "Submitting…" : modal === "chat" ? "Start chat" : "Create ticket"}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === "ticketDetail" && activeTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4">
          <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-xl">
            <div className="border-b border-outline-variant/30 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-headline-sm text-on-surface">
                    {activeTicket.subject}
                  </h3>
                  <p className="text-label-sm text-on-surface-variant">
                    {activeTicket.number} · {activeTicket.category}
                  </p>
                </div>
                <StatusBadge label={activeTicket.status} />
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {(activeTicket.messages ?? []).map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-lg px-3 py-2 text-body-sm ${
                    msg.role === "Client"
                      ? "ml-8 bg-primary-container text-on-primary"
                      : "mr-8 bg-surface-container-low text-on-surface"
                  }`}
                >
                  <p className="text-label-sm opacity-80">
                    {msg.author} · {msg.timestamp}
                  </p>
                  <p className="mt-1">{msg.message}</p>
                </div>
              ))}
              {(activeTicket.messages ?? []).length === 0 && (
                <p className="text-body-sm text-on-surface-variant">No messages yet.</p>
              )}
            </div>
            <div className="border-t border-outline-variant/30 p-4">
              {activeTicket.status !== "Resolved" && activeTicket.status !== "Closed" && (
                <div className="mb-3 flex gap-2">
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void sendReply();
                    }}
                    placeholder="Type a reply…"
                    className="flex-1 rounded-lg border border-outline-variant/50 px-3 py-2 text-body-sm outline-none focus:border-primary-container"
                  />
                  <button
                    type="button"
                    disabled={busy || !reply.trim()}
                    onClick={() => void sendReply()}
                    className="rounded-lg bg-primary-container px-3 py-2 text-label-md font-medium text-on-primary disabled:opacity-60"
                  >
                    Send
                  </button>
                </div>
              )}
              <div className="flex justify-between gap-2">
                {activeTicket.status !== "Resolved" && activeTicket.status !== "Closed" ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void resolveTicket()}
                    className="rounded-lg border border-outline-variant/50 px-3 py-2 text-label-md"
                  >
                    Mark resolved
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setModal(null);
                    setActiveTicket(null);
                  }}
                  className="rounded-lg border border-outline-variant/50 px-4 py-2 text-label-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal === "article" && article && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-xl">
            <p className="text-label-sm text-on-surface-variant">{article.category}</p>
            <h3 className="mt-1 font-display text-headline-sm text-on-surface">{article.title}</h3>
            <p className="mt-4 text-body-sm text-on-surface-variant whitespace-pre-wrap">
              {article.content}
            </p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setModal(null);
                  setArticle(null);
                }}
                className="rounded-lg border border-outline-variant/50 px-4 py-2 text-label-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
