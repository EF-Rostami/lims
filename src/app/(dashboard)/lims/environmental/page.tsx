"use client";

import { useState } from "react";
import {
  Thermometer, Droplets, Gauge, Sun, Activity, Wind,
  PlusCircle, Loader2, CheckCircle2, AlertTriangle, XCircle,
  Camera, Clock, ChevronDown, ChevronUp, Trash2, Edit3, Check, X,
  Eye,
} from "lucide-react";
import {
  useParameters, useCreateParameter, useUpdateParameter, useDeleteParameter,
  useLogReading, useReadings,
  useThresholds, useCreateThreshold, useUpdateThreshold, useDeleteThreshold,
  useSnapshots, useSnapshot, useTakeSnapshot,
} from "@/features/lims/environmental/environmental.queries";
import type {
  ParameterRead, ParameterCreate, ParameterType, ReadingStatus,
  ThresholdCreate,
} from "@/features/lims/environmental/environmental.api";

// ── Constants ─────────────────────────────────────────────────────────────────

const PARAM_TYPE_META: Record<ParameterType, { label: string; icon: React.ElementType; unit: string }> = {
  temperature: { label: "Temperature", icon: Thermometer, unit: "°C" },
  humidity:    { label: "Humidity",    icon: Droplets,    unit: "%RH" },
  pressure:    { label: "Pressure",    icon: Gauge,       unit: "hPa" },
  light:       { label: "Light",       icon: Sun,         unit: "lux" },
  vibration:   { label: "Vibration",   icon: Activity,    unit: "m/s²" },
  air_quality: { label: "Air Quality", icon: Wind,        unit: "AQI" },
};

