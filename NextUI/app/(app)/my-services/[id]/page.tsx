"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient } from "@/lib/api-client";
import StatusBadge from "@/components/portal/StatusBadge";

interface ServiceCard {
  id: number;
  name: string;
  category: string;
  description: string;
  status: string;
  status_raw: string;
  progress: number;
  stage: string;
  pipeline: string[];
  owner: string;
  due_date: string | null;
  booking_number: string;
  can_cancel: boolean;
  can_reschedule: boolean;
  booking_date: string | null;
  booking_time: string | null;
}

interface WorkspaceDoc {
  id: number;
  name: string;
  size: string | null;
  uploaded_on: string | null;
  status: string;
  download_url: string | null;
}

interface Message {
  id: number;
  author: string;
  role: string;
  message: string;
  timestamp: string;
}

interface WorkspacePayload {
  service: ServiceCard;
  current_focus: string;
  action_items: Array<{ id: string; title: string; due_date: string; priority: string }>;
  milestones: {
    client_tasks: Array<{ id: string; title: string; done: boolean }>;
    firm_tasks: Array<{ id: string; title: string; done: boolean }>;
  };
  documents: WorkspaceDoc[];
  messages: Message[];
  activity: Array<{ id: string; actor: string; action: string; timestamp: string }>;
  assigned_team: Array<{
    id: number;
    name: string;
    role: string;
    email?: string | null;
    phone?: string | null;
    initials: string;
  }>;
  billing: {
    id: number;
    number: string;
    amount_formatted: string;
    status: string;
    due_on: string | null;
  } | null;
  meetings: Array<{
    id: number;
    title: string;
    date: string;
    time: string;
    with: string;
    mode: string;
  }>;
}

