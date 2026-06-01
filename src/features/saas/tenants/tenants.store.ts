import { create } from "zustand";
import { type Tenant, type CreateTenantPayload, type UpdateTenantPayload, tenantsApi } from "./tenants.api";

type TenantsState = {
  tenants: Tenant[];
  selectedTenant: Tenant | null;
  isLoading: boolean;
  error: string | null;

  fetchTenants: () => Promise<void>;
  createTenant: (payload: CreateTenantPayload) => Promise<void>;
  updateTenant: (id: string, payload: UpdateTenantPayload) => Promise<void>;
  deleteTenant: (id: string) => Promise<void>;
  activateTenant: (id: string) => Promise<void>;
  suspendTenant: (id: string) => Promise<void>;

  setSelectedTenant: (tenant: Tenant | null) => void;
  clearError: () => void;
};

export const useTenantsStore = create<TenantsState>((set, get) => ({
  tenants: [],
  selectedTenant: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),

  fetchTenants: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await tenantsApi.list();
      set({ tenants: data, isLoading: false });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      set({ error: msg ?? "Failed to load tenants", isLoading: false });
    }
  },

  createTenant: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const created = await tenantsApi.create(payload);
      set({ tenants: [created, ...get().tenants], isLoading: false });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      set({ error: msg ?? "Failed to create tenant", isLoading: false });
    }
  },

  updateTenant: async (id, payload) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await tenantsApi.update(id, payload);
      set({
        tenants: get().tenants.map((t) => (t.id === id ? updated : t)),
        selectedTenant: null,
        isLoading: false,
      });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      set({ error: msg ?? "Failed to update tenant", isLoading: false });
    }
  },

  deleteTenant: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await tenantsApi.delete(id);
      set({ tenants: get().tenants.filter((t) => t.id !== id), selectedTenant: null, isLoading: false });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      set({ error: msg ?? "Failed to delete tenant", isLoading: false });
    }
  },

  activateTenant: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await tenantsApi.update(id, { status: "ACTIVE" });
      set({ tenants: get().tenants.map((t) => (t.id === id ? updated : t)), isLoading: false });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      set({ error: msg ?? "Failed to activate tenant", isLoading: false });
    }
  },

  suspendTenant: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await tenantsApi.update(id, { status: "SUSPENDED" });
      set({ tenants: get().tenants.map((t) => (t.id === id ? updated : t)), isLoading: false });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      set({ error: msg ?? "Failed to suspend tenant", isLoading: false });
    }
  },

  setSelectedTenant: (tenant) => set({ selectedTenant: tenant }),
}));
