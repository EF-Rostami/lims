"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLimsAuthStore } from "@/features/lims-auth/lims-auth.store";
import { sidebarConfig, NavItem } from "@/config/navigation";
import { useBranding } from "@/features/lims/branding/BrandingProvider";
import { cn } from "@/lib/utils";

const SECTION_LABELS: Record<string, string> = {
  main: "",
  qms: "QMS Setup",
  accreditation: "Accreditation",
  lims: "Laboratory",
  admin: "Administration",
};

function groupBySections(items: NavItem[]) {
  const sections: Record<string, NavItem[]> = {};
  for (const item of items) {
    const sec = item.section ?? "main";
    if (!sections[sec]) sections[sec] = [];
    sections[sec].push(item);
  }
  return sections;
}

export function Sidebar() {
  const pathname = usePathname();
  const user = useLimsAuthStore((state) => state.user);
  const { companyName, logoUrl, sidebarBgHex } = useBranding();

  const visibleItems = sidebarConfig.filter((item) => {
    if (!item.requiredRoles && !item.requiredPermissions) return true;
    const hasRole =
      item.requiredRoles?.some((role) => user?.roles?.includes(role)) ?? false;
    const hasPermission =
      item.requiredPermissions?.some((perm) =>
        user?.permissions?.includes(perm)
      ) ?? false;
    return hasRole || hasPermission;
  });

  const sections = groupBySections(visibleItems);
  const sectionOrder = ["main", "qms", "accreditation", "lims", "admin"];

  const hasBg = !!sidebarBgHex;

  return (
    <aside
      className={cn(
        "w-64 border-r h-screen flex flex-col overflow-y-auto",
        hasBg ? "" : "bg-card",
      )}
      style={hasBg ? { backgroundColor: sidebarBgHex! } : undefined}
    >
      {/* Header */}
      <div className={cn("p-4 border-b shrink-0 flex items-center gap-3", hasBg ? "border-white/10" : "")}>
        {logoUrl ? (
          <img src={logoUrl} alt={companyName} className="h-8 w-8 rounded object-contain shrink-0" />
        ) : (
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
            {companyName.charAt(0).toUpperCase()}
          </div>
        )}
        <span
          className={cn("font-bold text-base leading-tight truncate", hasBg ? "text-white" : "")}
        >
          {companyName}
        </span>
      </div>

      <nav className="flex-1 p-3 space-y-5 overflow-y-auto">
        {sectionOrder.map((sec) => {
          const items = sections[sec];
          if (!items?.length) return null;
          const label = SECTION_LABELS[sec];
          return (
            <div key={sec}>
              {label && (
                <p
                  className={cn(
                    "text-[10px] font-black uppercase tracking-widest px-3 mb-1.5",
                    hasBg ? "text-white/40" : "text-muted-foreground",
                  )}
                >
                  {label}
                </p>
              )}
              <div className="space-y-0.5">
                {items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm",
                        isActive
                          ? "bg-primary text-primary-foreground font-semibold"
                          : hasBg
                            ? "text-white/80 hover:text-white hover:bg-white/10"
                            : "hover:bg-muted",
                      )}
                    >
                      <item.icon size={17} />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
