import { create } from "zustand";
import { saasAuthApi, SaasUser } from "./saas-auth.api";

export type SaasAuthStatus =
  | "checking"
  | "authenticated"
  | "unauthenticated";

interface SaasAuthState {
  accessToken: string | null;
  user: SaasUser | null;
  status: SaasAuthStatus;

  setAuth: (accessToken: string, user: SaasUser) => void;
  clearAuth: () => void;
  login: (email: string, password: string) => Promise<void>;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useSaasAuthStore = create<SaasAuthState>((set) => ({
  accessToken: null,
  user: null,
  status: "checking",

  setAuth: (accessToken, user) =>
    set({
      accessToken,
      user,
      status: "authenticated",
    }),

  clearAuth: () =>
    set({
      accessToken: null,
      user: null,
      status: "unauthenticated",
    }),

  login: async (email, password) => {
    const data = await saasAuthApi.login({ email, password });

    set({
      accessToken: data.access_token,
      user: data.user,
      status: "authenticated",
    });
  },


  refreshAuth: async () => {
  // console.log("🔥 refreshAuth started");

  set({ status: "checking" });

  try {
    // console.log("🚀 Calling SaaS refresh API");

    const response = await saasAuthApi.refresh();

    // console.log("✅ SaaS refresh success", response);

    set({
      accessToken: response.access_token,
      user: response.user,
      status: "authenticated",
    });
  } catch (error) {
    console.error("❌ SaaS refresh failed", error);

    set({
      accessToken: null,
      user: null,
      status: "unauthenticated",
    });
  }
},

  logout: async () => {
    try {
      await saasAuthApi.logout();
    } finally {
      set({
        accessToken: null,
        user: null,
        status: "unauthenticated",
      });
    }
  },
}));