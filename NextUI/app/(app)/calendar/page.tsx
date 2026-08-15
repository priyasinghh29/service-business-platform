"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/api-client";
import StatusBadge from "@/components/portal/StatusBadge";

interface CalEvent {
  id: number | string;
  source: "calendar" | "booking";
  booking_id?: number | null;
  title: string;
  type: "meeting" | "deadline" | "rsvp";
  date: string;
  day: number;
  month_short: string;
  time: string | null;
  with: string | null;
  mode: string | null;
  priority: string | null;
  rsvp_status: string | null;
  date_label: string;
  notes?: string | null;
}

interface CalendarVault {
  year: number;
  month: number;
  month_label: string;
  today: string;
  today_day: number;
  is_current_month: boolean;
  events: CalEvent[];
  today_schedule: CalEvent[];
  upcoming_meetings: CalEvent[];
  deadlines: CalEvent[];
  pending_rsvps: CalEvent[];
  integrations: Array<{ id: string; name: string; connected: boolean }>;
}

type DayEvent = { day: number; type: CalEvent["type"]; label: string; id: string | number };

const dotColor: Record<CalEvent["type"], string> = {
  meeting: "bg-primary-container",
  deadline: "bg-rose-500",
  rsvp: "bg-amber-500",
};

const views = ["Day", "Week", "Month", "Agenda"] as const;

function buildMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function shiftMonth(year: number, month: number, delta: number) {
  const d = new Date(year, month - 1 + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
}

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [view, setView] = useState<(typeof views)[number]>("Month");
  const [selectedDay, setSelectedDay] = useState<number | null>(now.getDate());

  const [data, setData] = useState<CalendarVault | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [flashError, setFlashError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState<"meeting" | "deadline" | "rsvp">("meeting");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("14:00");
  const [withName, setWithName] = useState("");
  const [mode, setMode] = useState("Video Call");
  const [priority, setPriority] = useState("Medium");

  const load = useCallback(async (y: number, m: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/calendar", { params: { year: y, month: m } });
      const payload = (response.data?.data ?? response.data) as CalendarVault;
      setData(payload);
      if (payload.is_current_month) {
        setSelectedDay(payload.today_day);
      } else if (selectedDay == null) {
        setSelectedDay(1);
      }
    } catch (err) {
      setError(
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data
          ?.message ||
          (err as { message?: string })?.message ||
          "Failed to load calendar"
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedDay]);

  useEffect(() => {
    void load(year, month);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  const notify = (ok?: string, err?: string) => {
    setFlash(ok ?? null);
    setFlashError(err ?? null);
  };

  const monthEvents: DayEvent[] = useMemo(() => {
    if (!data) return [];
    return data.events
      .filter((e) => e.rsvp_status !== "declined")
      .map((e) => ({
        day: e.day,
        type: e.type === "rsvp" && e.rsvp_status === "pending" ? "rsvp" : e.type === "deadline" ? "deadline" : e.type === "rsvp" ? "meeting" : e.type,
        label: e.title,
        id: e.id,
      }));
  }, [data]);

  const cells = buildMonthGrid(year, month);

  const dayEvents = useMemo(() => {
    if (!data || selectedDay == null) return [];
    return data.events.filter(
      (e) => e.day === selectedDay && e.rsvp_status !== "declined"
    );
  }, [data, selectedDay]);

  const weekStartDay = useMemo(() => {
    if (selectedDay == null) return 1;
    const dow = new Date(year, month - 1, selectedDay).getDay();
    return Math.max(1, selectedDay - dow);
  }, [year, month, selectedDay]);

  const weekDays = useMemo(() => {
    const daysInMonth = new Date(year, month, 0).getDate();
    return Array.from({ length: 7 }, (_, i) => {
      const d = weekStartDay + i;
      return d <= daysInMonth ? d : null;
    });
  }, [year, month, weekStartDay]);

  const respondRsvp = async (id: number | string, response: "accept" | "decline") => {
    if (typeof id !== "number") return;
    setBusy(true);
    notify();
    try {
      await apiClient.post(`/calendar/events/${id}/rsvp`, { response });
      notify(response === "accept" ? "Invitation accepted" : "Invitation declined");
      await load(year, month);
    } catch (err) {
      notify(
        undefined,
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Could not update RSVP"
      );
    } finally {
      setBusy(false);
    }
  };

  const toggleIntegration = async (provider: string) => {
    setBusy(true);
    notify();
    try {
      const response = await apiClient.post(`/calendar/integrations/${provider}/toggle`);
      const item = (response.data?.data ?? response.data) as { connected: boolean; name: string };
      notify(item.connected ? `${item.name} connected` : `${item.name} disconnected`);
      await load(year, month);
    } catch (err) {
      notify(
        undefined,
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Could not update integration"
      );
    } finally {
      setBusy(false);
    }
  };

  const createEvent = async () => {
    if (!title.trim() || !eventDate) return;
    setBusy(true);
    notify();
    try {
      await apiClient.post("/calendar/events", {
        title: title.trim(),
        type: eventType,
        event_date: eventDate,
        event_time: eventType === "deadline" ? null : eventTime || null,
        with_name: withName.trim() || null,
        mode: eventType === "deadline" ? null : mode,
        priority: eventType === "deadline" ? priority : null,
      });
      setShowCreate(false);
      setTitle("");
      setWithName("");
      notify("Event added");
      const d = new Date(eventDate + "T00:00:00");
      setYear(d.getFullYear());
      setMonth(d.getMonth() + 1);
      setSelectedDay(d.getDate());
      await load(d.getFullYear(), d.getMonth() + 1);
    } catch (err) {
      notify(
        undefined,
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Could not create event"
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-body-md text-on-surface-variant">Loading calendar…</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-8 text-center shadow-sm">
        <h1 className="font-display text-headline-md text-on-surface">Couldn’t load calendar</h1>
        <p className="mt-2 text-body-sm text-on-surface-variant">{error}</p>
        <button
          type="button"
          onClick={() => void load(year, month)}
          className="mt-5 rounded-lg bg-primary-container px-4 py-2 text-label-md font-medium text-on-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  const vault = data!;

  return (
    <div className="space-y-6">
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
          <h1 className="font-display text-headline-lg font-semibold text-on-surface">Calendar</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Meetings, deadlines, and engagements at a glance.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const pad = (n: number) => String(n).padStart(2, "0");
              setEventDate(
                `${year}-${pad(month)}-${pad(selectedDay ?? vault.today_day)}`
              );
              setEventType("meeting");
              setShowCreate(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-primary-container px-4 py-2.5 text-label-md font-medium text-on-primary hover:opacity-90"
          >
            
            Add Event
          </button>
          <div className="flex items-center gap-1 rounded-lg border border-outline-variant/50 bg-surface-container-lowest p-1">
            {views.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={`rounded-md px-3 py-1.5 text-label-md font-medium transition-colors ${
                  view === v
                    ? "bg-primary-fixed text-primary"
                    : "text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-headline-sm font-semibold text-on-surface">
                {vault.month_label}
                {loading && (
                  <span className="ml-2 text-label-sm font-normal text-on-surface-variant">
                    Updating…
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const next = shiftMonth(year, month, -1);
                    setYear(next.year);
                    setMonth(next.month);
                  }}
                  className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low"
                  aria-label="Previous month"
                >
                  
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const n = new Date();
                    setYear(n.getFullYear());
                    setMonth(n.getMonth() + 1);
                    setSelectedDay(n.getDate());
                  }}
                  className="rounded-lg px-2 py-1.5 text-label-sm text-on-surface-variant hover:bg-surface-container-low"
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = shiftMonth(year, month, 1);
                    setYear(next.year);
                    setMonth(next.month);
                  }}
                  className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-container-low"
                  aria-label="Next month"
                >
                  
                </button>
              </div>
            </div>

            {view === "Agenda" && (
              <ul className="divide-y divide-outline-variant/30">
                {monthEvents.length === 0 ? (
                  <li className="py-6 text-center text-body-sm text-on-surface-variant">
                    No events this month.
                  </li>
                ) : (
                  monthEvents.map((event) => (
                    <li key={`${event.id}-${event.day}`} className="flex items-center gap-4 py-3">
                      <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-primary-fixed text-primary">
                        <span className="text-label-sm font-semibold leading-none">{event.day}</span>
                        <span className="text-[10px] uppercase leading-none">
                          {vault.month_label.slice(0, 3)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-body-sm font-medium text-on-surface">
                          {event.label}
                        </p>
                        <p className="text-label-sm capitalize text-on-surface-variant">
                          {event.type}
                        </p>
                      </div>
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotColor[event.type]}`} />
                    </li>
                  ))
                )}
              </ul>
            )}

            {view === "Day" && (
              <div>
                <p className="mb-3 text-body-sm text-on-surface-variant">
                  {selectedDay
                    ? new Date(year, month - 1, selectedDay).toLocaleDateString("en-IN", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })
                    : "Select a day"}
                </p>
                <ul className="space-y-3">
                  {dayEvents.length === 0 ? (
                    <li className="text-body-sm text-on-surface-variant">No events on this day.</li>
                  ) : (
                    dayEvents.map((e) => (
                      <li
                        key={String(e.id)}
                        className="flex items-center gap-3 rounded-lg border border-outline-variant/40 px-4 py-3"
                      >
                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotColor[e.type]}`} />
                        <div className="min-w-0 flex-1">
                          <p className="text-body-sm font-medium text-on-surface">{e.title}</p>
                          <p className="text-label-sm text-on-surface-variant">
                            {[e.time, e.mode, e.with ? `with ${e.with}` : null]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        </div>
                        <StatusBadge
                          label={e.type === "deadline" ? e.priority || "Deadline" : e.type}
                        />
                      </li>
                    ))
                  )}
                </ul>
              </div>
            )}

            {view === "Week" && (
              <div className="grid grid-cols-7 gap-1">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div
                    key={d}
                    className="pb-2 text-center text-label-sm font-medium text-on-surface-variant"
                  >
                    {d}
                  </div>
                ))}
                {weekDays.map((day, idx) => {
                  const isToday =
                    vault.is_current_month && day === vault.today_day;
                  const events = day
                    ? monthEvents.filter((e) => e.day === day)
                    : [];
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={!day}
                      onClick={() => day && setSelectedDay(day)}
                      className={`min-h-[90px] rounded-lg border p-1.5 text-left ${
                        day ? "border-outline-variant/30" : "border-transparent"
                      } ${isToday ? "bg-primary-fixed" : ""} ${
                        day === selectedDay ? "ring-1 ring-primary-container" : ""
                      }`}
                    >
                      {day && (
                        <>
                          <span
                            className={`text-label-sm ${
                              isToday ? "font-semibold text-primary" : "text-on-surface"
                            }`}
                          >
                            {day}
                          </span>
                          <div className="mt-1 space-y-0.5">
                            {events.slice(0, 3).map((e) => (
                              <div
                                key={`${e.id}-${e.label}`}
                                className="flex items-center gap-1 truncate text-[10px] text-on-surface-variant"
                              >
                                <span
                                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColor[e.type]}`}
                                />
                                <span className="truncate">{e.label}</span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {view === "Month" && (
              <>
                <div className="grid grid-cols-7 gap-1 pb-2 text-center text-label-sm font-medium text-on-surface-variant">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d}>{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {cells.map((day, idx) => {
                    const isToday =
                      vault.is_current_month && day === vault.today_day;
                    const events = day
                      ? monthEvents.filter((e) => e.day === day)
                      : [];
                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={!day}
                        onClick={() => day && setSelectedDay(day)}
                        className={`min-h-[76px] rounded-lg border p-1.5 text-left ${
                          day ? "border-outline-variant/30" : "border-transparent"
                        } ${isToday ? "bg-primary-fixed" : "bg-transparent"} ${
                          day === selectedDay ? "ring-1 ring-primary-container" : ""
                        }`}
                      >
                        {day && (
                          <>
                            <span
                              className={`text-label-sm ${
                                isToday ? "font-semibold text-primary" : "text-on-surface"
                              }`}
                            >
                              {day}
                            </span>
                            <div className="mt-1 space-y-0.5">
                              {events.slice(0, 2).map((e) => (
                                <div
                                  key={`${e.id}-${e.label}`}
                                  className="flex items-center gap-1 truncate text-[10px] text-on-surface-variant"
                                >
                                  <span
                                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotColor[e.type]}`}
                                  />
                                  <span className="truncate">{e.label}</span>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </section>

          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-4 text-headline-sm font-semibold text-on-surface">
              Today&apos;s Schedule
            </h2>
            <ul className="space-y-3">
              {vault.today_schedule.map((m) => (
                <li
                  key={String(m.id)}
                  className="flex items-center gap-4 rounded-lg border border-outline-variant/40 px-4 py-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-fixed text-primary">
                    
                  </div>
                  <div className="flex-1">
                    <p className="text-body-sm font-medium text-on-surface">{m.title}</p>
                    <p className="text-label-sm text-on-surface-variant">
                      {[m.time, m.mode, m.with ? `with ${m.with}` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                </li>
              ))}
              {vault.today_schedule.length === 0 && (
                <p className="text-body-sm text-on-surface-variant">
                  No meetings scheduled for today.
                </p>
              )}
            </ul>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-4 text-headline-sm font-semibold text-on-surface">
              Upcoming Meetings
            </h2>
            <ul className="space-y-3">
              {vault.upcoming_meetings.length === 0 ? (
                <li className="text-body-sm text-on-surface-variant">No upcoming meetings.</li>
              ) : (
                vault.upcoming_meetings.map((m) => (
                  <li
                    key={String(m.id)}
                    className="rounded-lg border border-outline-variant/40 p-3.5"
                  >
                    <p className="text-body-sm font-medium text-on-surface">{m.title}</p>
                    <p className="text-label-sm text-on-surface-variant">
                      {m.date_label}
                      {m.time ? ` · ${m.time}` : ""}
                    </p>
                    <p className="text-label-sm text-on-surface-variant">
                      {[m.mode, m.with ? `with ${m.with}` : null].filter(Boolean).join(" ")}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-4 text-headline-sm font-semibold text-on-surface">Deadlines</h2>
            <ul className="space-y-3">
              {vault.deadlines.length === 0 ? (
                <li className="text-body-sm text-on-surface-variant">No upcoming deadlines.</li>
              ) : (
                vault.deadlines.map((d) => (
                  <li key={String(d.id)} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-body-sm font-medium text-on-surface">{d.title}</p>
                      <p className="text-label-sm text-on-surface-variant">{d.date_label}</p>
                    </div>
                    {d.priority && <StatusBadge label={d.priority} />}
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-4 text-headline-sm font-semibold text-on-surface">Pending RSVPs</h2>
            <ul className="space-y-3">
              {vault.pending_rsvps.length === 0 ? (
                <li className="text-body-sm text-on-surface-variant">No pending invitations.</li>
              ) : (
                vault.pending_rsvps.map((r) => (
                  <li
                    key={String(r.id)}
                    className="rounded-lg border border-outline-variant/40 p-3.5"
                  >
                    <p className="text-body-sm font-medium text-on-surface">{r.title}</p>
                    <p className="mb-2 text-label-sm text-on-surface-variant">
                      {r.date_label}
                      {r.time ? ` · ${r.time}` : ""}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void respondRsvp(r.id, "accept")}
                        className="flex-1 rounded-lg bg-primary-container py-1.5 text-label-sm font-medium text-on-primary hover:opacity-90 disabled:opacity-60"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => void respondRsvp(r.id, "decline")}
                        className="flex-1 rounded-lg border border-outline-variant/50 py-1.5 text-label-sm font-medium text-on-surface hover:bg-surface-container-low disabled:opacity-60"
                      >
                        Decline
                      </button>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </section>

          <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 shadow-sm">
            <h2 className="mb-4 text-headline-sm font-semibold text-on-surface">
              Calendar Integrations
            </h2>
            <ul className="space-y-3">
              {vault.integrations.map((ci) => (
                <li key={ci.id} className="flex items-center justify-between">
                  <span className="text-body-sm text-on-surface">{ci.name}</span>
                  {ci.connected ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void toggleIntegration(ci.id)}
                      className="text-left"
                    >
                      <StatusBadge label="Connected" tone="success" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void toggleIntegration(ci.id)}
                      className="text-label-sm font-medium text-primary hover:underline disabled:opacity-60"
                    >
                      Connect
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-xl">
            <h3 className="font-display text-headline-sm text-on-surface">Add Event</h3>
            <div className="mt-4 space-y-3">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-body-sm outline-none focus:border-primary-container"
              />
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as typeof eventType)}
                className="w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-body-sm outline-none focus:border-primary-container"
              >
                <option value="meeting">Meeting</option>
                <option value="deadline">Deadline</option>
                <option value="rsvp">Invitation (RSVP)</option>
              </select>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-body-sm outline-none focus:border-primary-container"
              />
              {eventType !== "deadline" && (
                <>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    className="w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-body-sm outline-none focus:border-primary-container"
                  />
                  <input
                    value={withName}
                    onChange={(e) => setWithName(e.target.value)}
                    placeholder="With (optional)"
                    className="w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-body-sm outline-none focus:border-primary-container"
                  />
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-full rounded-lg border border-outline-variant/50 px-3 py-2 text-body-sm outline-none focus:border-primary-container"
                  >
                    {["Video Call", "Phone Call", "In Person", "Workshop"].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </>
              )}
              {eventType === "deadline" && (
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
              )}
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-lg border border-outline-variant/50 px-4 py-2 text-label-md"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy || !title.trim() || !eventDate}
                onClick={() => void createEvent()}
                className="rounded-lg bg-primary-container px-4 py-2 text-label-md font-medium text-on-primary disabled:opacity-60"
              >
                {busy ? "Saving…" : "Save event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
