export function getApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();

  if (typeof window !== "undefined") {
    if (configured?.startsWith("http")) {
      return configured.replace(/\/$/, "");
    }
    return "/api";
  }

  if (configured?.startsWith("/")) {
    const internal = (
      process.env.LARAVEL_INTERNAL_URL ?? "http://127.0.0.1:8000"
    ).replace(/\/$/, "");
    return `${internal}${configured}`.replace(/\/$/, "");
  }

  if (configured) {
    return configured.replace(/\/$/, "");
  }

  return "http://127.0.0.1:8000/api";
}

export function getStorageOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_LARAVEL_ORIGIN?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const api = process.env.NEXT_PUBLIC_API_URL?.trim() ?? "";
  if (api.startsWith("http")) {
    try {
      return new URL(api).origin;
    } catch {
      return "";
    }
  }

  return (process.env.LARAVEL_INTERNAL_URL ?? "http://127.0.0.1:8000").replace(
    /\/$/,
    ""
  );
}

export const getClientApiBase = getApiBaseUrl;

export async function parseJsonResponse<T>(res: Response): Promise<T> {
  return res.json() as Promise<T>;
}
