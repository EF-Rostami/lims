"use client";

import { useState } from "react";
import {
  Activity, PlusCircle, Loader2, AlertTriangle, CheckCircle2,
  XCircle, Trash2, Edit3, Check, X, ShieldAlert, BarChart3,
  TestTube2, Beaker, ChevronDown, ChevronUp,
} from "lucide-react";
import {
  useQCMaterials, useCreateQCMaterial, useUpdateQCMaterial, useDeleteQCMaterial,
  useQCRuns, useSubmitQCRun, useOverrideQCRun, useDeleteQCRun,
  useLJChart,
  useQCAlerts, useResolveQCAlert,
} from "@/features/lims/qc/qc.queries";
import { qcApi } from "@/features/lims/qc/qc.api";
import type {
  QCMaterialType, QCRunStatus, AlertSeverity,
  QCMaterialCreate, QCMaterialUpdate,
  QCResultInput, QCRunRead, QCMaterialRead,
  LJChartData, LJDataPoint,
} from "@/features/lims/qc/qc.api";

// ── Constants ─────────────────────────────────────────────────────────────────

const MATERIAL_TYPE_META: Record<QCMaterialType, { label: string; color: string; bg: string }> = {
  blank:        { label: "Blank",        color: "text-slate-600",  bg: "bg-slate-100" },
  standard:     { label: "Standard",     color: "text-blue-700",   bg: "bg-blue-100" },
  control_low:  { label: "Control Low",  color: "text-yellow-700", bg: "bg-yellow-100" },
  control_mid:  { label: "Control Mid",  color: "text-green-700",  bg: "bg-green-100" },
  control_high: { label: "Control High", color: "text-purple-700", bg: "bg-purple-100" },
  spike:        { label: "Spike",        color: "text-orange-700", bg: "bg-orange-100" },
};

const RUN_STATUS_META: Record<QCRunStatus, { label: string; icon: React.ElementType; bg: string; text: string; border: string }> = {
  pending:    { label: "Pending",    icon: Loader2,       bg: "bg-slate-100",  text: "text-slate-600",  border: "border-slate-300" },
  warning:    { label: "Warning",    icon: AlertTriangle, bg: "bg-yellow-50",  text: "text-yellow-700", border: "border-yellow-300" },
  accepted:   { label: "Accepted",   icon: CheckCircle2,  bg: "bg-green-50",   text: "text-green-700",  border: "border-green-300" },
  rejected:   { label: "Rejected",   icon: XCircle,       bg: "bg-red-50",     text: "text-red-700",    border: "border-red-300" },
  overridden: { label: "Overridden", icon: ShieldAlert,   bg: "bg-orange-50",  text: "text-orange-700", border: "border-orange-300" },
};

const WESTGARD_META: Record<string, { severity: string; desc: string }> = {
  "1-2s": { severity: "warning", desc: "1 result > ±2 SD" },
  "1-3s": { severity: "reject",  desc: "1 result > ±3 SD" },
  "2-2s": { severity: "reject",  desc: "2 consecutive > ±2 SD same side" },
  "R-4s": { severity: "reject",  desc: "Range between consecutive > 4 SD" },
  "4-1s": { severity: "reject",  desc: "4 consecutive > ±1 SD same side" },
  "10x":  { severity: "reject",  desc: "10 consecutive same side of mean" },
};

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "–";
  return new Date(iso).toLocaleDateString();
}

function Spinner() {
  return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-300" size={28} /></div>;
}

function RunStatusBadge({ status }: { status: QCRunStatus }) {
  const m = RUN_STATUS_META[status];
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${m.bg} ${m.text} ${m.border}`}>
      <Icon size={11} /> {m.label}
    </span>
  );
}

function WestgardBadge({ rule }: { rule: string }) {
  const m = WESTGARD_META[rule];
  const isReject = m?.severity === "reject";
  return (
    <span
      title={m?.desc}
      className={`px-1.5 py-0.5 rounded text-xs font-bold font-mono ${isReject ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}
    >
      {rule}
    </span>
  );
}

type Tab = "materials" | "runs" | "chart" | "alerts";

