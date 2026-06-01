import { AuthState } from "@/types/api-types";
import { create } from "zustand";


interface AuthStore extends AuthState {
  setAccessToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken: null,
  isAuthenticated: false,

  setAccessToken: (token) => 
    set({ 
      accessToken: token, 
      isAuthenticated: !!token 
    }),

  logout: () => 
    set({ 
      accessToken: null, 
      isAuthenticated: false 
    }),
}));