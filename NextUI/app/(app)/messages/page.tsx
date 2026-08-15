"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { getApiErrorMessage, unwrapData } from "@/lib/api-helpers";

interface Thread {
  booking_id: number;
  booking_number: string;
  service_name?: string | null;
  provider_name?: string | null;
  last_message?: string | null;
  last_message_at?: string | null;
  author_name?: string | null;
  sender_role?: string | null;
}

export default function MessagesPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/messages");
      const data = unwrapData<{ threads: Thread[] }>(res.data);
      setThreads(data.threads ?? []);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load messages"));
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-headline-lg text-on-surface">Messages</h1>
        <p className="mt-1 text-body-sm text-on-surface-variant">
          Conversations with your service providers and support team.
        </p>
      </div>

      {loading ? (
        <p className="text-body-md text-on-surface-variant">Loading messages…</p>
      ) : error ? (
        <p className="text-body-md text-rose-700">{error}</p>
      ) : threads.length === 0 ? (
        <div className="rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-8 text-center">
          <p className="text-body-md text-on-surface-variant">No conversations yet.</p>
          <p className="mt-2 text-body-sm text-on-surface-variant">
            Message your provider from an active booking engagement.
          </p>
          <Link href="/my-services" className="mt-4 inline-block text-primary hover:underline">
            Go to My Services
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-outline-variant/30 overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-lowest">
          {threads.map((thread) => (
            <li key={thread.booking_id}>
              <Link
                href={`/my-services/${thread.booking_id}`}
                className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-surface-container-low"
              >
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-on-surface">
                      {thread.service_name ?? thread.booking_number}
                    </p>
                    <span className="text-label-sm text-on-surface-variant">
                      {thread.last_message_at
                        ? new Date(thread.last_message_at).toLocaleString()
                        : ""}
                    </span>
                  </div>
                  <p className="text-label-sm text-on-surface-variant">
                    {thread.provider_name || thread.author_name || "Team"}
                    {thread.booking_number ? ` · ${thread.booking_number}` : ""}
                  </p>
                  <p className="mt-1 truncate text-body-sm text-on-surface-variant">
                    {thread.last_message}
                  </p>
                </div>
                
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