const STATUS_META: Record<ReadingStatus, { label: string; bg: string; text: string; border: string; icon: React.ElementType }> = {
  normal:       { label: "Normal",       bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200", icon: CheckCircle2 },
  warning:      { label: "Warning",      bg: "bg-yellow-50", text: "text-yellow-700", border: "border-yellow-200", icon: AlertTriangle },
  out_of_range: { label: "Out of Range", bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200",    icon: XCircle },
};

function Spinner() {
  return (
    <div className="flex justify-center py-12">
      <Loader2 className="animate-spin text-slate-400" size={28} />
    </div>
  );
}

function StatusBadge({ status }: { status: ReadingStatus }) {
  const m = STATUS_META[status];
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${m.bg} ${m.text}`}>
      <Icon size={11} />
      {m.label}
    </span>
  );
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString();
}

type Tab = "monitor" | "log" | "thresholds" | "history" | "snapshots";

// ── Monitor tab ───────────────────────────────────────────────────────────────

function MonitorTab() {
  const { data: params, isLoading } = useParameters();
  const takeSnapshot = useTakeSnapshot();
  const [snapping, setSnapping] = useState(false);

  async function handleSnapshot() {
    setSnapping(true);
    try {
      await takeSnapshot.mutateAsync({});
    } finally {
      setSnapping(false);
    }
  }

  if (isLoading) return <Spinner />;
  const list = params ?? [];

  const outCount = list.filter(p => p.latest_status === "out_of_range").length;
  const warnCount = list.filter(p => p.latest_status === "warning").length;

  return (
    <div className="space-y-6">
      {/* Summary banner */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {outCount > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-sm font-medium border border-red-200">
              <XCircle size={14} />
              {outCount} out of range
            </span>
          )}
          {warnCount > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-50 text-yellow-700 text-sm font-medium border border-yellow-200">
              <AlertTriangle size={14} />
              {warnCount} warning
            </span>
          )}
          {outCount === 0 && warnCount === 0 && list.length > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-sm font-medium border border-green-200">
              <CheckCircle2 size={14} />
              All conditions normal
            </span>
          )}
        </div>
        <button
          onClick={handleSnapshot}
          disabled={snapping}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
        >
          {snapping ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
          Take Snapshot
        </button>
      </div>

      {list.length === 0 && (
        <p className="text-slate-400 text-sm text-center py-8">No active parameters configured.</p>
      )}

      {/* Parameter cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map(p => {
          const typeMeta = PARAM_TYPE_META[p.parameter_type];
          const Icon = typeMeta?.icon ?? Thermometer;
          const status = p.latest_status ?? "normal";
          const sm = STATUS_META[status];
          const hasReading = p.latest_value != null;

          return (
            <div
              key={p.id}
              className={`rounded-xl border p-4 ${sm.bg} ${sm.border} transition-all`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg bg-white/60 ${sm.text}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm leading-tight">{p.name}</p>
                    {p.location && <p className="text-xs text-slate-500">{p.location}</p>}
                  </div>
                </div>
                <StatusBadge status={status} />
              </div>

              <div className="mt-2">
                {hasReading ? (
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-bold ${sm.text}`}>
                      {p.latest_value!.toFixed(1)}
                    </span>
                    <span className="text-sm text-slate-500">{p.unit}</span>
                  </div>
                ) : (
                  <p className="text-slate-400 text-sm italic">No reading yet</p>
                )}
                {p.global_min != null || p.global_max != null ? (
                  <p className="text-xs text-slate-400 mt-1">
                    Range: {p.global_min ?? "–"} – {p.global_max ?? "–"} {p.unit}
                  </p>
                ) : null}
              </div>

              {p.latest_recorded_at && (
                <div className="flex items-center gap-1 mt-3 text-xs text-slate-400">
                  <Clock size={10} />
                  {fmtDate(p.latest_recorded_at)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Log tab ───────────────────────────────────────────────────────────────────

function LogTab() {
  const { data: params } = useParameters();
  const logReading = useLogReading();

  const [selectedParam, setSelectedParam] = useState("");
  const [value, setValue] = useState("");
  const [notes, setNotes] = useState("");
  const [lastResult, setLastResult] = useState<{ status: ReadingStatus; auto_finding_id?: number | null } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedParam || !value) return;
    try {
      const res = await logReading.mutateAsync({
        parameter_id: Number(selectedParam),
        value: Number(value),
        notes: notes || null,
      });
      setLastResult({ status: res.status, auto_finding_id: res.auto_finding_id });
      setValue("");
      setNotes("");
    } catch {
      // handled by query
    }
  }

  const paramList = params ?? [];

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="bg-white rounded-xl border p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Log Environmental Reading</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Parameter</label>
            <select
              value={selectedParam}
              onChange={e => setSelectedParam(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
              required
            >
              <option value="">Select parameter…</option>
              {paramList.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.unit}){p.location ? ` — ${p.location}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Value</label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={value}
                onChange={e => setValue(e.target.value)}
                placeholder="Enter reading value"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
                required
              />
              {selectedParam && paramList.find(p => p.id === Number(selectedParam)) && (
                <span className="absolute right-3 top-2 text-sm text-slate-400">
                  {paramList.find(p => p.id === Number(selectedParam))?.unit}
                </span>
              )}
            </div>
            {selectedParam && (() => {
              const p = paramList.find(p => p.id === Number(selectedParam));
              if (!p || (p.global_min == null && p.global_max == null)) return null;
              return (
                <p className="text-xs text-slate-400 mt-1">
                  Acceptable range: {p.global_min ?? "–"} – {p.global_max ?? "–"} {p.unit}
                  {p.warning_margin ? ` (±${p.warning_margin} warning zone)` : ""}
                </p>
              );
            })()}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 resize-none"
              placeholder="Additional notes…"
            />
          </div>

          <button
            type="submit"
            disabled={logReading.isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
          >
            {logReading.isPending ? <Loader2 size={14} className="animate-spin" /> : <PlusCircle size={14} />}
            Log Reading
          </button>
        </form>
      </div>

      {lastResult && (
        <div className={`rounded-xl border p-4 ${STATUS_META[lastResult.status].bg} ${STATUS_META[lastResult.status].border}`}>
          <div className={`flex items-center gap-2 font-medium ${STATUS_META[lastResult.status].text}`}>
            {lastResult.status === "normal" && <CheckCircle2 size={16} />}
            {lastResult.status === "warning" && <AlertTriangle size={16} />}
            {lastResult.status === "out_of_range" && <XCircle size={16} />}
            Reading logged — Status: {STATUS_META[lastResult.status].label}
          </div>
          {lastResult.auto_finding_id && (
            <p className="text-sm mt-1 text-red-600">
              Nonconformance finding #{lastResult.auto_finding_id} automatically created.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Thresholds tab ────────────────────────────────────────────────────────────

function ThresholdsTab() {
  const { data: params } = useParameters(false);
  const { data: thresholds, isLoading } = useThresholds();
  const createThreshold = useCreateThreshold();
  const updateThreshold = useUpdateThreshold();
  const deleteThreshold = useDeleteThreshold();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<ThresholdCreate>>({ is_active: true });
  const [editId, setEditId] = useState<number | null>(null);
  const [editMin, setEditMin] = useState("");
  const [editMax, setEditMax] = useState("");

  const paramList = params ?? [];
  const thresholdList = thresholds ?? [];

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.parameter_id) return;
    await createThreshold.mutateAsync({
      parameter_id: form.parameter_id!,
      method_id: form.method_id ?? null,
      min_value: form.min_value ?? null,
      max_value: form.max_value ?? null,
      is_active: form.is_active ?? true,
    });
    setForm({ is_active: true });
    setShowForm(false);
  }

  async function saveEdit(id: number) {
    await updateThreshold.mutateAsync({
      id,
      data: {
        min_value: editMin !== "" ? Number(editMin) : null,
        max_value: editMax !== "" ? Number(editMax) : null,
      },
    });
    setEditId(null);
  }

  const paramMap = Object.fromEntries(paramList.map(p => [p.id, p]));

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700"
        >
          <PlusCircle size={14} />
          Add Threshold
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-slate-50 rounded-xl border p-4 space-y-3">
          <h3 className="font-medium text-slate-700 text-sm">New Method-Specific Threshold</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Parameter</label>
              <select
                className="w-full border rounded-lg px-2 py-1.5 text-sm"
                value={form.parameter_id ?? ""}
                onChange={e => setForm(f => ({ ...f, parameter_id: Number(e.target.value) }))}
                required
              >
                <option value="">Select…</option>
                {paramList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Method ID (optional)</label>
              <input
                type="number"
                className="w-full border rounded-lg px-2 py-1.5 text-sm"
                value={form.method_id ?? ""}
                onChange={e => setForm(f => ({ ...f, method_id: e.target.value ? Number(e.target.value) : undefined }))}
                placeholder="Leave blank for global"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Min Value</label>
              <input
                type="number"
                step="any"
                className="w-full border rounded-lg px-2 py-1.5 text-sm"
                value={form.min_value ?? ""}
                onChange={e => setForm(f => ({ ...f, min_value: e.target.value ? Number(e.target.value) : undefined }))}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Max Value</label>
              <input
                type="number"
                step="any"
                className="w-full border rounded-lg px-2 py-1.5 text-sm"
                value={form.max_value ?? ""}
                onChange={e => setForm(f => ({ ...f, max_value: e.target.value ? Number(e.target.value) : undefined }))}
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm rounded-lg border hover:bg-slate-100">Cancel</button>
            <button type="submit" disabled={createThreshold.isPending} className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50">
              {createThreshold.isPending ? <Loader2 size={12} className="animate-spin" /> : "Save"}
            </button>
          </div>
        </form>
      )}

      {isLoading ? <Spinner /> : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-xs font-medium text-slate-500">
                <th className="px-4 py-3">Parameter</th>
                <th className="px-4 py-3">Method ID</th>
                <th className="px-4 py-3">Min</th>
                <th className="px-4 py-3">Max</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {thresholdList.map(t => {
                const p = paramMap[t.parameter_id];
                const isEditing = editId === t.id;
                return (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{p?.name ?? `#${t.parameter_id}`}</td>
                    <td className="px-4 py-3 text-slate-500">{t.method_id ?? <span className="italic text-slate-300">Global</span>}</td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input type="number" step="any" value={editMin} onChange={e => setEditMin(e.target.value)} className="w-20 border rounded px-1 py-0.5 text-sm" />
                      ) : (t.min_value ?? "–")}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input type="number" step="any" value={editMax} onChange={e => setEditMax(e.target.value)} className="w-20 border rounded px-1 py-0.5 text-sm" />
                      ) : (t.max_value ?? "–")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {t.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {isEditing ? (
                          <>
                            <button onClick={() => saveEdit(t.id)} className="p-1 rounded hover:bg-green-50 text-green-600"><Check size={14} /></button>
                            <button onClick={() => setEditId(null)} className="p-1 rounded hover:bg-slate-100 text-slate-400"><X size={14} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditId(t.id); setEditMin(t.min_value?.toString() ?? ""); setEditMax(t.max_value?.toString() ?? ""); }} className="p-1 rounded hover:bg-slate-100 text-slate-400"><Edit3 size={14} /></button>
                            <button onClick={() => deleteThreshold.mutate(t.id)} className="p-1 rounded hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {thresholdList.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400 text-sm">No thresholds configured.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── History tab ───────────────────────────────────────────────────────────────

function HistoryTab() {
  const { data: params } = useParameters(false);
  const [filterParam, setFilterParam] = useState<number | undefined>();
  const [filterStatus, setFilterStatus] = useState<ReadingStatus | undefined>();
  const { data: readings, isLoading } = useReadings({
    parameter_id: filterParam,
    reading_status: filterStatus,
    limit: 200,
  });

  const paramList = params ?? [];
  const readingList = readings ?? [];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filterParam ?? ""}
          onChange={e => setFilterParam(e.target.value ? Number(e.target.value) : undefined)}
          className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          <option value="">All parameters</option>
          {paramList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select
          value={filterStatus ?? ""}
          onChange={e => setFilterStatus((e.target.value || undefined) as ReadingStatus | undefined)}
          className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          <option value="">All statuses</option>
          <option value="normal">Normal</option>
          <option value="warning">Warning</option>
          <option value="out_of_range">Out of Range</option>
        </select>
      </div>

      {isLoading ? <Spinner /> : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-xs font-medium text-slate-500">
                <th className="px-4 py-3">Parameter</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Recorded</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3">Finding</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {readingList.map(r => {
                const sm = STATUS_META[r.status];
                return (
                  <tr key={r.id} className={`${sm.bg}`}>
                    <td className="px-4 py-3 font-medium text-slate-800">{r.parameter_name ?? `#${r.parameter_id}`}</td>
                    <td className={`px-4 py-3 font-mono font-semibold ${sm.text}`}>
                      {r.value.toFixed(2)} <span className="text-slate-400 font-normal text-xs">{r.unit}</span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{fmtDate(r.recorded_at)}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{r.notes ?? "–"}</td>
                    <td className="px-4 py-3">
                      {r.auto_finding_id ? (
                        <span className="text-xs text-red-600 font-medium">#{r.auto_finding_id}</span>
                      ) : "–"}
                    </td>
                  </tr>
                );
              })}
              {readingList.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-slate-400 text-sm">No readings found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Snapshots tab ─────────────────────────────────────────────────────────────

function SnapshotRow({ id, taken_at, is_compliant, reading_count }: {
  id: number; taken_at: string; is_compliant: boolean; reading_count: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const { data: detail, isFetching } = useSnapshot(expanded ? id : 0);

  return (
    <>
      <tr className="hover:bg-slate-50 cursor-pointer" onClick={() => setExpanded(v => !v)}>
        <td className="px-4 py-3 text-slate-800 font-medium">#{id}</td>
        <td className="px-4 py-3 text-slate-500 text-xs">{fmtDate(taken_at)}</td>
        <td className="px-4 py-3">
          {is_compliant ? (
            <span className="flex items-center gap-1 text-xs text-green-700 font-medium"><CheckCircle2 size={12} /> Compliant</span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-red-700 font-medium"><XCircle size={12} /> Non-Compliant</span>
          )}
        </td>
        <td className="px-4 py-3 text-slate-500 text-xs">{reading_count} readings</td>
        <td className="px-4 py-3 text-slate-400">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={5} className="bg-slate-50 px-4 pb-3">
            {isFetching ? (
              <div className="py-4 flex justify-center"><Loader2 size={16} className="animate-spin text-slate-300" /></div>
            ) : (
              <div className="overflow-x-auto rounded-lg border mt-2 bg-white">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-slate-500 text-left">
                      <th className="px-3 py-2">Parameter</th>
                      <th className="px-3 py-2">Value</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Range</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(detail?.readings ?? []).map((r, i) => {
                      const sm = STATUS_META[r.status];
                      return (
                        <tr key={i} className={sm.bg}>
                          <td className="px-3 py-2 font-medium">{r.parameter_name}</td>
                          <td className={`px-3 py-2 font-mono font-semibold ${sm.text}`}>
                            {r.value.toFixed(2)} {r.unit}
                          </td>
                          <td className="px-3 py-2"><StatusBadge status={r.status} /></td>
                          <td className="px-3 py-2 text-slate-400">
                            {r.min_threshold ?? "–"} – {r.max_threshold ?? "–"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function SnapshotsTab() {
  const { data: snapshots, isLoading } = useSnapshots();
  const takeSnapshot = useTakeSnapshot();
  const [snapping, setSnapping] = useState(false);

  async function handleSnapshot() {
    setSnapping(true);
    try {
      await takeSnapshot.mutateAsync({});
    } finally {
      setSnapping(false);
    }
  }

  const list = snapshots ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={handleSnapshot}
          disabled={snapping}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700 disabled:opacity-50"
        >
          {snapping ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
          Take Snapshot Now
        </button>
      </div>

      {isLoading ? <Spinner /> : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-xs font-medium text-slate-500">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Taken At</th>
                <th className="px-4 py-3">Compliance</th>
                <th className="px-4 py-3">Readings</th>
                <th className="px-4 py-3 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {list.map(s => (
                <SnapshotRow key={s.id} {...s} />
              ))}
              {list.length === 0 && (
                <tr><td colSpan={5} className="text-center py-8 text-slate-400 text-sm">No snapshots taken yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Parameters tab (setup) ────────────────────────────────────────────────────

function ParametersSetupSection() {
  const { data: params, isLoading } = useParameters(false);
  const createParameter = useCreateParameter();
  const updateParameter = useUpdateParameter();
  const deleteParameter = useDeleteParameter();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<ParameterCreate>>({ is_active: true, parameter_type: "temperature" });
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<ParameterRead>>({});

  const paramList = params ?? [];

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.parameter_type || !form.unit) return;
    await createParameter.mutateAsync(form as ParameterCreate);
    setForm({ is_active: true, parameter_type: "temperature" });
    setShowForm(false);
  }

  async function saveEdit(id: number) {
    await updateParameter.mutateAsync({ id, data: editForm });
    setEditId(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700"
        >
          <PlusCircle size={14} />
          Add Parameter
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-slate-50 rounded-xl border p-4 space-y-3">
          <h3 className="font-medium text-slate-700 text-sm">New Environmental Parameter</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Name</label>
              <input className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.name ?? ""} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Lab Room A – Temp" required />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Type</label>
              <select className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.parameter_type ?? "temperature"} onChange={e => setForm(f => ({ ...f, parameter_type: e.target.value as ParameterType }))}>
                {Object.entries(PARAM_TYPE_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Unit</label>
              <input className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.unit ?? ""} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="°C, %RH, hPa…" required />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Location</label>
              <input className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.location ?? ""} onChange={e => setForm(f => ({ ...f, location: e.target.value || null }))} placeholder="Room A, Fridge 1…" />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Global Min</label>
              <input type="number" step="any" className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.global_min ?? ""} onChange={e => setForm(f => ({ ...f, global_min: e.target.value ? Number(e.target.value) : null }))} />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Global Max</label>
              <input type="number" step="any" className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.global_max ?? ""} onChange={e => setForm(f => ({ ...f, global_max: e.target.value ? Number(e.target.value) : null }))} />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Warning Margin</label>
              <input type="number" step="any" className="w-full border rounded-lg px-2 py-1.5 text-sm" value={form.warning_margin ?? ""} onChange={e => setForm(f => ({ ...f, warning_margin: e.target.value ? Number(e.target.value) : null }))} placeholder="Units before threshold" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm rounded-lg border hover:bg-slate-100">Cancel</button>
            <button type="submit" disabled={createParameter.isPending} className="px-3 py-1.5 text-sm rounded-lg bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-50">
              {createParameter.isPending ? <Loader2 size={12} className="animate-spin" /> : "Save"}
            </button>
          </div>
        </form>
      )}

      {isLoading ? <Spinner /> : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left text-xs font-medium text-slate-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Unit</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Range</th>
                <th className="px-4 py-3">Margin</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paramList.map(p => {
                const isEditing = editId === p.id;
                const typeMeta = PARAM_TYPE_META[p.parameter_type];
                const Icon = typeMeta?.icon ?? Thermometer;
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {isEditing ? (
                        <input className="w-full border rounded px-1 py-0.5 text-sm" value={editForm.name ?? p.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} />
                      ) : p.name}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      <span className="flex items-center gap-1"><Icon size={12} />{typeMeta?.label ?? p.parameter_type}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{p.unit}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{p.location ?? "–"}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs font-mono">
                      {isEditing ? (
                        <div className="flex gap-1">
                          <input type="number" step="any" className="w-16 border rounded px-1 py-0.5 text-xs" value={editForm.global_min ?? ""} onChange={e => setEditForm(f => ({ ...f, global_min: e.target.value ? Number(e.target.value) : null }))} placeholder="min" />
                          <span>–</span>
                          <input type="number" step="any" className="w-16 border rounded px-1 py-0.5 text-xs" value={editForm.global_max ?? ""} onChange={e => setEditForm(f => ({ ...f, global_max: e.target.value ? Number(e.target.value) : null }))} placeholder="max" />
                        </div>
                      ) : `${p.global_min ?? "–"} – ${p.global_max ?? "–"}`}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs">
                      {isEditing ? (
                        <input type="number" step="any" className="w-16 border rounded px-1 py-0.5 text-xs" value={editForm.warning_margin ?? ""} onChange={e => setEditForm(f => ({ ...f, warning_margin: e.target.value ? Number(e.target.value) : null }))} />
                      ) : (p.warning_margin != null ? `±${p.warning_margin}` : "–")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        {isEditing ? (
                          <>
                            <button onClick={() => saveEdit(p.id)} className="p-1 rounded hover:bg-green-50 text-green-600"><Check size={14} /></button>
                            <button onClick={() => setEditId(null)} className="p-1 rounded hover:bg-slate-100 text-slate-400"><X size={14} /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => { setEditId(p.id); setEditForm({ name: p.name, global_min: p.global_min, global_max: p.global_max, warning_margin: p.warning_margin }); }} className="p-1 rounded hover:bg-slate-100 text-slate-400"><Edit3 size={14} /></button>
                            <button onClick={() => deleteParameter.mutate(p.id)} className="p-1 rounded hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paramList.length === 0 && (
                <tr><td colSpan={8} className="text-center py-8 text-slate-400 text-sm">No parameters configured.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string }[] = [
  { id: "monitor",    label: "Monitor" },
  { id: "log",        label: "Log Reading" },
  { id: "thresholds", label: "Thresholds" },
  { id: "history",    label: "History" },
  { id: "snapshots",  label: "Snapshots" },
];

export default function EnvironmentalPage() {
  const [tab, setTab] = useState<Tab>("monitor");

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Environmental Conditions</h1>
          <p className="text-sm text-slate-500 mt-0.5">ISO 17025 §4.2 — Monitor, log, and enforce lab conditions</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b flex gap-1">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id
                ? "border-slate-800 text-slate-800"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Setup section (always visible when on thresholds tab) */}
      {tab === "thresholds" && (
        <div className="space-y-2">
          <h2 className="text-base font-semibold text-slate-700">Parameters</h2>
          <ParametersSetupSection />
          <h2 className="text-base font-semibold text-slate-700 pt-4">Method-Specific Thresholds</h2>
        </div>
      )}

      {tab === "monitor"    && <MonitorTab />}
      {tab === "log"        && <LogTab />}
      {tab === "thresholds" && <ThresholdsTab />}
      {tab === "history"    && <HistoryTab />}
      {tab === "snapshots"  && <SnapshotsTab />}
    </div>
  );
}
