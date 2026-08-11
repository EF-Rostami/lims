import { RoleType } from "@/types/api-types";
import {
  LayoutDashboard, Users, FlaskConical, Settings,
  TestTube2, ClipboardList, Microscope, Wrench,
  BarChart3, AlertTriangle, ScrollText, FolderOpen, PenLine,
  Building2, Briefcase, ShieldCheck, GanttChart, UserCog, FileSpreadsheet,
  Package, Thermometer, Atom, GraduationCap, Beaker, Activity, Sigma, ClipboardCheck,
  GitBranch, Bell, MessageSquareWarning, FileText, BookOpen, Target, CalendarDays, LayoutList,
  UserCircle,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  requiredRoles?: RoleType[];
  requiredPermissions?: string[];
  section?: string;
}

/** Roles that indicate a "full LIMS" user — consultant sidebar is for everyone else. */
export const FULL_LIMS_ROLES: RoleType[] = [
  "admin",
  "head_of_laboratory",
  "quality_manager",
  "technical_manager",
];

/**
 * Consultant-only sidebar shown when the user holds CONSULTANT or LEAD_AUDITOR
 * but does NOT hold any FULL_LIMS_ROLES role.
 */
export const consultantSidebarConfig: NavItem[] = [
  // Consultant work
  { title: "Home", href: "/consultant/home", icon: LayoutDashboard, section: "consultant" },
  { title: "My Labs", href: "/consultant/labs-overview", icon: LayoutList, section: "consultant" },
  { title: "Projects", href: "/consultant/projects", icon: Target, section: "current_lab" },
  { title: "Frameworks", href: "/consultant/frameworks", icon: BookOpen, section: "current_lab" },
  { title: "Meetings", href: "/consultant/meetings", icon: CalendarDays, section: "current_lab" },
  { title: "Lab Health", href: "/lims/health", icon: ShieldCheck, section: "current_lab" },
  { title: "Compliance", href: "/consultant/compliance", icon: Activity, section: "current_lab" },
  { title: "Gap Assessment", href: "/consultant/gap-assessment", icon: ClipboardCheck, section: "current_lab" },
  { title: "Documents", href: "/consultant/documents", icon: FileText, section: "current_lab" },

  // Lab entities — for lifecycle transitions only (no samples/orders/results/QC)
  { title: "Instruments", href: "/lims/instruments", icon: Wrench, section: "lab_entities" },
  { title: "Methods", href: "/lims/methods", icon: FlaskConical, section: "lab_entities" },
  { title: "Competence", href: "/lims/competence", icon: GraduationCap, section: "lab_entities" },

  // Account
  { title: "My Profile", href: "/consultant/profile", icon: UserCircle, section: "account" },
];

export const consultantSectionLabels: Record<string, string> = {
  consultant: "Consultancy",
  lab_entities: "Lab Entities",
  account: "Account",
};

