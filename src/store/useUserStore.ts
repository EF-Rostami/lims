import { UserMetadata } from "@/types/api-types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";


interface UserStore {
  user: UserMetadata | null;
  setUser: (user: UserMetadata) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
    }),
    {
      name: "user-metadata", // key in localStorage
      version: 2, // Increment this whenever you change DB roles/perms
      storage: createJSONStorage(() => localStorage),
    }
  )
);