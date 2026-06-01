import { create } from "zustand";
import { limsAuthApi, LimsUserMetadata } from "./lims-auth.api";

type AuthStatus = "checking" | "authenticated" | "unauthenticated";

interface LimsAuthState {
  accessToken: string | null;
  user: LimsUserMetadata | null;
  tenantSchema: string | null;
  status: AuthStatus;

  setAccessToken: (token: string | null) => void;
  setUser: (user: LimsUserMetadata | null) => void;

  login: (email: string, password: string, tenantSchema: string) => Promise<void>;
  refreshAuth: () => Promise<void>;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useLimsAuthStore = create<LimsAuthState>((set, get) => ({
  accessToken: null,
  user: null,
  tenantSchema: null,
  status: "checking",

  setAccessToken: (token) => set({ accessToken: token }),

  setUser: (user) => set({ user }),

  login: async (email, password, tenantSchema) => {
    sessionStorage.setItem("lims_tenant_schema", tenantSchema);

    const loginResponse = await limsAuthApi.login(email, password, tenantSchema);

    set({
      accessToken: loginResponse.access_token,
      tenantSchema,
      status: "checking",
    });

    const user = await limsAuthApi.me(loginResponse.access_token, tenantSchema);

    set({
      user,
      status: "authenticated",
    });
  },

  refreshAuth: async () => {
    const tenantSchema =
      get().tenantSchema || sessionStorage.getItem("lims_tenant_schema");

    if (!tenantSchema) {
      set({
        accessToken: null,
        user: null,
        tenantSchema: null,
        status: "unauthenticated",
      });
      return;
    }

    try {
      const refreshResponse = await limsAuthApi.refresh(tenantSchema);

      set({
        accessToken: refreshResponse.access_token,
        tenantSchema,
      });

      const user = await limsAuthApi.me(
        refreshResponse.access_token,
        tenantSchema
      );

      set({
        user,
        status: "authenticated",
      });
    } catch {
      sessionStorage.removeItem("lims_tenant_schema");

      set({
        accessToken: null,
        user: null,
        tenantSchema: null,
        status: "unauthenticated",
      });
    }
  },

  fetchMe: async () => {
    const { accessToken, tenantSchema } = get();

    if (!accessToken || !tenantSchema) {
      set({ status: "unauthenticated" });
      return;
    }

    const user = await limsAuthApi.me(accessToken, tenantSchema);

    set({
      user,
      status: "authenticated",
    });
  },

  logout: async () => {
    const tenantSchema =
      get().tenantSchema || sessionStorage.getItem("lims_tenant_schema");

    try {
      if (tenantSchema) {
        await limsAuthApi.logout(tenantSchema);
      }
    } finally {
      sessionStorage.removeItem("lims_tenant_schema");

      set({
        accessToken: null,
        user: null,
        tenantSchema: null,
        status: "unauthenticated",
      });
    }
  },
}));