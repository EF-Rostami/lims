"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  Rocket,
  RefreshCw,
  Settings,
  Eye,
  RotateCcw,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useGoLiveDefinitions,
  useReadiness,
  useExecuteGoLive,
  useUpsertGoLiveConfig,
  useResetGoLiveConfig,
} from "@/features/lims/consultancy/consultancy.queries";
import { GoLiveDefinitionWithConfig } from "@/features/lims/consultancy/consultancy.api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const CATEGORY_LABELS: Record<string, string> = {
  ORGANISATION: "Organisation",
  PERSONNEL: "Personnel",
  TECHNICAL: "Technical",
  DOCUMENTATION: "Documentation",
  CONSULTANCY: "Consultancy",
};

const CATEGORY_GO_FIX_LINKS: Record<string, string> = {
  ORGANISATION: "/lims/hr/departments",
  PERSONNEL: "/lims/hr/employees",
  TECHNICAL: "/lims/instruments",
  DOCUMENTATION: "/lims/qms-documents",
};

function SeverityBadge({ severity }: { severity: string }) {
  if (severity === "BLOCKING") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
        BLOCKING
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
      WARNING
    </span>
  );
}

function ConfigureRow({
  defn,
  projectId,
}: {
  defn: GoLiveDefinitionWithConfig;
  projectId: number;
}) {
  const upsert = useUpsertGoLiveConfig(projectId);
  const reset = useResetGoLiveConfig(projectId);
  const [threshold, setThreshold] = useState(String(defn.effective_threshold));
  const [severity, setSeverity] = useState(defn.effective_severity);
  const [enabled, setEnabled] = useState(defn.is_enabled);
  const [dirty, setDirty] = useState(false);

  const handleSave = () => {
    upsert.mutate({
      checkKey: defn.check_key,
      data: {
        threshold: threshold !== "" ? Number(threshold) : null,
        severity,
        is_enabled: enabled,
      },
    });
    setDirty(false);
  };

  const handleReset = () => {
    reset.mutate(defn.check_key, {
      onSuccess: () => {
        setThreshold(String(defn.default_threshold));
        setSeverity(defn.default_severity);
        setEnabled(true);
        setDirty(false);
      },
    });
  };

  const needsThreshold = ["COUNT_GTE", "FUNC_ROLE", "DELEGATION", "DEPT_EXISTS"].includes(
    defn.check_type,
  );

  return (
    <div className={`border rounded-lg px-4 py-3 ${!enabled ? "opacity-50" : ""}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{defn.label}</span>
            {defn.has_override && (
              <Badge variant="outline" className="text-[10px] h-4 px-1">
                customised
              </Badge>
            )}
          </div>
          {defn.guidance_text && (
            <p className="text-xs text-muted-foreground mt-0.5">{defn.guidance_text}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          {/* Enabled toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer text-xs">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => { setEnabled(e.target.checked); setDirty(true); }}
              className="rounded"
            />
            Enabled
          </label>

          {/* Threshold (only for count-based checks) */}
          {needsThreshold && (
            <div className="flex items-center gap-1 text-xs">
              <span className="text-muted-foreground">Min:</span>
              <input
                type="number"
                min={0}
                value={threshold}
                onChange={(e) => { setThreshold(e.target.value); setDirty(true); }}
                className="w-14 border rounded px-1.5 py-0.5 text-xs bg-background"
              />
            </div>
          )}

          {/* Severity toggle */}
          <select
            value={severity}
            onChange={(e) => { setSeverity(e.target.value as "BLOCKING" | "WARNING"); setDirty(true); }}
            className="border rounded px-1.5 py-0.5 text-xs bg-background"
          >
            <option value="BLOCKING">BLOCKING</option>
            <option value="WARNING">WARNING</option>
          </select>

          {/* Save / Reset */}
          {dirty && (
            <Button size="sm" className="h-6 text-xs px-2" onClick={handleSave} disabled={upsert.isPending}>
              Save
            </Button>
          )}
          {defn.has_override && (
            <Button
              size="sm"
              variant="ghost"
              className="h-6 text-xs px-1.5"
              onClick={handleReset}
              disabled={reset.isPending}
              title="Reset to default"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GoLivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const projectId = Number(id);

  const [tab, setTab] = useState<"configure" | "readiness">("readiness");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: definitions = [], isLoading: defsLoading } = useGoLiveDefinitions(projectId);
  const { data: report, isLoading: reportLoading, refetch } = useReadiness(projectId);
  const executeGoLive = useExecuteGoLive(projectId);

  const handleGoLive = async () => {
    await executeGoLive.mutateAsync();
    setConfirmOpen(false);
    refetch();
  };

  // Group definitions by category
  const byCategory = definitions.reduce<Record<string, GoLiveDefinitionWithConfig[]>>((acc, d) => {
    (acc[d.category] ||= []).push(d);
    return acc;
  }, {});

  // Group readiness checks by category
  const checksByCategory = (report?.checks ?? []).reduce<
    Record<string, typeof report.checks>
  >((acc, c) => {
    (acc[c.category] ||= []).push(c);
    return acc;
  }, {});

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold">Go-Live Readiness</h1>
        <div className="flex-1" />
        <Button size="sm" variant="outline" onClick={() => refetch()} className="h-7 text-xs">
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "readiness"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setTab("readiness")}
        >
          <Eye className="h-3.5 w-3.5" />
          Readiness
        </button>
        <button
          className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === "configure"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
          onClick={() => setTab("configure")}
        >
          <Settings className="h-3.5 w-3.5" />
          Configure Checks
        </button>
      </div>

      {/* ── READINESS TAB ─────────────────────────────────────────────────────── */}
      {tab === "readiness" && (
        <div className="space-y-5">
          {reportLoading && (
            <p className="text-sm text-muted-foreground animate-pulse">Running readiness checks…</p>
          )}

          {report && (
            <>
              {/* Overall banner */}
              <div
                className={`border rounded-lg p-4 flex items-center gap-3 ${
                  report.all_blocking_passed
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                {report.all_blocking_passed ? (
                  <CheckCircle className="h-6 w-6 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500 shrink-0" />
                )}
                <div>
                  <p
                    className={`font-semibold text-sm ${
                      report.all_blocking_passed ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {report.all_blocking_passed
                      ? "All blocking checks passed — ready for go-live"
                      : "Blocking checks remain — go-live is not yet possible"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {report.passed} / {report.total} checks passed · Standard:{" "}
                    {report.standard}
                  </p>
                </div>
                {report.all_blocking_passed && (
                  <div className="flex-1 flex justify-end">
                    <Button size="sm" onClick={() => setConfirmOpen(true)}>
                      <Rocket className="h-3.5 w-3.5 mr-1.5" />
                      Execute Go-Live
                    </Button>
                  </div>
                )}
              </div>

              {/* Checks by category */}
              {Object.entries(checksByCategory).map(([cat, checks]) => (
                <div key={cat} className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {CATEGORY_LABELS[cat] ?? cat}
                  </h3>
                  {checks.map((check) => {
                    const fixLink =
                      check.category === "CONSULTANCY"
                        ? check.check_key === "no_high_tasks" || check.check_key === "no_deficiencies"
                          ? `/consultant/projects/${id}/tasks`
                          : `/consultant/projects/${id}/assessment`
                        : CATEGORY_GO_FIX_LINKS[check.category];
                    return (
                      <div
                        key={check.check_key}
                        className={`border rounded-lg px-4 py-3 flex items-start gap-3 ${
                          check.passed
                            ? "border-green-100"
                            : check.severity === "BLOCKING"
                              ? "border-red-200 bg-red-50/30"
                              : "border-amber-200 bg-amber-50/30"
                        }`}
                      >
                        {check.passed ? (
                          <CheckCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                        ) : check.severity === "BLOCKING" ? (
                          <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">{check.label}</span>
                            <SeverityBadge severity={check.severity} />
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{check.details}</p>
                        </div>
                        {!check.passed && fixLink && (
                          <Link
                            href={fixLink}
                            className="text-xs text-primary underline-offset-4 hover:underline shrink-0"
                          >
                            → Go fix
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* ── CONFIGURE TAB ─────────────────────────────────────────────────────── */}
      {tab === "configure" && (
        <div className="space-y-5">
          <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5">
            <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              Customise thresholds, severity, and enable/disable checks for this project. Changes
              override the standard defaults. Click "Reset" to restore a check to its default.
            </p>
          </div>

          {defsLoading && (
            <p className="text-sm text-muted-foreground animate-pulse">Loading check definitions…</p>
          )}

          {Object.entries(byCategory).map(([cat, defs]) => (
            <div key={cat} className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {CATEGORY_LABELS[cat] ?? cat}
              </h3>
              {defs.map((defn) => (
                <ConfigureRow key={defn.check_key} defn={defn} projectId={projectId} />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Go-Live confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Go-Live</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <p className="text-sm text-muted-foreground">
              This will mark the project as COMPLETED and record today as the actual go-live date.
            </p>
            <p className="text-sm font-medium text-amber-700">
              This action cannot be undone through the UI.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleGoLive} disabled={executeGoLive.isPending}>
              {executeGoLive.isPending ? "Executing…" : "Confirm Go-Live"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
