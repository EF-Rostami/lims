"use client";

import { useMemo } from "react";
import { AlertCircle, CheckCircle2, Circle, MinusCircle, ShieldAlert } from "lucide-react";
import { useProjects } from "@/features/lims/consultancy/consultancy.queries";
import { useAssessments } from "@/features/lims/consultancy/consultancy.queries";
import { useAssessmentItems } from "@/features/lims/consultancy/consultancy.queries";
import type { GapAssessmentItemRead } from "@/features/lims/consultancy/consultancy.api";

type ComplianceStatus = GapAssessmentItemRead["compliance_status"];

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  COMPLIANT: {
    label: "Compliant",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    className: "bg-green-100 text-green-700 border border-green-200",
  },
  PARTIAL: {
    label: "Partial",
    icon: <Circle className="w-3.5 h-3.5" />,
    className: "bg-amber-100 text-amber-700 border border-amber-200",
  },
  DEFICIENT: {
    label: "Deficient",
    icon: <AlertCircle className="w-3.5 h-3.5" />,
    className: "bg-red-100 text-red-700 border border-red-200",
  },
  NOT_ASSESSED: {
    label: "Not Assessed",
    icon: <MinusCircle className="w-3.5 h-3.5" />,
    className: "bg-gray-100 text-gray-500 border border-gray-200",
  },
  NOT_APPLICABLE: {
    label: "N/A",
    icon: <MinusCircle className="w-3.5 h-3.5" />,
    className: "bg-slate-100 text-slate-400 border border-slate-200",
  },
};

const RISK_CONFIG: Record<string, string> = {
  LOW: "bg-blue-100 text-blue-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.NOT_ASSESSED;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.className}`}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function RiskBadge({ risk }: { risk: string | null }) {
  if (!risk) return <span className="text-xs text-muted-foreground">—</span>;
  const cls = RISK_CONFIG[risk] ?? "bg-gray-100 text-gray-500";
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${cls}`}>
      {risk.charAt(0) + risk.slice(1).toLowerCase()}
    </span>
  );
}

function SummaryBar({ items }: { items: GapAssessmentItemRead[] }) {
  const counts = useMemo(() => {
    const c = { COMPLIANT: 0, PARTIAL: 0, DEFICIENT: 0, NOT_ASSESSED: 0, NOT_APPLICABLE: 0 };
    items.forEach((it) => {
      const k = it.compliance_status as keyof typeof c;
      if (k in c) c[k]++;
    });
    return c;
  }, [items]);

  const total = items.length;
  const assessed = counts.COMPLIANT + counts.PARTIAL + counts.DEFICIENT;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {[
        { label: "Compliant", count: counts.COMPLIANT, cls: "text-green-600" },
        { label: "Partial", count: counts.PARTIAL, cls: "text-amber-600" },
        { label: "Deficient", count: counts.DEFICIENT, cls: "text-red-600" },
        { label: "Not Assessed", count: counts.NOT_ASSESSED, cls: "text-gray-400" },
      ].map(({ label, count, cls }) => (
        <div key={label} className="border rounded-lg p-4">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${cls}`}>{count}</p>
        </div>
      ))}
      <div className="border rounded-lg p-4 sm:col-span-4 col-span-2 flex items-center gap-3">
        <ShieldAlert className="w-4 h-4 text-muted-foreground shrink-0" />
        <div className="flex-1 bg-gray-100 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all"
            style={{ width: total > 0 ? `${Math.round((counts.COMPLIANT / total) * 100)}%` : "0%" }}
          />
        </div>
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {assessed} / {total} assessed
        </span>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

function GapTable({ assessmentId }: { assessmentId: number }) {
  const { data: items, isLoading, isError } = useAssessmentItems(assessmentId);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 bg-muted animate-pulse rounded" />
        ))}
      </div>
    );
  }

  if (isError || !items) {
    return <p className="text-sm text-muted-foreground">Could not load assessment items.</p>;
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No clauses in this assessment yet. Populate it from the project assessment page.
      </p>
    );
  }

  return (
    <>
      <SummaryBar items={items} />
      <div className="border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-3 py-2.5 font-medium text-muted-foreground w-24">Clause</th>
              <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Title</th>
              <th className="text-left px-3 py-2.5 font-medium text-muted-foreground w-36">Status</th>
              <th className="text-left px-3 py-2.5 font-medium text-muted-foreground w-24">Risk</th>
              <th className="text-left px-3 py-2.5 font-medium text-muted-foreground">Finding</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-3 py-2.5 font-mono text-xs text-muted-foreground">
                  {item.clause?.clause_number ?? `#${item.clause_id}`}
                </td>
                <td className="px-3 py-2.5 font-medium">
                  {item.clause?.title ?? "—"}
                </td>
                <td className="px-3 py-2.5">
                  <StatusBadge status={item.compliance_status} />
                </td>
                <td className="px-3 py-2.5">
                  <RiskBadge risk={item.risk_level} />
                </td>
                <td className="px-3 py-2.5 text-muted-foreground max-w-xs truncate">
                  {item.finding || <span className="italic text-gray-300">—</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function AssessmentView({ projectId }: { projectId: number }) {
  const { data: assessments, isLoading } = useAssessments(projectId);

  if (isLoading) return <div className="h-8 w-48 bg-muted animate-pulse rounded" />;

  const latest = assessments?.[0];
  if (!latest) {
    return (
      <p className="text-sm text-muted-foreground py-8 text-center">
        No gap assessment created for this project yet.
      </p>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-medium">{latest.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Status: <span className="capitalize">{latest.status.toLowerCase().replace("_", " ")}</span>
            {latest.assessed_at && (
              <> · Assessed {new Date(latest.assessed_at).toLocaleDateString()}</>
            )}
          </p>
        </div>
      </div>
      <GapTable assessmentId={latest.id} />
    </div>
  );
}

export default function ConsultantGapAssessmentPage() {
  const { data: projects, isLoading } = useProjects();

  const activeProject = useMemo(() => {
    if (!projects) return null;
    return projects.find((p) => p.status === "IN_PROGRESS") ?? projects[0] ?? null;
  }, [projects]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Gap Assessment</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Clause-by-clause compliance status for the active accreditation project.
        </p>
      </div>

      {isLoading && (
        <div className="space-y-3">
          <div className="h-6 w-64 bg-muted animate-pulse rounded" />
          <div className="h-4 w-40 bg-muted animate-pulse rounded" />
        </div>
      )}

      {!isLoading && !activeProject && (
        <div className="border rounded-lg p-8 text-center">
          <p className="text-sm text-muted-foreground">No accreditation project found.</p>
        </div>
      )}

      {activeProject && (
        <div className="border rounded-xl p-5 bg-card">
          <div className="flex items-center gap-3 mb-5 pb-4 border-b">
            <div className="w-8 h-8 rounded-lg bg-sky-100 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-sky-600" />
            </div>
            <div>
              <p className="font-semibold">{activeProject.name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {activeProject.status.toLowerCase().replace("_", " ")}
                {activeProject.target_go_live && (
                  <> · Target: {new Date(activeProject.target_go_live).toLocaleDateString()}</>
                )}
              </p>
            </div>
          </div>
          <AssessmentView projectId={activeProject.id} />
        </div>
      )}
    </div>
  );
}
