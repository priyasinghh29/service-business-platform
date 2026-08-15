"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";

interface NotificationItem {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  read: boolean;
  action_required: boolean;
  action_label: string | null;
  action_href: string | null;
  group: string;
  time: string;
}

interface NotificationsVault {
  stats: {
    unread: number;
    today: number;
    action_required: number;
    high_priority: number;
  };
  categories: string[];
  notifications: NotificationItem[];
  deadlines: Array<{ id: number; title: string; date: string; priority: string | null }>;
  next_meeting: {
    id: number;
    title: string;
    date: string;
    time: string | null;
    mode: string | null;
    with: string | null;
  } | null;
  account_health: {
    score: number;
    label: string;
    notes: string;
  };
}

const groupOrder = ["Today", "Yesterday", "This Week", "Earlier"] as const;

const categoryIcon: Record<string, string> = {
  Service: "work",
  Invoice: "payments",
  Document: "folder_shared",
  Meeting: "calendar_today",
  System: "settings",
};

export default function NotificationsPage() {
  const [data, setData] = useState<NotificationsVault | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [category, setCategory] = useState("All");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/notifications");
      const payload = (response.data?.data ?? response.data) as NotificationsVault;
      setData(payload);
    } catch (err) {
      setError(
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ||
          (err as { message?: string })?.message ||
          "Failed to load notifications"
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return category === "All"
      ? data.notifications
      : data.notifications.filter((n) => n.category === category);
  }, [data, category]);

  const grouped = groupOrder.map((group) => ({
    group,
    items: filtered.filter((n) => n.group === group),
  }));

  const markAllRead = async () => {
    setBusy(true);
    setFlash(null);
    try {
      await apiClient.post("/notifications/read-all");
      setFlash("All notifications marked as read");
      await load();
    } catch (err) {
      setFlash(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Could not mark all as read"
      );
    } finally {
      setBusy(false);
    }
  };

  const markOneRead = async (id: number, alreadyRead: boolean) => {
    if (alreadyRead) return;
    try {
      await apiClient.post(`/notifications/${id}/read`);
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          notifications: prev.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
          stats: {
            ...prev.stats,
            unread: Math.max(0, prev.stats.unread - 1),
          },
        };
      });
    } catch {
      // non-blocking
    }
  };

  if (loading && !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-body-md text-on-surface-variant">Loading notifications…</p>
      </div>
    );
  }

  if ((error || !data) && !loading) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-8 text-center shadow-sm">
        <h1 className="font-display text-headline-md text-on-surface">
          Couldn’t load notifications
        </h1>
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

  const vault = data!;
  const categories = vault.categories?.length
    ? vault.categories
    : ["All", "Service", "Invoice", "Document", "Meeting", "System"];

  return (
    <div className="space-y-6">
      {flash && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-body-sm text-emerald-800">
          {flash}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-headline-lg font-semibold text-on-surface">
            Notifications
          </h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Stay on top of everything happening with your services.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            disabled={busy || vault.stats.unread === 0}
            onClick={() => void markAllRead()}
            className="flex items-center gap-2 rounded-lg border border-outline-variant/50 px-4 py-2.5 text-label-md font-medium text-on-surface hover:bg-surface-container-low disabled:opacity-60"
          >
            
            Mark All as Read
          </button>
          <Link
            href="/settings"
            className="flex items-center gap-2 rounded-lg bg-primary-container px-4 py-2.5 text-label-md font-medium text-on-primary hover:opacity-90"
          >
            
            Preferences
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Unread", value: vault.stats.unread },
          { label: "Today", value: vault.stats.today },
          { label: "Action Required", value: vault.stats.action_required },
          { label: "High Priority", value: vault.stats.high_priority },
        ].map((chip) => (
          <div
            key={chip.label}
            className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 text-center shadow-sm"
          >
            <p className="font-display text-headline-md font-semibold text-on-surface">
              {chip.value}
            </p>
            <p className="mt-1 text-label-sm text-on-surface-variant">{chip.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-2 shadow-sm">
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-lg px-3.5 py-2 text-label-md font-medium transition-colors ${
              category === c
                ? "bg-primary-fixed text-primary"
                : "text-on-surface-variant hover:bg-surface-container-low"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          {grouped.map(
            (section) =>
              section.items.length > 0 && (
                <section
                  key={section.group}
                  className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm"
                >
                  <h2 className="mb-4 text-headline-sm font-semibold text-on-surface">
                    {section.group}
                  </h2>
                  <ul className="divide-y divide-outline-variant/30">
                    {section.items.map((n) => (
                      <li
                        key={n.id}
                        className={`flex cursor-pointer items-start gap-3 py-3.5 ${
                          !n.read ? "bg-primary-fixed/30 -mx-2 rounded-lg px-2" : ""
                        }`}
                        onClick={() => void markOneRead(n.id, n.read)}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p
                              className={`text-body-sm ${
                                !n.read ? "font-semibold" : "font-medium"
                              } text-on-surface`}
                            >
                              {n.title}
                            </p>
                            {!n.read && (
                              <span className="h-2 w-2 shrink-0 rounded-full bg-primary-container" />
                            )}
                          </div>
                          <p className="mt-0.5 text-body-sm text-on-surface-variant">
                            {n.description}
                          </p>
                          <div className="mt-2 flex items-center gap-3">
                            <span className="text-label-sm text-on-surface-variant">{n.time}</span>
                            {n.action_label && n.action_href && (
                              <Link
                                href={n.action_href}
                                onClick={(e) => e.stopPropagation()}
                                className="text-label-sm font-medium text-primary hover:underline"
                              >
                                {n.action_label}
                              </Link>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )
          )}

          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-outline-variant/50 bg-surface-container-lowest p-10 text-center text-body-sm text-on-surface-variant">
              No notifications in this category.
            </div>
          )}
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-4 text-headline-sm font-semibold text-on-surface">
              Upcoming Deadlines
            </h2>
            <ul className="space-y-3">
              {vault.deadlines.length === 0 ? (
                <li className="text-body-sm text-on-surface-variant">No upcoming deadlines.</li>
              ) : (
                vault.deadlines.map((d) => (
                  <li key={d.id} className="flex items-center justify-between gap-2">
                    <span className="text-body-sm text-on-surface">{d.title}</span>
                    <span className="text-label-sm text-on-surface-variant">{d.date}</span>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-3 text-headline-sm font-semibold text-on-surface">Next Meeting</h2>
            {vault.next_meeting ? (
              <div>
                <p className="text-body-sm font-medium text-on-surface">
                  {vault.next_meeting.title}
                </p>
                <p className="text-label-sm text-on-surface-variant">
                  {vault.next_meeting.date}
                  {vault.next_meeting.time ? ` · ${vault.next_meeting.time}` : ""}
                </p>
                <p className="text-label-sm text-on-surface-variant">
                  {[vault.next_meeting.mode, vault.next_meeting.with ? `with ${vault.next_meeting.with}` : null]
                    .filter(Boolean)
                    .join(" ")}
                </p>
                <Link
                  href="/calendar"
                  className="mt-2 inline-block text-label-sm font-medium text-primary hover:underline"
                >
                  Open calendar
                </Link>
              </div>
            ) : (
              <p className="text-body-sm text-on-surface-variant">No upcoming meetings.</p>
            )}
          </section>

          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-3 text-headline-sm font-semibold text-on-surface">Account Health</h2>
            <div className="flex items-center gap-4">
              <div
                className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full"
                style={{
                  background: `conic-gradient(#0052ff ${vault.account_health.score * 3.6}deg, #dce9ff 0deg)`,
                }}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-lowest text-label-sm font-semibold text-on-surface">
                  {vault.account_health.score}
                </div>
              </div>
              <div>
                <p className="text-body-sm font-semibold text-on-surface">
                  {vault.account_health.label}
                </p>
                <p className="text-label-sm text-on-surface-variant">
                  {vault.account_health.notes}
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
