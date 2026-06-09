"use client";

import { useState } from "react";
import {
  Atom, PlusCircle, Loader2, AlertTriangle, CheckCircle2,
  Trash2, Edit3, Check, X, ChevronDown, ChevronUp,
  Clock, Package, Link, ShieldCheck, BookOpen, History,
} from "lucide-react";
import {
  useMaterials, useCreateMaterial, useUpdateMaterial, useDeleteMaterial,
  useBatches, useCreateBatch, useUpdateBatch, useDeleteBatch,
  useRecordUsage, useBatchUsage, useUsage,
  useApprovals, useCreateApproval, useDeleteApproval,
  useRMAlerts,
} from "@/features/lims/rm/rm.queries";
import type {
  MaterialType, BatchStatus, UsagePurpose, RMUsageRead,
  ReferenceMaterialCreate, ReferenceMaterialRead,
  RMBatchCreate, RMBatchRead, RMUsageCreate,
  RMMethodApprovalCreate,
} from "@/features/lims/rm/rm.api";

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_META: Record<MaterialType, { label: string; color: string; bg: string }> = {
  rm:  { label: "RM",  color: "text-blue-700",  bg: "bg-blue-100" },
  crm: { label: "CRM", color: "text-purple-700", bg: "bg-purple-100" },
};

const STATUS_META: Record<BatchStatus, { label: string; color: string; bg: string }> = {
  active:     { label: "Active",     color: "text-green-700",  bg: "bg-green-100" },
  expired:    { label: "Expired",    color: "text-red-700",    bg: "bg-red-100" },
  depleted:   { label: "Depleted",   color: "text-slate-500",  bg: "bg-slate-100" },
  quarantine: { label: "Quarantine", color: "text-yellow-700", bg: "bg-yellow-100" },
};

const PURPOSE_META: Record<UsagePurpose, string> = {
  calibration: "Calibration",
  validation:  "Validation",
  qc_check:    "QC Check",
  blind_check: "Blind Check",
  other:       "Other",
};

function expiryClass(days: number | null | undefined): string {
  if (days == null) return "text-slate-400";
  if (days < 0)   return "text-red-700 font-semibold";
  if (days <= 14) return "text-red-600 font-semibold";
  if (days <= 60) return "text-yellow-600 font-medium";
  return "text-green-700";
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "–";
  return new Date(iso).toLocaleDateString();
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString();
}

function Spinner() {
  return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-300" size={28} /></div>;
}

function TypeBadge({ type }: { type: MaterialType }) {
  const m = TYPE_META[type];
  return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${m.bg} ${m.color}`}>{m.label}</span>;
}

function StatusBadge({ status }: { status: BatchStatus }) {
  const m = STATUS_META[status];
  return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.bg} ${m.color}`}>{m.label}</span>;
}

type Tab = "catalog" | "batches" | "approvals" | "traceability" | "alerts";

// ── Catalog tab ───────────────────────────────────────────────────────────────

const EMPTY_MATERIAL: Partial<ReferenceMaterialCreate> = {
  material_type: "crm",
  coverage_factor: 2.0,
  is_active: true,
};

