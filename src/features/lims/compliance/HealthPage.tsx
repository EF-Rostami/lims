"use client";

import { useState } from "react";
import {
  CheckCircle, XCircle, AlertTriangle, MinusCircle, AlertCircle, PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LimsPageLayout } from "@/features/lims/components/LimsPageLayout";
import {
  useComplianceHealth,
  useComplianceHistory,
  useComplianceResults,
  useRunCompliance,
} from "./compliance.queries";
import type { ComplianceCheckResultRead, ScoreHistoryPoint } from "./compliance.api";

// ── Constants ──────────────────────────────────────────────────────────────────

const MODULE_LABELS: Record<string, string> = {
  CAL: "Calibration & Equipment",
  COMP: "Personnel Competence",
  DOC: "Document Control",
  IA: "Internal Audits",
  CAPA: "Corrective & Preventive Actions",
  PT: "Proficiency Testing",
  MU: "Measurement Uncertainty",
  METHOD: "Test Methods",
  FIND: "Nonconformities",
  MR: "Management Review",
  CMPL: "Complaints",
  ENV: "Environmental Conditions",
  SUP: "Supplier Management",
  DAKKS: "DAkkS Requirements",
  SAMPLE: "Sample Management",
  RPT: "Reporting",
  INV: "Inventory",
};

