// src/features/audit/audit-store.ts
import { create } from "zustand";

interface AuditStore {
  isOpen: boolean;
  reason: string;
  resolve: ((reason: string) => void) | null;
  
  // Called by the Interceptor/Hook to trigger the modal
  promptForReason: () => Promise<string>;
  
  // Called by the UI Modal
  submitReason: (reason: string) => void;
  close: () => void;
}

export const useAuditStore = create<AuditStore>((set, get) => ({
  isOpen: false,
  reason: "",
  resolve: null,

  promptForReason: () => {
    return new Promise((resolve) => {
      set({ isOpen: true, reason: "", resolve });
    });
  },

  submitReason: (reason: string) => {
    const { resolve } = get();
    if (resolve) resolve(reason);
    set({ isOpen: false, reason: "", resolve: null });
  },

  close: () => {
    const { resolve } = get();
    if (resolve) resolve(""); // Resolve with empty to cancel or handle error
    set({ isOpen: false, resolve: null });
  },
}));