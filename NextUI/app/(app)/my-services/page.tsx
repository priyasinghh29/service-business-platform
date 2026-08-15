"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
  is_overdue: boolean;
  booking_number: string;
}

interface Deliverable {
  id: number;
  name: string;
  folder: string | null;
  download_url: string | null;
}

interface Activity {
  id: string;
  actor: string;
  action: string;
  timestamp: string;
}

interface MyServicesPayload {
  stats: {
    active: number;
    completed: number;
    pending: number;
    overdue: number;
    upcoming: number;
  };
  categories: string[];
  pipeline: string[];
  services: ServiceCard[];
  deliverables: Deliverable[];
  recent_activity: Activity[];
}

const statusFilters = ["All", "In Progress", "Review", "Completed", "Pending"] as const;

export default function MyServicesPage() {
  const [data, setData] = useState<MyServicesPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState<(typeof statusFilters)[number]>("All");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/my-services");
      setData((response.data?.data ?? response.data) as MyServicesPayload);
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ||
        (err as { message?: string })?.message ||
        "Failed to load services";
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const categories = useMemo(
    () => ["All Categories", ...(data?.categories ?? [])],
    [data?.categories]
  );

  const filtered = useMemo(() => {
    const list = data?.services ?? [];
    return list.filter((s) => {
      const categoryMatch = category === "All Categories" || s.category === category;
      const statusMatch =
        status === "All" ||
        s.status === status ||
        (status === "In Progress" && s.status_raw === "confirmed");
      return categoryMatch && statusMatch;
    });
  }, [data?.services, category, status]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-body-md text-on-surface-variant">Loading your services…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-8 text-center shadow-sm">
        <h1 className="font-display text-headline-md text-on-surface">Couldn’t load services</h1>
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

  const pipeline = data.pipeline?.length
    ? data.pipeline
    : ["Consult", "Proposal", "Submission", "Review", "Complete"];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-headline-lg font-semibold text-on-surface">My Services</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Track and manage every engagement with Oknitech Serve.
          </p>
        </div>
        <Link
          href="/book-consultation"
          className="flex items-center gap-2 rounded-lg bg-primary-container px-4 py-2.5 text-label-md font-medium text-on-primary hover:opacity-90"
        >
          
          Request New Service
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Active", value: data.stats.active, tone: "info" as const },
          { label: "Completed", value: data.stats.completed, tone: "success" as const },
          { label: "Pending", value: data.stats.pending, tone: "warning" as const },
          { label: "Overdue", value: data.stats.overdue, tone: "danger" as const },
          { label: "Upcoming", value: data.stats.upcoming, tone: "neutral" as const },
        ].map((chip) => (
          <div
            key={chip.label}
            className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 text-center shadow-sm"
          >
            <p className="font-display text-headline-md font-semibold text-on-surface">{chip.value}</p>
            <StatusBadge label={chip.label} tone={chip.tone} className="mt-2" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-4 shadow-sm">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-3 py-2 text-body-sm text-on-surface outline-none focus:border-primary-container"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatus(s)}
                  className={`rounded-lg px-3 py-2 text-label-md font-medium transition-colors ${
                    status === s
                      ? "bg-primary-fixed text-primary"
                      : "text-on-surface-variant hover:bg-surface-container-low"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {filtered.map((service) => {
              const currentIdx = pipeline.indexOf(service.stage);
              return (
                <div
                  key={service.id}
                  className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/my-services/${service.id}`}
                        className="text-headline-sm font-semibold text-on-surface hover:text-primary hover:underline"
                      >
                        {service.name}
                      </Link>
                      <p className="text-label-sm text-on-surface-variant">
                        {service.category} · {service.booking_number}
                        {service.is_overdue ? " · Overdue" : ""}
                      </p>
                    </div>
                    <StatusBadge label={service.status} />
                  </div>

                  <p className="mt-3 text-body-sm text-on-surface-variant">{service.description}</p>

                  <div className="mt-4 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-container-high">
                      <div
                        className="h-full rounded-full bg-primary-container"
                        style={{ width: `${service.progress}%` }}
                      />
                    </div>
                    <span className="text-label-sm font-medium text-on-surface-variant">
                      {service.progress}%
                    </span>
                  </div>

                  <div className="mt-5 flex items-center justify-between overflow-x-auto">
                    {pipeline.map((stage, idx) => {
                      const isDone = currentIdx >= 0 && (idx < currentIdx || service.stage === "Complete");
                      const isCurrent = stage === service.stage;
                      return (
                        <div key={stage} className="flex flex-1 items-center last:flex-none">
                          <div className="flex flex-col items-center gap-1.5">
                            <div
                              className={`flex h-7 w-7 items-center justify-center rounded-full text-label-sm font-semibold ${
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
                              className={`mx-1 h-0.5 flex-1 ${
                                isDone ? "bg-emerald-500" : "bg-surface-container-high"
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/30 pt-4 text-label-sm text-on-surface-variant">
                    <span>Owner: {service.owner}</span>
                    <span>Due: {service.due_date ?? "—"}</span>
                    <Link
                      href={`/my-services/${service.id}`}
                      className="flex items-center gap-1 font-medium text-primary hover:underline"
                    >
                      View Workspace
                      
                    </Link>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-outline-variant/50 bg-surface-container-lowest p-10 text-center text-body-sm text-on-surface-variant">
                {data.services.length === 0 ? (
                  <>
                    No services yet.{" "}
                    <Link href="/book-consultation" className="text-primary hover:underline">
                      Request a new service
                    </Link>
                  </>
                ) : (
                  "No services match the selected filters."
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-4 text-headline-sm font-semibold text-on-surface">Deliverables</h2>
            {data.deliverables.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">No deliverables yet.</p>
            ) : (
              <ul className="space-y-3">
                {data.deliverables.map((doc) => (
                  <li key={doc.id} className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body-sm text-on-surface">{doc.name}</p>
                      <p className="text-label-sm text-on-surface-variant">{doc.folder}</p>
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
            <h2 className="mb-4 text-headline-sm font-semibold text-on-surface">Recent Activity</h2>
            {data.recent_activity.length === 0 ? (
              <p className="text-body-sm text-on-surface-variant">No recent activity.</p>
            ) : (
              <ul className="space-y-4">
                {data.recent_activity.map((activity) => (
                  <li key={activity.id} className="flex gap-3">
                    <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-container" />
                    <div>
                      <p className="text-body-sm text-on-surface">
                        <span className="font-medium">{activity.actor}</span> {activity.action}
                      </p>
                      <p className="text-label-sm text-on-surface-variant">{activity.timestamp}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-4 text-headline-sm font-semibold text-on-surface">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                href="/documents"
                className="flex items-center gap-3 rounded-lg border border-outline-variant/50 px-3 py-2.5 text-label-md text-on-surface hover:bg-surface-container-low"
              >
                
                Upload Document
              </Link>
              <Link
                href="/calendar"
                className="flex items-center gap-3 rounded-lg border border-outline-variant/50 px-3 py-2.5 text-label-md text-on-surface hover:bg-surface-container-low"
              >
                
                Schedule Meeting
              </Link>
              <Link
                href="/support"
                className="flex items-center gap-3 rounded-lg border border-outline-variant/50 px-3 py-2.5 text-label-md text-on-surface hover:bg-surface-container-low"
              >
                
                Raise Ticket
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
