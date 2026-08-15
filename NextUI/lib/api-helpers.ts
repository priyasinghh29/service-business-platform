import { getApiBaseUrl } from "@/lib/api-base";

export type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiEnvelope<T>).data;
  }
  return payload as T;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const err = error as {
    response?: { data?: { message?: string; errors?: Record<string, string[]> } };
    message?: string;
  };

  const errors = err.response?.data?.errors;
  if (errors) {
    const first = Object.values(errors).flat()[0];
    if (first) return first;
  }

  return err.response?.data?.message || err.message || fallback;
}

/** Server-side fetch helper for public endpoints. */
export async function fetchPublicApi<T>(path: string, init?: RequestInit): Promise<T | null> {
  const base = getApiBaseUrl();
  try {
    const res = await fetch(`${base}${path.startsWith("/") ? path : `/${path}`}`, {
      ...init,
      next: { revalidate: 60 },
      headers: {
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return unwrapData<T>(json);
  } catch {
    return null;
  }
}

export function formatMoney(amount: number | string | null | undefined, currency = "INR"): string {
  const value = typeof amount === "string" ? Number(amount) : amount ?? 0;
  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number.isFinite(value) ? value : 0);
  } catch {
    return `₹${Number(value || 0).toFixed(2)}`;
  }
}

export function toBookingTime(label: string): string {
  const match = label.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) {
    if (/^\d{2}:\d{2}$/.test(label.trim())) return label.trim();
    return "10:00";
  }
  let hour = Number(match[1]);
  const minute = match[2];
  const period = match[3].toUpperCase();
  if (period === "PM" && hour < 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${minute}`;
}

export function tomorrowIsoDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
