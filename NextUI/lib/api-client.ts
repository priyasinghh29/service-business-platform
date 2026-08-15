import axios, { type InternalAxiosRequestConfig } from "axios";
import { getApiBaseUrl } from "@/lib/api-base";

export function clearAuthSessionAndNotify(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.dispatchEvent(new CustomEvent("auth:session-expired"));
}

function requestHadBearer(config: InternalAxiosRequestConfig | undefined): boolean {
  if (!config?.headers) return false;
  const h = config.headers;
  const auth =
    typeof h.get === "function"
      ? h.get("Authorization") ?? h.get("authorization")
      : (h as Record<string, unknown>).Authorization ??
        (h as Record<string, unknown>).authorization;
  return typeof auth === "string" && auth.startsWith("Bearer ");
}

export const API_REQUEST_TIMEOUT_MS = 30_000;

export const apiClient = axios.create({
  timeout: API_REQUEST_TIMEOUT_MS,
});

apiClient.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 && requestHadBearer(error.config) && typeof window !== "undefined") {
      clearAuthSessionAndNotify();
    }
    return Promise.reject(error);
  }
);
