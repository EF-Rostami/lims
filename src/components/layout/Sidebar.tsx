"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLimsAuthStore } from "@/features/lims-auth/lims-auth.store";
import { sidebarConfig } from "@/config/navigation";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const user = useLimsAuthStore((state) => state.user);

  const filteredMenu = sidebarConfig.filter((item) => {
    if (!item.requiredRoles && !item.requiredPermissions) return true;

    const hasRole =
      item.requiredRoles?.some((role) => user?.roles?.includes(role)) ?? false;

    const hasPermission =
      item.requiredPermissions?.some((perm) =>
        user?.permissions?.includes(perm)
      ) ?? false;

    return hasRole || hasPermission;
  });

  return (
    <aside className="w-64 border-r bg-card h-screen flex flex-col">
      <div className="p-6 font-bold text-xl border-b">LIMS Portal</div>

      <nav className="flex-1 p-4 space-y-2">
        {filteredMenu.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
              pathname === item.href
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            )}
          >
            <item.icon size={20} />
            <span>{item.title}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}