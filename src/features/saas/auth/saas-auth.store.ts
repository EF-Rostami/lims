import { create } from "zustand";
import { saasAuthApi, SaasUser, isMFARequired } from "./saas-auth.api";

export type SaasAuthStatus =
  | "checking"
  | "authenticated"
  | "unauthenticated"
  | "mfa_required";

interface SaasAuthState {
  accessToken: string | null;
  user: SaasUser | null;
  status: SaasAuthStatus;
  mfaToken: string | null;

  setAuth: (accessToken: string, user: SaasUser) => void;
  clearAuth: () => void;
  login: (email: string, password: string) => Promise<void>;
  verifyMfa: (code: string) => Promise<void>;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useSaasAuthStore = create<SaasAuthState>((set, get) => ({
  accessToken: null,
  user: null,
  status: "checking",
  mfaToken: null,

  setAuth: (accessToken, user) =>
    set({ accessToken, user, status: "authenticated", mfaToken: null }),

  clearAuth: () =>
    set({ accessToken: null, user: null, status: "unauthenticated", mfaToken: null }),

  login: async (email, password) => {
    const result = await saasAuthApi.login({ email, password });

    if (isMFARequired(result)) {
      set({ status: "mfa_required", mfaToken: result.mfa_token });
      return;
    }

    set({
      accessToken: result.access_token,
      user: result.user,
      status: "authenticated",
      mfaToken: null,
    });
  },

  verifyMfa: async (code) => {
    const mfaToken = get().mfaToken;
    if (!mfaToken) throw new Error("No MFA token available");
    const data = await saasAuthApi.verifyMfa(mfaToken, code);
    set({
      accessToken: data.access_token,
      user: data.user,
      status: "authenticated",
      mfaToken: null,
    });
  },

  refreshAuth: async () => {
    set({ status: "checking" });
    try {
      const response = await saasAuthApi.refresh();
      set({
        accessToken: response.access_token,
        user: response.user,
        status: "authenticated",
      });
    } catch {
      set({ accessToken: null, user: null, status: "unauthenticated" });
    }
  },

  logout: async () => {
    try {
      await saasAuthApi.logout();
    } finally {
      set({ accessToken: null, user: null, status: "unauthenticated", mfaToken: null });
    }
  },
}));
