"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useLimsAuthStore } from "./lims-auth.store";
import { FULL_LIMS_ROLES } from "@/config/navigation";

export function LimsAuthBootstrap({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const status = useLimsAuthStore((state) => state.status);
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const { accessToken, refreshAuth } = useLimsAuthStore.getState();

    if (accessToken) {
      useLimsAuthStore.setState({ status: "authenticated" });
    } else {
      refreshAuth();
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }

    if (status === "authenticated" && pathname === "/dashboard") {
      const user = useLimsAuthStore.getState().user;
      const roles: string[] = user?.roles ?? [];
      const isConsultantOnly =
        roles.some((r) => r === "consultant" || r === "lead_auditor") &&
        !roles.some((r) => FULL_LIMS_ROLES.includes(r as never));

      if (isConsultantOnly) {
        router.replace("/consultant/projects");
      }
    }
  }, [status, pathname, router]);

  if (status === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}
