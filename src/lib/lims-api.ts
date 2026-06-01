import axios from "axios";
import { useLimsAuthStore } from "@/features/lims-auth/lims-auth.store";

export function extractPage<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object" && "data" in payload && Array.isArray((payload as { data: unknown }).data)) {
    return (payload as { data: T[] }).data;
  }
  return [];
}

export const limsApi = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL_LIMS ||
    "http://127.0.0.1:8000/api/v1/lims",
  withCredentials: true,
});

limsApi.interceptors.request.use((config) => {
  const { accessToken, tenantSchema } = useLimsAuthStore.getState();

  const schema =
    tenantSchema ||
    (typeof window !== "undefined"
      ? sessionStorage.getItem("lims_tenant_schema")
      : null);

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (schema) {
    config.headers["x-tenant-schema"] = schema;
  }

  return config;
});

limsApi.interceptors.response.use(
  (response) => {
    // Unwrap backend ApiResponse envelope: { success: true, data: T, meta?: ... }
    if (
      response.data &&
      typeof response.data === "object" &&
      "success" in response.data &&
      response.data.success === true &&
      "data" in response.data
    ) {
      const { data, meta } = response.data;
      // Paginated responses: spread meta fields (page, page_size, total, total_pages) alongside data
      response.data = meta && typeof meta === "object" ? { ...meta, data } : data;
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    const excluded =
      originalRequest?.url?.includes("/auth/login") ||
      originalRequest?.url?.includes("/auth/refresh");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !excluded
    ) {
      originalRequest._retry = true;

      try {
        await useLimsAuthStore.getState().refreshAuth();

        const token = useLimsAuthStore.getState().accessToken;

        if (token) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }

        return limsApi(originalRequest);
      } catch {
        await useLimsAuthStore.getState().logout();
      }
    }

    return Promise.reject(error);
  }
);