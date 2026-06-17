"use client";

import { useRouter } from "next/navigation";
import {
  ArrowRight, ShieldCheck, Eye, FlaskConical, ClipboardList,
  Microscope, Wrench, Users, BarChart3, FileText, Thermometer,
  Package, BookOpen, AlertTriangle, CheckCircle2, Activity,
  BadgeCheck, Lock, Info,
} from "lucide-react";
import { useLimsAuthStore } from "@/features/lims-auth/lims-auth.store";
import { useEffect } from "react";

// ── Module capability cards ────────────────────────────────────────────────

const modules = [
  {
    icon: ClipboardList,
    label: "Orders & Samples",
    color: "bg-blue-50 text-blue-600",
    items: ["5 test orders", "8 samples with chain of custody", "~25 results (approved / validated)"],
  },
  {
    icon: FlaskConical,
    label: "QC & Westgard",
    color: "bg-violet-50 text-violet-600",
    items: ["10 QC materials", "11 QC runs with z-scores", "Westgard 1₂s / 1₃s alerts"],
  },
  {
    icon: FileText,
    label: "QMS Documents",
    color: "bg-cyan-50 text-cyan-600",
    items: ["17 SOPs + 1 Quality Manual", "5 document types", "All APPROVED status"],
  },
  {
    icon: Microscope,
    label: "Internal Audits",
    color: "bg-indigo-50 text-indigo-600",
    items: ["1 audit programme (ISO 17025 2026)", "3 audits: closed / reported / planned", "15 checklist items + findings"],
  },
  {
    icon: AlertTriangle,
    label: "Findings & CAPA",
    color: "bg-rose-50 text-rose-600",
    items: ["5 QC findings (LOW → CRITICAL)", "5-Whys chains + Ishikawa diagrams", "Corrective & preventive actions"],
  },
  {
    icon: Wrench,
    label: "Instruments",
    color: "bg-orange-50 text-orange-600",
    items: ["13 instruments (GC, HPLC, incubators…)", "Calibration schedules & status", "Maintenance records"],
  },
  {
    icon: Users,
    label: "HR & Competence",
    color: "bg-emerald-50 text-emerald-600",
    items: ["17 staff across 2 departments", "62 method & instrument competence records", "Training records + refresher logs"],
  },
  {
    icon: Thermometer,
    label: "Environmental",
    color: "bg-teal-50 text-teal-600",
    items: ["7 monitoring parameters", "98 temperature & humidity readings", "Out-of-range events logged"],
  },
  {
    icon: Package,
    label: "Inventory",
    color: "bg-amber-50 text-amber-600",
    items: ["17 items (chemicals, kits, media)", "4 suppliers", "Lot tracking & expiry"],
  },
  {
    icon: BookOpen,
    label: "Reference Materials",
    color: "bg-lime-50 text-lime-600",
    items: ["5 CRMs / RMs (BCR-063, FAPAS, ATCC)", "Batch records & method approvals", "Certificate traceability"],
  },
  {
    icon: Activity,
    label: "Method Validation & MU",
    color: "bg-sky-50 text-sky-600",
    items: ["5 validation studies (fat, protein, AFM1…)", "4 GUM-compliant MU budgets", "ILAC-G8 decision rules"],
  },
  {
    icon: BarChart3,
    label: "Reports & CoA",
    color: "bg-fuchsia-50 text-fuchsia-600",
    items: ["3 report templates (CoA, Micro, AFM1)", "4 lab reports (ISSUED / DRAFT)", "Accreditation fields on templates"],
  },
];

// ── Permission table ────────────────────────────────────────────────────────

const roleRows = [
  { action: "View dashboard & KPIs",          guest: true,  analyst: true,  qm: true  },
  { action: "Browse orders, samples, results", guest: true,  analyst: true,  qm: true  },
  { action: "View QMS documents & SOPs",       guest: true,  analyst: true,  qm: true  },
  { action: "View QC runs & Westgard charts",  guest: true,  analyst: true,  qm: true  },
  { action: "View audit reports & findings",   guest: true,  analyst: true,  qm: true  },
  { action: "Enter / edit results",            guest: false, analyst: true,  qm: true  },
  { action: "Approve / reject results",        guest: false, analyst: false, qm: true  },
  { action: "Create / close findings",         guest: false, analyst: false, qm: true  },
  { action: "Issue lab reports (CoA)",         guest: false, analyst: false, qm: true  },
  { action: "Manage users & roles",            guest: false, analyst: false, qm: false },
];

// ── Tech stack pills ────────────────────────────────────────────────────────

const techStack = [
  "FastAPI (Python 3.12)",
  "SQLAlchemy async",
  "PostgreSQL 16 – schema-per-tenant",
  "Alembic migrations",
  "JWT + refresh tokens",
  "TOTP MFA",
  "Next.js 15 (App Router)",
  "Tailwind CSS v4",
  "Zustand state",
  "SlowAPI rate limiting",
];

// ── Page ────────────────────────────────────────────────────────────────────

