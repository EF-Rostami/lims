"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Plus, Trash2, CheckCircle, ShieldCheck, AlertTriangle,
  ChevronRight, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { limsApi, extractPage } from "@/lib/lims-api";
import {
  useCapaSummary,
  useUpsertFiveWhys,
  useCreateFishboneCause, useUpdateFishboneCause, useDeleteFishboneCause,
  useCreateAction, useUpdateAction, useCompleteAction, useVerifyAction, useDeleteAction,
  useCreateImpact, useDeleteImpact,
} from "@/features/lims/capa/capa.queries";
import type {
  ActionItem, ActionItemCreate, ActionType, ActionStatus,
  FishboneCategory, FishboneCause,
  FindingListItem, FindingSeverity,
  ImpactEntityType, ImpactLinkCreate,
} from "@/features/lims/capa/capa.api";

// ── Shared helpers ────────────────────────────────────────────────────────────

const SEV_COLORS: Record<FindingSeverity, string> = {
  LOW: "bg-green-100 text-green-700",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-500",
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  verified: "bg-violet-100 text-violet-700",
};

function Badge({ label, className }: { label: string; className?: string }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${className ?? "bg-gray-100 text-gray-600"}`}>
      {label.replace(/_/g, " ")}
    </span>
  );
}

// ── Finding list ──────────────────────────────────────────────────────────────

function useFindingsList() {
  return useQuery({
    queryKey: ["capa-findings-list"],
    queryFn: async () => {
      const res = await limsApi.get("/findings", { params: { page_size: 200 } });
      return extractPage<FindingListItem>(res.data);
    },
    staleTime: 60_000,
  });
}

function FindingListPanel({
  selected,
  onSelect,
}: {
  selected: FindingListItem | null;
  onSelect: (f: FindingListItem) => void;
}) {
  const { data: findings = [], isLoading } = useFindingsList();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("OPEN");

  const filtered = findings.filter((f) => {
    if (statusFilter && f.status !== statusFilter) return false;
    if (search && !f.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full border-r">
      <div className="p-3 border-b space-y-2">
        <p className="text-sm font-semibold">Findings</p>
        <Input
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-7 text-xs"
        />
        <div className="flex gap-1 flex-wrap">
          {["", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-2 py-0.5 rounded text-xs border transition-colors ${statusFilter === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
            >
              {s || "All"}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading && <p className="text-xs text-muted-foreground p-3 animate-pulse">Loading…</p>}
        {filtered.map((f) => (
          <button
            key={f.id}
            onClick={() => onSelect(f)}
            className={`w-full text-left px-3 py-2.5 border-b hover:bg-muted transition-colors ${selected?.id === f.id ? "bg-muted border-l-2 border-l-primary" : ""}`}
          >
            <p className="text-xs font-medium truncate leading-snug">{f.title}</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <Badge label={f.severity} className={SEV_COLORS[f.severity]} />
              <Badge label={f.status} className={STATUS_COLORS[f.status]} />
            </div>
          </button>
        ))}
        {!isLoading && !filtered.length && (
          <p className="text-xs text-muted-foreground p-3">No findings found.</p>
        )}
      </div>
    </div>
  );
}

// ── Tab: Actions (Overview) ───────────────────────────────────────────────────

function ActionsTab({ findingId }: { findingId: number }) {
  const { data: summary } = useCapaSummary(findingId);
  const actions = summary?.actions ?? [];
  const createAction = useCreateAction(findingId);
  const completeAction = useCompleteAction(findingId);
  const verifyAction = useVerifyAction(findingId);
  const deleteAction = useDeleteAction(findingId);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ActionItemCreate>({ action_type: "corrective", title: "" });
  const [verifyTarget, setVerifyTarget] = useState<ActionItem | null>(null);
  const [verifyNotes, setVerifyNotes] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAction.mutateAsync(form);
    setShowForm(false);
    setForm({ action_type: "corrective", title: "" });
  };

  const corrective = actions.filter((a) => a.action_type === "corrective");
  const preventive = actions.filter((a) => a.action_type === "preventive");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">CAPA Action Items</p>
        <Button size="sm" className="h-7 text-xs" onClick={() => setShowForm(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" />Add Action
        </Button>
      </div>

      {["corrective", "preventive"].map((type) => {
        const list = type === "corrective" ? corrective : preventive;
        return (
          <div key={type}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              {type === "corrective" ? "Corrective Actions" : "Preventive Actions"}
            </p>
            {!list.length ? (
              <p className="text-xs text-muted-foreground italic">None added yet.</p>
            ) : (
              <div className="space-y-2">
                {list.map((a) => (
                  <div
                    key={a.id}
                    className={`border rounded-lg p-3 text-sm ${a.status === "verified" ? "border-violet-200 bg-violet-50/30" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{a.title}</p>
                        {a.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">{a.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <Badge label={a.status} className={STATUS_COLORS[a.status]} />
                          {a.due_date && (
                            <span className={`text-xs ${new Date(a.due_date) < new Date() && a.status !== "verified" ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
                              Due: {a.due_date}
                            </span>
                          )}
                          {a.completed_at && (
                            <span className="text-xs text-green-600">
                              Completed: {new Date(a.completed_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {a.verification_notes && (
                          <p className="text-xs text-violet-700 mt-1 italic">{a.verification_notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {a.status === "open" || a.status === "in_progress" ? (
                          <Button
                            size="sm" variant="outline" className="h-6 text-xs px-2"
                            onClick={() => completeAction.mutateAsync({ actionId: a.id })}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />Complete
                          </Button>
                        ) : a.status === "completed" ? (
                          <Button
                            size="sm" variant="outline" className="h-6 text-xs px-2 border-violet-300"
                            onClick={() => { setVerifyTarget(a); setVerifyNotes(""); }}
                          >
                            <ShieldCheck className="h-3 w-3 mr-1" />Verify
                          </Button>
                        ) : null}
                        <Button
                          size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive"
                          onClick={() => deleteAction.mutateAsync(a.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Create dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Action Item</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3 mt-2">
            <div className="space-y-1">
              <Label>Type *</Label>
              <div className="flex gap-2">
                {(["corrective", "preventive"] as ActionType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, action_type: t }))}
                    className={`flex-1 py-1.5 text-xs rounded border capitalize transition-colors ${form.action_type === t ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea rows={2} value={form.description ?? ""} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value || null }))} />
            </div>
            <div className="space-y-1">
              <Label>Due Date</Label>
              <Input type="date" value={form.due_date ?? ""} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value || null }))} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={createAction.isPending}>Add</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Verify dialog */}
      <Dialog open={!!verifyTarget} onOpenChange={() => setVerifyTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Verify Action Effectiveness</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <p className="text-sm text-muted-foreground">{verifyTarget?.title}</p>
            <div className="space-y-1">
              <Label>Verification Notes *</Label>
              <Textarea rows={3} placeholder="Describe evidence that the action was effective…" value={verifyNotes}
                onChange={(e) => setVerifyNotes(e.target.value)} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setVerifyTarget(null)}>Cancel</Button>
              <Button
                disabled={!verifyNotes.trim() || verifyAction.isPending}
                onClick={async () => {
                  await verifyAction.mutateAsync({ actionId: verifyTarget!.id, notes: verifyNotes });
                  setVerifyTarget(null);
                }}
              >
                Confirm Verified
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Tab: 5 Whys ───────────────────────────────────────────────────────────────

