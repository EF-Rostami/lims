// @/features/saas/customers/store/customers.store.ts
import { create } from "zustand";
import type { Organization, Tenant } from "../api/customers.api";

type CustomersUIState = {
  selectedOrganization: Organization | null;
  selectedTenant: Tenant | null;
  isOrgModalOpen: boolean;
  isTenantModalOpen: boolean;
  
  // UI triggers
  setSelectedOrganization: (org: Organization | null) => void;
  setSelectedTenant: (tenant: Tenant | null) => void;
  openOrgModal: (org?: Organization | null) => void;
  closeOrgModal: () => void;
  openTenantModal: (tenant?: Tenant | null) => void;
  closeTenantModal: () => void;
};

export const useCustomersUIStore = create<CustomersUIState>((set) => ({
  selectedOrganization: null,
  selectedTenant: null,
  isOrgModalOpen: false,
  isTenantModalOpen: false,

  setSelectedOrganization: (org) => set({ selectedOrganization: org }),
  setSelectedTenant: (tenant) => set({ selectedTenant: tenant }),
  
  openOrgModal: (org = null) => set({ selectedOrganization: org, isOrgModalOpen: true }),
  closeOrgModal: () => set({ selectedOrganization: null, isOrgModalOpen: false }),
  
  openTenantModal: (tenant = null) => set({ selectedTenant: tenant, isTenantModalOpen: true }),
  closeTenantModal: () => set({ selectedTenant: null, isTenantModalOpen: false }),
}));