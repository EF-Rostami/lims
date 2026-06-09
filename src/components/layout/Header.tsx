"use client";

import { useRouter } from "next/navigation";
import { LogOut, UserCircle, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLimsAuthStore } from "@/features/lims-auth/lims-auth.store";
import { PermissionGate } from "../protection/PermissionGate";
import { NotificationBell } from "./NotificationBell";

export function Header() {
  const router = useRouter();
  const user = useLimsAuthStore((state) => state.user);
  const logout = useLimsAuthStore((state) => state.logout);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      window.location.href = "/login";
    }
  };

  const initials = user?.display_name
    ? user.display_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : (user?.email?.[0] ?? "U").toUpperCase();

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <span className="text-muted-foreground">
          Welcome back, {user?.display_name || user?.username || "User"}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <PermissionGate permissions={["SAMPLE_CREATE"]}>
          <button className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm">
            + New Sample
          </button>
        </PermissionGate>

        <NotificationBell />

        <div className="ml-2 border-l pl-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full hover:bg-muted px-2 py-1 transition-colors">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold select-none">
                  {initials}
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium leading-none">{user?.display_name || user?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize mt-0.5">
                    {user?.roles?.join(", ") || user?.user_type}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium">{user?.display_name || "Account"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/lims/account")}>
                <Settings className="h-4 w-4 mr-2" />
                Account Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