export default function ServiceWorkspacePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;
  const fileRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<WorkspacePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("10:00");
  const [busyAction, setBusyAction] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get(`/my-services/${id}`);
      const payload = (response.data?.data ?? response.data) as WorkspacePayload;
      setData(payload);
      if (payload.service.booking_date) setRescheduleDate(payload.service.booking_date);
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const message =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ||
        (err as { message?: string })?.message ||
        "Failed to load service";
      setError(status === 404 ? "Service not found" : message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const sendMessage = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    setActionError(null);
    try {
      const response = await apiClient.post(`/my-services/${id}/messages`, {
        message: message.trim(),
      });
      const created = (response.data?.data ?? response.data) as Message;
      setData((prev) =>
        prev
          ? {
              ...prev,
              messages: [...prev.messages, created],
              activity: [
                {
                  id: `msg-${created.id}`,
                  actor: created.author,
                  action: "sent a message",
                  timestamp: "Just now",
                },
                ...prev.activity,
              ],
            }
          : prev
      );
      setMessage("");
    } catch (err) {
      setActionError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Failed to send message"
      );
    } finally {
      setSending(false);
    }
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setActionError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("booking_id", String(id));
      form.append("folder", data?.service.category || "General");
      await apiClient.post("/documents", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await load();
    } catch (err) {
      setActionError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Upload failed"
      );
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const cancelBooking = async () => {
    if (!data?.service.can_cancel || busyAction) return;
    if (!window.confirm("Cancel this service engagement?")) return;
    setBusyAction("cancel");
    setActionError(null);
    try {
      await apiClient.post(`/bookings/${id}/cancel`, { reason: "Cancelled by customer" });
      await load();
    } catch (err) {
      setActionError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Could not cancel"
      );
    } finally {
      setBusyAction(null);
    }
  };

  const rescheduleBooking = async () => {
    if (!data?.service.can_reschedule || busyAction) return;
    setBusyAction("reschedule");
    setActionError(null);
    try {
      await apiClient.post(`/bookings/${id}/reschedule`, {
        booking_date: rescheduleDate,
        booking_time: rescheduleTime,
      });
      setRescheduleOpen(false);
      await load();
    } catch (err) {
      setActionError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Could not reschedule"
      );
    } finally {
      setBusyAction(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-body-md text-on-surface-variant">Loading workspace…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-8 text-center shadow-sm">
        <h1 className="font-display text-headline-md text-on-surface">{error ?? "Not found"}</h1>
        <div className="mt-5 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg bg-primary-container px-4 py-2 text-label-md font-medium text-on-primary"
          >
            Retry
          </button>
          <button
            type="button"
            onClick={() => router.push("/my-services")}
            className="rounded-lg border border-outline-variant/50 px-4 py-2 text-label-md font-medium text-on-surface"
          >
            Back to My Services
          </button>
        </div>
      </div>
    );
  }

  const service = data.service;
  const pipeline = service.pipeline?.length
    ? service.pipeline
    : ["Consult", "Proposal", "Submission", "Review", "Complete"];
  const currentIdx = pipeline.indexOf(service.stage);

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-label-md text-on-surface-variant">
        <Link href="/dashboard" className="hover:text-primary hover:underline">
          Dashboard
        </Link>
        
        <Link href="/my-services" className="hover:text-primary hover:underline">
          My Services
        </Link>
        
        <span className="font-medium text-on-surface">{service.name}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-headline-lg font-semibold text-on-surface">{service.name}</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            {service.category} · {service.booking_number}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge label={service.status} />
          <span className="text-headline-sm font-semibold text-on-surface">{service.progress}%</span>
          {service.can_reschedule && (
            <button
              type="button"
              onClick={() => setRescheduleOpen((v) => !v)}
              className="rounded-lg border border-outline-variant/50 px-3 py-2 text-label-md font-medium text-on-surface hover:bg-surface-container-low"
            >
              Reschedule
            </button>
          )}
          {service.can_cancel && (
            <button
              type="button"
              onClick={() => void cancelBooking()}
              disabled={busyAction === "cancel"}
              className="rounded-lg border border-rose-200 px-3 py-2 text-label-md font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-60"
            >
              {busyAction === "cancel" ? "Cancelling…" : "Cancel"}
            </button>
          )}
        </div>
      </div>

      {actionError && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-body-sm text-rose-700">
          {actionError}
        </div>
      )}

      {rescheduleOpen && (
        <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
          <h2 className="mb-3 text-headline-sm font-semibold text-on-surface">Reschedule engagement</h2>
          <div className="flex flex-wrap items-end gap-3">
            <label className="text-label-sm text-on-surface-variant">
              Date
              <input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="mt-1 block rounded-lg border border-outline-variant/50 px-3 py-2 text-body-sm outline-none focus:border-primary-container"
              />
            </label>
            <label className="text-label-sm text-on-surface-variant">
              Time
              <input
                type="time"
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
                className="mt-1 block rounded-lg border border-outline-variant/50 px-3 py-2 text-body-sm outline-none focus:border-primary-container"
              />
            </label>
            <button
              type="button"
              onClick={() => void rescheduleBooking()}
              disabled={!rescheduleDate || busyAction === "reschedule"}
              className="rounded-lg bg-primary-container px-4 py-2 text-label-md font-medium text-on-primary disabled:opacity-60"
            >
              {busyAction === "reschedule" ? "Saving…" : "Save new time"}
            </button>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-body-sm">
          <span className="font-medium text-on-surface">Overall Progress</span>
          <span className="text-on-surface-variant">{service.progress}% complete</span>
        </div>
        <div className="mb-5 h-2.5 overflow-hidden rounded-full bg-surface-container-high">
          <div
            className="h-full rounded-full bg-primary-container"
            style={{ width: `${service.progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between overflow-x-auto">
          {pipeline.map((stage, idx) => {
            const isDone = currentIdx >= 0 && (idx < currentIdx || service.stage === "Complete");
            const isCurrent = stage === service.stage;
            return (
              <div key={stage} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-label-sm font-semibold ${
                      isDone
                        ? "bg-emerald-500 text-white"
                        : isCurrent
                          ? "bg-primary-container text-on-primary"
                          : "bg-surface-container-high text-on-surface-variant"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <span
                    className={`text-[11px] ${
                      isCurrent ? "font-medium text-on-surface" : "text-on-surface-variant"
                    }`}
                  >
                    {stage}
                  </span>
                </div>
                {idx < pipeline.length - 1 && (
                  <div
                    className={`mx-1 h-0.5 flex-1 ${isDone ? "bg-emerald-500" : "bg-surface-container-high"}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className="rounded-2xl border border-outline-variant/40 bg-primary-fixed p-5 shadow-sm">
            <div className="flex items-center gap-2 text-primary">
              
              <h2 className="text-label-md font-semibold uppercase tracking-wide">Current Focus</h2>
            </div>
            <p className="mt-2 text-body-md text-on-surface">{data.current_focus}</p>
          </section>

          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-4 text-headline-sm font-semibold text-on-surface">Action Items</h2>
            {data.action_items.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">No open action items.</p>
            ) : (
              <ul className="space-y-3">
                {data.action_items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-outline-variant/40 px-4 py-3"
                  >
                    <div>
                      <p className="text-body-sm font-medium text-on-surface">{item.title}</p>
                      <p className="text-label-sm text-on-surface-variant">Due {item.due_date}</p>
                    </div>
                    <StatusBadge label={item.priority} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-4 text-headline-sm font-semibold text-on-surface">Milestones</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="mb-3 text-label-md font-medium text-on-surface-variant">Client Tasks</p>
                <ul className="space-y-2.5">
                  {data.milestones.client_tasks.map((task) => (
                    <li key={task.id} className="flex items-center gap-2.5 text-body-sm">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          task.done
                            ? "bg-emerald-500 text-white"
                            : "border border-outline-variant/60 text-transparent"
                        }`}
                      >
                        
                      </span>
                      <span className={task.done ? "text-on-surface-variant line-through" : "text-on-surface"}>
                        {task.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-3 text-label-md font-medium text-on-surface-variant">Firm Tasks</p>
                <ul className="space-y-2.5">
                  {data.milestones.firm_tasks.map((task) => (
                    <li key={task.id} className="flex items-center gap-2.5 text-body-sm">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                          task.done
                            ? "bg-emerald-500 text-white"
                            : "border border-outline-variant/60 text-transparent"
                        }`}
                      >
                        
                      </span>
                      <span className={task.done ? "text-on-surface-variant line-through" : "text-on-surface"}>
                        {task.title}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-headline-sm font-semibold text-on-surface">Document Manager</h2>
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadFile(file);
                  }}
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="flex items-center gap-1.5 rounded-lg bg-primary-container px-3 py-1.5 text-label-sm font-medium text-on-primary hover:opacity-90 disabled:opacity-60"
                >
                  
                  {uploading ? "Uploading…" : "Upload"}
                </button>
              </div>
            </div>
            {data.documents.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">No documents for this service yet.</p>
            ) : (
              <ul className="divide-y divide-outline-variant/30">
                {data.documents.map((doc) => (
                  <li key={doc.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      
                      <div className="min-w-0">
                        <p className="truncate text-body-sm text-on-surface">{doc.name}</p>
                        <p className="text-label-sm text-on-surface-variant">
                          {[doc.size, doc.uploaded_on, doc.status].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </div>
                    {doc.download_url ? (
                      <a
                        href={doc.download_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-label-sm font-medium text-primary hover:underline"
                      >
                        Download
                      </a>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-4 text-headline-sm font-semibold text-on-surface">Communication Hub</h2>
            <div className="space-y-4">
              {data.messages.length === 0 && (
                <p className="text-body-sm text-on-surface-variant">No messages yet. Start the conversation below.</p>
              )}
              {data.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "Client" ? "flex-row-reverse" : ""}`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-label-sm font-semibold text-primary">
                    {msg.author
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      msg.role === "Client"
                        ? "bg-primary-container text-on-primary"
                        : "bg-surface-container-low text-on-surface"
                    }`}
                  >
                    <p className="text-body-sm">{msg.message}</p>
                    <p
                      className={`mt-1 text-[11px] ${
                        msg.role === "Client" ? "text-on-primary/70" : "text-on-surface-variant"
                      }`}
                    >
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void sendMessage();
                }}
                placeholder="Type a message…"
                className="flex-1 rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-3 py-2.5 text-body-sm outline-none focus:border-primary-container"
              />
              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={sending || !message.trim()}
                className="rounded-lg bg-primary-container px-4 py-2.5 text-label-md font-medium text-on-primary hover:opacity-90 disabled:opacity-60"
              >
                {sending ? "…" : "Send"}
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-4 text-headline-sm font-semibold text-on-surface">Activity Timeline</h2>
            {data.activity.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">No activity yet.</p>
            ) : (
              <ul className="space-y-4 border-l border-outline-variant/40 pl-4">
                {data.activity.map((activity) => (
                  <li key={activity.id} className="relative">
                    <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary-container" />
                    <p className="text-body-sm text-on-surface">
                      <span className="font-medium">{activity.actor}</span> {activity.action}
                    </p>
                    <p className="text-label-sm text-on-surface-variant">{activity.timestamp}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-4 text-headline-sm font-semibold text-on-surface">Assigned Team</h2>
            {data.assigned_team.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">Manager will be assigned soon.</p>
            ) : (
              <ul className="space-y-3">
                {data.assigned_team.map((member) => (
                  <li key={member.id} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-fixed text-label-sm font-semibold text-primary">
                      {member.initials || "RM"}
                    </div>
                    <div>
                      <p className="text-body-sm font-medium text-on-surface">{member.name}</p>
                      <p className="text-label-sm text-on-surface-variant">{member.role}</p>
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="text-label-sm text-primary hover:underline">
                          {member.email}
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-3 text-headline-sm font-semibold text-on-surface">Billing</h2>
            {data.billing ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-body-sm">
                  <span className="text-on-surface-variant">{data.billing.number}</span>
                  <StatusBadge label={data.billing.status} />
                </div>
                <p className="text-headline-sm font-semibold text-on-surface">
                  {data.billing.amount_formatted}
                </p>
                <p className="text-label-sm text-on-surface-variant">
                  {data.billing.due_on ? `Due ${data.billing.due_on}` : "No due date"}
                </p>
                <Link
                  href="/invoices"
                  className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-primary-container py-2 text-label-md font-medium text-on-primary hover:opacity-90"
                >
                  View Invoice
                </Link>
              </div>
            ) : (
              <p className="text-body-sm text-on-surface-variant">No invoices linked to this service yet.</p>
            )}
          </section>

          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-4 text-headline-sm font-semibold text-on-surface">Meetings</h2>
            {data.meetings.length === 0 ? (
              <p className="mb-3 text-body-sm text-on-surface-variant">No meetings scheduled.</p>
            ) : (
              <ul className="space-y-3">
                {data.meetings.map((meeting) => (
                  <li key={meeting.id} className="rounded-lg border border-outline-variant/40 p-3">
                    <p className="text-body-sm font-medium text-on-surface">{meeting.title}</p>
                    <p className="text-label-sm text-on-surface-variant">
                      {meeting.date} · {meeting.time}
                    </p>
                    <p className="text-label-sm text-on-surface-variant">
                      {meeting.mode} with {meeting.with}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <Link
              href="/calendar"
              className="mt-3 flex items-center justify-center gap-2 rounded-lg border border-outline-variant/50 py-2 text-label-md font-medium text-on-surface hover:bg-surface-container-low"
            >
              
              View Calendar
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
