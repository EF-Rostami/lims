"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, AlertTriangle, CheckCircle, XCircle, Activity, FolderOpen } from "lucide-react";
import { useMyLabsHealth, useMyLabsProjects } from "./labs-overview.queries";
import type { LabHealthSummary, ProjectBrief } from "./labs-overview.api";

// ── Helpers ────────────────────────────────────────────────────────────────────

function scoreColor(score: number | null): string {
  if (score === null) return "bg-gray-100 text-gray-500";
  if (score < 60) return "bg-red-100 text-red-700";
  if (score < 80) return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
}

function scoreBarColor(score: number | null): string {
  if (score === null) return "bg-gray-300";
  if (score < 60) return "bg-red-500";
  if (score < 80) return "bg-yellow-400";
  return "bg-green-500";
}

function riskLabel(score: number | null): string {
  if (score === null) return "No data";
  if (score < 60) return "High risk";
  if (score < 80) return "Moderate";
  return "On track";
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── Status chip for project status ────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  PLANNING:   "bg-slate-100 text-slate-600",
  ACTIVE:     "bg-blue-100 text-blue-700",
  ON_HOLD:    "bg-amber-100 text-amber-700",
  COMPLETED:  "bg-green-100 text-green-700",
  CANCELLED:  "bg-red-100 text-red-700",
};

function projectStatusChip(status: string) {
  return STATUS_COLORS[status] ?? "bg-muted text-muted-foreground";
}

// ── Row ────────────────────────────────────────────────────────────────────────

function LabRow({ lab, projects }: { lab: LabHealthSummary; projects: ProjectBrief[] }) {
  const [expanded, setExpanded] = useState(false);
  const pct = lab.score ?? 0;

  return (
    <>
      <tr
        className="border-b hover:bg-muted/40 cursor-pointer transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Expand toggle + lab name */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            {expanded
              ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
              : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />}
            <span className="font-medium text-sm">{lab.tenant_name}</span>
          </div>
        </td>

        {/* Score bar + badge */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${scoreBarColor(lab.score)}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${scoreColor(lab.score)}`}>
              {lab.score !== null ? `${lab.score}%` : "—"}
            </span>
          </div>
        </td>

        {/* Risk label */}
        <td className="py-3 px-4 text-sm text-muted-foreground">{riskLabel(lab.score)}</td>

        {/* Critical */}
        <td className="py-3 px-4">
          {lab.critical_count > 0 ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
              <AlertTriangle className="h-3 w-3" /> {lab.critical_count}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </td>

        {/* Major */}
        <td className="py-3 px-4">
          {lab.major_count > 0 ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-yellow-700 bg-yellow-50 px-2 py-0.5 rounded-full">
              <AlertTriangle className="h-3 w-3" /> {lab.major_count}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </td>

        {/* Last run */}
        <td className="py-3 px-4 text-xs text-muted-foreground">{formatDate(lab.last_run_at)}</td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="border-b bg-muted/20">
          <td colSpan={6} className="px-8 py-4">
            <div className="grid grid-cols-3 gap-6 text-sm">
              <Stat
                icon={<CheckCircle className="h-4 w-4 text-green-500" />}
                label="Passed"
                value={lab.passed}
              />
              <Stat
                icon={<XCircle className="h-4 w-4 text-red-500" />}
                label="Failed"
                value={lab.failed}
              />
              <Stat
                icon={<Activity className="h-4 w-4 text-blue-500" />}
                label="Total checks"
                value={lab.total_checks}
              />
            </div>
            {lab.score === null && (
              <p className="mt-3 text-xs text-muted-foreground italic">
                No compliance run has been performed for this lab yet.
              </p>
            )}

            {/* Projects */}
            <div className="mt-4 border-t pt-3">
              <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                <FolderOpen className="h-3.5 w-3.5" />
                Projects in this lab
              </p>
              {projects.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No accreditation projects yet.</p>
              ) : (
                <div className="flex flex-col gap-1">
                  {projects.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 text-xs">
                      <span className={`rounded-full px-2 py-0.5 font-medium ${projectStatusChip(p.status)}`}>
                        {p.status}
                      </span>
                      <span className="font-medium text-foreground">{p.name}</span>
                      {p.target_go_live && (
                        <span className="text-muted-foreground">
                          Target: {new Date(p.target_go_live).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-muted-foreground">{label}:</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function LabsOverviewPage() {
  const { data: labs = [], isLoading, isError } = useMyLabsHealth();
  const { data: labProjects = [] } = useMyLabsProjects();

  const projectsBySchema = Object.fromEntries(
    labProjects.map((lp) => [lp.tenant_schema, lp.projects])
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl font-semibold">My Labs</h1>
        <p className="text-sm text-muted-foreground">
          Health overview of all laboratories you are assigned to — sorted by risk (highest risk first).
          Use the <strong>Current Lab</strong> sidebar section to navigate projects, frameworks, and meetings
          for the lab you are currently working in.
        </p>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground animate-pulse">Loading labs…</p>
      )}

      {isError && (
        <div className="border border-red-200 bg-red-50 rounded-lg p-4 text-sm text-red-700">
          Could not load lab data. Please try again.
        </div>
      )}

      {!isLoading && !isError && labs.length === 0 && (
        <div className="border rounded-lg p-8 text-center text-muted-foreground text-sm">
          <Activity className="h-8 w-8 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No labs assigned yet.</p>
          <p className="mt-1">Ask your account manager to assign you to a laboratory.</p>
        </div>
      )}

      {!isLoading && labs.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="text-start py-2.5 px-4 font-medium text-muted-foreground">Laboratory</th>
                <th className="text-start py-2.5 px-4 font-medium text-muted-foreground">Health Score</th>
                <th className="text-start py-2.5 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-start py-2.5 px-4 font-medium text-muted-foreground">Critical</th>
                <th className="text-start py-2.5 px-4 font-medium text-muted-foreground">Major</th>
                <th className="text-start py-2.5 px-4 font-medium text-muted-foreground">Last Run</th>
              </tr>
            </thead>
            <tbody>
              {labs.map((lab) => (
                <LabRow
                  key={lab.assignment_id}
                  lab={lab}
                  projects={projectsBySchema[lab.tenant_schema] ?? []}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Click any row to expand pass/fail details.
        To run a new compliance assessment, open the individual lab&apos;s health dashboard.
      </p>
    </div>
  );
}
