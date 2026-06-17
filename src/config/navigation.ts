import { RoleType } from "@/types/api-types";
import {
  LayoutDashboard, Users, FlaskConical, Settings,
  TestTube2, ClipboardList, Microscope, Wrench,
  BarChart3, AlertTriangle, ScrollText, FolderOpen, PenLine,
  Building2, Briefcase, ShieldCheck, GanttChart, UserCog, FileSpreadsheet,
  Package, Thermometer, Atom, GraduationCap, Beaker, Activity, Sigma, ClipboardCheck,
  GitBranch, Bell, MessageSquareWarning, FileText, BookOpen, Target,
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

export const sidebarConfig: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, section: "main" },

  // QMS Setup (consultant-only setup phase)
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

  // LIMS Operations
  { title: "Clients", href: "/lims/clients", icon: Building2, section: "lims" },
  { title: "Samples", href: "/lims/samples", icon: TestTube2, section: "lims" },
  { title: "Orders", href: "/lims/orders", icon: ClipboardList, section: "lims" },
  { title: "Results", href: "/lims/results", icon: Microscope, section: "lims" },
  { title: "Instruments", href: "/lims/instruments", icon: Wrench, section: "lims" },
  { title: "Inventory", href: "/lims/inventory", icon: Package, section: "lims" },
  { title: "Environment", href: "/lims/environmental", icon: Thermometer, section: "lims" },
  { title: "Ref. Materials", href: "/lims/rm", icon: Atom, section: "lims" },
  { title: "Competence", href: "/lims/competence", icon: GraduationCap, section: "lims" },
  { title: "Methods", href: "/lims/methods", icon: FlaskConical, section: "lims" },
  { title: "Validation", href: "/lims/validation", icon: Beaker, section: "lims" },
  { title: "QC", href: "/lims/qc", icon: Activity, section: "lims" },
  { title: "Meas. Uncertainty", href: "/lims/mu", icon: Sigma, section: "lims" },
  { title: "Internal Audits", href: "/lims/ia", icon: ClipboardCheck, section: "lims" },
  { title: "Reports", href: "/lims/reports", icon: BarChart3, section: "lims" },
  { title: "Documents", href: "/lims/qms-documents", icon: FileText, section: "lims" },
  { title: "Complaints", href: "/lims/complaints", icon: MessageSquareWarning, section: "lims" },
  { title: "Findings", href: "/lims/findings", icon: AlertTriangle, section: "lims" },
  { title: "CAPA", href: "/lims/capa", icon: GitBranch, section: "lims" },
  { title: "Files", href: "/lims/files", icon: FolderOpen, section: "lims" },
  { title: "Signatures", href: "/lims/signatures", icon: PenLine, section: "lims" },
  { title: "Audit Log", href: "/lims/audit-logs", icon: ScrollText, section: "lims" },
  { title: "Notifications", href: "/lims/notifications", icon: Bell, section: "lims" },
  { title: "Lab Settings", href: "/lims/settings", icon: Settings, section: "lims" },

  // Admin
  { title: "Users", href: "/lims/hr/users", icon: Users, requiredRoles: ["admin"], section: "admin" },
  { title: "Employees", href: "/lims/hr/employees", icon: UserCog, requiredRoles: ["admin", "hr"], section: "admin" },
  { title: "Departments", href: "/lims/hr/departments", icon: Briefcase, requiredRoles: ["admin"], section: "admin" },
  { title: "Positions", href: "/lims/hr/positions", icon: ShieldCheck, requiredRoles: ["admin"], section: "admin" },
  { title: "Responsibilities", href: "/lims/hr/responsibilities", icon: ClipboardCheck, requiredRoles: ["admin", "quality_manager"], section: "admin" },
];