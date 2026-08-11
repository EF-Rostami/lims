"use client";

import { useRouter } from "next/navigation";
import { LogOut, Menu, Settings } from "lucide-react";
import { useSidebarStore } from "./sidebar.store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLimsAuthStore } from "@/features/lims-auth/lims-auth.store";
import { FULL_LIMS_ROLES } from "@/config/navigation";
import { PermissionGate } from "../protection/PermissionGate";
import { NotificationBell } from "./NotificationBell";
import { LanguageSelector } from "@/components/i18n/LanguageSelector";
import { LabSwitcher } from "./LabSwitcher";
import { useT } from "@/i18n/LocaleProvider";

export function Header() {
  const router = useRouter();
  const user = useLimsAuthStore((state) => state.user);
  const logout = useLimsAuthStore((state) => state.logout);
  const toggle = useSidebarStore((s) => s.toggle);
  const t = useT("header");

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      window.location.href = "/login";
    }
  };

  const roles: string[] = user?.roles ?? [];
  const isConsultantOnly =
    roles.some((r) => r === "consultant" || r === "lead_auditor") &&
    !roles.some((r) => FULL_LIMS_ROLES.includes(r as never));

  const initials = user?.display_name
    ? user.display_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : (user?.email?.[0] ?? "U").toUpperCase();

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-1.5 rounded-md hover:bg-muted transition-colors"
          onClick={toggle}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-muted-foreground hidden sm:block">
          {t("welcomeBack", { name: user?.display_name || user?.username || "User" })}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <PermissionGate permissions={["SAMPLE_CREATE"]}>
          <button className="bg-primary text-primary-foreground px-4 py-1.5 rounded-md text-sm">
            {t("newSample")}
          </button>
        </PermissionGate>

        {isConsultantOnly && <LabSwitcher />}

        <NotificationBell />

        <LanguageSelector />

        <div className="border-s ps-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full hover:bg-muted px-2 py-1 transition-colors">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold select-none">
                  {initials}
                </div>
                <div className="text-end hidden sm:block">
                  <p className="text-sm font-medium leading-none">{user?.display_name || user?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize mt-0.5">
                    {user?.roles?.join(", ") || user?.user_type}
                  </p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium">{user?.display_name || t("account")}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/lims/account")}>
                <Settings className="h-4 w-4 me-2" />
                {t("accountSettings")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="h-4 w-4 me-2" />
                {t("signOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
