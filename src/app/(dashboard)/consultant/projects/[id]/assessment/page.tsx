"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, ChevronDown, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useAssessments,
  useCreateAssessment,
  useUpdateAssessment,
  useAssessmentItems,
  useUpdateAssessmentItem,
  useFrameworks,
  consultancyKeys,
} from "@/features/lims/consultancy/consultancy.queries";
import { consultancyApi } from "@/features/lims/consultancy/consultancy.api";
import type {
  GapAssessmentRead,
  GapAssessmentItemRead,
  ComplianceStatus,
} from "@/features/lims/consultancy/consultancy.api";

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUSES: ComplianceStatus[] = [
  "NOT_ASSESSED",
  "COMPLIANT",
  "PARTIAL",
  "DEFICIENT",
  "NOT_APPLICABLE",
];

const STATUS_LABEL: Record<string, string> = {
  NOT_ASSESSED: "Not Assessed",
  COMPLIANT: "Compliant",
  PARTIAL: "Partial",
  DEFICIENT: "Deficient",
  NOT_APPLICABLE: "N/A",
};

const STATUS_SELECT_STYLE: Record<string, string> = {
  NOT_ASSESSED: "bg-gray-50 text-gray-500 border-gray-200",
  COMPLIANT: "bg-green-50 text-green-700 border-green-300",
  PARTIAL: "bg-amber-50 text-amber-700 border-amber-300",
  DEFICIENT: "bg-red-50 text-red-700 border-red-300",
  NOT_APPLICABLE: "bg-slate-50 text-slate-500 border-slate-200",
};

const ROW_BORDER: Record<string, string> = {
  NOT_ASSESSED: "border-l-gray-200",
  COMPLIANT: "border-l-green-400",
  PARTIAL: "border-l-amber-400",
  DEFICIENT: "border-l-red-500",
  NOT_APPLICABLE: "border-l-slate-200",
};

const ROW_BG: Record<string, string> = {
  NOT_ASSESSED: "",
  COMPLIANT: "bg-green-50/30",
  PARTIAL: "bg-amber-50/30",
  DEFICIENT: "bg-red-50/20",
  NOT_APPLICABLE: "opacity-50",
};

const RISK_LABEL: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

const RISK_STYLE: Record<string, string> = {
  LOW: "bg-green-50 text-green-700 border-green-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  HIGH: "bg-orange-50 text-orange-700 border-orange-200",
  CRITICAL: "bg-red-50 text-red-700 border-red-200",
};

const FILTER_TABS: Array<{ key: string; label: string }> = [
  { key: "", label: "All" },
  { key: "NOT_ASSESSED", label: "Not Assessed" },
  { key: "DEFICIENT", label: "Deficient" },
  { key: "PARTIAL", label: "Partial" },
  { key: "COMPLIANT", label: "Compliant" },
  { key: "NOT_APPLICABLE", label: "N/A" },
];

// ── Progress bar ──────────────────────────────────────────────────────────────

function ProgressBar({ items }: { items: GapAssessmentItemRead[] }) {
  const total = items.length;
  if (!total) return null;

  const counts: Record<string, number> = {
    COMPLIANT: 0,
    PARTIAL: 0,
    DEFICIENT: 0,
    NOT_APPLICABLE: 0,
    NOT_ASSESSED: 0,
  };
  items.forEach((i) => {
    counts[i.compliance_status] = (counts[i.compliance_status] ?? 0) + 1;
  });

  const assessed = total - counts.NOT_ASSESSED;
  const pct = Math.round((assessed / total) * 100);

  const segments = [
    { key: "COMPLIANT", color: "bg-green-500" },
    { key: "PARTIAL", color: "bg-amber-400" },
    { key: "DEFICIENT", color: "bg-red-500" },
    { key: "NOT_APPLICABLE", color: "bg-slate-300" },
    { key: "NOT_ASSESSED", color: "bg-gray-200" },
  ];

  return (
    <div className="space-y-2">
      <div className="h-2 rounded-full overflow-hidden flex">
        {segments.map(({ key, color }) =>
          counts[key] ? (
            <div
              key={key}
              className={`${color} transition-all`}
              style={{ width: `${(counts[key] / total) * 100}%` }}
              title={`${counts[key]} ${STATUS_LABEL[key]}`}
            />
          ) : null
        )}
      </div>
      <div className="flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{pct}% assessed</span>
        <span>{total} clauses total</span>
        {counts.COMPLIANT > 0 && (
          <span className="text-green-600">{counts.COMPLIANT} compliant</span>
        )}
        {counts.PARTIAL > 0 && (
          <span className="text-amber-600">{counts.PARTIAL} partial</span>
        )}
        {counts.DEFICIENT > 0 && (
          <span className="text-red-600 font-medium">{counts.DEFICIENT} deficient</span>
        )}
        {counts.NOT_ASSESSED > 0 && (
          <span>{counts.NOT_ASSESSED} remaining</span>
        )}
      </div>
    </div>
  );
}

