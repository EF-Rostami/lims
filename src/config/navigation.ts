import { RoleType } from "@/types/api-types";
import {
  LayoutDashboard, Users, FlaskConical, Settings,
  TestTube2, ClipboardList, Microscope, Wrench,
  BarChart3, AlertTriangle, ScrollText, FolderOpen, PenLine,
  Building2, Briefcase, ShieldCheck,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  requiredRoles?: RoleType[];      // Using our extracted RoleType enum
  requiredPermissions?: string[];   // Specific codes like "LAB_VIEW"
}

export const sidebarConfig: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },

  // LIMS
  { title: "Clients", href: "/lims/clients", icon: Building2 },
  { title: "Samples", href: "/lims/samples", icon: TestTube2 },
  { title: "Orders", href: "/lims/orders", icon: ClipboardList },
  { title: "Results", href: "/lims/results", icon: Microscope },
  { title: "Instruments", href: "/lims/instruments", icon: Wrench },
  { title: "Methods", href: "/lims/methods", icon: FlaskConical },
  { title: "Reports", href: "/lims/reports", icon: BarChart3 },
  { title: "Findings", href: "/lims/findings", icon: AlertTriangle },
  { title: "Files", href: "/lims/files", icon: FolderOpen },
  { title: "Signatures", href: "/lims/signatures", icon: PenLine },
  { title: "Audit Log", href: "/lims/audit-logs", icon: ScrollText },
  { title: "Lab Settings", href: "/lims/settings", icon: Settings },
  { title: "HR — Users", href: "/lims/hr/users", icon: Users },
  { title: "HR — Departments", href: "/lims/hr/departments", icon: Briefcase },
  { title: "HR — Positions", href: "/lims/hr/positions", icon: ShieldCheck },
];