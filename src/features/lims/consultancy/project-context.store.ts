import { create } from "zustand";

interface ProjectContextState {
  id: number | null;
  name: string | null;
  setProject: (id: number, name: string) => void;
  clearProject: () => void;
}

export const useProjectContextStore = create<ProjectContextState>((set) => ({
  id: null,
  name: null,
  setProject: (id, name) => set({ id, name }),
  clearProject: () => set({ id: null, name: null }),
}));