// Render order for module groups
const MODULE_ORDER = [
  "CAL", "COMP", "METHOD", "MU", "PT",
  "SAMPLE", "RPT", "INV", "ENV", "SUP",
  "DOC", "FIND", "CAPA", "IA", "CMPL", "MR", "DAKKS",
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function getPrefix(checkKey: string): string {
  return checkKey.split("-")[0];
}

function groupByModule(
  results: ComplianceCheckResultRead[],
): Record<string, ComplianceCheckResultRead[]> {
  return results.reduce<Record<string, ComplianceCheckResultRead[]>>((acc, r) => {
    const p = getPrefix(r.check.check_key);
    if (!acc[p]) acc[p] = [];
    acc[p].push(r);
    return acc;
  }, {});
}

function sortedPrefixes(groups: Record<string, ComplianceCheckResultRead[]>): string[] {
  const known = MODULE_ORDER.filter((p) => p in groups);
  const unknown = Object.keys(groups).filter((p) => !MODULE_ORDER.includes(p));
  return [...known, ...unknown];
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.min(score, 100) / 100);
  const color = score >= 90 ? "#16a34a" : score >= 70 ? "#ca8a04" : "#dc2626";

  return (
    <svg viewBox="0 0 128 128" className="w-36 h-36" aria-label={`Compliance score: ${score} out of 100`}>
      <circle
        cx="64" cy="64" r={radius}
        fill="none" stroke="#e2e8f0" strokeWidth="12"
      />
      <circle
        cx="64" cy="64" r={radius}
        fill="none" stroke={color} strokeWidth="12"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        transform="rotate(-90 64 64)"
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
      <text x="64" y="60" textAnchor="middle" fontSize="30" fontWeight="bold" fill={color}>
        {score}
      </text>
      <text x="64" y="78" textAnchor="middle" fontSize="11" fill="#94a3b8">
        / 100
      </text>
    </svg>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 px-5 py-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  switch (status) {
    case "PASS":    return <CheckCircle   className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />;
    case "FAIL":    return <XCircle       className="h-4 w-4 text-red-600   shrink-0 mt-0.5" />;
    case "WARNING": return <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0 mt-0.5" />;
    case "NA":      return <MinusCircle   className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />;
    default:        return <AlertCircle   className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />;
  }
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PASS:    "bg-green-100 text-green-700",
    FAIL:    "bg-red-100   text-red-700",
    WARNING: "bg-yellow-100 text-yellow-700",
    NA:      "bg-slate-100 text-slate-500",
    ERROR:   "bg-orange-100 text-orange-700",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${styles[status] ?? "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}

function SeverityDot({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    CRITICAL:    "bg-red-500",
    MAJOR:       "bg-orange-400",
    MINOR:       "bg-yellow-400",
    OBSERVATION: "bg-blue-400",
  };
  return (
    <span
      title={severity}
      className={`inline-block h-2 w-2 rounded-full shrink-0 mt-1.5 ${colors[severity] ?? "bg-slate-300"}`}
    />
  );
}

function ModuleGroup({
  prefix,
  results,
  defaultExpanded = false,
}: {
  prefix: string;
  results: ComplianceCheckResultRead[];
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const label  = MODULE_LABELS[prefix] ?? prefix;
  const passed  = results.filter((r) => r.status === "PASS").length;
  const failed  = results.filter((r) => r.status === "FAIL").length;
  const warning = results.filter((r) => r.status === "WARNING").length;
  const na      = results.filter((r) => r.status === "NA").length;

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-slate-50 text-left transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-800">{label}</span>
          <span className="text-xs text-slate-400">{results.length} checks</span>
        </div>
        <div className="flex items-center gap-3">
          {passed  > 0 && <span className="text-xs text-green-700 font-medium">{passed} passed</span>}
          {warning > 0 && <span className="text-xs text-yellow-700 font-medium">{warning} warn</span>}
          {failed  > 0 && <span className="text-xs text-red-700 font-medium">{failed} failed</span>}
          {na      > 0 && <span className="text-xs text-slate-400">{na} N/A</span>}
          <svg
            className={`h-4 w-4 text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 divide-y divide-slate-100">
          {results.map((r) => (
            <div key={r.id} className="px-4 py-3 flex items-start gap-3 bg-white">
              <StatusIcon status={r.status} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-xs font-mono text-slate-400 shrink-0">{r.check.clause_ref}</span>
                  <SeverityDot severity={r.check.severity} />
                  <span className="text-xs text-slate-400">{r.check.severity}</span>
                  <span className="text-xs text-slate-300">·</span>
                  <span className="text-xs text-slate-400">{r.check.layer}</span>
                </div>
                <p className="text-sm text-slate-700">{r.check.question}</p>
                {r.evidence_summary && (
                  <p className="text-xs text-slate-500 mt-1">{r.evidence_summary}</p>
                )}
                {r.failing_record_ids && r.failing_record_ids.length > 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    {r.failing_record_ids.length} failing record
                    {r.failing_record_ids.length !== 1 ? "s" : ""}:{" "}
                    #{r.failing_record_ids.slice(0, 5).join(", #")}
                    {r.failing_record_ids.length > 5
                      ? ` …+${r.failing_record_ids.length - 5} more`
                      : ""}
                  </p>
                )}
              </div>
              <StatusBadge status={r.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Score sparkline ────────────────────────────────────────────────────────────

function ScoreSparkline({ points }: { points: ScoreHistoryPoint[] }) {
  if (points.length < 2) return null;

  const W = 280, H = 64, PAD = 6;
  const scores = points.map((p) => p.score);
  const minS = Math.min(...scores);
  const maxS = Math.max(...scores);
  const range = maxS - minS || 1;

  const x = (i: number) => PAD + (i / (points.length - 1)) * (W - PAD * 2);
  const y = (s: number) => PAD + (1 - (s - minS) / range) * (H - PAD * 2);

  const polyline = points.map((p, i) => `${x(i)},${y(p.score)}`).join(" ");
  const latest = points[points.length - 1];
  const first  = points[0];
  const trend  = latest.score - first.score;
  const trendColor = trend > 0 ? "#16a34a" : trend < 0 ? "#dc2626" : "#94a3b8";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-xs text-slate-400 px-0.5">
        <span>
          {new Date(first.evaluated_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
        <span className="font-medium" style={{ color: trendColor }}>
          {trend > 0 ? `+${trend}` : trend === 0 ? "—" : trend} pts
        </span>
        <span>
          {new Date(latest.evaluated_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-14">
        {/* Fill area */}
        <defs>
          <linearGradient id="spark-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon
          points={`${x(0)},${H} ${polyline} ${x(points.length - 1)},${H}`}
          fill="url(#spark-fill)"
        />
        {/* Line */}
        <polyline
          points={polyline}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="1.8"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Dots */}
        {points.map((p, i) => (
          <circle key={p.run_id} cx={x(i)} cy={y(p.score)} r="2.5" fill="#3b82f6">
            <title>{`${new Date(p.evaluated_at).toLocaleDateString()} — ${p.score}%`}</title>
          </circle>
        ))}
      </svg>
      <p className="text-[10px] text-slate-400 text-center">{points.length} runs — last 90 days</p>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export function HealthPage() {
  const { data: summary, isLoading: summaryLoading, isError: summaryError } = useComplianceHealth();
  const { data: results = [], isLoading: resultsLoading } = useComplianceResults();
  const { data: history = [] } = useComplianceHistory(90);
  const runNow = useRunCompliance();

  const isLoading = summaryLoading || resultsLoading;
  const groups    = groupByModule(results);
  const prefixes  = sortedPrefixes(groups);

  // Auto-expand groups that have at least one failure
  const hasFailure = (prefix: string) =>
    (groups[prefix] ?? []).some((r) => r.status === "FAIL");

  return (
    <LimsPageLayout
      title="Lab Compliance Health"
      description="Continuous ISO 17025 + DAkkS compliance monitoring — updated every 24 hours."
      headerExtra={
        <Button
          variant="outline"
          size="sm"
          onClick={() => runNow.mutate()}
          disabled={runNow.isPending}
        >
          <PlayCircle className="h-4 w-4 me-1.5" />
          {runNow.isPending ? "Running…" : "Run Now"}
        </Button>
      }
    >
      {/* Run-now error */}
      {runNow.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <div className="text-sm text-red-700">
            <strong>Run failed.</strong> Check that the compliance migration has been applied
            (<code className="text-xs bg-red-100 px-1 py-0.5 rounded">alembic upgrade head</code>) and inspect the server logs for the full error.
          </div>
        </div>
      )}

      {/* API error on health endpoint */}
      {!isLoading && summaryError && (
        <div className="flex flex-col items-center gap-4 py-20 text-slate-500">
          <AlertCircle className="h-12 w-12 text-red-300" />
          <p className="text-sm text-red-600">Could not load compliance data. The server returned an error — check that the compliance tables exist and the migration has been applied.</p>
          <p className="text-xs text-slate-400">Endpoint: <code>GET /lims/compliance/health</code></p>
        </div>
      )}

      {/* No runs yet — explicit null from API (tables exist, no run has been performed) */}
      {!isLoading && !summaryError && summary === null && (
        <div className="flex flex-col items-center gap-4 py-20 text-slate-500">
          <AlertCircle className="h-12 w-12 text-slate-300" />
          <p className="text-sm">No compliance run found. Click <strong>Run Now</strong> to perform the first assessment.</p>
        </div>
      )}

      {summary != null && (
        <div className="space-y-6">
          {/* ── Score + stats ── */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              {/* Ring */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <ScoreRing score={summary.score} />
                <p className="text-xs text-slate-400 mt-1">
                  Last run: {fmtDate(summary.evaluated_at)}
                </p>
              </div>

              {/* Trend sparkline */}
              {history.length >= 2 && (
                <div className="w-72 shrink-0 hidden sm:block">
                  <p className="text-xs text-slate-400 mb-1 font-medium">Score trend</p>
                  <ScoreSparkline points={history} />
                </div>
              )}

              {/* Stats grid */}
              <div className="flex-1 w-full">
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  <StatCard label="Passed"   value={summary.passed}          color="text-green-600" />
                  <StatCard label="Failed"   value={summary.failed}          color="text-red-600"   />
                  <StatCard label="Warnings" value={summary.warnings}        color="text-yellow-600"/>
                  <StatCard label="N/A"      value={summary.not_applicable}  color="text-slate-400" />
                  <StatCard label="Total"    value={summary.total}           color="text-slate-700" />
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  Score = passed ÷ (total − N/A − errors) × 100.
                  {summary.errors > 0 && (
                    <span className="text-orange-600 ms-1">{summary.errors} check(s) errored during evaluation.</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* ── Critical failures ── */}
          {summary.critical_failures.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="h-5 w-5 text-red-600" />
                <h2 className="text-sm font-semibold text-red-800">
                  Critical Failures ({summary.critical_failures.length})
                </h2>
              </div>
              <ul className="space-y-1.5">
                {summary.critical_failures.map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-red-700">
                    <span className="shrink-0 mt-1">•</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Major failures ── */}
          {summary.major_failures.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <h2 className="text-sm font-semibold text-orange-800">
                  Major Findings ({summary.major_failures.length})
                </h2>
              </div>
              <ul className="space-y-1.5">
                {summary.major_failures.map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-orange-700">
                    <span className="shrink-0 mt-1">•</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Grouped check results ── */}
          {results.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-700 mb-3">
                Check Results by Module
              </h2>
              <div className="space-y-2">
                {prefixes.map((prefix) => (
                  <ModuleGroup
                    key={prefix}
                    prefix={prefix}
                    results={groups[prefix]}
                    defaultExpanded={hasFailure(prefix)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-4 animate-pulse">
          <div className="h-40 bg-slate-100 rounded-xl" />
          <div className="h-24 bg-slate-100 rounded-xl" />
          <div className="h-24 bg-slate-100 rounded-xl" />
        </div>
      )}
    </LimsPageLayout>
  );
}
