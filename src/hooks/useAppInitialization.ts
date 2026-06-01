// @ts-nocheck — pending migration to features/lims/ pattern
import { useEffect, useState, useRef } from "react";
import { authService } from "@/services/auth.service";
import { useUserStore } from "@/store/useUserStore"; // Import your user store
import { useAuthStore } from "@/store/useAuthStore"; // Import your auth store

export function useAppInitialization() {
  const [isInitializing, setIsInitializing] = useState(true);
  const hasInitialized = useRef(false);
  
  // Get the setters from your stores
  const setUser = useUserStore((state) => state.setUser);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const initAuth = async () => {
      try {
        // 1. Manually type the refresh response if your generated types are lagging
        const refreshResponse = await authService.refresh();
        
        // Use type assertion (as any) or better yet, a specific interface
        const data = refreshResponse.data as { access_token: string };

        if (data?.access_token) {
          setAccessToken(data.access_token);
          
          // 2. Fetch the full user profile
          const userResponse = await authService.me();
          
          // Ensure userResponse.data matches your UserMetadata interface
          setUser(userResponse.data); 
          console.log("✅ Auth & Profile Initialized");
        }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        console.warn("⚠️ No active session found during initialization");
      } finally {
        setIsInitializing(false);
      }
    };

    initAuth();
  }, [setUser, setAccessToken]);

  return { isInitializing };
}