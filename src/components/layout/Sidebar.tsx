"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft, LayoutDashboard, BarChart2, ClipboardList,
  CalendarDays, Rocket,
} from "lucide-react";
import { useLimsAuthStore } from "@/features/lims-auth/lims-auth.store";
import {
  sidebarConfig,
  consultantSidebarConfig,
  consultantSectionLabels,
  FULL_LIMS_ROLES,
  NavItem,
} from "@/config/navigation";
import { useBranding } from "@/features/lims/branding/BrandingProvider";
import { useProjectContextStore } from "@/features/lims/consultancy/project-context.store";
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

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
  hasBg,
}: {
  href: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  isActive: boolean;
  hasBg: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm",
        isActive
          ? "bg-primary text-primary-foreground font-semibold"
          : hasBg
            ? "text-white/80 hover:text-white hover:bg-white/10"
            : "hover:bg-muted",
      )}
    >
      <Icon size={17} />
      <span>{label}</span>
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const user = useLimsAuthStore((state) => state.user);
  const { companyName, logoUrl, sidebarBgHex } = useBranding();
  const { id: ctxProjectId, name: ctxProjectName } = useProjectContextStore();

  const roles: string[] = user?.roles ?? [];

  const isConsultantOnly =
    roles.some((r) => r === "consultant" || r === "lead_auditor") &&
    !roles.some((r) => FULL_LIMS_ROLES.includes(r as never));

  // Detect if currently navigating inside a specific project
  const projectMatch = pathname.match(/^\/consultant\/projects\/(\d+)/);
  const isInProject = isConsultantOnly && !!projectMatch;
  const projectId = projectMatch ? Number(projectMatch[1]) : null;

  // Project name: use store value (set by ProjectContextSetter); fall back to ID while loading
  const projectName =
    ctxProjectId === projectId && ctxProjectName
      ? ctxProjectName
      : projectId
        ? `Project #${projectId}`
        : "";

  const hasBg = !!sidebarBgHex;

  // ── Shared logo header ─────────────────────────────────────────────────────
  const header = (
    <div className={cn("p-4 border-b shrink-0 flex items-center gap-3", hasBg ? "border-white/10" : "")}>
      {logoUrl ? (
        <img src={logoUrl} alt={companyName} className="h-8 w-8 rounded object-contain shrink-0" />
      ) : (
        <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
          {companyName.charAt(0).toUpperCase()}
        </div>
      )}
      <span className={cn("font-bold text-base leading-tight truncate", hasBg ? "text-white" : "")}>
        {companyName}
      </span>
    </div>
  );

  // ── Consultant-only: inside a project ──────────────────────────────────────
  if (isInProject && projectId) {
    const base = `/consultant/projects/${projectId}`;

    const projectItems = [
      {
        href: base,
        label: "Overview",
        icon: LayoutDashboard,
        // exact match — sub-routes should highlight their own item
        isActive: pathname === base,
      },
      {
        href: `${base}/assessment`,
        label: "Gap Assessment",
        icon: BarChart2,
        isActive: pathname.startsWith(`${base}/assessment`),
      },
      {
        href: `${base}/tasks`,
        label: "Tasks",
        icon: ClipboardList,
        isActive: pathname.startsWith(`${base}/tasks`),
      },
      {
        href: `${base}/meetings`,
        label: "Meetings",
        icon: CalendarDays,
        isActive: pathname.startsWith(`${base}/meetings`),
      },
      {
        href: `${base}/go-live`,
        label: "Go Live",
        icon: Rocket,
        isActive: pathname.startsWith(`${base}/go-live`),
      },
    ];

    // Lab entities section (always visible for consultant-only users)
    const labItems = consultantSidebarConfig.filter((i) => i.section === "lab_entities");

    return (
      <aside
        className={cn("w-64 border-r h-screen flex flex-col overflow-y-auto", hasBg ? "" : "bg-card")}
        style={hasBg ? { backgroundColor: sidebarBgHex! } : undefined}
      >
        {header}

        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {/* Back link */}
          <div>
            <Link
              href="/consultant/projects"
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                hasBg
                  ? "text-white/50 hover:text-white/80 hover:bg-white/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <ArrowLeft size={13} />
              All Projects
            </Link>
          </div>

          {/* Project sub-nav */}
          <div>
            <p
              className={cn(
                "text-[10px] font-black uppercase tracking-widest px-3 mb-1.5 truncate",
                hasBg ? "text-white/40" : "text-muted-foreground",
              )}
              title={projectName}
            >
              {projectName}
            </p>
            <div className="space-y-0.5">
              {projectItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={item.isActive}
                  hasBg={hasBg}
                />
              ))}
            </div>
          </div>

          {/* Lab entities */}
          {labItems.length > 0 && (
            <div>
              <p
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest px-3 mb-1.5",
                  hasBg ? "text-white/40" : "text-muted-foreground",
                )}
              >
                {consultantSectionLabels.lab_entities}
              </p>
              <div className="space-y-0.5">
                {labItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <NavLink
                      key={item.href}
                      href={item.href}
                      label={item.title}
                      icon={item.icon}
                      isActive={isActive}
                      hasBg={hasBg}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </nav>
      </aside>
    );
  }

  // ── Standard sidebar (consultant top-level or full LIMS user) ──────────────
  const navConfig = isConsultantOnly ? consultantSidebarConfig : sidebarConfig;
  const sectionLabels = isConsultantOnly ? consultantSectionLabels : SECTION_LABELS;
  const sectionOrder = isConsultantOnly
    ? ["consultant", "lab_entities"]
    : ["main", "qms", "accreditation", "lims", "admin"];

  const visibleItems = isConsultantOnly
    ? navConfig
    : navConfig.filter((item) => {
        if (!item.requiredRoles && !item.requiredPermissions) return true;
        const hasRole = item.requiredRoles?.some((role) => roles.includes(role)) ?? false;
        const hasPermission =
          item.requiredPermissions?.some((perm) => user?.permissions?.includes(perm)) ?? false;
        return hasRole || hasPermission;
      });

  const sections = groupBySections(visibleItems);

  return (
    <aside
      className={cn("w-64 border-r h-screen flex flex-col overflow-y-auto", hasBg ? "" : "bg-card")}
      style={hasBg ? { backgroundColor: sidebarBgHex! } : undefined}
    >
      {header}

      <nav className="flex-1 p-3 space-y-5 overflow-y-auto">
        {sectionOrder.map((sec) => {
          const items = sections[sec];
          if (!items?.length) return null;
          const label = sectionLabels[sec] ?? "";
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
                    <NavLink
                      key={item.href}
                      href={item.href}
                      label={item.title}
                      icon={item.icon}
                      isActive={isActive}
                      hasBg={hasBg}
                    />
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
