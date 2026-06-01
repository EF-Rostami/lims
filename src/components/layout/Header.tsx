"use client";

import { useLimsAuthStore } from "@/features/lims-auth/lims-auth.store";
import { PermissionGate } from "../protection/PermissionGate";
import { LogOut, Bell } from "lucide-react";


export function Header() {
  const user = useLimsAuthStore((state) => state.user);
  const logout = useLimsAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      window.location.href = "/login";
      // router.replace("/login");
    }
  };

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <span className="text-muted-foreground">
          Welcome back, {user?.username || "User"}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <PermissionGate permissions={["SAMPLE_CREATE"]}>
          <button className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm">
            + New Sample
          </button>
        </PermissionGate>

        <button title="Notifications" className="p-2 hover:bg-muted rounded-full">
          <Bell size={20} />
        </button>

        <div className="flex items-center gap-3 ml-4 border-l pl-4">
          <div className="text-right">
            <p className="text-sm font-medium leading-none">
              {user?.email}
            </p>

            <p className="text-xs text-muted-foreground capitalize">
              {user?.user_type} · {user?.roles?.join(", ")}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-destructive hover:bg-destructive/10 rounded-full"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}