import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  withCredentials: true,
});

/**
 * REQUEST INTERCEPTOR
 * 1. Attaches the JWT from Zustand safely
 * 2. Injects critical tenant schema context for SQLAlchemy translation mapping
 * 3. Handles Dynamic Content-Types for LIMS File Uploads
 */
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  
  // FIX 1: Do NOT throw an error here if a token is absent!
  // This allows unauthenticated calls (like /login or public workspace fetching) to proceed.
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // FIX 2: Dynamic multi-tenant mapping header assignment
  // Pulls the selected schema name right out of local storage if in the browser
  const savedSchema = typeof window !== "undefined" ? localStorage.getItem("selected_tenant_schema") : null;
  if (savedSchema) {
    // Inject both standard casing styles to guarantee middleware extraction success
    config.headers["x-tenant-schema"] = savedSchema;
    config.headers["X-Tenant-Schema"] = savedSchema;
  }

  // Handle PDF/Image Upload states dynamically
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else if (!config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

/**
 * RESPONSE INTERCEPTOR
 * 1. Safely catches 401s and executes an authenticated silent token refresh
 * 2. Gracefully isolates authentication/discovery paths to prevent loops
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 422) {
      console.error("❌ LIMS Validation Error:", error.response.data.detail);
    }
    
    const originalRequest = error.config;

    // Define paths that must NEVER trigger background token refreshes
    const publicExclusions = ["/auth/login", "/auth/refresh", "/public/workplaces"];
    const isExcluded = publicExclusions.some((path) => originalRequest.url?.includes(path));

    // Guard: Fail instantly on public routes to protect the app loop
    if (error.response?.status === 401 && isExcluded) {
      return Promise.reject(error);
    }

    // Handle session expirations via refresh tokens
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const savedSchema = typeof window !== "undefined" ? localStorage.getItem("selected_tenant_schema") : "";

        // Send refresh with the exact tenant context required by the backend
        const { data } = await axios.post(
          `${apiClient.defaults.baseURL}/lims/auth/refresh`,
          {},
          {
            withCredentials: true,
            headers: {
              "x-tenant-schema": savedSchema,
              "X-Tenant-Schema": savedSchema,
            },
          }
        );

        const newToken = data.access_token;
        useAuthStore.getState().setAccessToken(newToken);

        // Bind the fresh properties onto the original failed layout request and retry
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        originalRequest.headers["x-tenant-schema"] = savedSchema;
        return apiClient(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        if (typeof window !== "undefined") {
          window.location.href = "/login?reason=session_expired";
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;