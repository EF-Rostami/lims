"use client";

import { useState } from "react";
import {
  FlaskConical, PlusCircle, Loader2, ChevronRight, Trash2,
  Check, X, Edit3, CheckCircle2, XCircle, Clock, AlertTriangle,
  BarChart3, ClipboardList, TestTube2, Beaker,
} from "lucide-react";
import {
  useValidationStudies, useValidationStudy,
  useCreateStudy, useUpdateStudy, useDeleteStudy,
  useUpsertCriteria, useDeleteCriteria,
  useCreateRun, useUpdateRun, useDeleteRun,
  useAddResult, useDeleteResult,
  useMethodValidationStatus,
} from "@/features/lims/validation/validation.queries";
import { validationApi } from "@/features/lims/validation/validation.api";
import type {
  ValidationParameter, ValidationStatus, RunStatus, PassFail,
  ValidationStudyCreate, ValidationStudyUpdate,
  ValidationCriteriaCreate,
  ValidationRunCreate,
  ValidationResultCreate,
  ValidationStudySummary, ValidationStudyRead,
  ValidationCriteriaRead, ValidationRunRead,
} from "@/features/lims/validation/validation.api";

// ── Constants ─────────────────────────────────────────────────────────────────

const PARAM_META: Record<ValidationParameter, { label: string; abbr: string }> = {
  accuracy:                { label: "Accuracy",                abbr: "Acc" },
  precision:               { label: "Precision",               abbr: "Prec" },
  linearity:               { label: "Linearity",               abbr: "Lin" },
  lod:                     { label: "Limit of Detection",      abbr: "LOD" },
  loq:                     { label: "Limit of Quantification", abbr: "LOQ" },
  robustness:              { label: "Robustness",              abbr: "Rob" },
  selectivity:             { label: "Selectivity",             abbr: "Sel" },
  recovery:                { label: "Recovery",                abbr: "Rec" },
  measurement_uncertainty: { label: "Measurement Uncertainty", abbr: "MU" },
  bias:                    { label: "Bias",                    abbr: "Bias" },
  repeatability:           { label: "Repeatability",           abbr: "Rep" },
  reproducibility:         { label: "Reproducibility",         abbr: "Repro" },
};

const VALIDATION_STATUS_META: Record<ValidationStatus | "not_validated", { label: string; bg: string; text: string; border: string }> = {
  validated:        { label: "Validated",          bg: "bg-green-100",  text: "text-green-800",  border: "border-green-300" },
  under_validation: { label: "Under Validation",   bg: "bg-blue-100",   text: "text-blue-800",   border: "border-blue-300" },
  expired:          { label: "Expired",             bg: "bg-red-100",    text: "text-red-800",    border: "border-red-300" },
  failed:           { label: "Failed",              bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300" },
  not_validated:    { label: "Not Validated",       bg: "bg-slate-100",  text: "text-slate-500",  border: "border-slate-200" },
};

const RUN_STATUS_META: Record<RunStatus, { label: string; color: string }> = {
  draft:    { label: "Draft",    color: "text-slate-500" },
  complete: { label: "Complete", color: "text-green-600" },
  failed:   { label: "Failed",   color: "text-red-600" },
};

const PASS_FAIL_META: Record<PassFail, { label: string; bg: string; text: string }> = {
  pass:    { label: "PASS",    bg: "bg-green-100",  text: "text-green-700" },
  fail:    { label: "FAIL",    bg: "bg-red-100",    text: "text-red-700" },
  pending: { label: "Pending", bg: "bg-slate-100",  text: "text-slate-500" },
};

const ALL_PARAMS = Object.keys(PARAM_META) as ValidationParameter[];

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "–";
  return new Date(iso).toLocaleDateString();
}

function Spinner() {
  return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-300" size={28} /></div>;
}

function StatusBadge({ status }: { status: ValidationStatus | "not_validated" }) {
  const m = VALIDATION_STATUS_META[status] ?? VALIDATION_STATUS_META.not_validated;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${m.bg} ${m.text} ${m.border}`}>
      {m.label}
    </span>
  );
}

function PassFailBadge({ pf }: { pf: PassFail }) {
  const m = PASS_FAIL_META[pf];
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold ${m.bg} ${m.text}`}>{m.label}</span>
  );
}

type Tab = "status" | "studies" | "criteria" | "runs";

