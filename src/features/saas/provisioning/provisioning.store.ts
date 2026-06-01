// @/features/saas/provisioning/provisioning.store.ts
import { create } from "zustand";

interface ProvisioningUIState {
  isOpen: boolean;
  activeTenantId: string | null;
  activeTenantName: string | null;
  openProvisionModal: (tenantId: string, tenantName: string) => void;
  closeProvisionModal: () => void;
}

export const useProvisioningStore = create<ProvisioningUIState>((set) => ({
  isOpen: false,
  activeTenantId: null,
  activeTenantName: null,

  openProvisionModal: (tenantId, tenantName) =>
    set({
      isOpen: true,
      activeTenantId: tenantId,
      activeTenantName: tenantName,
    }),

  closeProvisionModal: () =>
    set({
      isOpen: false,
      activeTenantId: null,
      activeTenantName: null,
    }),
}));