function CatalogTab() {
  const { data: materials, isLoading } = useMaterials(false);
  const createMaterial = useCreateMaterial();
  const updateMaterial = useUpdateMaterial();
  const deleteMaterial = useDeleteMaterial();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<ReferenceMaterialCreate>>(EMPTY_MATERIAL);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<ReferenceMaterialRead>>({});

  const list = materials ?? [];

  function sf(key: keyof ReferenceMaterialCreate, val: unknown) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.rm_code || !form.material_type) return;
    await createMaterial.mutateAsync(form as ReferenceMaterialCreate);
    setForm(EMPTY_MATERIAL);
    setShowForm(false);
  }

  async function saveEdit(id: number) {
    await updateMaterial.mutateAsync({ id, data: editForm });
    setEditId(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700">
          <PlusCircle size={14} /> Add Material
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-slate-50 border rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-slate-700">New Reference Material</h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-slate-500 mb-1">Name *</label>
              <input className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.name ?? ""} onChange={e => sf("name", e.target.value)} placeholder="e.g. NIST SRM 2709a San Joaquin Soil" required />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Code *</label>
              <input className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.rm_code ?? ""} onChange={e => sf("rm_code", e.target.value)} placeholder="e.g. NIST-2709a" required />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Type *</label>
              <select className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.material_type ?? "crm"} onChange={e => sf("material_type", e.target.value as MaterialType)}>
                <option value="rm">RM — Reference Material</option>
                <option value="crm">CRM — Certified Reference Material</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-slate-500 mb-1">Matrix</label>
              <input className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.matrix ?? ""} onChange={e => sf("matrix", e.target.value || null)} placeholder="e.g. soil, water, serum, air filter" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Producer</label>
              <input className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.producer ?? ""} onChange={e => sf("producer", e.target.value || null)} placeholder="NIST, LGC, IRMM…" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Catalog No.</label>
              <input className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.catalog_number ?? ""} onChange={e => sf("catalog_number", e.target.value || null)} />
            </div>
          </div>

          <div className="border-t pt-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Metrological Data</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Certified Value</label>
                <input type="number" step="any" className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.certified_value ?? ""} onChange={e => sf("certified_value", e.target.value ? Number(e.target.value) : null)} placeholder="e.g. 98.4" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Unit</label>
                <input className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.certified_unit ?? ""} onChange={e => sf("certified_unit", e.target.value || null)} placeholder="mg/kg, µg/L…" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Expanded Uncertainty (U)</label>
                <input type="number" step="any" className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.expanded_uncertainty ?? ""} onChange={e => sf("expanded_uncertainty", e.target.value ? Number(e.target.value) : null)} placeholder="±" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Coverage Factor (k)</label>
                <input type="number" step="0.1" className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.coverage_factor ?? 2.0} onChange={e => sf("coverage_factor", Number(e.target.value))} />
              </div>
              <div className="col-span-2 md:col-span-4">
                <label className="block text-xs text-slate-500 mb-1">Traceability Chain</label>
                <textarea rows={2} className="w-full border rounded-lg px-2 py-1.5 text-sm resize-none" value={form.traceability_chain ?? ""} onChange={e => sf("traceability_chain", e.target.value || null)} placeholder="e.g. NIST SI traceable via calibrated mass spectrometry → BIPM…" />
              </div>
            </div>
          </div>

          <div className="border-t pt-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Certificate</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Certificate No.</label>
                <input className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.certificate_number ?? ""} onChange={e => sf("certificate_number", e.target.value || null)} />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">CAS Number</label>
                <input className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.cas_number ?? ""} onChange={e => sf("cas_number", e.target.value || null)} />
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end border-t pt-3">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm rounded-lg border hover:bg-slate-100">Cancel</button>
            <button type="submit" disabled={createMaterial.isPending} className="px-4 py-1.5 text-sm rounded-lg bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50">
              {createMaterial.isPending ? <Loader2 size={12} className="animate-spin" /> : "Save Material"}
            </button>
          </div>
        </form>
      )}

      {isLoading ? <Spinner /> : (
        <div className="space-y-2">
          {list.map(m => {
            const isExpanded = expandedId === m.id;
            const isEditing = editId === m.id;
            const hasCertValue = m.certified_value != null;
            return (
              <div key={m.id} className="bg-white border rounded-xl overflow-hidden">
                <div
                  className="flex items-start gap-4 p-4 cursor-pointer hover:bg-slate-50"
                  onClick={() => !isEditing && setExpandedId(isExpanded ? null : m.id)}
                >
                  <div className="pt-0.5">
                    <TypeBadge type={m.material_type ?? "rm"} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <input className="w-full border rounded px-2 py-1 text-sm font-semibold" value={editForm.name ?? m.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} onClick={e => e.stopPropagation()} />
                    ) : (
                      <p className="font-semibold text-slate-800">{m.name}</p>
                    )}
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-slate-400 font-mono">{m.rm_code}</span>
                      {m.matrix && <span className="text-xs text-slate-400">· {m.matrix}</span>}
                      {m.producer && <span className="text-xs text-slate-400">· {m.producer}</span>}
                    </div>
                  </div>
                  {hasCertValue && (
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-800">
                        {m.certified_value} {m.certified_unit}
                      </p>
                      {m.expanded_uncertainty && (
                        <p className="text-xs text-slate-400">
                          ±{m.expanded_uncertainty} (k={m.coverage_factor ?? 2})
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <Package size={12} />
                    {m.active_batch_count} batch{m.active_batch_count !== 1 ? "es" : ""}
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"}`}>
                    {m.is_active ? "Active" : "Inactive"}
                  </span>
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    {isEditing ? (
                      <>
                        <button onClick={() => saveEdit(m.id)} className="p-1.5 rounded hover:bg-green-50 text-green-600"><Check size={14} /></button>
                        <button onClick={() => setEditId(null)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400"><X size={14} /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => { setEditId(m.id); setEditForm({ name: m.name, is_active: m.is_active }); }} className="p-1.5 rounded hover:bg-slate-100 text-slate-400"><Edit3 size={14} /></button>
                        <button onClick={() => deleteMaterial.mutate(m.id)} className="p-1.5 rounded hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
                      </>
                    )}
                    {isExpanded ? <ChevronUp size={14} className="text-slate-400 mt-1" /> : <ChevronDown size={14} className="text-slate-400 mt-1" />}
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t bg-slate-50 px-4 py-3 grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {m.traceability_chain && (
                      <div className="col-span-2 md:col-span-3">
                        <p className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1"><Link size={10} /> Traceability Chain</p>
                        <p className="text-slate-600 text-xs leading-relaxed">{m.traceability_chain}</p>
                      </div>
                    )}
                    {m.certificate_number && <div><p className="text-xs text-slate-400">Certificate No.</p><p className="font-medium">{m.certificate_number}</p></div>}
                    {m.catalog_number && <div><p className="text-xs text-slate-400">Catalog No.</p><p className="font-medium">{m.catalog_number}</p></div>}
                    {m.cas_number && <div><p className="text-xs text-slate-400">CAS</p><p className="font-mono font-medium">{m.cas_number}</p></div>}
                  </div>
                )}
              </div>
            );
          })}
          {list.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">
              <Atom size={32} className="mx-auto mb-3 text-slate-200" />
              No reference materials in catalog.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Batch usage sub-row ───────────────────────────────────────────────────────

function BatchUsageRow({ batchId }: { batchId: number }) {
  const { data: usages, isLoading } = useBatchUsage(batchId);
  const recordUsage = useRecordUsage();
  const [form, setForm] = useState<Partial<RMUsageCreate>>({ purpose: "qc_check" });
  const [showForm, setShowForm] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.quantity_used) return;
    await recordUsage.mutateAsync({
      batchId,
      data: {
        batch_id: batchId,
        quantity_used: Number(form.quantity_used),
        purpose: form.purpose ?? "qc_check",
        result_id: form.result_id ?? null,
        notes: form.notes ?? null,
      },
    });
    setForm({ purpose: "qc_check" });
    setShowForm(false);
  }

  const list = usages ?? [];
  return (
    <div className="space-y-2 py-2">
      <div className="flex justify-between items-center px-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Usage History</p>
        <button onClick={() => setShowForm(v => !v)} className="text-xs flex items-center gap-1 text-slate-500 hover:text-slate-800">
          <PlusCircle size={11} /> Record Usage
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-3 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Qty Used *</label>
              <input type="number" step="any" className="w-full border rounded px-2 py-1 text-xs" value={form.quantity_used ?? ""} onChange={e => setForm(f => ({ ...f, quantity_used: Number(e.target.value) }))} required />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Purpose</label>
              <select className="w-full border rounded px-2 py-1 text-xs" value={form.purpose ?? "qc_check"} onChange={e => setForm(f => ({ ...f, purpose: e.target.value as UsagePurpose }))}>
                {Object.entries(PURPOSE_META).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Result ID</label>
              <input type="number" className="w-full border rounded px-2 py-1 text-xs" value={form.result_id ?? ""} onChange={e => setForm(f => ({ ...f, result_id: e.target.value ? Number(e.target.value) : null }))} placeholder="Optional" />
            </div>
            <div className="col-span-3">
              <label className="block text-xs text-slate-400 mb-1">Notes</label>
              <input className="w-full border rounded px-2 py-1 text-xs" value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value || null }))} placeholder="Optional…" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="text-xs px-2 py-1 border rounded hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={recordUsage.isPending} className="text-xs px-3 py-1 bg-slate-800 text-white rounded hover:bg-slate-700 disabled:opacity-50">
              {recordUsage.isPending ? "…" : "Record"}
            </button>
          </div>
        </form>
      )}
      {isLoading ? <div className="py-3 flex justify-center"><Loader2 size={14} className="animate-spin text-slate-300" /></div> : (
        list.length === 0 ? (
          <p className="text-xs text-slate-400 italic px-1">No usage recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-400 text-left border-b">
                  <th className="py-1.5 pr-3">Purpose</th>
                  <th className="py-1.5 pr-3">Quantity</th>
                  <th className="py-1.5 pr-3">Result ID</th>
                  <th className="py-1.5 pr-3">Used At</th>
                  <th className="py-1.5">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {list.map(u => (
                  <tr key={u.id}>
                    <td className="py-1.5 pr-3"><span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">{PURPOSE_META[u.purpose]}</span></td>
                    <td className="py-1.5 pr-3 font-mono">{u.quantity_used}</td>
                    <td className="py-1.5 pr-3 text-slate-400">{u.result_id ?? "–"}</td>
                    <td className="py-1.5 pr-3 text-slate-400">{fmtDateTime(u.used_at)}</td>
                    <td className="py-1.5 text-slate-400">{u.notes ?? "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}

// ── Batches tab ───────────────────────────────────────────────────────────────

function BatchesTab() {
  const { data: materials } = useMaterials(true);
  const { data: batches, isLoading } = useBatches();
  const createBatch = useCreateBatch();
  const updateBatch = useUpdateBatch();
  const deleteBatch = useDeleteBatch();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<RMBatchCreate>>({});
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<RMBatchRead>>({});

  const matList = materials ?? [];
  const batchList = batches ?? [];

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.rm_id || !form.batch_number || !form.quantity_received || !form.unit || !form.received_date) return;
    await createBatch.mutateAsync({
      ...form as RMBatchCreate,
      quantity_remaining: form.quantity_remaining ?? form.quantity_received!,
    });
    setForm({});
    setShowForm(false);
  }

  async function saveEdit(id: number) {
    await updateBatch.mutateAsync({ id, data: editForm });
    setEditId(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700">
          <PlusCircle size={14} /> Add Batch
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-slate-50 border rounded-xl p-4 space-y-3">
          <h3 className="font-medium text-slate-700 text-sm">New Batch / Lot</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-slate-500 mb-1">Material *</label>
              <select className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.rm_id ?? ""} onChange={e => setForm(f => ({ ...f, rm_id: Number(e.target.value) }))} required>
                <option value="">Select…</option>
                {matList.map(m => <option key={m.id} value={m.id}>[{m.material_type?.toUpperCase()}] {m.name} ({m.rm_code})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Batch No. *</label>
              <input className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.batch_number ?? ""} onChange={e => setForm(f => ({ ...f, batch_number: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Supplier Batch No.</label>
              <input className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.supplier_batch_number ?? ""} onChange={e => setForm(f => ({ ...f, supplier_batch_number: e.target.value || null }))} />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Qty Received *</label>
              <input type="number" step="any" className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.quantity_received ?? ""} onChange={e => setForm(f => ({ ...f, quantity_received: Number(e.target.value) }))} required />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Unit *</label>
              <input className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.unit ?? ""} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="g, mL, units…" required />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Received Date *</label>
              <input type="date" className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.received_date ?? ""} onChange={e => setForm(f => ({ ...f, received_date: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Expiry Date</label>
              <input type="date" className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.expiry_date ?? ""} onChange={e => setForm(f => ({ ...f, expiry_date: e.target.value || null }))} />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Cert. Valid Until</label>
              <input type="date" className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.certificate_valid_until ?? ""} onChange={e => setForm(f => ({ ...f, certificate_valid_until: e.target.value || null }))} />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm rounded-lg border hover:bg-slate-100">Cancel</button>
            <button type="submit" disabled={createBatch.isPending} className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50">
              {createBatch.isPending ? <Loader2 size={12} className="animate-spin" /> : "Save"}
            </button>
          </div>
        </form>
      )}

      {isLoading ? <Spinner /> : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-xs font-medium text-slate-500">
                <th className="px-4 py-3">Material</th>
                <th className="px-4 py-3">Batch No.</th>
                <th className="px-4 py-3">Qty Remaining</th>
                <th className="px-4 py-3">Expiry</th>
                <th className="px-4 py-3">Cert. Valid</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody>
              {batchList.map(b => {
                const isExpanded = expandedId === b.id;
                const isEditing = editId === b.id;
                return (
                  <>
                    <tr key={b.id} className="border-b hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {b.material_type && <TypeBadge type={b.material_type} />}
                          <span className="font-medium text-slate-800">{b.material_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">{b.batch_number}</td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <input type="number" step="any" className="w-20 border rounded px-1 py-0.5 text-sm" value={editForm.quantity_remaining ?? b.quantity_remaining} onChange={e => setEditForm(f => ({ ...f, quantity_remaining: Number(e.target.value) }))} />
                        ) : (
                          <span>{b.quantity_remaining} <span className="text-slate-400 text-xs">{b.unit}</span></span>
                        )}
                      </td>
                      <td className={`px-4 py-3 text-xs ${expiryClass(b.days_until_expiry)}`}>
                        {fmtDate(b.expiry_date)}
                        {b.days_until_expiry != null && <span className="ml-1 text-slate-400">({b.days_until_expiry}d)</span>}
                      </td>
                      <td className={`px-4 py-3 text-xs ${expiryClass(b.days_until_cert_expiry)}`}>
                        {fmtDate(b.certificate_valid_until)}
                        {b.days_until_cert_expiry != null && <span className="ml-1 text-slate-400">({b.days_until_cert_expiry}d)</span>}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {isEditing ? (
                            <>
                              <button onClick={() => saveEdit(b.id)} className="p-1 rounded hover:bg-green-50 text-green-600"><Check size={14} /></button>
                              <button onClick={() => setEditId(null)} className="p-1 rounded hover:bg-slate-100 text-slate-400"><X size={14} /></button>
                            </>
                          ) : (
                            <>
                              <button title="Usage history" onClick={() => setExpandedId(isExpanded ? null : b.id)} className="p-1 rounded hover:bg-slate-100 text-slate-400">
                                <History size={14} />
                              </button>
                              <button onClick={() => { setEditId(b.id); setEditForm({ quantity_remaining: b.quantity_remaining }); }} className="p-1 rounded hover:bg-slate-100 text-slate-400"><Edit3 size={14} /></button>
                              <button onClick={() => deleteBatch.mutate(b.id)} className="p-1 rounded hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${b.id}-usage`}>
                        <td colSpan={7} className="bg-slate-50 px-6 pb-3 border-b">
                          <BatchUsageRow batchId={b.id} />
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
              {batchList.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400 text-sm">No batches registered.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Method Approvals tab ──────────────────────────────────────────────────────

function ApprovalsTab() {
  const { data: materials } = useMaterials(true);
  const { data: approvals, isLoading } = useApprovals();
  const createApproval = useCreateApproval();
  const deleteApproval = useDeleteApproval();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<RMMethodApprovalCreate>>({});

  const matList = materials ?? [];
  const list = approvals ?? [];

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.rm_id || !form.method_id) return;
    await createApproval.mutateAsync(form as RMMethodApprovalCreate);
    setForm({});
    setShowForm(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <p className="text-sm text-slate-500 max-w-lg">
          Defines which RM/CRMs are approved for use with each test method — supports ISO 17025 §5.6 metrological traceability requirements.
        </p>
        <button onClick={() => setShowForm(v => !v)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 shrink-0">
          <PlusCircle size={14} /> Add Approval
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-slate-50 border rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-slate-500 mb-1">Reference Material *</label>
              <select className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.rm_id ?? ""} onChange={e => setForm(f => ({ ...f, rm_id: Number(e.target.value) }))} required>
                <option value="">Select material…</option>
                {matList.map(m => <option key={m.id} value={m.id}>[{m.material_type?.toUpperCase()}] {m.name} ({m.rm_code})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Method ID *</label>
              <input type="number" className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.method_id ?? ""} onChange={e => setForm(f => ({ ...f, method_id: Number(e.target.value) }))} placeholder="Method ID" required />
            </div>
            <div className="col-span-3">
              <label className="block text-xs text-slate-500 mb-1">Notes</label>
              <input className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.notes ?? ""} onChange={e => setForm(f => ({ ...f, notes: e.target.value || null }))} placeholder="e.g. Approved for Pb determination by ICP-MS…" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm rounded-lg border hover:bg-slate-100">Cancel</button>
            <button type="submit" disabled={createApproval.isPending} className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50">
              {createApproval.isPending ? <Loader2 size={12} className="animate-spin" /> : "Approve"}
            </button>
          </div>
        </form>
      )}

      {isLoading ? <Spinner /> : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-xs font-medium text-slate-500">
                <th className="px-4 py-3">Material</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Method ID</th>
                <th className="px-4 py-3">Approved At</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.map(a => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {a.material_type && <TypeBadge type={a.material_type} />}
                      <span className="font-medium">{a.material_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{a.material_code}</td>
                  <td className="px-4 py-3 text-slate-600">#{a.method_id}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{a.approved_at ? fmtDateTime(a.approved_at) : "–"}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{a.notes ?? "–"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteApproval.mutate(a.id)} className="p-1 rounded hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400 text-sm">No approved materials configured.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Traceability tab ──────────────────────────────────────────────────────────

function TraceabilityTab() {
  const [resultId, setResultId] = useState("");
  const [searched, setSearched] = useState<number | null>(null);
  const { data: usages, isLoading } = useUsage(searched ? { result_id: searched } : undefined);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (resultId) setSearched(Number(resultId));
  }

  const list = (usages ?? []) as RMUsageRead[];

  return (
    <div className="space-y-4">
      <div className="bg-white border rounded-xl p-4">
        <h3 className="font-medium text-slate-700 text-sm mb-3">Trace RM/CRM usage by Result ID</h3>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="number"
            className="border rounded-lg px-3 py-2 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-slate-300"
            value={resultId}
            onChange={e => setResultId(e.target.value)}
            placeholder="Result ID"
          />
          <button type="submit" className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700">Search</button>
          {searched && (
            <button type="button" onClick={() => { setSearched(null); setResultId(""); }} className="px-3 py-2 text-sm border rounded-lg hover:bg-slate-50 text-slate-500">Clear</button>
          )}
        </form>
      </div>

      {searched && (isLoading ? <Spinner /> : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-xs font-medium text-slate-500">
                <th className="px-4 py-3">Material</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Batch</th>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">Qty Used</th>
                <th className="px-4 py-3">Used At</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.map(u => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{u.material_name ?? "–"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{u.material_code ?? "–"}</td>
                  <td className="px-4 py-3 text-slate-600">{u.batch_number ?? "–"}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs">{PURPOSE_META[u.purpose]}</span></td>
                  <td className="px-4 py-3 font-mono">{u.quantity_used}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{fmtDateTime(u.used_at)}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{u.notes ?? "–"}</td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-slate-400 text-sm">No RM/CRM usage found for Result #{searched}.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      ))}

      {!searched && (
        <div className="text-center py-12 text-slate-400 text-sm">
          <History size={32} className="mx-auto mb-3 text-slate-200" />
          Enter a Result ID to see which reference materials were used for that test.
        </div>
      )}
    </div>
  );
}

// ── Alerts tab ────────────────────────────────────────────────────────────────

function AlertsTab() {
  const { data: summary, isLoading } = useRMAlerts();

  if (isLoading) return <Spinner />;
  const expiry = summary?.expiry_alerts ?? [];

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${expiry.filter(a => a.days_until_expiry <= 0).length > 0 ? "bg-red-50 border-red-200 text-red-700" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
          <AlertTriangle size={14} />
          {expiry.filter(a => a.days_until_expiry <= 0).length} expired
        </div>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border ${expiry.filter(a => a.days_until_expiry > 0 && a.days_until_expiry <= 60).length > 0 ? "bg-yellow-50 border-yellow-200 text-yellow-700" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
          <Clock size={14} />
          {expiry.filter(a => a.days_until_expiry > 0 && a.days_until_expiry <= 60).length} expiring within 60 days
        </div>
        {(summary?.low_stock_count ?? 0) > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 text-sm font-medium">
            <Package size={14} />
            {summary!.low_stock_count} below 10% remaining
          </div>
        )}
      </div>

      {expiry.map(a => {
        const expired = a.days_until_expiry <= 0;
        const certWarn = a.days_until_cert_expiry != null && a.days_until_cert_expiry <= 60;
        return (
          <div key={a.batch_id} className={`rounded-xl border p-4 ${expired ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <TypeBadge type={a.material_type} />
                  <span className="font-semibold text-slate-800">{a.material_name}</span>
                  <span className="font-mono text-xs text-slate-400">{a.material_code}</span>
                </div>
                <p className="text-xs text-slate-500">
                  Batch: <span className="font-mono font-medium">{a.batch_number}</span>
                  {" · "}{a.quantity_remaining} {a.unit} remaining
                </p>
                {certWarn && a.certificate_valid_until && (
                  <p className={`text-xs mt-1 font-medium ${expiryClass(a.days_until_cert_expiry)}`}>
                    Certificate valid until {fmtDate(a.certificate_valid_until)} ({a.days_until_cert_expiry}d)
                  </p>
                )}
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-bold ${expiryClass(a.days_until_expiry)}`}>
                  {expired ? "EXPIRED" : `${a.days_until_expiry} days`}
                </p>
                <p className="text-xs text-slate-400">{fmtDate(a.expiry_date)}</p>
              </div>
            </div>
          </div>
        );
      })}

      {expiry.length === 0 && (
        <div className="text-center py-12 text-slate-400 text-sm">
          <CheckCircle2 size={32} className="mx-auto mb-3 text-green-300" />
          No expiry or certificate alerts.
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "catalog",      label: "Catalog",          icon: BookOpen },
  { id: "batches",      label: "Batches / Lots",   icon: Package },
  { id: "approvals",    label: "Method Approvals", icon: ShieldCheck },
  { id: "traceability", label: "Traceability",      icon: History },
  { id: "alerts",       label: "Alerts",            icon: AlertTriangle },
];

export default function RMPage() {
  const [tab, setTab] = useState<Tab>("catalog");
  const { data: alertSummary } = useRMAlerts();
  const alertCount = (alertSummary?.expiry_alerts.length ?? 0) + (alertSummary?.low_stock_count ?? 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Atom size={22} /> Reference Materials
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          ISO 17025 §4.3 — RM/CRM catalog, metrological traceability, method approvals, usage traceability
        </p>
      </div>

      <div className="border-b flex gap-1 flex-wrap">
        {TABS.map(t => {
          const Icon = t.icon;
          const isAlert = t.id === "alerts" && alertCount > 0;
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

      {tab === "catalog"      && <CatalogTab />}
      {tab === "batches"      && <BatchesTab />}
      {tab === "approvals"    && <ApprovalsTab />}
      {tab === "traceability" && <TraceabilityTab />}
      {tab === "alerts"       && <AlertsTab />}
    </div>
  );
}