// ── Levey-Jennings SVG chart ──────────────────────────────────────────────────

const LJ_W = 700;
const LJ_H = 260;
const LJ_PAD = { top: 20, right: 20, bottom: 40, left: 54 };
const PLOT_W = LJ_W - LJ_PAD.left - LJ_PAD.right;
const PLOT_H = LJ_H - LJ_PAD.top - LJ_PAD.bottom;
const Z_MIN = -3.8;
const Z_MAX = 3.8;

function zToY(z: number): number {
  return LJ_PAD.top + PLOT_H - ((z - Z_MIN) / (Z_MAX - Z_MIN)) * PLOT_H;
}

function LJChart({ data }: { data: LJChartData }) {
  const pts = data.points;
  const mean = data.target_mean ?? data.computed_mean;
  const sd   = data.target_sd   ?? data.computed_sd;

  if (pts.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-300 text-sm">
        No data points yet — submit QC runs to populate the chart.
      </div>
    );
  }

  const n = pts.length;
  const xStep = PLOT_W / Math.max(n - 1, 1);

  function ptX(i: number) { return LJ_PAD.left + i * xStep; }

  function dotColor(pt: LJDataPoint): string {
    if (pt.run_status === "rejected")   return "#ef4444";
    if (pt.run_status === "warning")    return "#f59e0b";
    if (pt.run_status === "overridden") return "#f97316";
    return "#22c55e";
  }

  const linePoints = pts
    .map((pt, i) => pt.z_score != null ? `${ptX(i)},${zToY(pt.z_score)}` : null)
    .filter(Boolean)
    .join(" ");

  // Horizontal rule lines
  const rules = [
    { z: 3,  color: "#ef4444", dash: "4 2", label: "+3s" },
    { z: 2,  color: "#f59e0b", dash: "4 2", label: "+2s" },
    { z: 1,  color: "#94a3b8", dash: "2 2", label: "+1s" },
    { z: 0,  color: "#334155", dash: "",    label: "Mean" },
    { z: -1, color: "#94a3b8", dash: "2 2", label: "-1s" },
    { z: -2, color: "#f59e0b", dash: "4 2", label: "-2s" },
    { z: -3, color: "#ef4444", dash: "4 2", label: "-3s" },
  ];

  return (
    <div className="overflow-x-auto">
      <svg
        width={LJ_W}
        height={LJ_H}
        viewBox={`0 0 ${LJ_W} ${LJ_H}`}
        className="font-mono text-xs"
        style={{ minWidth: LJ_W }}
      >
        {/* Background bands */}
        <rect x={LJ_PAD.left} y={zToY(1)}  width={PLOT_W} height={zToY(-1) - zToY(1)}  fill="#f0fdf4" opacity={0.6} />
        <rect x={LJ_PAD.left} y={zToY(2)}  width={PLOT_W} height={zToY(1)  - zToY(2)}  fill="#fefce8" opacity={0.6} />
        <rect x={LJ_PAD.left} y={zToY(-1)} width={PLOT_W} height={zToY(-2) - zToY(-1)} fill="#fefce8" opacity={0.6} />
        <rect x={LJ_PAD.left} y={zToY(3)}  width={PLOT_W} height={zToY(2)  - zToY(3)}  fill="#fef2f2" opacity={0.6} />
        <rect x={LJ_PAD.left} y={zToY(-2)} width={PLOT_W} height={zToY(-3) - zToY(-2)} fill="#fef2f2" opacity={0.6} />

        {/* Rule lines */}
        {rules.map(r => (
          <g key={r.z}>
            <line
              x1={LJ_PAD.left} y1={zToY(r.z)}
              x2={LJ_PAD.left + PLOT_W} y2={zToY(r.z)}
              stroke={r.color}
              strokeWidth={r.z === 0 ? 1.5 : 0.8}
              strokeDasharray={r.dash}
            />
            <text x={LJ_PAD.left - 4} y={zToY(r.z) + 4} textAnchor="end" fontSize={9} fill={r.color}>
              {r.label}
            </text>
          </g>
        ))}

        {/* Connect-the-dots line */}
        {linePoints && (
          <polyline
            points={linePoints}
            fill="none"
            stroke="#94a3b8"
            strokeWidth={1}
          />
        )}

        {/* Data points */}
        {pts.map((pt, i) => {
          if (pt.z_score == null) return null;
          const cx = ptX(i);
          const cy = zToY(pt.z_score);
          const fill = dotColor(pt);
          const hasViolation = pt.westgard_flags.length > 0;
          return (
            <g key={pt.run_id}>
              {hasViolation && (
                <circle cx={cx} cy={cy} r={10} fill={fill} opacity={0.2} />
              )}
              <circle
                cx={cx}
                cy={cy}
                r={hasViolation ? 5 : 4}
                fill={fill}
                stroke="white"
                strokeWidth={1.5}
              >
                <title>
                  {fmtDate(pt.run_date)}: {pt.measured_value} ({pt.z_score.toFixed(2)}z)
                  {pt.westgard_flags.length > 0 ? `\n⚠ ${pt.westgard_flags.join(", ")}` : ""}
                </title>
              </circle>
            </g>
          );
        })}

        {/* X-axis labels (show every Nth) */}
        {pts.map((pt, i) => {
          const every = Math.max(1, Math.floor(n / 8));
          if (i % every !== 0 && i !== n - 1) return null;
          return (
            <text
              key={i}
              x={ptX(i)}
              y={LJ_H - LJ_PAD.bottom + 14}
              textAnchor="middle"
              fontSize={8}
              fill="#94a3b8"
            >
              {new Date(pt.run_date).toLocaleDateString("en", { month: "numeric", day: "numeric" })}
            </text>
          );
        })}

        {/* Chart border */}
        <rect
          x={LJ_PAD.left}
          y={LJ_PAD.top}
          width={PLOT_W}
          height={PLOT_H}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={1}
        />
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" />Accepted</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />Warning</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" />Rejected</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />Overridden</span>
        {mean != null && sd != null && (
          <span className="ml-auto text-slate-400">
            Mean = {mean.toFixed(4)}{data.unit ? ` ${data.unit}` : ""} · SD = {sd.toFixed(4)}{data.unit ? ` ${data.unit}` : ""}
            {data.target_mean == null ? " (computed)" : " (target)"}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Materials tab ─────────────────────────────────────────────────────────────

function MaterialsTab({ onChartOpen }: { onChartOpen: (id: number) => void }) {
  const { data: materials, isLoading } = useQCMaterials({ active_only: false });
  const createMaterial = useCreateQCMaterial();
  const updateMaterial = useUpdateQCMaterial();
  const deleteMaterial = useDeleteQCMaterial();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<QCMaterialCreate>>({ material_type: "control_mid" });
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<QCMaterialUpdate>>({});

  function sf(k: keyof QCMaterialCreate, v: unknown) {
    setForm(f => ({ ...f, [k]: v }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.method_id || !form.name || !form.material_type) return;
    await createMaterial.mutateAsync(form as QCMaterialCreate);
    setForm({ material_type: "control_mid" });
    setShowForm(false);
  }

  async function saveEdit(id: number) {
    await updateMaterial.mutateAsync({ id, data: editForm });
    setEditId(null);
  }

  const list = materials ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">{list.length} QC material{list.length !== 1 ? "s" : ""}</p>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700"
        >
          <PlusCircle size={14} /> Add Material
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-slate-50 border rounded-xl p-5 space-y-3">
          <h3 className="font-semibold text-slate-700">New QC Material</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Method ID *</label>
              <input type="number" className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white" value={form.method_id ?? ""} onChange={e => sf("method_id", Number(e.target.value))} required />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Name *</label>
              <input className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white" value={form.name ?? ""} onChange={e => sf("name", e.target.value)} placeholder="e.g. Lyphochek Level 2 Control" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Type *</label>
              <select className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white" value={form.material_type ?? "control_mid"} onChange={e => sf("material_type", e.target.value as QCMaterialType)}>
                {Object.entries(MATERIAL_TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Target Mean</label>
              <input type="number" step="any" className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white" value={form.target_mean ?? ""} onChange={e => sf("target_mean", e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Target SD</label>
              <input type="number" step="any" className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white" value={form.target_sd ?? ""} onChange={e => sf("target_sd", e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Unit</label>
              <input className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white" value={form.unit ?? ""} onChange={e => sf("unit", e.target.value || null)} placeholder="e.g. mmol/L" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Lot Number</label>
              <input className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white" value={form.lot_number ?? ""} onChange={e => sf("lot_number", e.target.value || null)} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Expiry Date</label>
              <input type="date" className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white" value={form.expiry_date ?? ""} onChange={e => sf("expiry_date", e.target.value || null)} />
            </div>
          </div>
          <div className="flex gap-2 justify-end border-t pt-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm rounded-lg border hover:bg-slate-100">Cancel</button>
            <button type="submit" disabled={createMaterial.isPending} className="px-4 py-1.5 text-sm rounded-lg bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50">
              {createMaterial.isPending ? <Loader2 size={12} className="animate-spin" /> : "Add Material"}
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
                <th className="px-4 py-3">Material Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Target Mean</th>
                <th className="px-4 py-3">Target SD</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Lot</th>
                <th className="px-4 py-3">Expiry</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.map(mat => {
                const m = MATERIAL_TYPE_META[mat.material_type];
                const isEditing = editId === mat.id;
                return (
                  <tr key={mat.id} className={`hover:bg-slate-50 ${!mat.is_active ? "opacity-50" : ""}`}>
                    <td className="px-4 py-2 font-mono text-xs font-semibold text-slate-600">{mat.method_code}</td>
                    <td className="px-4 py-2 font-medium text-slate-800">{mat.name}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${m.bg} ${m.color}`}>{m.label}</span>
                    </td>
                    <td className="px-4 py-2 font-mono text-sm text-slate-600">
                      {isEditing ? (
                        <input type="number" step="any" className="w-24 border rounded px-1 py-0.5 text-xs" value={editForm.target_mean ?? mat.target_mean ?? ""} onChange={e => setEditForm(f => ({ ...f, target_mean: e.target.value ? Number(e.target.value) : null }))} />
                      ) : (mat.target_mean ?? "–")}
                    </td>
                    <td className="px-4 py-2 font-mono text-sm text-slate-600">
                      {isEditing ? (
                        <input type="number" step="any" className="w-24 border rounded px-1 py-0.5 text-xs" value={editForm.target_sd ?? mat.target_sd ?? ""} onChange={e => setEditForm(f => ({ ...f, target_sd: e.target.value ? Number(e.target.value) : null }))} />
                      ) : (mat.target_sd ?? "–")}
                    </td>
                    <td className="px-4 py-2 text-xs text-slate-400">{mat.unit ?? "–"}</td>
                    <td className="px-4 py-2 text-xs text-slate-400 font-mono">{mat.lot_number ?? "–"}</td>
                    <td className="px-4 py-2 text-xs text-slate-400">{fmtDate(mat.expiry_date)}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-1">
                        {isEditing ? (
                          <>
                            <button onClick={() => saveEdit(mat.id)} className="p-1 rounded hover:bg-green-50 text-green-600"><Check size={13} /></button>
                            <button onClick={() => setEditId(null)} className="p-1 rounded hover:bg-slate-100 text-slate-400"><X size={13} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { onChartOpen(mat.id); }} className="p-1 rounded hover:bg-blue-50 text-blue-400" title="L-J Chart"><BarChart3 size={13} /></button>
                            <button onClick={() => { setEditId(mat.id); setEditForm({ target_mean: mat.target_mean, target_sd: mat.target_sd }); }} className="p-1 rounded hover:bg-slate-100 text-slate-400"><Edit3 size={13} /></button>
                            <button onClick={() => deleteMaterial.mutate(mat.id)} className="p-1 rounded hover:bg-red-50 text-red-400"><Trash2 size={13} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {list.length === 0 && (
                <tr><td colSpan={9} className="text-center py-8 text-slate-400 text-sm">No QC materials defined yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Runs tab ──────────────────────────────────────────────────────────────────

function RunsTab() {
  const { data: materials } = useQCMaterials();
  const { data: runs, isLoading } = useQCRuns({ limit: 50 });
  const submitRun = useSubmitQCRun();
  const overrideRun = useOverrideQCRun();
  const deleteRun = useDeleteQCRun();

  const [showForm, setShowForm] = useState(false);
  const [methodId, setMethodId] = useState<number | "">("");
  const [runDate, setRunDate] = useState(new Date().toISOString().slice(0, 10));
  const [batchRef, setBatchRef] = useState("");
  const [notes, setNotes] = useState("");
  const [measurements, setMeasurements] = useState<Record<number, string>>({});
  const [expandedRun, setExpandedRun] = useState<number | null>(null);
  const [overrideId, setOverrideId] = useState<number | null>(null);
  const [justification, setJustification] = useState("");

  const methodMaterials = (materials ?? []).filter(
    m => methodId && m.method_id === Number(methodId)
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!methodId) return;
    const results: QCResultInput[] = Object.entries(measurements)
      .filter(([, v]) => v !== "")
      .map(([id, v]) => ({ material_id: Number(id), measured_value: Number(v) }));
    if (results.length === 0) return;
    await submitRun.mutateAsync({
      method_id: Number(methodId),
      run_date: runDate,
      batch_ref: batchRef || null,
      notes: notes || null,
      results,
    });
    setShowForm(false);
    setMeasurements({});
    setBatchRef("");
    setNotes("");
  }

  const list = runs ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-slate-500">{list.length} recent QC runs</p>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700"
        >
          <PlusCircle size={14} /> Submit QC Run
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-slate-50 border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-slate-700">Submit QC Run</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Method ID *</label>
              <input
                type="number"
                className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white"
                value={methodId}
                onChange={e => { setMethodId(e.target.value ? Number(e.target.value) : ""); setMeasurements({}); }}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Run Date *</label>
              <input type="date" className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white" value={runDate} onChange={e => setRunDate(e.target.value)} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Batch Ref</label>
              <input className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white" value={batchRef} onChange={e => setBatchRef(e.target.value)} placeholder="e.g. BATCH-2026-042" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
              <input className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>

          {methodId && methodMaterials.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2">Measured Values for Method {methodId}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {methodMaterials.map(mat => {
                  const m = MATERIAL_TYPE_META[mat.material_type];
                  return (
                    <div key={mat.id}>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        <span className={`px-1.5 py-0.5 rounded text-xs mr-1 ${m.bg} ${m.color}`}>{m.label}</span>
                        {mat.name}
                        {mat.unit && <span className="text-slate-400 ml-1">({mat.unit})</span>}
                      </label>
                      <input
                        type="number"
                        step="any"
                        className="w-full border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-white font-mono"
                        value={measurements[mat.id] ?? ""}
                        onChange={e => setMeasurements(prev => ({ ...prev, [mat.id]: e.target.value }))}
                        placeholder={mat.target_mean != null ? `Target: ${mat.target_mean}` : ""}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {methodId && methodMaterials.length === 0 && (
            <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
              No active QC materials found for method {methodId}. Add materials in the Materials tab first.
            </p>
          )}

          <div className="flex gap-2 justify-end border-t pt-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm rounded-lg border hover:bg-slate-100">Cancel</button>
            <button
              type="submit"
              disabled={submitRun.isPending || !methodId || methodMaterials.length === 0}
              className="px-4 py-1.5 text-sm rounded-lg bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {submitRun.isPending ? <Loader2 size={12} className="animate-spin" /> : "Submit & Evaluate"}
            </button>
          </div>
        </form>
      )}

      {isLoading ? <Spinner /> : (
        <div className="space-y-2">
          {list.map(run => {
            const isExpanded = expandedRun === run.id;
            const sm = RUN_STATUS_META[run.run_status];
            const violations = run.westgard_violations ?? [];

            return (
              <div key={run.id} className={`rounded-xl border bg-white shadow-sm overflow-hidden`}>
                <div
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer ${sm.bg}`}
                  onClick={() => setExpandedRun(isExpanded ? null : run.id)}
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <RunStatusBadge status={run.run_status} />
                    <span className="font-mono text-xs font-semibold text-slate-600">{run.method_code}</span>
                    <span className="text-sm text-slate-700">{fmtDate(run.run_date)}</span>
                    {run.batch_ref && <span className="text-xs text-slate-400">Batch: {run.batch_ref}</span>}
                    {violations.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {violations.map(v => <WestgardBadge key={v} rule={v} />)}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    {(run.run_status === "rejected" || run.run_status === "warning") && (
                      <button
                        onClick={() => setOverrideId(run.id === overrideId ? null : run.id)}
                        className="text-xs px-2 py-1 rounded border border-orange-300 text-orange-700 bg-orange-50 hover:bg-orange-100"
                      >
                        Override
                      </button>
                    )}
                    <button onClick={() => deleteRun.mutate(run.id)} className="p-1 rounded hover:bg-red-50 text-red-300"><Trash2 size={13} /></button>
                    {isExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                  </div>
                </div>

                {overrideId === run.id && (
                  <div className="border-t bg-orange-50 px-4 py-3 space-y-2">
                    <p className="text-xs font-semibold text-orange-800">Override Justification (required)</p>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 border border-orange-300 rounded-lg px-2 py-1.5 text-sm bg-white"
                        value={justification}
                        onChange={e => setJustification(e.target.value)}
                        placeholder="Describe why this QC failure is acceptable to override…"
                      />
                      <button
                        onClick={async () => {
                          if (!justification) return;
                          await overrideRun.mutateAsync({ id: run.id, justification });
                          setOverrideId(null);
                          setJustification("");
                        }}
                        disabled={!justification || overrideRun.isPending}
                        className="px-3 py-1.5 text-sm rounded-lg bg-orange-700 text-white hover:bg-orange-800 disabled:opacity-50"
                      >
                        Confirm Override
                      </button>
                    </div>
                  </div>
                )}

                {isExpanded && (
                  <div className="border-t overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b bg-slate-50 text-left text-slate-500">
                          <th className="px-4 py-2">Material</th>
                          <th className="px-4 py-2">Type</th>
                          <th className="px-4 py-2">Measured</th>
                          <th className="px-4 py-2">Target Mean</th>
                          <th className="px-4 py-2">Target SD</th>
                          <th className="px-4 py-2">z-Score</th>
                          <th className="px-4 py-2">Flags</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {run.results.map(res => {
                          const z = res.z_score;
                          const flags = res.westgard_flags ?? [];
                          const zColor = z == null ? "" : Math.abs(z) > 3 ? "text-red-600 font-bold" : Math.abs(z) > 2 ? "text-yellow-600 font-semibold" : "text-green-600";
                          return (
                            <tr key={res.id} className="hover:bg-slate-50">
                              <td className="px-4 py-2 font-medium text-slate-700">{res.material_name}</td>
                              <td className="px-4 py-2">
                                {res.material_type && (
                                  <span className={`px-1.5 py-0.5 rounded text-xs ${MATERIAL_TYPE_META[res.material_type].bg} ${MATERIAL_TYPE_META[res.material_type].color}`}>
                                    {MATERIAL_TYPE_META[res.material_type].label}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-2 font-mono text-slate-800">{res.measured_value} {res.unit ?? ""}</td>
                              <td className="px-4 py-2 font-mono text-slate-400">{res.target_mean ?? "–"}</td>
                              <td className="px-4 py-2 font-mono text-slate-400">{res.target_sd ?? "–"}</td>
                              <td className={`px-4 py-2 font-mono ${zColor}`}>{z != null ? z.toFixed(2) : "–"}</td>
                              <td className="px-4 py-2">
                                <div className="flex gap-1 flex-wrap">
                                  {flags.map(f => <WestgardBadge key={f} rule={f} />)}
                                  {flags.length === 0 && <span className="text-green-500 text-xs">✓ OK</span>}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
          {list.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">
              <Activity size={36} className="mx-auto mb-3 text-slate-200" />
              No QC runs yet. Submit the first run to begin tracking.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Chart tab ─────────────────────────────────────────────────────────────────

function ChartTab({ initialMaterialId }: { initialMaterialId: number | null }) {
  const { data: materials } = useQCMaterials({ active_only: false });
  const [materialId, setMaterialId] = useState<number | null>(initialMaterialId);
  const [lastN, setLastN] = useState(30);
  const { data: chartData, isLoading } = useLJChart(materialId, lastN);

  const mat = (materials ?? []).find(m => m.id === materialId);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Select QC Material</label>
          <select
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white min-w-[240px]"
            value={materialId ?? ""}
            onChange={e => setMaterialId(e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">Choose material…</option>
            {(materials ?? []).map(m => (
              <option key={m.id} value={m.id}>
                [{m.method_code}] {m.name} ({MATERIAL_TYPE_META[m.material_type]?.label})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Show last</label>
          <select
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm bg-white"
            value={lastN}
            onChange={e => setLastN(Number(e.target.value))}
          >
            <option value={10}>10 runs</option>
            <option value={20}>20 runs</option>
            <option value={30}>30 runs</option>
            <option value={60}>60 runs</option>
          </select>
        </div>
      </div>

      {!materialId && (
        <div className="text-center py-16 text-slate-400">
          <BarChart3 size={40} className="mx-auto mb-3 text-slate-200" />
          <p className="font-medium">Select a QC material to view its Levey-Jennings chart.</p>
          <p className="text-sm mt-1">Or click the chart icon on any material in the Materials tab.</p>
        </div>
      )}

      {materialId && isLoading && <Spinner />}

      {chartData && (
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <div className="mb-3">
            <h3 className="font-semibold text-slate-800">{chartData.material_name}</h3>
            <p className="text-xs text-slate-400">
              [{chartData.method_code}] {chartData.method_name} ·{" "}
              {MATERIAL_TYPE_META[chartData.material_type]?.label} ·{" "}
              {chartData.points.length} data points
            </p>
          </div>
          <LJChart data={chartData} />
        </div>
      )}

      {/* Westgard rules reference */}
      <div className="rounded-xl border bg-slate-50 p-4">
        <h4 className="text-xs font-semibold text-slate-600 mb-2">Westgard Rules Reference</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {Object.entries(WESTGARD_META).map(([rule, meta]) => (
            <div key={rule} className="flex items-start gap-2">
              <WestgardBadge rule={rule} />
              <div>
                <p className="text-xs text-slate-600">{meta.desc}</p>
                <p className={`text-xs font-medium ${meta.severity === "reject" ? "text-red-600" : "text-yellow-600"}`}>
                  {meta.severity === "reject" ? "Reject" : "Warning"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Alerts tab ────────────────────────────────────────────────────────────────

function AlertsTab() {
  const { data: alerts, isLoading } = useQCAlerts({ unresolved_only: false });
  const resolveAlert = useResolveQCAlert();
  const [resolutionNote, setResolutionNote] = useState<Record<number, string>>({});
  const [resolvingId, setResolvingId] = useState<number | null>(null);

  const list = alerts ?? [];
  const open = list.filter(a => !a.is_resolved);
  const resolved = list.filter(a => a.is_resolved);

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-red-50 border-red-200">
          <span className="text-lg font-bold text-red-700">{open.filter(a => a.severity === "reject").length}</span>
          <span className="text-xs text-red-600">Open Rejects</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-yellow-50 border-yellow-200">
          <span className="text-lg font-bold text-yellow-700">{open.filter(a => a.severity === "warning").length}</span>
          <span className="text-xs text-yellow-600">Open Warnings</span>
        </div>
        {open.length === 0 && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-green-50 border-green-200 text-green-700 text-sm font-medium">
            <CheckCircle2 size={14} /> All QC alerts resolved — sample approval unblocked
          </div>
        )}
      </div>

      {isLoading ? <Spinner /> : (
        <div className="space-y-2">
          {list.map(alert => {
            const isReject = alert.severity === "reject";
            const isResolved = alert.is_resolved;
            return (
              <div
                key={alert.id}
                className={`rounded-xl border p-4 ${
                  isResolved ? "bg-slate-50 border-slate-200 opacity-60" :
                  isReject  ? "bg-red-50 border-red-200" :
                               "bg-yellow-50 border-yellow-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3">
                    {isReject ? (
                      <XCircle size={18} className={isResolved ? "text-slate-400" : "text-red-500 shrink-0"} />
                    ) : (
                      <AlertTriangle size={18} className={isResolved ? "text-slate-400" : "text-yellow-500 shrink-0"} />
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <WestgardBadge rule={alert.rule_name} />
                        <span className="text-xs font-mono font-semibold text-slate-600">{alert.method_code}</span>
                        <span className="text-xs text-slate-500">Run #{alert.run_id}</span>
                        {isResolved && <span className="text-xs text-slate-400">(Resolved)</span>}
                      </div>
                      <p className="text-sm text-slate-700 mt-0.5">{alert.description}</p>
                      {isResolved && alert.resolution_note && (
                        <p className="text-xs text-slate-400 mt-0.5 italic">Resolution: {alert.resolution_note}</p>
                      )}
                    </div>
                  </div>
                  {!isResolved && (
                    resolvingId === alert.id ? (
                      <div className="flex gap-2 items-center">
                        <input
                          className="border border-slate-300 rounded px-2 py-1 text-xs bg-white w-48"
                          value={resolutionNote[alert.id] ?? ""}
                          onChange={e => setResolutionNote(n => ({ ...n, [alert.id]: e.target.value }))}
                          placeholder="Resolution note (optional)"
                        />
                        <button
                          onClick={async () => {
                            await resolveAlert.mutateAsync({ id: alert.id, note: resolutionNote[alert.id] });
                            setResolvingId(null);
                          }}
                          className="px-2 py-1 text-xs rounded bg-slate-800 text-white hover:bg-slate-700"
                        >
                          Resolve
                        </button>
                        <button onClick={() => setResolvingId(null)} className="text-slate-400 hover:text-slate-600"><X size={13} /></button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setResolvingId(alert.id)}
                        className="text-xs px-2.5 py-1 rounded border border-slate-300 text-slate-600 bg-white hover:bg-slate-50"
                      >
                        Resolve
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
          {list.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">
              <ShieldAlert size={36} className="mx-auto mb-3 text-slate-200" />
              No QC alerts. All runs are within control limits.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "materials", label: "QC Materials", icon: Beaker },
  { id: "runs",      label: "QC Runs",      icon: TestTube2 },
  { id: "chart",     label: "L-J Chart",    icon: BarChart3 },
  { id: "alerts",    label: "Alerts",       icon: ShieldAlert },
];

export default function QCPage() {
  const [tab, setTab] = useState<Tab>("materials");
  const [chartMaterialId, setChartMaterialId] = useState<number | null>(null);
  const { data: allAlerts } = useQCAlerts({ unresolved_only: true });
  const openAlertCount = allAlerts?.length ?? 0;

  function openChart(materialId: number) {
    setChartMaterialId(materialId);
    setTab("chart");
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Activity size={22} /> Quality Control
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          ISO 17025 §7.7 — QC materials, Levey-Jennings charts, Westgard rules, alert management
        </p>
      </div>

      {openAlertCount > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm cursor-pointer"
          onClick={() => setTab("alerts")}
        >
          <XCircle size={16} className="shrink-0" />
          <span>
            <strong>{openAlertCount}</strong> unresolved QC alert{openAlertCount !== 1 ? "s" : ""} — sample result approval is blocked for affected methods.
          </span>
          <span className="ml-auto text-xs underline">View Alerts →</span>
        </div>
      )}

      <div className="border-b flex gap-1 flex-wrap">
        {TABS.map(t => {
          const Icon = t.icon;
          const isAlert = t.id === "alerts" && openAlertCount > 0;
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
                  {openAlertCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {tab === "materials" && <MaterialsTab onChartOpen={openChart} />}
      {tab === "runs"      && <RunsTab />}
      {tab === "chart"     && <ChartTab initialMaterialId={chartMaterialId} />}
      {tab === "alerts"    && <AlertsTab />}
    </div>
  );
}
