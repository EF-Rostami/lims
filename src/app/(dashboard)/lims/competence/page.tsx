"use client";

import { useState } from "react";
import {
  GraduationCap, PlusCircle, Loader2, AlertTriangle, CheckCircle2,
  XCircle, Clock, Trash2, Edit3, Check, X, Shield, Search,
  User, FlaskConical, Wrench,
} from "lucide-react";
import {
  useCompetenceRecords, useCreateCompetenceRecord, useUpdateCompetenceRecord, useDeleteCompetenceRecord,
  useCompetenceMatrix,
  useExpiringCompetences,
  useTrainingRecords, useCreateTrainingRecord, useDeleteTrainingRecord,
} from "@/features/lims/competence/competence.queries";
import { competenceApi } from "@/features/lims/competence/competence.api";
import type {
  CompetenceLevel, CompetenceStatus, CompetenceScope, TrainingType,
  CompetenceRecordCreate, CompetenceRecordRead, AuthorizationCheckResult,
  TrainingRecordCreate, MatrixCell,
} from "@/features/lims/competence/competence.api";

// ── Constants ─────────────────────────────────────────────────────────────────

const LEVEL_META: Record<CompetenceLevel, { label: string; bg: string; text: string; border: string }> = {
  trainee:   { label: "Trainee",   bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" },
  competent: { label: "Competent", bg: "bg-green-100",  text: "text-green-800",  border: "border-green-300" },
  assessor:  { label: "Assessor",  bg: "bg-blue-100",   text: "text-blue-800",   border: "border-blue-300" },
};

const STATUS_META: Record<CompetenceStatus, { label: string; color: string; bg: string }> = {
  active:                { label: "Active",               color: "text-green-700",  bg: "bg-green-100" },
  expired:               { label: "Expired",              color: "text-red-700",    bg: "bg-red-100" },
  suspended:             { label: "Suspended",            color: "text-orange-700", bg: "bg-orange-100" },
  pending_revalidation:  { label: "Revalidation Due",     color: "text-yellow-700", bg: "bg-yellow-100" },
};

const SCOPE_META: Record<CompetenceScope, { label: string; icon: React.ElementType }> = {
  method:     { label: "Test Method",  icon: FlaskConical },
  instrument: { label: "Instrument",   icon: Wrench },
  general:    { label: "General",      icon: GraduationCap },
};

const TRAINING_TYPE_META: Record<TrainingType, string> = {
  initial:    "Initial",
  refresher:  "Refresher",
  on_the_job: "On-the-Job",
  external:   "External",
  internal:   "Internal",
};

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "–";
  return new Date(iso).toLocaleDateString();
}

function expiryClass(days: number | null | undefined): string {
  if (days == null) return "text-slate-400";
  if (days < 0)   return "text-red-700 font-bold";
  if (days <= 7)  return "text-red-600 font-semibold";
  if (days <= 30) return "text-yellow-600 font-medium";
  return "text-green-700";
}

function Spinner() {
  return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-300" size={28} /></div>;
}

function LevelBadge({ level }: { level: CompetenceLevel }) {
  const m = LEVEL_META[level];
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${m.bg} ${m.text} ${m.border}`}>{m.label}</span>;
}

function StatusBadge({ status }: { status: CompetenceStatus }) {
  const m = STATUS_META[status];
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.bg} ${m.color}`}>{m.label}</span>;
}

type Tab = "matrix" | "records" | "training" | "expiring" | "check";

// ── Readiness panel ───────────────────────────────────────────────────────────

