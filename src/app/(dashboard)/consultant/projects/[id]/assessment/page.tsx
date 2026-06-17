"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  useAssessments,
  useCreateAssessment,
  useUpdateAssessment,
  useAssessmentItems,
  useUpdateAssessmentItem,
} from "@/features/lims/consultancy/consultancy.queries";
import type {
  GapAssessmentRead,
  GapAssessmentItemRead,
  ComplianceStatus,
} from "@/features/lims/consultancy/consultancy.api";

const STATUS_COLORS: Record<string, string> = {
  NOT_ASSESSED: "bg-gray-100 text-gray-500",
  COMPLIANT: "bg-green-100 text-green-700",
  PARTIAL: "bg-yellow-100 text-yellow-700",
  DEFICIENT: "bg-red-100 text-red-600",
  NOT_APPLICABLE: "bg-slate-100 text-slate-500",
};

const RISK_COLORS: Record<string, string> = {
  LOW: "bg-green-50 text-green-600",
  MEDIUM: "bg-yellow-50 text-yellow-600",
  HIGH: "bg-orange-50 text-orange-600",
  CRITICAL: "bg-red-50 text-red-700",
};

const STATUSES: ComplianceStatus[] = ["NOT_ASSESSED", "COMPLIANT", "PARTIAL", "DEFICIENT", "NOT_APPLICABLE"];

function AssessmentItemRow({
  item,
  assessmentId,
  projectId,
}: {
  item: GapAssessmentItemRead;
  assessmentId: number;
  projectId: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const update = useUpdateAssessmentItem(assessmentId, projectId);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="text-xs font-mono text-muted-foreground w-12 flex-shrink-0">
          {item.clause?.clause_number ?? `#${item.clause_id}`}
        </span>
        <span className="flex-1 text-sm font-medium truncate">
          {item.clause?.title ?? "Clause"}
        </span>
        <span className={`text-xs px-2 py-0.5 rounded font-medium flex-shrink-0 ${STATUS_COLORS[item.compliance_status] ?? "bg-gray-100"}`}>
          {item.compliance_status.replace(/_/g, " ")}
        </span>
        {expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t px-4 py-3 space-y-3 bg-muted/10">
          {item.clause?.description && (
            <p className="text-xs text-muted-foreground italic">{item.clause.description}</p>
          )}
          <div className="space-y-1">
            <Label className="text-xs">Compliance Status</Label>
            <div className="flex gap-1.5 flex-wrap">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => update.mutate({ itemId: item.id, data: { compliance_status: s } })}
                  disabled={update.isPending}
                  className={`px-2 py-0.5 rounded text-xs border transition-colors ${
                    item.compliance_status === s
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {s.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Finding</Label>
              <Textarea
                rows={2}
                className="text-xs"
                placeholder="Describe the finding or gap…"
                defaultValue={item.finding ?? ""}
                onBlur={(e) => {
                  if (e.target.value !== (item.finding ?? "")) {
                    update.mutate({ itemId: item.id, data: { finding: e.target.value || null } });
                  }
                }}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Recommendation</Label>
              <Textarea
                rows={2}
                className="text-xs"
                placeholder="Recommend corrective action…"
                defaultValue={item.recommendation ?? ""}
                onBlur={(e) => {
                  if (e.target.value !== (item.recommendation ?? "")) {
                    update.mutate({ itemId: item.id, data: { recommendation: e.target.value || null } });
                  }
                }}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Risk Level</Label>
            <div className="flex gap-1.5">
              {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => update.mutate({ itemId: item.id, data: { risk_level: r } })}
                  disabled={update.isPending}
                  className={`px-2 py-0.5 rounded text-xs border transition-colors ${
                    item.risk_level === r
                      ? `border-primary ${RISK_COLORS[r]}`
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AssessmentPanel({
  assessment,
  projectId,
}: {
  assessment: GapAssessmentRead;
  projectId: number;
}) {
  const { data: items = [], isLoading } = useAssessmentItems(assessment.id);
  const updateAssessment = useUpdateAssessment(assessment.id, projectId);

  const stats = {
    total: items.length,
    compliant: items.filter((i) => i.compliance_status === "COMPLIANT").length,
    deficient: items.filter((i) => i.compliance_status === "DEFICIENT").length,
    notAssessed: items.filter((i) => i.compliance_status === "NOT_ASSESSED").length,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-sm">{assessment.title}</h3>
          <p className="text-xs text-muted-foreground">Status: {assessment.status}</p>
        </div>
        <div className="flex items-center gap-2">
          {assessment.status !== "COMPLETED" && (
            <Button
              size="sm" variant="outline" className="h-7 text-xs"
              onClick={() => updateAssessment.mutate({ status: "COMPLETED" })}
              disabled={updateAssessment.isPending || stats.notAssessed > 0}
            >
              Mark Complete
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      {items.length > 0 && (
        <div className="flex gap-3 flex-wrap">
          <span className="text-xs text-muted-foreground">{stats.total} clauses</span>
          <span className="text-xs text-green-600">{stats.compliant} compliant</span>
          <span className="text-xs text-red-600">{stats.deficient} deficient</span>
          <span className="text-xs text-gray-500">{stats.notAssessed} not assessed</span>
        </div>
      )}

      {isLoading && <p className="text-xs text-muted-foreground animate-pulse">Loading clauses…</p>}

      {!isLoading && !items.length && (
        <p className="text-xs text-muted-foreground italic">
          No items. Use provisioning to auto-populate this assessment with all framework clauses.
        </p>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <AssessmentItemRow key={item.id} item={item} assessmentId={assessment.id} projectId={projectId} />
        ))}
      </div>
    </div>
  );
}

export default function AssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const projectId = Number(id);

  const { data: assessments = [], isLoading } = useAssessments(projectId);
  const createAssessment = useCreateAssessment(projectId);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const selected = assessments.find((a) => a.id === selectedId) ?? assessments[0] ?? null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await createAssessment.mutateAsync({ title: newTitle });
    setSelectedId(result.id);
    setNewTitle("");
    setShowCreate(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href={`/consultant/projects/${projectId}`} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-lg font-semibold">Gap Assessments</h1>
        <div className="flex-1" />
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" />New Assessment
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>}

      {!isLoading && !assessments.length && (
        <div className="border rounded-lg p-10 text-center text-muted-foreground text-sm">
          No assessments yet. Create one or use the provisioning engine to generate one automatically.
        </div>
      )}

      {assessments.length > 0 && (
        <div className="flex gap-4">
          {/* Sidebar */}
          <div className="w-52 flex-shrink-0 border rounded-lg overflow-hidden">
            {assessments.map((a) => (
              <button
                key={a.id}
                onClick={() => setSelectedId(a.id)}
                className={`w-full text-left px-3 py-2.5 border-b text-xs hover:bg-muted transition-colors ${
                  (selected?.id === a.id) ? "bg-muted border-l-2 border-l-primary font-medium" : ""
                }`}
              >
                <p className="truncate">{a.title}</p>
                <p className={`mt-0.5 ${a.status === "COMPLETED" ? "text-green-600" : "text-muted-foreground"}`}>
                  {a.status}
                </p>
              </button>
            ))}
          </div>

          {/* Detail */}
          <div className="flex-1 min-w-0">
            {selected && <AssessmentPanel assessment={selected} projectId={projectId} />}
          </div>
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>New Gap Assessment</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3 mt-2">
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input
                required
                placeholder="e.g. Initial Gap Assessment 2026"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" disabled={createAssessment.isPending}>Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