export const sidebarConfig: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, section: "main" },

  // QMS Setup (consultant-only setup phase)
  { title: "Lab Health", href: "/lims/health", icon: ShieldCheck, section: "qms" },
  {
    title: "QMS Setup",
    href: "/consultant",
    icon: GanttChart,
    requiredRoles: ["admin", "quality_manager", "head_of_laboratory"],
    section: "qms",
  },
  {
    title: "Org Structure",
    href: "/consultant/lab-organization",
    icon: Briefcase,
    requiredRoles: ["admin", "quality_manager", "head_of_laboratory"],
    section: "qms",
  },
  {
    title: "Steering Committee",
    href: "/consultant/steering-committee",
    icon: Users,
    requiredRoles: ["admin", "quality_manager", "head_of_laboratory"],
    section: "qms",
  },
  {
    title: "Authorities Matrix",
    href: "/consultant/role-permission-matrix",
    icon: ShieldCheck,
    requiredRoles: ["admin"],
    section: "qms",
  },
  {
    title: "Document Config",
    href: "/consultant/document-config",
    icon: ClipboardList,
    requiredRoles: ["admin", "quality_manager"],
    section: "qms",
  },
  {
    title: "Doc Assignments",
    href: "/consultant/document-assignments",
    icon: UserCog,
    requiredRoles: ["admin", "quality_manager"],
    section: "qms",
  },
  {
    title: "Data Onboarding",
    href: "/consultant/data-import",
    icon: FileSpreadsheet,
    requiredRoles: ["admin", "quality_manager", "head_of_laboratory"],
    section: "qms",
  },

  // Accreditation (consultancy module — visible to consultant, lead_auditor, admin, quality_manager)
  {
    title: "Acc. Projects",
    href: "/consultant/projects",
    icon: Target,
    requiredPermissions: ["consultancy.read"],
    section: "accreditation",
  },
  {
    title: "Frameworks",
    href: "/consultant/frameworks",
    icon: BookOpen,
    requiredPermissions: ["consultancy.read"],
    section: "accreditation",
  },

  // Operations — daily workflow for all lab staff
  { title: "Clients", href: "/lims/clients", icon: Building2, section: "operations" },
  { title: "Samples", href: "/lims/samples", icon: TestTube2, section: "operations" },
  { title: "Orders", href: "/lims/orders", icon: ClipboardList, section: "operations" },
  { title: "Results", href: "/lims/results", icon: Microscope, section: "operations" },
  { title: "Reports", href: "/lims/reports", icon: BarChart3, section: "operations" },

  // Technical — analysts and technical manager
  { title: "Instruments", href: "/lims/instruments", icon: Wrench, section: "technical" },
  { title: "Methods", href: "/lims/methods", icon: FlaskConical, section: "technical" },
  { title: "Validation", href: "/lims/validation", icon: Beaker, section: "technical" },
  { title: "QC", href: "/lims/qc", icon: Activity, section: "technical" },
  { title: "Meas. Uncertainty", href: "/lims/mu", icon: Sigma, section: "technical" },
  { title: "Inventory", href: "/lims/inventory", icon: Package, section: "technical" },
  { title: "Ref. Materials", href: "/lims/rm", icon: Atom, section: "technical" },
  { title: "Environment", href: "/lims/environmental", icon: Thermometer, section: "technical" },

  // Quality System — quality manager
  { title: "Documents", href: "/lims/qms-documents", icon: FileText, section: "quality" },
  { title: "Competence", href: "/lims/competence", icon: GraduationCap, section: "quality" },
  { title: "Internal Audits", href: "/lims/ia", icon: ClipboardCheck, section: "quality" },
  { title: "Findings", href: "/lims/findings", icon: AlertTriangle, section: "quality" },
  { title: "CAPA", href: "/lims/capa", icon: GitBranch, section: "quality" },
  { title: "Complaints", href: "/lims/complaints", icon: MessageSquareWarning, section: "quality" },

  // System — admin
  { title: "Notifications", href: "/lims/notifications", icon: Bell, section: "system" },
  { title: "Files", href: "/lims/files", icon: FolderOpen, section: "system" },
  { title: "Signatures", href: "/lims/signatures", icon: PenLine, section: "system" },
  { title: "Audit Log", href: "/lims/audit-logs", icon: ScrollText, section: "system" },
  { title: "Lab Settings", href: "/lims/settings", icon: Settings, section: "system" },

  // Admin
  { title: "Users", href: "/lims/hr/users", icon: Users, requiredRoles: ["admin"], section: "admin" },
  { title: "Employees", href: "/lims/hr/employees", icon: UserCog, requiredRoles: ["admin", "hr"], section: "admin" },
  { title: "Departments", href: "/lims/hr/departments", icon: Briefcase, requiredRoles: ["admin"], section: "admin" },
  { title: "Positions", href: "/lims/hr/positions", icon: ShieldCheck, requiredRoles: ["admin"], section: "admin" },
  { title: "Responsibilities", href: "/lims/hr/responsibilities", icon: ClipboardCheck, requiredRoles: ["admin", "quality_manager"], section: "admin" },
];