function ReadinessPanel() {
  const { data: records } = useCompetenceRecords();

  if (!records || records.length === 0) return null;

  // Group by employee and flag as cleared if they hold ≥1 active+competent/assessor record
  const byEmployee = new Map<number, { name: string; number: string | null | undefined; cleared: boolean }>();
  for (const r of records) {
    const existing = byEmployee.get(r.employee_id);
    const isCleared = r.status === "active" && (r.level === "competent" || r.level === "assessor");
    if (!existing) {
      byEmployee.set(r.employee_id, {
        name: r.employee_name ?? `#${r.employee_id}`,
        number: r.employee_number,
        cleared: isCleared,
      });
    } else if (isCleared) {
      existing.cleared = true;
    }
  }

  const analysts = Array.from(byEmployee.values()).sort((a, b) => a.name.localeCompare(b.name));
  const cleared = analysts.filter(a => a.cleared).length;
  const total = analysts.length;
  const allClear = cleared === total;

  return (
    <div className={`rounded-xl border p-4 ${allClear ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {allClear ? (
            <CheckCircle2 size={18} className="text-green-600 shrink-0" />
          ) : (
            <AlertTriangle size={18} className="text-amber-600 shrink-0" />
          )}
          <div>
            <p className={`text-sm font-semibold ${allClear ? "text-green-800" : "text-amber-800"}`}>
              Go-Live Readiness — Personnel
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {cleared} of {total} analyst{total !== 1 ? "s" : ""} hold an active competent-level authorization
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {analysts.map(a => (
            <span
              key={a.number ?? a.name}
              title={a.number ?? undefined}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                a.cleared
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-red-100 text-red-700 border-red-200"
              }`}
            >
              {a.cleared ? <Check size={10} /> : <X size={10} />}
              {a.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Matrix tab ────────────────────────────────────────────────────────────────

function MatrixCell({ cell }: { cell: MatrixCell | undefined }) {
  if (!cell || !cell.level) {
    return (
      <div className="w-full h-10 flex items-center justify-center text-slate-200 bg-slate-50 rounded">
        <X size={12} />
      </div>
    );
  }
  const m = LEVEL_META[cell.level];
  const expired = cell.status === "expired";
  const warn = cell.days_until_expiry != null && cell.days_until_expiry <= 30 && cell.days_until_expiry >= 0;
  return (
    <div
      title={`${m.label}${cell.valid_until ? ` · valid until ${fmtDate(cell.valid_until)}` : ""}`}
      className={`w-full h-10 flex items-center justify-center rounded text-xs font-bold border
        ${expired ? "bg-red-100 text-red-600 border-red-200 line-through" :
          warn ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
          `${m.bg} ${m.text} ${m.border}`
        }`}
    >
      {cell.level[0].toUpperCase()}
      {expired && <span className="ml-0.5 text-red-400">!</span>}
      {warn && !expired && <span className="ml-0.5 text-yellow-500">~</span>}
    </div>
  );
}

function MatrixTab() {
  const { data: matrix, isLoading } = useCompetenceMatrix();

  if (isLoading) return <Spinner />;
  if (!matrix) return null;

  const allCols = [
    ...matrix.method_columns.map(m => ({ key: `method:${m.id}`, label: m.code, sublabel: m.name, icon: FlaskConical })),
    ...matrix.instrument_columns.map(i => ({ key: `instrument:${i.id}`, label: i.code, sublabel: i.name, icon: Wrench })),
  ];

  if (matrix.rows.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <GraduationCap size={40} className="mx-auto mb-3 text-slate-200" />
        <p className="font-medium">No authorization data yet.</p>
        <p className="text-sm mt-1">Add competence records in the Records tab to populate the matrix.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs flex-wrap">
        <span className="text-slate-500 font-medium">Legend:</span>
        {Object.entries(LEVEL_META).map(([level, m]) => (
          <span key={level} className={`px-2 py-0.5 rounded border font-bold ${m.bg} ${m.text} ${m.border}`}>
            {level[0].toUpperCase()} = {m.label}
          </span>
        ))}
        <span className="px-2 py-0.5 rounded border bg-red-100 text-red-600 border-red-200 font-bold line-through">A!</span>
        <span className="text-slate-400">= Expired</span>
        <span className="px-2 py-0.5 rounded border bg-yellow-50 text-yellow-700 border-yellow-200 font-bold">A~</span>
        <span className="text-slate-400">= Expiring soon</span>
      </div>

      {/* Matrix table */}
      <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
        <table className="text-sm">
          <thead>
            <tr className="border-b bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 w-48 sticky left-0 bg-slate-50 z-10">
                Employee
              </th>
              {allCols.map(col => {
                const Icon = col.icon;
                return (
                  <th key={col.key} className="px-2 py-3 min-w-[90px]">
                    <div className="flex flex-col items-center gap-0.5">
                      <Icon size={11} className="text-slate-400" />
                      <span className="text-xs font-semibold text-slate-700 truncate max-w-[80px]" title={col.sublabel}>
                        {col.label}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y">
            {matrix.rows.map(row => (
              <tr key={row.employee_id} className="hover:bg-slate-50">
                <td className="px-4 py-2 sticky left-0 bg-white z-10 border-r">
                  <p className="font-medium text-slate-800 text-sm">{row.employee_name}</p>
                  <p className="text-xs text-slate-400 font-mono">{row.employee_number}</p>
                </td>
                {allCols.map(col => (
                  <td key={col.key} className="px-2 py-2">
                    <MatrixCell cell={row.cells[col.key]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Records tab ───────────────────────────────────────────────────────────────

const EMPTY_RECORD: Partial<CompetenceRecordCreate> = {
  scope: "method",
  level: "competent",
};

function RecordsTab() {
  const { data: records, isLoading } = useCompetenceRecords();
  const createRecord = useCreateCompetenceRecord();
  const updateRecord = useUpdateCompetenceRecord();
  const deleteRecord = useDeleteCompetenceRecord();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<CompetenceRecordCreate>>(EMPTY_RECORD);
  const [editId, setEditId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<CompetenceStatus>("active");
  const [editValidUntil, setEditValidUntil] = useState("");
  const [filterScope, setFilterScope] = useState<CompetenceScope | "">("");
  const [filterStatus, setFilterStatus] = useState<CompetenceStatus | "">("");

  const list = (records ?? []).filter(r =>
    (!filterScope || r.scope === filterScope) &&
    (!filterStatus || r.status === filterStatus)
  );

  function sf(k: keyof CompetenceRecordCreate, v: unknown) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.employee_id || !form.scope || !form.level) return;
    await createRecord.mutateAsync(form as CompetenceRecordCreate);
    setForm(EMPTY_RECORD);
    setShowForm(false);
  }

  async function saveEdit(id: number) {
    await updateRecord.mutateAsync({ id, data: { status: editStatus, valid_until: editValidUntil || null } });
    setEditId(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2">
          <select
            value={filterScope}
            onChange={e => setFilterScope(e.target.value as CompetenceScope | "")}
            className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <option value="">All scopes</option>
            <option value="method">Method</option>
            <option value="instrument">Instrument</option>
            <option value="general">General</option>
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as CompetenceStatus | "")}
            className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
          >
            <option value="">All statuses</option>
            {Object.entries(STATUS_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700"
        >
          <PlusCircle size={14} /> Grant Authorization
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-slate-50 border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-slate-700">Grant Competence Authorization</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Employee ID *</label>
              <input
                type="number"
                className="w-full border rounded-lg px-2 py-1.5 text-sm"
                value={form.employee_id ?? ""}
                onChange={e => sf("employee_id", Number(e.target.value))}
                placeholder="Employee ID"
                required
              />
              <p className="text-xs text-slate-400 mt-0.5">From HR module</p>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Scope *</label>
              <select className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.scope ?? "method"} onChange={e => sf("scope", e.target.value as CompetenceScope)}>
                <option value="method">Test Method</option>
                <option value="instrument">Instrument</option>
                <option value="general">General</option>
              </select>
            </div>
            {form.scope === "method" && (
              <div>
                <label className="block text-xs text-slate-500 mb-1">Method ID *</label>
                <input type="number" className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.method_id ?? ""} onChange={e => sf("method_id", Number(e.target.value))} required />
              </div>
            )}
            {form.scope === "instrument" && (
              <div>
                <label className="block text-xs text-slate-500 mb-1">Instrument ID *</label>
                <input type="number" className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.instrument_id ?? ""} onChange={e => sf("instrument_id", Number(e.target.value))} required />
              </div>
            )}
            <div>
              <label className="block text-xs text-slate-500 mb-1">Level *</label>
              <select className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.level ?? "competent"} onChange={e => sf("level", e.target.value as CompetenceLevel)}>
                <option value="trainee">Trainee (supervised)</option>
                <option value="competent">Competent (independent)</option>
                <option value="assessor">Assessor (can certify others)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Valid From</label>
              <input type="date" className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.valid_from ?? ""} onChange={e => sf("valid_from", e.target.value || null)} />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Valid Until</label>
              <input type="date" className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.valid_until ?? ""} onChange={e => sf("valid_until", e.target.value || null)} />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Revalidation (months)</label>
              <input type="number" className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.revalidation_interval_months ?? ""} onChange={e => sf("revalidation_interval_months", e.target.value ? Number(e.target.value) : null)} placeholder="e.g. 12" />
            </div>
            <div className="col-span-2 md:col-span-4">
              <label className="block text-xs text-slate-500 mb-1">Notes</label>
              <input className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.notes ?? ""} onChange={e => sf("notes", e.target.value || null)} placeholder="Assessment basis, training completion reference…" />
            </div>
          </div>
          <div className="flex gap-2 justify-end border-t pt-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm rounded-lg border hover:bg-slate-100">Cancel</button>
            <button type="submit" disabled={createRecord.isPending} className="px-4 py-1.5 text-sm rounded-lg bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50">
              {createRecord.isPending ? <Loader2 size={12} className="animate-spin" /> : "Grant Authorization"}
            </button>
          </div>
        </form>
      )}

      {isLoading ? <Spinner /> : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-xs font-medium text-slate-500">
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Scope</th>
                <th className="px-4 py-3">Method / Instrument</th>
                <th className="px-4 py-3">Level</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Valid Until</th>
                <th className="px-4 py-3">Revalidation</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.map(r => {
                const ScopeIcon = SCOPE_META[r.scope].icon;
                const isEditing = editId === r.id;
                return (
                  <tr key={r.id} className={r.status === "expired" ? "bg-red-50" : r.status === "pending_revalidation" ? "bg-yellow-50" : "hover:bg-slate-50"}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">{r.employee_name ?? `#${r.employee_id}`}</p>
                      <p className="text-xs text-slate-400 font-mono">{r.employee_number}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-xs text-slate-500">
                        <ScopeIcon size={12} />{SCOPE_META[r.scope].label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.scope === "method" && (
                        <span className="text-slate-700">{r.method_name ?? `#${r.method_id}`} <span className="text-slate-400 font-mono text-xs">{r.method_code}</span></span>
                      )}
                      {r.scope === "instrument" && (
                        <span className="text-slate-700">{r.instrument_name ?? `#${r.instrument_id}`} <span className="text-slate-400 font-mono text-xs">{r.instrument_code}</span></span>
                      )}
                      {r.scope === "general" && <span className="text-slate-400 italic text-xs">General</span>}
                    </td>
                    <td className="px-4 py-3"><LevelBadge level={r.level} /></td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <select className="border rounded px-1 py-0.5 text-xs" value={editStatus} onChange={e => setEditStatus(e.target.value as CompetenceStatus)}>
                          {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                        </select>
                      ) : (
                        <StatusBadge status={r.status} />
                      )}
                    </td>
                    <td className={`px-4 py-3 text-xs ${expiryClass(r.days_until_expiry)}`}>
                      {isEditing ? (
                        <input type="date" className="border rounded px-1 py-0.5 text-xs w-32" value={editValidUntil} onChange={e => setEditValidUntil(e.target.value)} />
                      ) : (
                        <>
                          {fmtDate(r.valid_until)}
                          {r.days_until_expiry != null && r.valid_until && (
                            <span className="ml-1 text-slate-400">({r.days_until_expiry}d)</span>
                          )}
                        </>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {r.revalidation_interval_months ? `${r.revalidation_interval_months}mo` : "–"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {isEditing ? (
                          <>
                            <button onClick={() => saveEdit(r.id)} className="p-1 rounded hover:bg-green-50 text-green-600"><Check size={14} /></button>
                            <button onClick={() => setEditId(null)} className="p-1 rounded hover:bg-slate-100 text-slate-400"><X size={14} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditId(r.id); setEditStatus(r.status); setEditValidUntil(r.valid_until ?? ""); }} className="p-1 rounded hover:bg-slate-100 text-slate-400"><Edit3 size={14} /></button>
                            <button onClick={() => deleteRecord.mutate(r.id)} className="p-1 rounded hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {list.length === 0 && (
                <tr><td colSpan={8} className="text-center py-8 text-slate-400 text-sm">No competence records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Training tab ──────────────────────────────────────────────────────────────

function TrainingTab() {
  const [filterEmployee, setFilterEmployee] = useState<number | undefined>();
  const [filterEmpStr, setFilterEmpStr] = useState("");
  const { data: training, isLoading } = useTrainingRecords({ employee_id: filterEmployee });
  const createTraining = useCreateTrainingRecord();
  const deleteTraining = useDeleteTrainingRecord();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<TrainingRecordCreate>>({ training_type: "initial" });

  const list = training ?? [];

  function sf(k: keyof TrainingRecordCreate, v: unknown) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.employee_id || !form.course_name || !form.training_type || !form.completed_at) return;
    await createTraining.mutateAsync(form as TrainingRecordCreate);
    setForm({ training_type: "initial" });
    setShowForm(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-2 items-center">
          <input
            type="number"
            className="border rounded-lg px-3 py-1.5 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-slate-300"
            placeholder="Filter by Emp. ID"
            value={filterEmpStr}
            onChange={e => {
              setFilterEmpStr(e.target.value);
              setFilterEmployee(e.target.value ? Number(e.target.value) : undefined);
            }}
          />
        </div>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700">
          <PlusCircle size={14} /> Add Training Record
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-slate-50 border rounded-xl p-4 space-y-3">
          <h3 className="font-medium text-slate-700 text-sm">New Training Record</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Employee ID *</label>
              <input type="number" className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.employee_id ?? ""} onChange={e => sf("employee_id", Number(e.target.value))} required />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-500 mb-1">Course / Training Name *</label>
              <input className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.course_name ?? ""} onChange={e => sf("course_name", e.target.value)} placeholder="e.g. GC-MS Operation & Safety" required />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Type *</label>
              <select className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.training_type ?? "initial"} onChange={e => sf("training_type", e.target.value as TrainingType)}>
                {Object.entries(TRAINING_TYPE_META).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Provider</label>
              <input className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.provider ?? ""} onChange={e => sf("provider", e.target.value || null)} placeholder="Internal / External org" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Completed Date *</label>
              <input type="date" className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.completed_at ?? ""} onChange={e => sf("completed_at", e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Valid Until</label>
              <input type="date" className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.valid_until ?? ""} onChange={e => sf("valid_until", e.target.value || null)} />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Pass Score</label>
              <input type="number" step="any" className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.pass_score ?? ""} onChange={e => sf("pass_score", e.target.value ? Number(e.target.value) : null)} placeholder="e.g. 80" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Achieved Score</label>
              <input type="number" step="any" className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.achieved_score ?? ""} onChange={e => sf("achieved_score", e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Competence Record ID</label>
              <input type="number" className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.competence_record_id ?? ""} onChange={e => sf("competence_record_id", e.target.value ? Number(e.target.value) : null)} placeholder="Links to auth record" />
            </div>
            <div className="col-span-2 md:col-span-4">
              <label className="block text-xs text-slate-500 mb-1">Notes</label>
              <input className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.notes ?? ""} onChange={e => sf("notes", e.target.value || null)} />
            </div>
          </div>
          <div className="flex gap-2 justify-end border-t pt-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm rounded-lg border hover:bg-slate-100">Cancel</button>
            <button type="submit" disabled={createTraining.isPending} className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50">
              {createTraining.isPending ? <Loader2 size={12} className="animate-spin" /> : "Save"}
            </button>
          </div>
        </form>
      )}

      {isLoading ? <Spinner /> : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-xs font-medium text-slate-500">
                <th className="px-4 py-3">Employee</th>
                <th className="px-4 py-3">Course</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Completed</th>
                <th className="px-4 py-3">Valid Until</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.map(t => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{t.employee_name ?? `#${t.employee_id}`}</p>
                    <p className="text-xs text-slate-400 font-mono">{t.employee_number}</p>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{t.course_name}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs">{TRAINING_TYPE_META[t.training_type]}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{t.provider ?? "–"}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{fmtDate(t.completed_at)}</td>
                  <td className={`px-4 py-3 text-xs ${expiryClass(t.days_until_expiry)}`}>
                    {fmtDate(t.valid_until)}
                    {t.days_until_expiry != null && t.valid_until && (
                      <span className="ml-1 text-slate-400">({t.days_until_expiry}d)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {t.achieved_score != null && t.pass_score != null ? (
                      <span className={t.achieved_score >= t.pass_score ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {t.achieved_score}/{t.pass_score}
                      </span>
                    ) : t.achieved_score != null ? (
                      <span>{t.achieved_score}</span>
                    ) : "–"}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteTraining.mutate(t.id)} className="p-1 rounded hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={8} className="text-center py-8 text-slate-400 text-sm">No training records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Expiring tab ──────────────────────────────────────────────────────────────

function ExpiringTab() {
  const [days, setDays] = useState(30);
  const { data: alerts, isLoading } = useExpiringCompetences(days);

  const list = alerts ?? [];
  const expired = list.filter(a => (a.days_until_expiry ?? 1) < 0);
  const expiring = list.filter(a => (a.days_until_expiry ?? 1) >= 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label className="text-sm text-slate-600 font-medium">Show expiring within</label>
        <select
          value={days}
          onChange={e => setDays(Number(e.target.value))}
          className="border rounded-lg px-3 py-1.5 text-sm"
        >
          <option value={7}>7 days</option>
          <option value={14}>14 days</option>
          <option value={30}>30 days</option>
          <option value={60}>60 days</option>
          <option value={90}>90 days</option>
        </select>
        <div className="flex gap-3 ml-2">
          {expired.length > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
              <XCircle size={13} /> {expired.length} expired
            </span>
          )}
          {expiring.length > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-medium">
              <Clock size={13} /> {expiring.length} expiring soon
            </span>
          )}
          {list.length === 0 && !isLoading && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
              <CheckCircle2 size={13} /> All competences current
            </span>
          )}
        </div>
      </div>

      {isLoading ? <Spinner /> : (
        <div className="space-y-2">
          {list.map(a => {
            const isExpired = (a.days_until_expiry ?? 1) < 0;
            const ScopeIcon = SCOPE_META[a.scope].icon;
            return (
              <div
                key={a.competence_record_id}
                className={`rounded-xl border p-4 flex items-center gap-4 ${isExpired ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"}`}
              >
                <div className="shrink-0">
                  <div className={`p-2 rounded-lg ${isExpired ? "bg-red-100" : "bg-yellow-100"}`}>
                    <ScopeIcon size={16} className={isExpired ? "text-red-600" : "text-yellow-600"} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800">{a.employee_name}</span>
                    <span className="text-xs font-mono text-slate-400">{a.employee_number}</span>
                    <LevelBadge level={a.level} />
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {SCOPE_META[a.scope].label}:&nbsp;
                    <span className="font-medium">
                      {a.scope === "method" ? `${a.method_name} (${a.method_code})` :
                       a.scope === "instrument" ? `${a.instrument_name} (${a.instrument_code})` :
                       "General authorization"}
                    </span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${expiryClass(a.days_until_expiry)}`}>
                    {isExpired
                      ? `Expired ${Math.abs(a.days_until_expiry!)} days ago`
                      : `${a.days_until_expiry}d remaining`}
                  </p>
                  <p className="text-xs text-slate-400">{fmtDate(a.valid_until)}</p>
                </div>
              </div>
            );
          })}
          {list.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">
              <CheckCircle2 size={36} className="mx-auto mb-3 text-green-300" />
              No competences expiring within {days} days.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Check tab ─────────────────────────────────────────────────────────────────

function CheckTab() {
  const [userId, setUserId] = useState("");
  const [methodId, setMethodId] = useState("");
  const [instrumentId, setInstrumentId] = useState("");
  const [result, setResult] = useState<AuthorizationCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!userId || (!methodId && !instrumentId)) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await competenceApi.checkAuthorization({
        user_id: Number(userId),
        method_id: methodId ? Number(methodId) : undefined,
        instrument_id: instrumentId ? Number(instrumentId) : undefined,
      });
      setResult(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-white border rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold text-slate-700 mb-1 flex items-center gap-2">
          <Shield size={16} /> Authorization Check
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Verify whether a user is competent and authorized to execute a test or operate an instrument.
        </p>
        <form onSubmit={handleCheck} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">User ID *</label>
            <input
              type="number"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
              value={userId}
              onChange={e => { setUserId(e.target.value); setResult(null); }}
              placeholder="Enter user ID"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Method ID</label>
              <input
                type="number"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                value={methodId}
                onChange={e => { setMethodId(e.target.value); setInstrumentId(""); setResult(null); }}
                placeholder="Test method ID"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Instrument ID</label>
              <input
                type="number"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                value={instrumentId}
                onChange={e => { setInstrumentId(e.target.value); setMethodId(""); setResult(null); }}
                placeholder="Instrument ID"
              />
            </div>
          </div>
          <p className="text-xs text-slate-400">Provide either a Method ID or Instrument ID — not both.</p>
          <button
            type="submit"
            disabled={loading || !userId || (!methodId && !instrumentId)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            Check Authorization
          </button>
        </form>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      )}

      {result && (
        <div className={`rounded-xl border p-5 ${result.is_authorized ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <div className="flex items-center gap-3 mb-3">
            {result.is_authorized ? (
              <CheckCircle2 size={28} className="text-green-600 shrink-0" />
            ) : (
              <XCircle size={28} className="text-red-600 shrink-0" />
            )}
            <div>
              <p className={`text-lg font-bold ${result.is_authorized ? "text-green-700" : "text-red-700"}`}>
                {result.is_authorized ? "AUTHORIZED" : "NOT AUTHORIZED"}
              </p>
              <p className="text-xs text-slate-500">User #{result.user_id}</p>
            </div>
          </div>
          {result.level && (
            <div className="mt-2">
              <LevelBadge level={result.level} />
            </div>
          )}
          {result.reason && (
            <p className="mt-2 text-sm text-slate-600 italic">{result.reason}</p>
          )}
          {result.competence_record_id && (
            <p className="mt-1 text-xs text-slate-400">Competence record #{result.competence_record_id}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "matrix",   label: "Auth Matrix",   icon: User },
  { id: "records",  label: "Records",       icon: Shield },
  { id: "training", label: "Training",      icon: GraduationCap },
  { id: "expiring", label: "Expiring",      icon: Clock },
  { id: "check",    label: "Auth Check",    icon: Search },
];

export default function CompetencePage() {
  const [tab, setTab] = useState<Tab>("matrix");
  const { data: expiring } = useExpiringCompetences(30);
  const alertCount = expiring?.length ?? 0;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <GraduationCap size={22} /> Competence & Personnel
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          ISO 17025 §6.2 — Authorization matrix, training records, competency expiry, assignment restrictions
        </p>
      </div>

      <ReadinessPanel />

      <div className="border-b flex gap-1 flex-wrap">
        {TABS.map(t => {
          const Icon = t.icon;
          const isAlert = t.id === "expiring" && alertCount > 0;
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
              {isAlert && (
                <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">
                  {alertCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {tab === "matrix"   && <MatrixTab />}
      {tab === "records"  && <RecordsTab />}
      {tab === "training" && <TrainingTab />}
      {tab === "expiring" && <ExpiringTab />}
      {tab === "check"    && <CheckTab />}
    </div>
  );
}
