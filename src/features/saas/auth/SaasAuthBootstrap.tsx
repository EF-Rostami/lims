"use client";

import { useEffect, useRef } from "react";
import { useSaasAuthStore } from "./saas-auth.store";

export function SaasAuthBootstrap({
  children,
}: {
  children: React.ReactNode;
}) {
  const didRun = useRef(false);


  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const { accessToken, refreshAuth} = useSaasAuthStore.getState();

    if (!accessToken) {
      void refreshAuth();
    }
  }, []);

  return <>{children}</>;
}