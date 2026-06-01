/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { useSaasAuthStore } from "@/features/saas/auth/saas-auth.store";

export const saasApi = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_SAAS_API_URL ||
    "http://localhost:8000/api/v1/global",
  withCredentials: true,
});


saasApi.interceptors.request.use((config) => {
  const accessToken = useSaasAuthStore.getState().accessToken;

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  } else if (!config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

export default saasApi;

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

saasApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/saas/auth/login") &&
      !originalRequest.url?.includes("/saas/auth/refresh")
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve,
            reject,
          });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return saasApi(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const res = await saasApi.post("/saas/auth/refresh");

        const newToken = res.data.access_token;

        useSaasAuthStore.getState().setAuth(
          newToken,
          res.data.user
        );

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return saasApi(originalRequest);
      } catch (err) {
        processQueue(err, null);

        useSaasAuthStore.getState().clearAuth();

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);