function FiveWhysTab({ findingId, problemStatement }: { findingId: number; problemStatement: string }) {
  const { data: summary } = useCapaSummary(findingId);
  const upsert = useUpsertFiveWhys(findingId);

  const [steps, setSteps] = useState(() =>
    Array.from({ length: 5 }, (_, i) => ({
      step_number: i + 1,
      why_text: "",
      because_text: "",
    })),
  );
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!summary) return;
    const loaded = summary.five_whys;
    setSteps(
      Array.from({ length: 5 }, (_, i) => {
        const existing = loaded.find((s) => s.step_number === i + 1);
        return {
          step_number: i + 1,
          why_text: existing?.why_text ?? "",
          because_text: existing?.because_text ?? "",
        };
      }),
    );
    setDirty(false);
  }, [summary]);

  const setStep = (i: number, field: "why_text" | "because_text", val: string) => {
    setSteps((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: val };
      return next;
    });
    setDirty(true);
  };

  const handleSave = async () => {
    await upsert.mutateAsync({
      steps: steps.map((s) => ({
        step_number: s.step_number,
        why_text: s.why_text || null,
        because_text: s.because_text || null,
      })),
    });
    setDirty(false);
  };

  const lastFilledIdx = steps.reduce((last, s, i) => (s.because_text ? i : last), -1);
  const rootCause = lastFilledIdx >= 0 ? steps[lastFilledIdx].because_text : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">5 Whys Analysis</p>
        {dirty && (
          <Button size="sm" className="h-7 text-xs" onClick={handleSave} disabled={upsert.isPending}>
            {upsert.isPending ? "Saving…" : "Save"}
          </Button>
        )}
      </div>

      {/* Problem statement */}
      <div className="border rounded-lg p-3 bg-red-50/40 border-red-200">
        <p className="text-xs font-semibold text-red-700 mb-1">Problem Statement</p>
        <p className="text-sm">{problemStatement}</p>
      </div>

      {/* Steps */}
      <div className="space-y-0">
        {steps.map((step, i) => {
          const prevBecause = i > 0 ? steps[i - 1].because_text : null;
          const isActive = i === 0 || !!steps[i - 1].because_text;
          const isLastFilled = i === lastFilledIdx;

          return (
            <div
              key={step.step_number}
              className={`relative pl-8 pb-4 ${!isActive ? "opacity-40 pointer-events-none" : ""}`}
            >
              {/* Connector line */}
              {i < 4 && (
                <div className="absolute left-3.5 top-7 bottom-0 w-px bg-border" />
              )}
              {/* Step circle */}
              <div className={`absolute left-0 top-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 ${step.because_text ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground"}`}>
                {step.step_number}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                  <span>WHY {step.step_number}</span>
                  {prevBecause && (
                    <span className="italic truncate max-w-xs">— "{prevBecause}"?</span>
                  )}
                  {!prevBecause && i === 0 && (
                    <span className="italic truncate max-w-xs">— Why did the problem occur?</span>
                  )}
                </div>
                <Textarea
                  rows={2}
                  placeholder={`Because…`}
                  value={step.because_text}
                  onChange={(e) => setStep(i, "because_text", e.target.value)}
                  className={`text-sm ${isLastFilled ? "border-primary ring-1 ring-primary" : ""}`}
                />
                {isLastFilled && step.because_text && (
                  <p className="text-xs text-primary font-medium flex items-center gap-1">
                    <ChevronRight className="h-3.5 w-3.5" />
                    Root Cause identified at Step {step.step_number}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {rootCause && (
        <div className="border rounded-lg p-3 bg-primary/5 border-primary/30">
          <p className="text-xs font-semibold text-primary mb-1">Root Cause (from Step {lastFilledIdx + 1})</p>
          <p className="text-sm font-medium">{rootCause}</p>
        </div>
      )}
    </div>
  );
}

// ── Fishbone SVG ──────────────────────────────────────────────────────────────

const BONES: { key: FishboneCategory; label: string; side: "top" | "bottom"; spineX: number; tipX: number; tipY: number }[] = [
  { key: "machine",     label: "Machine",     side: "top",    spineX: 210, tipX: 100, tipY: 60  },
  { key: "method",      label: "Method",      side: "top",    spineX: 380, tipX: 340, tipY: 60  },
  { key: "man",         label: "Man / People", side: "top",   spineX: 545, tipX: 520, tipY: 60  },
  { key: "material",    label: "Material",    side: "bottom", spineX: 210, tipX: 100, tipY: 350 },
  { key: "measurement", label: "Measurement", side: "bottom", spineX: 380, tipX: 340, tipY: 350 },
  { key: "environment", label: "Environment", side: "bottom", spineX: 545, tipX: 520, tipY: 350 },
];

const SPINE_Y = 205;
const BONE_COLORS: Record<FishboneCategory, string> = {
  machine:     "#6366f1",
  method:      "#0ea5e9",
  material:    "#10b981",
  man:         "#f59e0b",
  measurement: "#ef4444",
  environment: "#ec4899",
};

function FishboneSVG({
  causes,
  onBoneClick,
}: {
  causes: FishboneCause[];
  onBoneClick: (cat: FishboneCategory) => void;
}) {
  const byCat = (cat: FishboneCategory) => causes.filter((c) => c.category === cat);

  return (
    <div className="overflow-x-auto">
      <svg viewBox="0 0 740 420" className="w-full min-w-[520px]" style={{ maxHeight: 340 }}>
        {/* Spine */}
        <line x1="50" y1={SPINE_Y} x2="680" y2={SPINE_Y} stroke="#94a3b8" strokeWidth="2.5" />
        {/* Arrow head */}
        <polygon points="680,198 700,205 680,212" fill="#94a3b8" />
        {/* Problem label */}
        <rect x="702" y="192" width="34" height="26" rx="4" fill="#ef4444" />
        <text x="719" y="209" textAnchor="middle" fontSize="9" fontWeight="bold" fill="white">PROB</text>
        <text x="719" y="219" textAnchor="middle" fontSize="7" fill="white">LEM</text>

        {BONES.map((bone) => {
          const color = BONE_COLORS[bone.key];
          const boneCauses = byCat(bone.key);
          const isTop = bone.side === "top";

          return (
            <g key={bone.key} style={{ cursor: "pointer" }} onClick={() => onBoneClick(bone.key)}>
              {/* Main bone */}
              <line
                x1={bone.tipX} y1={bone.tipY}
                x2={bone.spineX} y2={SPINE_Y}
                stroke={color} strokeWidth="2"
              />
              {/* Category label box */}
              <rect
                x={bone.tipX - 40} y={isTop ? bone.tipY - 28 : bone.tipY + 8}
                width="80" height="20" rx="4" fill={color} opacity="0.15"
              />
              <text
                x={bone.tipX} y={isTop ? bone.tipY - 13 : bone.tipY + 22}
                textAnchor="middle" fontSize="9" fontWeight="600" fill={color}
              >
                {bone.label}
              </text>

              {/* Cause sub-branches along bone */}
              {boneCauses.slice(0, 5).map((cause, ci) => {
                const t = 0.25 + ci * 0.14;
                const cx = bone.tipX + (bone.spineX - bone.tipX) * t;
                const cy = bone.tipY + (SPINE_Y - bone.tipY) * t;
                const subLen = 28;
                const sx = cx + (isTop ? subLen : -subLen) * (bone.side === "top" ? -0.6 : 0.6);
                const sy = cy + (isTop ? -subLen : subLen) * 0.6;
                return (
                  <g key={cause.id}>
                    <line x1={cx} y1={cy} x2={sx} y2={sy} stroke={color} strokeWidth="1" opacity="0.6" />
                    <text
                      x={sx}
                      y={sy + (isTop ? -3 : 11)}
                      textAnchor="middle"
                      fontSize="7"
                      fill={cause.is_root_cause ? "#ef4444" : "#475569"}
                      fontWeight={cause.is_root_cause ? "700" : "400"}
                    >
                      {cause.cause_text.length > 18 ? cause.cause_text.slice(0, 17) + "…" : cause.cause_text}
                    </text>
                  </g>
                );
              })}

              {/* Count badge if more than 5 */}
              {boneCauses.length > 5 && (
                <text
                  x={bone.tipX}
                  y={isTop ? bone.tipY - 1 : bone.tipY + 36}
                  textAnchor="middle" fontSize="7" fill={color} opacity="0.8"
                >
                  +{boneCauses.length - 5} more
                </text>
              )}

              {/* Add hint */}
              {!boneCauses.length && (
                <text
                  x={bone.tipX + (bone.spineX - bone.tipX) * 0.4}
                  y={isTop ? SPINE_Y - 30 : SPINE_Y + 40}
                  textAnchor="middle" fontSize="7.5" fill={color} opacity="0.5" fontStyle="italic"
                >
                  + add cause
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Tab: Fishbone ─────────────────────────────────────────────────────────────

function FishboneTab({ findingId }: { findingId: number }) {
  const { data: summary } = useCapaSummary(findingId);
  const causes = summary?.fishbone ?? [];
  const createCause = useCreateFishboneCause(findingId);
  const updateCause = useUpdateFishboneCause(findingId);
  const deleteCause = useDeleteFishboneCause(findingId);

  const [activeCategory, setActiveCategory] = useState<FishboneCategory | null>(null);
  const [newCauseText, setNewCauseText] = useState("");
  const [isRootCause, setIsRootCause] = useState(false);

  const handleAddCause = async () => {
    if (!activeCategory || !newCauseText.trim()) return;
    await createCause.mutateAsync({
      category: activeCategory,
      cause_text: newCauseText.trim(),
      is_root_cause: isRootCause,
    });
    setNewCauseText("");
    setIsRootCause(false);
  };

  const byCat = (cat: FishboneCategory) => causes.filter((c) => c.category === cat);

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold">Fishbone (Ishikawa) Diagram</p>
      <p className="text-xs text-muted-foreground">
        Click a category bone to add causes. Red text = identified root cause.
      </p>

      <FishboneSVG causes={causes} onBoneClick={(cat) => { setActiveCategory(cat); setNewCauseText(""); setIsRootCause(false); }} />

      {/* Cause editor per category */}
      {activeCategory && (
        <div className="border rounded-lg p-3 space-y-3" style={{ borderColor: BONE_COLORS[activeCategory] + "60" }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold capitalize" style={{ color: BONE_COLORS[activeCategory] }}>
              {BONES.find((b) => b.key === activeCategory)?.label}
            </p>
            <button onClick={() => setActiveCategory(null)}>
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          {/* Existing causes */}
          <div className="space-y-1.5">
            {byCat(activeCategory).map((c) => (
              <div key={c.id} className="flex items-center gap-2 text-xs">
                <span className={`flex-1 ${c.is_root_cause ? "text-red-600 font-semibold" : ""}`}>
                  {c.is_root_cause && "★ "}{c.cause_text}
                </span>
                <button
                  onClick={() => updateCause.mutateAsync({ causeId: c.id, data: { is_root_cause: !c.is_root_cause } })}
                  title={c.is_root_cause ? "Unmark root cause" : "Mark as root cause"}
                  className="text-muted-foreground hover:text-red-600 transition-colors"
                >
                  ★
                </button>
                <button
                  onClick={() => deleteCause.mutateAsync(c.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
            {!byCat(activeCategory).length && (
              <p className="text-xs text-muted-foreground italic">No causes added yet.</p>
            )}
          </div>

          {/* Add new cause */}
          <div className="flex gap-2">
            <Input
              className="h-7 text-xs flex-1"
              placeholder="Describe a contributing cause…"
              value={newCauseText}
              onChange={(e) => setNewCauseText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddCause(); } }}
            />
            <label className="flex items-center gap-1 text-xs cursor-pointer flex-shrink-0">
              <input
                type="checkbox"
                checked={isRootCause}
                onChange={(e) => setIsRootCause(e.target.checked)}
              />
              Root
            </label>
            <Button
              size="sm" className="h-7 text-xs px-2"
              disabled={!newCauseText.trim() || createCause.isPending}
              onClick={handleAddCause}
            >
              Add
            </Button>
          </div>
        </div>
      )}

      {/* Full cause list by category */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {BONES.map((bone) => {
          const boneCauses = byCat(bone.key);
          return (
            <button
              key={bone.key}
              onClick={() => { setActiveCategory(bone.key); setNewCauseText(""); setIsRootCause(false); }}
              className="text-left border rounded-lg p-2.5 hover:bg-muted transition-colors"
              style={{ borderColor: BONE_COLORS[bone.key] + "40" }}
            >
              <p className="text-xs font-semibold mb-1.5" style={{ color: BONE_COLORS[bone.key] }}>
                {bone.label}
              </p>
              {boneCauses.length ? (
                <ul className="space-y-0.5">
                  {boneCauses.map((c) => (
                    <li key={c.id} className={`text-xs truncate ${c.is_root_cause ? "text-red-600 font-semibold" : "text-muted-foreground"}`}>
                      {c.is_root_cause ? "★ " : "· "}{c.cause_text}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground italic">Click to add</p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Tab: Impact Analysis ──────────────────────────────────────────────────────

const ENTITY_COLORS: Record<ImpactEntityType, string> = {
  sample:      "bg-blue-100 text-blue-700",
  result:      "bg-violet-100 text-violet-700",
  order:       "bg-amber-100 text-amber-700",
  qc_run:      "bg-teal-100 text-teal-700",
  instrument:  "bg-orange-100 text-orange-700",
  other:       "bg-gray-100 text-gray-600",
};

function ImpactTab({ findingId }: { findingId: number }) {
  const { data: summary } = useCapaSummary(findingId);
  const impacts = summary?.impacts ?? [];
  const createImpact = useCreateImpact(findingId);
  const deleteImpact = useDeleteImpact(findingId);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ImpactLinkCreate>({
    entity_type: "sample",
    entity_label: "",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createImpact.mutateAsync(form);
    setShowForm(false);
    setForm({ entity_type: "sample", entity_label: "" });
  };

  const byType = (type: ImpactEntityType) => impacts.filter((i) => i.entity_type === type);
  const entityTypes: ImpactEntityType[] = ["sample", "result", "order", "qc_run", "instrument", "other"];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">Impact Analysis</p>
          <p className="text-xs text-muted-foreground">
            Link affected samples, results, and other entities to this finding.
          </p>
        </div>
        <Button size="sm" className="h-7 text-xs" onClick={() => setShowForm(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" />Add Link
        </Button>
      </div>

      {!impacts.length ? (
        <div className="border rounded-lg p-8 text-center text-sm text-muted-foreground">
          No affected entities linked yet.
          <br />
          <span className="text-xs">Add links to samples, results, or other entities impacted by this finding.</span>
        </div>
      ) : (
        <div className="space-y-3">
          {entityTypes.filter((t) => byType(t).length > 0).map((type) => (
            <div key={type}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 capitalize">
                {type.replace(/_/g, " ")}s ({byType(type).length})
              </p>
              <div className="space-y-1.5">
                {byType(type).map((link) => (
                  <div key={link.id} className="flex items-start gap-3 border rounded-lg px-3 py-2">
                    <Badge label={link.entity_type.replace(/_/g, " ")} className={ENTITY_COLORS[link.entity_type]} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{link.entity_label}</p>
                      {link.entity_id && (
                        <p className="text-xs text-muted-foreground font-mono">ID: {link.entity_id}</p>
                      )}
                      {link.impact_description && (
                        <p className="text-xs text-muted-foreground mt-0.5">{link.impact_description}</p>
                      )}
                    </div>
                    <Button
                      size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive flex-shrink-0"
                      onClick={() => deleteImpact.mutateAsync(link.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats row */}
      {impacts.length > 0 && (
        <div className="border rounded-lg p-3 bg-muted/30">
          <p className="text-xs font-semibold mb-2">Impact Summary</p>
          <div className="flex flex-wrap gap-2">
            {entityTypes.filter((t) => byType(t).length > 0).map((t) => (
              <Badge key={t} label={`${byType(t).length} ${t.replace(/_/g, " ")}`} className={ENTITY_COLORS[t]} />
            ))}
          </div>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Impact Link</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3 mt-2">
            <div className="space-y-1">
              <Label>Entity Type *</Label>
              <select
                className="w-full border rounded px-2 py-1.5 text-sm bg-background"
                value={form.entity_type}
                onChange={(e) => setForm((f) => ({ ...f, entity_type: e.target.value as ImpactEntityType }))}
              >
                <option value="sample">Sample</option>
                <option value="result">Result</option>
                <option value="order">Order</option>
                <option value="qc_run">QC Run</option>
                <option value="instrument">Instrument</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>Label / Identifier *</Label>
              <Input
                required
                placeholder="e.g. S-2026-0123 or Result #456"
                value={form.entity_label}
                onChange={(e) => setForm((f) => ({ ...f, entity_label: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Entity ID (numeric, optional)</Label>
              <Input
                type="number"
                value={form.entity_id ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, entity_id: e.target.value ? Number(e.target.value) : null }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Impact Description</Label>
              <Textarea
                rows={2}
                placeholder="Describe how this entity is affected…"
                value={form.impact_description ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, impact_description: e.target.value || null }))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={createImpact.isPending}>Add Link</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── CAPA Detail Panel ─────────────────────────────────────────────────────────

const TABS = ["Actions", "5 Whys", "Fishbone", "Impact"] as const;
type Tab = (typeof TABS)[number];

function CAPADetailPanel({ finding }: { finding: FindingListItem }) {
  const [tab, setTab] = useState<Tab>("Actions");
  const { data: summary } = useCapaSummary(finding.id);

  const openActions = summary?.open_actions ?? 0;
  const rootCauseFound = summary?.root_cause_identified ?? false;

  return (
    <div className="flex flex-col h-full">
      {/* Finding header */}
      <div className="px-4 py-3 border-b flex-shrink-0">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-tight">{finding.title}</p>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{finding.description}</p>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <Badge label={finding.severity} className={SEV_COLORS[finding.severity]} />
            <Badge label={finding.status} className={STATUS_COLORS[finding.status]} />
          </div>
        </div>
        <div className="flex items-center gap-3 mt-2">
          {openActions > 0 && (
            <span className="flex items-center gap-1 text-xs text-amber-600">
              <AlertTriangle className="h-3 w-3" />
              {openActions} open action{openActions > 1 ? "s" : ""}
            </span>
          )}
          {rootCauseFound && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle className="h-3 w-3" />
              Root cause identified
            </span>
          )}
          {finding.entity_type && (
            <span className="text-xs text-muted-foreground font-mono">
              {finding.entity_type}#{finding.entity_id}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b px-4 flex-shrink-0">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {tab === "Actions" && <ActionsTab findingId={finding.id} />}
        {tab === "5 Whys" && <FiveWhysTab findingId={finding.id} problemStatement={finding.description} />}
        {tab === "Fishbone" && <FishboneTab findingId={finding.id} />}
        {tab === "Impact" && <ImpactTab findingId={finding.id} />}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CapaPage() {
  const [selected, setSelected] = useState<FindingListItem | null>(null);

  return (
    <div className="flex h-[calc(100vh-8rem)] -mx-4 -my-4">
      {/* Left: finding list */}
      <div className="w-64 flex-shrink-0 flex flex-col">
        <FindingListPanel selected={selected} onSelect={setSelected} />
      </div>

      {/* Right: CAPA workbench */}
      <div className="flex-1 overflow-hidden">
        {!selected ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
            <AlertTriangle className="h-8 w-8 opacity-20" />
            <p className="text-sm">Select a finding to begin CAPA analysis</p>
          </div>
        ) : (
          <CAPADetailPanel finding={selected} />
        )}
      </div>
    </div>
  );
}