// ── Clause row ────────────────────────────────────────────────────────────────

function ClauseRow({
  item,
  assessmentId,
  projectId,
}: {
  item: GapAssessmentItemRead;
  assessmentId: number;
  projectId: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const update = useUpdateAssessmentItem(assessmentId, projectId);

  const mutate = (data: Parameters<typeof update.mutate>[0]["data"]) => {
    update.mutate({ itemId: item.id, data });
  };

  const handleTextBlur = (field: "finding" | "recommendation", value: string) => {
    const prev = item[field] ?? "";
    if (value === prev) return;
    setSaving(true);
    update.mutate(
      { itemId: item.id, data: { [field]: value || null } },
      { onSettled: () => setSaving(false) }
    );
  };

  const status = item.compliance_status;
  const showRisk = status !== "NOT_ASSESSED" && status !== "NOT_APPLICABLE";

  return (
    <div
      className={`border border-l-4 rounded-lg ${ROW_BORDER[status] ?? "border-l-gray-200"} ${ROW_BG[status] ?? ""} transition-colors`}
    >
      {/* Always-visible row */}
      <div className="flex items-start gap-2 px-3 py-2.5">
        {/* Clause number */}
        <span className="text-xs font-mono text-muted-foreground w-12 shrink-0 pt-0.5">
          {item.clause?.clause_number ?? `#${item.clause_id}`}
        </span>

        {/* Title + description */}
        <div className="flex-1 min-w-0">
          <span className="text-sm leading-snug block" title={item.clause?.title}>
            {item.clause?.title ?? "Clause"}
          </span>
          {item.clause?.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
              {item.clause.description}
            </p>
          )}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Status select */}
          <select
            value={status}
            disabled={update.isPending}
            onChange={(e) => mutate({ compliance_status: e.target.value as ComplianceStatus })}
            className={`text-xs px-2 py-1 rounded border cursor-pointer font-medium appearance-none focus:outline-none focus:ring-1 focus:ring-ring ${
              STATUS_SELECT_STYLE[status] ?? ""
            }`}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>

          {/* Risk select — only when assessed */}
          {showRisk && (
            <select
              value={item.risk_level ?? ""}
              disabled={update.isPending}
              onChange={(e) =>
                mutate({
                  risk_level: (e.target.value as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL") || null,
                })
              }
              className={`text-xs px-2 py-1 rounded border cursor-pointer appearance-none focus:outline-none focus:ring-1 focus:ring-ring ${
                item.risk_level ? RISK_STYLE[item.risk_level] : "text-muted-foreground border-border"
              }`}
            >
              <option value="">Risk</option>
              {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const).map((r) => (
                <option key={r} value={r}>
                  {RISK_LABEL[r]}
                </option>
              ))}
            </select>
          )}

          {saving && (
            <span className="text-xs text-muted-foreground animate-pulse">saving…</span>
          )}

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title={expanded ? "Collapse" : "Add observation / action required"}
          >
            {expanded ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t px-3 pb-3 pt-2.5 space-y-3 bg-background/60">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Observation / Evidence</Label>
              <Textarea
                rows={3}
                className="text-xs resize-none"
                placeholder="Describe the gap or evidence observed…"
                defaultValue={item.finding ?? ""}
                onBlur={(e) => handleTextBlur("finding", e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Action Required</Label>
              <Textarea
                rows={3}
                className="text-xs resize-none"
                placeholder="Recommended corrective action…"
                defaultValue={item.recommendation ?? ""}
                onBlur={(e) => handleTextBlur("recommendation", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Assessment panel ──────────────────────────────────────────────────────────

function AssessmentPanel({
  assessment,
  projectId,
}: {
  assessment: GapAssessmentRead;
  projectId: number;
}) {
  const { data: items = [], isLoading } = useAssessmentItems(assessment.id);
  const updateAssessment = useUpdateAssessment(assessment.id, projectId);
  const [filter, setFilter] = useState("");

  const counts: Record<string, number> = {};
  items.forEach((i) => {
    counts[i.compliance_status] = (counts[i.compliance_status] ?? 0) + 1;
  });

  const notAssessed = counts.NOT_ASSESSED ?? 0;
  const canComplete = assessment.status !== "COMPLETED" && notAssessed === 0 && items.length > 0;
  const isCompleted = assessment.status === "COMPLETED";

  const filtered = filter ? items.filter((i) => i.compliance_status === filter) : items;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-sm">{assessment.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isCompleted ? (
              <span className="text-green-600 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Assessment completed
              </span>
            ) : (
              "In progress — work through each clause below"
            )}
          </p>
        </div>
        {!isCompleted && (
          <div className="shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() => updateAssessment.mutate({ status: "COMPLETED" })}
              disabled={!canComplete || updateAssessment.isPending}
              title={
                notAssessed > 0
                  ? `${notAssessed} clause(s) still not assessed`
                  : "Mark this assessment as completed"
              }
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              Mark Complete
            </Button>
            {notAssessed > 0 && (
              <p className="text-xs text-muted-foreground mt-1 text-right">
                {notAssessed} clause{notAssessed !== 1 ? "s" : ""} remaining
              </p>
            )}
          </div>
        )}
      </div>

      {/* Progress bar */}
      {items.length > 0 && <ProgressBar items={items} />}

      {isLoading && (
        <p className="text-xs text-muted-foreground animate-pulse">Loading clauses…</p>
      )}

      {!isLoading && !items.length && (
        <div className="border rounded-lg p-8 text-center text-sm text-muted-foreground">
          No clauses loaded yet. This may take a moment to appear after creation.
        </div>
      )}

      {/* Filter tabs */}
      {items.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {FILTER_TABS.map(({ key, label }) => {
            const count = key ? (counts[key] ?? 0) : items.length;
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-2.5 py-1 rounded text-xs border transition-colors ${
                  filter === key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {label}
                {count > 0 && <span className="ml-1 opacity-70">{count}</span>}
              </button>
            );
          })}
        </div>
      )}

      {items.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Change the status of each clause using the dropdown. Click{" "}
          <ChevronRight className="h-3 w-3 inline" /> to add an observation or required action.
        </p>
      )}

      {/* Clause list */}
      <div className="space-y-1.5">
        {filtered.map((item) => (
          <ClauseRow
            key={item.id}
            item={item}
            assessmentId={assessment.id}
            projectId={projectId}
          />
        ))}
      </div>

      {filtered.length === 0 && items.length > 0 && (
        <p className="text-sm text-center text-muted-foreground py-6">
          No clauses match this filter.
        </p>
      )}
    </div>
  );
}

// ── Assessment sidebar tab ────────────────────────────────────────────────────

function AssessmentSidebarItem({
  assessment,
  selected,
  onClick,
}: {
  assessment: GapAssessmentRead;
  selected: boolean;
  onClick: () => void;
}) {
  const isCompleted = assessment.status === "COMPLETED";
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 border-b last:border-b-0 text-xs hover:bg-muted transition-colors ${
        selected ? "bg-muted border-l-2 border-l-primary" : ""
      }`}
    >
      <p className="truncate font-medium">{assessment.title}</p>
      <p className={`mt-0.5 ${isCompleted ? "text-green-600" : "text-muted-foreground"}`}>
        {isCompleted ? "✓ Completed" : "In progress"}
      </p>
    </button>
  );
}

// ── Create dialog ─────────────────────────────────────────────────────────────

function CreateAssessmentDialog({
  open,
  onClose,
  projectId,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  projectId: number;
  onCreated: (id: number) => void;
}) {
  const { data: frameworks = [] } = useFrameworks();
  const createAssessment = useCreateAssessment(projectId);
  const qc = useQueryClient();

  const [title, setTitle] = useState("");
  const [frameworkId, setFrameworkId] = useState<number | "">("");
  const [phase, setPhase] = useState<"idle" | "creating" | "populating">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frameworkId) return;

    setPhase("creating");
    let assessment;
    try {
      assessment = await createAssessment.mutateAsync({ title });
    } catch {
      setPhase("idle");
      return;
    }

    setPhase("populating");
    try {
      await consultancyApi.populateAssessment(assessment.id, Number(frameworkId));
      qc.invalidateQueries({ queryKey: consultancyKeys.assessmentItems(assessment.id) });
      qc.invalidateQueries({ queryKey: consultancyKeys.assessments(projectId) });
    } finally {
      setPhase("idle");
      setTitle("");
      setFrameworkId("");
      onClose();
      onCreated(assessment.id);
    }
  };

  const busy = phase !== "idle";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New Gap Assessment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div className="space-y-1">
            <Label>Title *</Label>
            <Input
              required
              autoFocus
              placeholder="e.g. ISO 17025 Initial Assessment 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={busy}
            />
          </div>
          <div className="space-y-1">
            <Label>Checklist (Framework) *</Label>
            <select
              required
              value={frameworkId}
              onChange={(e) => setFrameworkId(e.target.value ? Number(e.target.value) : "")}
              disabled={busy}
              className="w-full text-sm px-3 py-2 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Select a framework…</option>
              {frameworks.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}{f.version ? ` (${f.version})` : ""}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              All clauses from this framework will be pre-loaded as your checklist.
            </p>
          </div>
          {phase === "creating" && (
            <p className="text-xs text-muted-foreground animate-pulse">Creating assessment…</p>
          )}
          {phase === "populating" && (
            <p className="text-xs text-muted-foreground animate-pulse">
              Loading checklist clauses…
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy || !frameworkId}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const projectId = Number(id);

  const { data: assessments = [], isLoading } = useAssessments(projectId);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const selected =
    assessments.find((a) => a.id === selectedId) ?? assessments[0] ?? null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/consultant/projects/${projectId}`}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-lg font-semibold">Gap Assessments</h1>
        <div className="flex-1" />
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          New Assessment
        </Button>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>
      )}

      {!isLoading && !assessments.length && (
        <div className="border rounded-lg p-12 text-center text-muted-foreground text-sm space-y-1">
          <p className="font-medium">No assessments yet</p>
          <p className="text-xs">
            Create one and select a compliance framework — all clauses will be pre-loaded
            as your assessment checklist.
          </p>
        </div>
      )}

      {assessments.length > 0 && (
        <div className="flex gap-4 items-start">
          {/* Sidebar */}
          <div className="w-52 shrink-0 border rounded-lg overflow-hidden">
            {assessments.map((a) => (
              <AssessmentSidebarItem
                key={a.id}
                assessment={a}
                selected={selected?.id === a.id}
                onClick={() => setSelectedId(a.id)}
              />
            ))}
          </div>

          {/* Detail panel */}
          <div className="flex-1 min-w-0">
            {selected && (
              <AssessmentPanel assessment={selected} projectId={projectId} />
            )}
          </div>
        </div>
      )}

      <CreateAssessmentDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        projectId={projectId}
        onCreated={(newId) => setSelectedId(newId)}
      />
    </div>
  );
}