// ── Status overview tab ───────────────────────────────────────────────────────

function StatusTab({ onSelectStudy }: { onSelectStudy: (id: number) => void }) {
  const { data: statuses, isLoading } = useMethodValidationStatus();

  if (isLoading) return <Spinner />;
  const list = statuses ?? [];

  const counts = {
    validated: list.filter(s => s.validation_status === "validated").length,
    under_validation: list.filter(s => s.validation_status === "under_validation").length,
    expired: list.filter(s => s.validation_status === "expired").length,
    failed: list.filter(s => s.validation_status === "failed").length,
    not_validated: list.filter(s => s.validation_status === "not_validated").length,
  };

  return (
    <div className="space-y-5">
      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(counts).map(([k, v]) => {
          const m = VALIDATION_STATUS_META[k as ValidationStatus | "not_validated"];
          return (
            <div key={k} className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${m.bg} ${m.border}`}>
              <span className={`text-lg font-bold ${m.text}`}>{v}</span>
              <span className={`text-xs ${m.text}`}>{m.label}</span>
            </div>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-left text-xs font-medium text-slate-500">
              <th className="px-4 py-3">Method Code</th>
              <th className="px-4 py-3">Method Name</th>
              <th className="px-4 py-3">Validation Status</th>
              <th className="px-4 py-3">Valid Until</th>
              <th className="px-4 py-3 w-24"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {list.map(s => (
              <tr key={s.method_id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">{s.method_code}</td>
                <td className="px-4 py-3 text-slate-800">{s.method_name}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={s.validation_status as ValidationStatus | "not_validated"} />
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">{fmtDate(s.valid_until)}</td>
                <td className="px-4 py-3">
                  {s.study_id && (
                    <button
                      onClick={() => onSelectStudy(s.study_id!)}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 transition-colors"
                    >
                      View <ChevronRight size={12} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr><td colSpan={5} className="text-center py-8 text-slate-400 text-sm">No active methods found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Studies list tab ──────────────────────────────────────────────────────────

const EMPTY_STUDY: Partial<ValidationStudyCreate> = {};

function StudiesTab({
  selectedStudyId,
  onSelect,
  onTabChange,
}: {
  selectedStudyId: number | null;
  onSelect: (id: number | null) => void;
  onTabChange: (tab: Tab) => void;
}) {
  const { data: studies, isLoading } = useValidationStudies();
  const createStudy = useCreateStudy();
  const deleteStudy = useDeleteStudy();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<ValidationStudyCreate>>(EMPTY_STUDY);

  function sf(k: keyof ValidationStudyCreate, v: unknown) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.method_id || !form.title) return;
    const created = await createStudy.mutateAsync(form as ValidationStudyCreate);
    setForm(EMPTY_STUDY);
    setShowForm(false);
    onSelect(created.id);
    onTabChange("criteria");
  }

  const list = studies ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">{list.length} validation {list.length === 1 ? "study" : "studies"}</p>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700"
        >
          <PlusCircle size={14} /> New Study
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-slate-50 border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-slate-700">Create Validation Study</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Method ID *</label>
              <input
                type="number"
                className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white"
                value={form.method_id ?? ""}
                onChange={e => sf("method_id", Number(e.target.value))}
                placeholder="e.g. 5"
                required
              />
            </div>
            <div className="col-span-2 md:col-span-3">
              <label className="block text-xs font-medium text-slate-600 mb-1">Study Title *</label>
              <input
                className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white"
                value={form.title ?? ""}
                onChange={e => sf("title", e.target.value)}
                placeholder="e.g. Initial Validation – ICP-MS Method v2.1"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Started</label>
              <input type="date" className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white" value={form.started_at ?? ""} onChange={e => sf("started_at", e.target.value || null)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Valid Until</label>
              <input type="date" className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white" value={form.valid_until ?? ""} onChange={e => sf("valid_until", e.target.value || null)} />
            </div>
            <div className="col-span-2 md:col-span-4">
              <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
              <input className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white" value={form.notes ?? ""} onChange={e => sf("notes", e.target.value || null)} placeholder="Study context, reference standard used…" />
            </div>
          </div>
          <div className="flex gap-2 justify-end border-t pt-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm rounded-lg border hover:bg-slate-100">Cancel</button>
            <button type="submit" disabled={createStudy.isPending} className="px-4 py-1.5 text-sm rounded-lg bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50">
              {createStudy.isPending ? <Loader2 size={12} className="animate-spin" /> : "Create & Configure"}
            </button>
          </div>
        </form>
      )}

      {isLoading ? <Spinner /> : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-xs font-medium text-slate-500">
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Study Title</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Started</th>
                <th className="px-4 py-3">Valid Until</th>
                <th className="px-4 py-3">Runs</th>
                <th className="px-4 py-3">Criteria</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.map(s => (
                <tr
                  key={s.id}
                  className={`hover:bg-slate-50 cursor-pointer ${selectedStudyId === s.id ? "bg-blue-50" : ""}`}
                  onClick={() => onSelect(s.id === selectedStudyId ? null : s.id)}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-slate-700">{s.method_code}</span>
                    <p className="text-xs text-slate-400 truncate max-w-[140px]">{s.method_name}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-800 font-medium max-w-[200px] truncate">{s.title}</td>
                  <td className="px-4 py-3"><StatusBadge status={s.validation_status} /></td>
                  <td className="px-4 py-3 text-xs text-slate-400">{fmtDate(s.started_at)}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{fmtDate(s.valid_until)}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{s.run_count}</td>
                  <td className="px-4 py-3 text-xs text-slate-600">{s.criteria_count}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => { onSelect(s.id); onTabChange("criteria"); }}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                        title="Open"
                      >
                        <ChevronRight size={14} />
                      </button>
                      <button
                        onClick={() => deleteStudy.mutate(s.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-red-300 hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={8} className="text-center py-8 text-slate-400 text-sm">No validation studies yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Criteria tab ──────────────────────────────────────────────────────────────

function CriteriaTab({ studyId }: { studyId: number | null }) {
  const { data: study, isLoading } = useValidationStudy(studyId);
  const upsertCriteria = useUpsertCriteria();
  const deleteCriteria = useDeleteCriteria();
  const updateStudy = useUpdateStudy();

  const [editParam, setEditParam] = useState<ValidationParameter | null>(null);
  const [criteriaForm, setCriteriaForm] = useState<Partial<ValidationCriteriaCreate>>({});

  if (!studyId) {
    return (
      <div className="text-center py-16 text-slate-400">
        <ClipboardList size={36} className="mx-auto mb-3 text-slate-200" />
        <p className="font-medium">Select a study from the Studies tab first.</p>
      </div>
    );
  }

  if (isLoading) return <Spinner />;
  if (!study) return null;

  const existingParams = new Set(study.criteria.map(c => c.parameter));
  const availableParams = ALL_PARAMS.filter(p => !existingParams.has(p));

  function openEdit(c: ValidationCriteriaRead) {
    setEditParam(c.parameter);
    setCriteriaForm({
      parameter: c.parameter,
      target_value: c.target_value ?? undefined,
      tolerance_pct: c.tolerance_pct ?? undefined,
      tolerance_abs: c.tolerance_abs ?? undefined,
      unit: c.unit ?? undefined,
      description: c.description ?? undefined,
    });
  }

  function openNew(param: ValidationParameter) {
    setEditParam(param);
    setCriteriaForm({ parameter: param });
  }

  async function saveCriteria() {
    if (!editParam) return;
    await upsertCriteria.mutateAsync({
      studyId: study.id,
      data: { parameter: editParam, ...criteriaForm } as ValidationCriteriaCreate,
    });
    setEditParam(null);
  }

  return (
    <div className="space-y-4">
      {/* Study header */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-slate-500">{study.method_code}</span>
              <StatusBadge status={study.validation_status} />
            </div>
            <h3 className="font-semibold text-slate-800">{study.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Started: {fmtDate(study.started_at)} · Valid until: {fmtDate(study.valid_until)}
            </p>
          </div>
          {/* Status quick-update */}
          <select
            className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white"
            value={study.validation_status}
            onChange={e => updateStudy.mutate({ id: study.id, data: { validation_status: e.target.value as ValidationStatus } })}
          >
            <option value="under_validation">Under Validation</option>
            <option value="validated">Validated</option>
            <option value="expired">Expired</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Existing criteria */}
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b bg-slate-50 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-700">Acceptance Criteria ({study.criteria.length})</h4>
        </div>
        {study.criteria.length === 0 ? (
          <p className="text-center py-6 text-slate-400 text-sm">No criteria defined yet. Add parameters below.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs font-medium text-slate-500">
                <th className="px-4 py-2">Parameter</th>
                <th className="px-4 py-2">Target Value</th>
                <th className="px-4 py-2">Tolerance %</th>
                <th className="px-4 py-2">Tolerance Abs</th>
                <th className="px-4 py-2">Unit</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {study.criteria.map(c => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 font-semibold text-slate-700">
                    {PARAM_META[c.parameter]?.label ?? c.parameter}
                  </td>
                  <td className="px-4 py-2 text-slate-500">{c.target_value ?? "–"}</td>
                  <td className="px-4 py-2 text-slate-500">{c.tolerance_pct != null ? `±${c.tolerance_pct}%` : "–"}</td>
                  <td className="px-4 py-2 text-slate-500">{c.tolerance_abs != null ? `±${c.tolerance_abs}` : "–"}</td>
                  <td className="px-4 py-2 text-slate-400 text-xs">{c.unit ?? "–"}</td>
                  <td className="px-4 py-2 text-slate-400 text-xs max-w-[180px] truncate">{c.description ?? "–"}</td>
                  <td className="px-4 py-2">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="p-1 rounded hover:bg-slate-100 text-slate-400"><Edit3 size={13} /></button>
                      <button onClick={() => deleteCriteria.mutate({ id: c.id, studyId: study.id })} className="p-1 rounded hover:bg-red-50 text-red-400"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add parameter */}
      {availableParams.length > 0 && (
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <h4 className="text-sm font-semibold text-slate-700 mb-3">Add Parameter</h4>
          <div className="flex flex-wrap gap-2">
            {availableParams.map(p => (
              <button
                key={p}
                onClick={() => openNew(p)}
                className="px-3 py-1.5 rounded-lg border border-dashed border-slate-300 text-xs text-slate-500 hover:border-slate-500 hover:text-slate-700 transition-colors"
              >
                + {PARAM_META[p]?.label ?? p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Criteria edit form */}
      {editParam && (
        <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-5 space-y-3">
          <h4 className="font-semibold text-slate-800">
            {PARAM_META[editParam]?.label ?? editParam} — Acceptance Criteria
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Target Value</label>
              <input
                type="number"
                step="any"
                className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white"
                value={criteriaForm.target_value ?? ""}
                onChange={e => setCriteriaForm(f => ({ ...f, target_value: e.target.value ? Number(e.target.value) : null }))}
                placeholder="Reference"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tolerance % (±)</label>
              <input
                type="number"
                step="any"
                className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white"
                value={criteriaForm.tolerance_pct ?? ""}
                onChange={e => setCriteriaForm(f => ({ ...f, tolerance_pct: e.target.value ? Number(e.target.value) : null }))}
                placeholder="e.g. 15"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tolerance Abs (±)</label>
              <input
                type="number"
                step="any"
                className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white"
                value={criteriaForm.tolerance_abs ?? ""}
                onChange={e => setCriteriaForm(f => ({ ...f, tolerance_abs: e.target.value ? Number(e.target.value) : null }))}
                placeholder="e.g. 0.05"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Unit</label>
              <input
                className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white"
                value={criteriaForm.unit ?? ""}
                onChange={e => setCriteriaForm(f => ({ ...f, unit: e.target.value || null }))}
                placeholder="e.g. mg/L, %"
              />
            </div>
            <div className="col-span-2 md:col-span-4">
              <label className="block text-xs font-medium text-slate-600 mb-1">Description / Basis</label>
              <input
                className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white"
                value={criteriaForm.description ?? ""}
                onChange={e => setCriteriaForm(f => ({ ...f, description: e.target.value || null }))}
                placeholder="e.g. Per ISO 17511:2003 §6.3.3, recovery must be 85–115%"
              />
            </div>
          </div>
          <div className="flex gap-2 border-t pt-3">
            <button onClick={saveCriteria} disabled={upsertCriteria.isPending} className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50">
              {upsertCriteria.isPending ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              Save Criteria
            </button>
            <button onClick={() => setEditParam(null)} className="px-3 py-1.5 text-sm rounded-lg border hover:bg-slate-100">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Runs & Results tab ────────────────────────────────────────────────────────

function RunsTab({ studyId }: { studyId: number | null }) {
  const { data: study, isLoading } = useValidationStudy(studyId);
  const createRun = useCreateRun();
  const updateRun = useUpdateRun();
  const deleteRun = useDeleteRun();
  const addResult = useAddResult();
  const deleteResult = useDeleteResult();

  const [expandedRun, setExpandedRun] = useState<number | null>(null);
  const [showNewRun, setShowNewRun] = useState(false);
  const [runForm, setRunForm] = useState<Partial<ValidationRunCreate>>({ run_status: "draft" });
  const [resultForm, setResultForm] = useState<Partial<ValidationResultCreate>>({ pass_fail: "pending" });
  const [addingResultTo, setAddingResultTo] = useState<number | null>(null);

  if (!studyId) {
    return (
      <div className="text-center py-16 text-slate-400">
        <TestTube2 size={36} className="mx-auto mb-3 text-slate-200" />
        <p className="font-medium">Select a study from the Studies tab first.</p>
      </div>
    );
  }

  if (isLoading) return <Spinner />;
  if (!study) return null;

  const criteria = study.criteria;

  async function handleCreateRun(e: React.FormEvent) {
    e.preventDefault();
    const nextNum = (study.runs.length > 0 ? Math.max(...study.runs.map(r => r.run_number)) : 0) + 1;
    const created = await createRun.mutateAsync({
      studyId: study.id,
      data: { run_number: nextNum, run_status: "draft", ...runForm } as ValidationRunCreate,
    });
    setShowNewRun(false);
    setRunForm({ run_status: "draft" });
    setExpandedRun(created.id);
  }

  async function handleAddResult(runId: number) {
    if (!resultForm.parameter) return;
    await addResult.mutateAsync({
      runId,
      studyId: study.id,
      data: resultForm as ValidationResultCreate,
    });
    setResultForm({ pass_fail: "pending" });
    setAddingResultTo(null);
  }

  return (
    <div className="space-y-4">
      {/* Study header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800">{study.title}</h3>
          <p className="text-xs text-slate-400">{study.method_code} · {study.runs.length} runs</p>
        </div>
        <button
          onClick={() => setShowNewRun(v => !v)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700"
        >
          <PlusCircle size={14} /> Add Run
        </button>
      </div>

      {showNewRun && (
        <form onSubmit={handleCreateRun} className="bg-slate-50 border rounded-xl p-4 space-y-3">
          <h4 className="font-medium text-slate-700 text-sm">New Validation Run</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Run Date</label>
              <input type="date" className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white" value={runForm.run_date ?? ""} onChange={e => setRunForm(f => ({ ...f, run_date: e.target.value || null }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white" value={runForm.run_status ?? "draft"} onChange={e => setRunForm(f => ({ ...f, run_status: e.target.value as RunStatus }))}>
                <option value="draft">Draft</option>
                <option value="complete">Complete</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="col-span-2 md:col-span-3">
              <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
              <input className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white" value={runForm.notes ?? ""} onChange={e => setRunForm(f => ({ ...f, notes: e.target.value || null }))} placeholder="Conditions, instrument ID, calibration reference…" />
            </div>
          </div>
          <div className="flex gap-2 justify-end border-t pt-2">
            <button type="button" onClick={() => setShowNewRun(false)} className="px-3 py-1.5 text-sm rounded-lg border hover:bg-slate-100">Cancel</button>
            <button type="submit" disabled={createRun.isPending} className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50">
              {createRun.isPending ? <Loader2 size={12} className="animate-spin" /> : "Create Run"}
            </button>
          </div>
        </form>
      )}

      {study.runs.length === 0 && !showNewRun && (
        <div className="text-center py-12 text-slate-400 text-sm">
          <Beaker size={36} className="mx-auto mb-3 text-slate-200" />
          No runs yet. Click "Add Run" to start entering validation data.
        </div>
      )}

      {/* Runs list */}
      <div className="space-y-3">
        {study.runs.map(run => {
          const isExpanded = expandedRun === run.id;
          const statusM = RUN_STATUS_META[run.run_status];
          const paramsDone = new Set(run.results.map(r => r.parameter));
          const passCount = run.results.filter(r => r.pass_fail === "pass").length;
          const failCount = run.results.filter(r => r.pass_fail === "fail").length;

          return (
            <div key={run.id} className="rounded-xl border bg-white shadow-sm overflow-hidden">
              {/* Run header */}
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50"
                onClick={() => setExpandedRun(isExpanded ? null : run.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-slate-700 text-sm">Run #{run.run_number}</span>
                  <span className={`text-xs font-medium ${statusM.color}`}>{statusM.label}</span>
                  {run.run_date && <span className="text-xs text-slate-400">{fmtDate(run.run_date)}</span>}
                  {run.results.length > 0 && (
                    <div className="flex gap-1.5">
                      {passCount > 0 && <span className="text-xs text-green-600 font-medium">{passCount} pass</span>}
                      {failCount > 0 && <span className="text-xs text-red-600 font-medium">{failCount} fail</span>}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                  <select
                    className="border border-slate-200 rounded px-1.5 py-0.5 text-xs bg-white"
                    value={run.run_status}
                    onChange={e => updateRun.mutate({ id: run.id, studyId: study.id, data: { run_status: e.target.value as RunStatus } })}
                  >
                    <option value="draft">Draft</option>
                    <option value="complete">Complete</option>
                    <option value="failed">Failed</option>
                  </select>
                  <button onClick={() => deleteRun.mutate({ id: run.id, studyId: study.id })} className="p-1 rounded hover:bg-red-50 text-red-400"><Trash2 size={13} /></button>
                  <ChevronRight size={14} className={`text-slate-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </div>
              </div>

              {/* Results grid */}
              {isExpanded && (
                <div className="border-t px-4 py-4 space-y-3">
                  {/* Results table */}
                  {run.results.length > 0 && (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b text-left text-slate-500">
                          <th className="py-1.5 pr-4">Parameter</th>
                          <th className="py-1.5 pr-4">Measured</th>
                          <th className="py-1.5 pr-4">Calculated</th>
                          <th className="py-1.5 pr-4">Unit</th>
                          <th className="py-1.5 pr-4">Pass/Fail</th>
                          <th className="py-1.5 pr-4">Notes</th>
                          <th className="py-1.5 w-8"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {run.results.map(res => {
                          const crit = criteria.find(c => c.parameter === res.parameter);
                          return (
                            <tr key={res.id} className="hover:bg-slate-50">
                              <td className="py-1.5 pr-4 font-semibold text-slate-700">
                                {PARAM_META[res.parameter]?.abbr ?? res.parameter}
                              </td>
                              <td className="py-1.5 pr-4 font-mono text-slate-600">
                                {res.measured_value ?? "–"}
                                {crit?.target_value != null && res.measured_value != null && crit.tolerance_pct != null && (
                                  <span className={`ml-1 ${Math.abs((res.measured_value - crit.target_value) / crit.target_value * 100) <= crit.tolerance_pct ? "text-green-500" : "text-red-500"}`}>
                                    ({((res.measured_value - crit.target_value) / crit.target_value * 100).toFixed(1)}%)
                                  </span>
                                )}
                              </td>
                              <td className="py-1.5 pr-4 font-mono text-slate-500">{res.calculated_value ?? "–"}</td>
                              <td className="py-1.5 pr-4 text-slate-400">{res.unit ?? "–"}</td>
                              <td className="py-1.5 pr-4"><PassFailBadge pf={res.pass_fail} /></td>
                              <td className="py-1.5 pr-4 text-slate-400 max-w-[120px] truncate">{res.notes ?? "–"}</td>
                              <td className="py-1.5">
                                <button onClick={() => deleteResult.mutate({ id: res.id, studyId: study.id })} className="p-0.5 rounded hover:bg-red-50 text-red-300"><Trash2 size={12} /></button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}

                  {/* Add result form */}
                  {addingResultTo === run.id ? (
                    <div className="bg-slate-50 rounded-lg p-3 space-y-3 border">
                      <h5 className="text-xs font-semibold text-slate-700">Add Result</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Parameter *</label>
                          <select
                            className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs bg-white"
                            value={resultForm.parameter ?? ""}
                            onChange={e => setResultForm(f => ({ ...f, parameter: e.target.value as ValidationParameter }))}
                          >
                            <option value="">Select…</option>
                            {ALL_PARAMS.filter(p => !paramsDone.has(p)).map(p => (
                              <option key={p} value={p}>{PARAM_META[p]?.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Measured Value</label>
                          <input
                            type="number"
                            step="any"
                            className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs bg-white"
                            value={resultForm.measured_value ?? ""}
                            onChange={e => setResultForm(f => ({ ...f, measured_value: e.target.value ? Number(e.target.value) : null }))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Calculated Value</label>
                          <input
                            type="number"
                            step="any"
                            className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs bg-white"
                            value={resultForm.calculated_value ?? ""}
                            onChange={e => setResultForm(f => ({ ...f, calculated_value: e.target.value ? Number(e.target.value) : null }))}
                            placeholder="e.g. %CV, %Rec"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Unit</label>
                          <input
                            className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs bg-white"
                            value={resultForm.unit ?? ""}
                            onChange={e => setResultForm(f => ({ ...f, unit: e.target.value || null }))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Pass / Fail *</label>
                          <select
                            className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs bg-white"
                            value={resultForm.pass_fail ?? "pending"}
                            onChange={e => setResultForm(f => ({ ...f, pass_fail: e.target.value as PassFail }))}
                          >
                            <option value="pending">Pending</option>
                            <option value="pass">Pass</option>
                            <option value="fail">Fail</option>
                          </select>
                        </div>
                        <div className="col-span-2 md:col-span-3">
                          <label className="block text-xs text-slate-500 mb-1">Notes</label>
                          <input
                            className="w-full border border-slate-300 rounded px-1.5 py-1 text-xs bg-white"
                            value={resultForm.notes ?? ""}
                            onChange={e => setResultForm(f => ({ ...f, notes: e.target.value || null }))}
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAddResult(run.id)}
                          disabled={!resultForm.parameter || addResult.isPending}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-white text-xs hover:bg-slate-700 disabled:opacity-50"
                        >
                          {addResult.isPending ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                          Save
                        </button>
                        <button onClick={() => setAddingResultTo(null)} className="px-2.5 py-1 text-xs rounded border hover:bg-slate-100">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    paramsDone.size < ALL_PARAMS.length && (
                      <button
                        onClick={() => { setAddingResultTo(run.id); setResultForm({ pass_fail: "pending" }); }}
                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded border border-dashed border-slate-300 hover:border-slate-500 transition-colors"
                      >
                        <PlusCircle size={11} /> Add measurement result
                      </button>
                    )
                  )}

                  {run.notes && (
                    <p className="text-xs text-slate-400 italic mt-1">{run.notes}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "status",   label: "Method Status",    icon: BarChart3 },
  { id: "studies",  label: "Studies",          icon: ClipboardList },
  { id: "criteria", label: "Criteria",         icon: CheckCircle2 },
  { id: "runs",     label: "Runs & Results",   icon: TestTube2 },
];

export default function ValidationPage() {
  const [tab, setTab] = useState<Tab>("status");
  const [selectedStudyId, setSelectedStudyId] = useState<number | null>(null);

  function selectStudy(id: number | null) {
    setSelectedStudyId(id);
  }

  function goToStudy(id: number) {
    setSelectedStudyId(id);
    setTab("criteria");
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FlaskConical size={22} /> Method Validation
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          ISO 17025 §7.2 — Validation parameters, acceptance criteria, run data, pass/fail tracking
        </p>
      </div>

      {/* Selected study indicator */}
      {selectedStudyId && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700">
          <TestTube2 size={13} />
          Study #{selectedStudyId} selected
          <button onClick={() => setSelectedStudyId(null)} className="ml-auto text-blue-400 hover:text-blue-600">
            <X size={13} />
          </button>
        </div>
      )}

      <div className="border-b flex gap-1 flex-wrap">
        {TABS.map(t => {
          const Icon = t.icon;
          const needsStudy = (t.id === "criteria" || t.id === "runs") && !selectedStudyId;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                tab === t.id
                  ? "border-slate-800 text-slate-800"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <Icon size={13} />
              {t.label}
              {needsStudy && <span className="ml-1 text-xs text-slate-300">(select study)</span>}
            </button>
          );
        })}
      </div>

      {tab === "status"   && <StatusTab onSelectStudy={goToStudy} />}
      {tab === "studies"  && <StudiesTab selectedStudyId={selectedStudyId} onSelect={selectStudy} onTabChange={setTab} />}
      {tab === "criteria" && <CriteriaTab studyId={selectedStudyId} />}
      {tab === "runs"     && <RunsTab studyId={selectedStudyId} />}
    </div>
  );
}