export default function DemoWelcomePage() {
  const router = useRouter();
  const user = useLimsAuthStore((s) => s.user);
  const status = useLimsAuthStore((s) => s.status);

  // Guard: if not authenticated, send back to demo login
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/demo");
  }, [status, router]);

  if (status === "checking" || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header bar ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">B</span>
            </div>
            <span className="font-bold text-gray-900">BLIMS</span>
            <span className="text-gray-300 mx-1">|</span>
            <span className="text-xs text-gray-500 font-medium">Live Demo – Dairy Testing Lab</span>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 bg-blue-600 text-white text-sm px-5 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Enter dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* ── Welcome banner ───────────────────────────────────────────────── */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-blue-200 text-sm font-medium">Read-only demo session active</span>
            </div>
            <h1 className="text-2xl font-extrabold mb-1">Welcome to the BLIMS Live Demo</h1>
            <p className="text-blue-200 text-sm max-w-xl">
              You are exploring a fully-populated dairy testing laboratory running ISO 17025-compliant
              workflows. Every module is seeded with realistic data — browse freely, nothing can be modified.
            </p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-xl px-5 py-4 min-w-50 shrink-0">
            <p className="text-blue-200 text-xs mb-2 font-medium uppercase tracking-wider">Signed in as</p>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">D</div>
              <div>
                <p className="text-white text-sm font-semibold">{user.display_name || user.username || "Demo User"}</p>
                <p className="text-blue-300 text-xs">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <Eye className="w-3.5 h-3.5 text-blue-300" />
              <span className="text-blue-200 text-xs font-medium">GUEST · View-only</span>
            </div>
          </div>
        </div>

        {/* ── Role & Permissions ───────────────────────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Lock className="w-5 h-5 text-gray-400" />
            <h2 className="text-base font-bold text-gray-900">Role & Permissions</h2>
          </div>
          <p className="text-sm text-gray-500 mb-5">
            BLIMS uses fine-grained role-based access control. The demo account has the
            <span className="font-semibold text-gray-700"> GUEST </span>
            role — full read access across all modules, zero write access.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs text-gray-500 font-semibold pb-2 pr-6">Action</th>
                  <th className="text-center text-xs text-gray-500 font-semibold pb-2 px-4">
                    <div className="flex items-center justify-center gap-1">
                      <Eye className="w-3 h-3" /> Guest (you)
                    </div>
                  </th>
                  <th className="text-center text-xs text-gray-500 font-semibold pb-2 px-4">Analyst</th>
                  <th className="text-center text-xs text-gray-500 font-semibold pb-2 px-4">Quality Manager</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {roleRows.map((row) => (
                  <tr key={row.action}>
                    <td className="py-2.5 pr-6 text-gray-700">{row.action}</td>
                    {[row.guest, row.analyst, row.qm].map((allowed, i) => (
                      <td key={i} className="py-2.5 px-4 text-center">
                        {allowed
                          ? <CheckCircle2 className="w-4 h-4 text-green-500 mx-auto" />
                          : <span className="w-4 h-4 block mx-auto text-center text-gray-300 text-lg leading-none">—</span>
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-700">
              In a live tenant, the full role matrix includes Head of Laboratory, Technical Manager,
              HR, Equipment Manager, Auditor, and custom roles — each with granular per-endpoint
              permission codes.
            </p>
          </div>
        </div>

        {/* ── Module capabilities ──────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <BadgeCheck className="w-5 h-5 text-gray-400" />
            <h2 className="text-base font-bold text-gray-900">What's seeded in this demo</h2>
            <span className="ml-auto text-xs text-gray-400">12 modules · all populated</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {modules.map((m) => (
              <div key={m.label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-9 h-9 rounded-xl ${m.color} flex items-center justify-center mb-3`}>
                  <m.icon className="w-4.5 h-4.5" />
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-2">{m.label}</p>
                <ul className="space-y-1">
                  {m.items.map((item) => (
                    <li key={item} className="flex items-start gap-1.5 text-xs text-gray-500">
                      <span className="text-green-500 mt-0.5">·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tech stack ───────────────────────────────────────────────────── */}
        <div className="bg-gray-900 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">Technical architecture</h2>
          </div>
          <p className="text-gray-400 text-sm mb-5">
            BLIMS is a multi-tenant SaaS LIMS. Each laboratory gets an isolated PostgreSQL
            schema — complete data separation with no shared tables between tenants.
            Authentication uses short-lived JWTs with HttpOnly refresh tokens and optional TOTP MFA.
          </p>
          <div className="flex flex-wrap gap-2 mb-5">
            {techStack.map((t) => (
              <span key={t} className="bg-gray-800 text-gray-300 text-xs px-3 py-1.5 rounded-full border border-gray-700 font-mono">
                {t}
              </span>
            ))}
          </div>
          <div className="grid sm:grid-cols-3 gap-4 text-center">
            {[
              { label: "Schema isolation", value: "per tenant", sub: "PostgreSQL schema-per-tenant" },
              { label: "Token lifetime", value: "30 min", sub: "JWT access + 30-day refresh" },
              { label: "Migration system", value: "Alembic", sub: "Per-tenant upgrade on provision" },
            ].map((s) => (
              <div key={s.label} className="bg-gray-800 rounded-xl p-4">
                <p className="text-white font-bold text-lg">{s.value}</p>
                <p className="text-blue-400 text-xs font-semibold mb-0.5">{s.label}</p>
                <p className="text-gray-500 text-xs">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <div className="text-center pb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="inline-flex items-center gap-2.5 bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-base hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            Enter the dashboard <ArrowRight className="w-5 h-5" />
          </button>
          <p className="mt-3 text-xs text-gray-400">
            Read-only · No data will be modified · Session expires in 30 minutes
          </p>
        </div>

      </div>
    </div>
  );
}
