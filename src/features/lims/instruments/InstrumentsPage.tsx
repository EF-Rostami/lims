"use client";

import { useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, Plus, Pencil, Trash2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { LimsPageLayout } from "@/features/lims/components/LimsPageLayout";
import { LimsStatusBadge } from "@/features/lims/components/LimsStatusBadge";
import {
  useInstruments, useCreateInstrument, useUpdateInstrument, useDeleteInstrument,
  useMaintenance, useLogMaintenance,
  useCalibrations, useCreateCalibration, useApproveCalibration, useDeleteCalibration,
  useChecks, useCreateCheck, useDeleteCheck,
  useQualifications, useCreateQualification, useUpdateQualification, useApproveQualification,
  useDeleteQualification, useAddQualificationItem, useUpdateQualificationItem,
  useDeleteQualificationItem,
} from "./instruments.queries";
import { instrumentsApi } from "./instruments.api";
import type {
  InstrumentRead, InstrumentCreate, MaintenanceLogCreate,
  CalibrationRecordCreate, CalibrationType, CalibrationResult,
  IntermediateCheckCreate, CheckResult,
  QualificationCreate, QualificationUpdate, QualificationType,
  QualificationStatus, QualificationConclusion, QualificationItemCreate,
  Qualification, QualificationItem,
} from "./instruments.api";

// ── Helpers ───────────────────────────────────────────────────────────────────

const QUAL_LABELS: Record<string, string> = {
  iq: "IQ — Installation",
  oq: "OQ — Operational",
  pq: "PQ — Performance",
  requalification: "Requalification",
};

const QUAL_STATUS_COLORS: Record<string, string> = {
  planned: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-gray-100 text-gray-500",
};

const CONCLUSION_COLORS: Record<string, string> = {
  pending: "bg-gray-100 text-gray-500",
  conforming: "bg-green-100 text-green-700",
  non_conforming: "bg-red-100 text-red-700",
  conditional: "bg-amber-100 text-amber-700",
};

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${className}`}>
      {label.replace(/_/g, " ")}
    </span>
  );
}

function ResultIcon({ result }: { result: "pass" | "fail" | "warning" | "conditional" }) {
  if (result === "pass") return <CheckCircle className="h-4 w-4 text-green-600" />;
  if (result === "fail") return <XCircle className="h-4 w-4 text-red-500" />;
  return <AlertTriangle className="h-4 w-4 text-amber-500" />;
}

// ── Instrument List Panel ─────────────────────────────────────────────────────

function InstrumentListPanel({
  selected,
  onSelect,
  onAdd,
}: {
  selected: InstrumentRead | null;
  onSelect: (i: InstrumentRead) => void;
  onAdd: () => void;
}) {
  const { data: instruments = [], isLoading } = useInstruments({ active_only: false });
  const [search, setSearch] = useState("");
  const filtered = instruments.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.code.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full border-r">
      <div className="p-3 border-b space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Instruments</span>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onAdd}>
            <Plus className="h-3.5 w-3.5 mr-1" />Add
          </Button>
        </div>
        <Input
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-sm"
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        {isLoading && <p className="text-xs text-muted-foreground p-3">Loading…</p>}
        {filtered.map((i) => (
          <button
            key={i.id}
            onClick={() => onSelect(i)}
            className={`w-full text-left px-3 py-2.5 border-b hover:bg-muted transition-colors ${
              selected?.id === i.id ? "bg-muted border-l-2 border-l-primary" : ""
            }`}
          >
            <p className="text-sm font-medium truncate">{i.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-mono text-muted-foreground">{i.code}</span>
              <LimsStatusBadge status={i.status} />
            </div>
          </button>
        ))}
        {!isLoading && !filtered.length && (
          <p className="text-xs text-muted-foreground p-3">No instruments found.</p>
        )}
      </div>
    </div>
  );
}

// ── Details Tab ───────────────────────────────────────────────────────────────

function DetailsTab({ instrument, onEdit, onDelete }: { instrument: InstrumentRead; onEdit: () => void; onDelete: () => void }) {
  const { data: logs = [], isLoading } = useMaintenance(instrument.id);
  const [showMaint, setShowMaint] = useState(false);
  const [maintForm, setMaintForm] = useState<MaintenanceLogCreate>({
    action: "", notes: null, performed_at: new Date().toISOString(),
  });
  const logMaint = useLogMaintenance();

  const handleMaint = async (e: React.FormEvent) => {
    e.preventDefault();
    await logMaint.mutateAsync({ id: instrument.id, data: maintForm });
    setShowMaint(false);
    setMaintForm({ action: "", notes: null, performed_at: new Date().toISOString() });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{instrument.name}</h2>
          <p className="text-sm text-muted-foreground font-mono">{instrument.code}</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onEdit}><Pencil className="h-3.5 w-3.5 mr-1" />Edit</Button>
          <Button size="sm" variant="destructive" onClick={onDelete}><Trash2 className="h-3.5 w-3.5 mr-1" />Delete</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        {[
          ["Manufacturer", instrument.manufacturer],
          ["Model", instrument.model_number],
          ["Serial #", instrument.serial_number],
          ["Location", instrument.location],
          ["Purchase Date", instrument.purchase_date],
          ["Warranty Expiry", instrument.warranty_expiry],
          ["Last Calibrated", instrument.last_calibrated_at],
          ["Next Cal. Due", instrument.next_calibration_due],
          ["Last Maintained", instrument.last_maintained_at],
          ["Next Maint. Due", instrument.next_maintenance_due],
        ].map(([label, val]) =>
          val ? (
            <div key={label as string}>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="font-medium">{val as string}</p>
            </div>
          ) : null,
        )}
      </div>

      <div className="flex gap-2">
        <LimsStatusBadge status={instrument.status} />
        <LimsStatusBadge status={instrument.calibration_status} />
      </div>

      {instrument.notes && (
        <p className="text-sm text-muted-foreground border rounded-lg p-3">{instrument.notes}</p>
      )}

      <div className="border rounded-lg">
        <div className="flex items-center justify-between p-3 border-b">
          <span className="text-sm font-semibold">Maintenance Log</span>
          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setShowMaint(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />Log Entry
          </Button>
        </div>
        {isLoading ? (
          <p className="text-xs text-muted-foreground p-3">Loading…</p>
        ) : !logs.length ? (
          <p className="text-xs text-muted-foreground p-3">No maintenance logs yet.</p>
        ) : (
          <div className="divide-y">
            {logs.map((l) => (
              <div key={l.id} className="px-3 py-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{l.action}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(l.performed_at).toLocaleDateString()}
                  </span>
                </div>
                {l.notes && <p className="text-xs text-muted-foreground mt-0.5">{l.notes}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showMaint} onOpenChange={setShowMaint}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Log Maintenance</DialogTitle></DialogHeader>
          <form onSubmit={handleMaint} className="space-y-3 mt-2">
            <div className="space-y-1">
              <Label>Action *</Label>
              <Input required value={maintForm.action} onChange={(e) => setMaintForm((f) => ({ ...f, action: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Performed At *</Label>
              <Input type="datetime-local" required value={maintForm.performed_at.slice(0, 16)}
                onChange={(e) => setMaintForm((f) => ({ ...f, performed_at: e.target.value ? new Date(e.target.value).toISOString() : f.performed_at }))} />
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea rows={2} value={maintForm.notes ?? ""} onChange={(e) => setMaintForm((f) => ({ ...f, notes: e.target.value || null }))} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowMaint(false)}>Cancel</Button>
              <Button type="submit" disabled={logMaint.isPending}>Log</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Calibration Tab ───────────────────────────────────────────────────────────

function CalibrationTab({ instrument }: { instrument: InstrumentRead }) {
  const { data: records = [], isLoading } = useCalibrations(instrument.id);
  const createCal = useCreateCalibration();
  const approveCal = useApproveCalibration();
  const deleteCal = useDeleteCalibration();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CalibrationRecordCreate>({
    calibration_type: "external",
    calibration_date: new Date().toISOString().slice(0, 10),
    result: "pass",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCal.mutateAsync({ id: instrument.id, data: form });
    setShowForm(false);
    setForm({ calibration_type: "external", calibration_date: new Date().toISOString().slice(0, 10), result: "pass" });
  };

  const setF = (k: keyof CalibrationRecordCreate, v: string | number | null) =>
    setForm((f) => ({ ...f, [k]: v || null }));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Calibration Records</span>
        <Button size="sm" onClick={() => setShowForm(true)} className="h-7 text-xs">
          <Plus className="h-3.5 w-3.5 mr-1" />Add Record
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !records.length ? (
        <p className="text-sm text-muted-foreground border rounded-lg p-6 text-center">No calibration records yet.</p>
      ) : (
        <div className="space-y-2">
          {records.map((r) => (
            <div key={r.id} className="border rounded-lg p-3 text-sm space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <ResultIcon result={r.result} />
                  <span className="font-medium capitalize">{r.calibration_type}</span>
                  <span className="text-muted-foreground">{r.calibration_date}</span>
                </div>
                <div className="flex items-center gap-2">
                  {r.approved_at ? (
                    <Badge label="Approved" className="bg-green-100 text-green-700" />
                  ) : (
                    <Button size="sm" variant="outline" className="h-6 text-xs"
                      onClick={() => approveCal.mutateAsync({ calId: r.id, instrumentId: instrument.id })}>
                      <ShieldCheck className="h-3 w-3 mr-1" />Approve
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive"
                    onClick={() => deleteCal.mutateAsync({ calId: r.id, instrumentId: instrument.id })}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {r.certificate_number && <span>Cert: <strong className="text-foreground">{r.certificate_number}</strong></span>}
                {r.calibrated_by && <span>By: <strong className="text-foreground">{r.calibrated_by}</strong></span>}
                {r.next_due_date && <span>Next due: <strong className="text-foreground">{r.next_due_date}</strong></span>}
                {r.standard_used && <span>Standard: {r.standard_used}</span>}
                {r.traceability_reference && <span>Traceable: {r.traceability_reference}</span>}
                {r.uncertainty_value != null && <span>U: ±{r.uncertainty_value}</span>}
              </div>
              {r.notes && <p className="text-xs text-muted-foreground">{r.notes}</p>}
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Calibration Record</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Type *</Label>
                <select className="w-full border rounded px-2 py-1.5 text-sm bg-background" required
                  value={form.calibration_type}
                  onChange={(e) => setForm((f) => ({ ...f, calibration_type: e.target.value as CalibrationType }))}>
                  <option value="external">External</option>
                  <option value="internal">Internal</option>
                  <option value="factory">Factory</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Result *</Label>
                <select className="w-full border rounded px-2 py-1.5 text-sm bg-background" required
                  value={form.result}
                  onChange={(e) => setForm((f) => ({ ...f, result: e.target.value as CalibrationResult }))}>
                  <option value="pass">Pass</option>
                  <option value="fail">Fail</option>
                  <option value="conditional">Conditional</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Calibration Date *</Label>
                <Input type="date" required value={form.calibration_date}
                  onChange={(e) => setForm((f) => ({ ...f, calibration_date: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Next Due Date</Label>
                <Input type="date" value={form.next_due_date ?? ""}
                  onChange={(e) => setF("next_due_date", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Certificate #</Label>
                <Input value={form.certificate_number ?? ""} onChange={(e) => setF("certificate_number", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Calibrated By</Label>
                <Input value={form.calibrated_by ?? ""} onChange={(e) => setF("calibrated_by", e.target.value)} placeholder="External lab or person" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Standard Used</Label>
                <Input value={form.standard_used ?? ""} onChange={(e) => setF("standard_used", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Uncertainty ±</Label>
                <Input type="number" step="any" value={form.uncertainty_value ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, uncertainty_value: e.target.value ? Number(e.target.value) : null }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Traceability Reference</Label>
              <Input value={form.traceability_reference ?? ""} onChange={(e) => setF("traceability_reference", e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea rows={2} value={form.notes ?? ""} onChange={(e) => setF("notes", e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={createCal.isPending}>Add Record</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Intermediate Checks Tab ───────────────────────────────────────────────────

function ChecksTab({ instrument }: { instrument: InstrumentRead }) {
  const { data: checks = [], isLoading } = useChecks(instrument.id);
  const createChk = useCreateCheck();
  const deleteChk = useDeleteCheck();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<IntermediateCheckCreate>({
    check_date: new Date().toISOString().slice(0, 10),
    check_type: "",
    result: "pass",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createChk.mutateAsync({ id: instrument.id, data: form });
    setShowForm(false);
    setForm({ check_date: new Date().toISOString().slice(0, 10), check_type: "", result: "pass" });
  };

  const setF = (k: keyof IntermediateCheckCreate, v: string | number | null) =>
    setForm((f) => ({ ...f, [k]: v }));

  const autoDeviation = (ref: number | null, meas: number | null) => {
    if (ref == null || meas == null || ref === 0) return null;
    return Math.abs(((meas - ref) / ref) * 100);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Intermediate Checks</span>
        <Button size="sm" onClick={() => setShowForm(true)} className="h-7 text-xs">
          <Plus className="h-3.5 w-3.5 mr-1" />Add Check
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !checks.length ? (
        <p className="text-sm text-muted-foreground border rounded-lg p-6 text-center">No intermediate checks yet.</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-2 px-3">Date</th>
                <th className="text-left py-2 px-2">Check Type</th>
                <th className="text-center py-2 px-2">Result</th>
                <th className="text-right py-2 px-2">Reference</th>
                <th className="text-right py-2 px-2">Measured</th>
                <th className="text-right py-2 px-2">Dev %</th>
                <th className="text-right py-2 px-2">Tol %</th>
                <th className="w-8 py-2 px-2"></th>
              </tr>
            </thead>
            <tbody>
              {checks.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="py-2 px-3 font-mono">{c.check_date}</td>
                  <td className="py-2 px-2">{c.check_type}</td>
                  <td className="py-2 px-2 text-center">
                    <ResultIcon result={c.result as "pass" | "fail" | "warning"} />
                  </td>
                  <td className="py-2 px-2 text-right">{c.reference_value ?? "—"}</td>
                  <td className="py-2 px-2 text-right">{c.measured_value ?? "—"}</td>
                  <td className={`py-2 px-2 text-right font-mono ${c.deviation_pct != null && c.tolerance_pct != null && c.deviation_pct > c.tolerance_pct ? "text-red-600 font-bold" : ""}`}>
                    {c.deviation_pct != null ? `${c.deviation_pct.toFixed(2)}%` : "—"}
                  </td>
                  <td className="py-2 px-2 text-right">
                    {c.tolerance_pct != null ? `±${c.tolerance_pct}%` : "—"}
                  </td>
                  <td className="py-2 px-2">
                    <Button size="sm" variant="ghost" className="h-5 w-5 p-0 text-destructive"
                      onClick={() => deleteChk.mutateAsync({ checkId: c.id, instrumentId: instrument.id })}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Add Intermediate Check</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Date *</Label>
                <Input type="date" required value={form.check_date}
                  onChange={(e) => setF("check_date", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Result *</Label>
                <select className="w-full border rounded px-2 py-1.5 text-sm bg-background" required
                  value={form.result}
                  onChange={(e) => setF("result", e.target.value as CheckResult)}>
                  <option value="pass">Pass</option>
                  <option value="warning">Warning</option>
                  <option value="fail">Fail</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Check Type *</Label>
              <Input required placeholder="e.g. Daily linearity, Weekly reference standard"
                value={form.check_type} onChange={(e) => setF("check_type", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Reference Value</Label>
                <Input type="number" step="any" value={form.reference_value ?? ""}
                  onChange={(e) => setForm((f) => {
                    const ref = e.target.value ? Number(e.target.value) : null;
                    const dev = autoDeviation(ref, f.measured_value ?? null);
                    return { ...f, reference_value: ref, deviation_pct: dev };
                  })} />
              </div>
              <div className="space-y-1">
                <Label>Measured Value</Label>
                <Input type="number" step="any" value={form.measured_value ?? ""}
                  onChange={(e) => setForm((f) => {
                    const meas = e.target.value ? Number(e.target.value) : null;
                    const dev = autoDeviation(f.reference_value ?? null, meas);
                    return { ...f, measured_value: meas, deviation_pct: dev };
                  })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Tolerance %</Label>
                <Input type="number" step="any" value={form.tolerance_pct ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, tolerance_pct: e.target.value ? Number(e.target.value) : null }))} />
              </div>
              <div className="space-y-1">
                <Label>Deviation % (auto)</Label>
                <Input type="number" readOnly value={form.deviation_pct != null ? form.deviation_pct.toFixed(4) : ""} className="bg-muted" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea rows={2} value={form.notes ?? ""} onChange={(e) => setF("notes", e.target.value || null)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={createChk.isPending}>Add Check</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── IQ/OQ/PQ Tab ─────────────────────────────────────────────────────────────

function QualificationItemRow({
  item,
  instrumentId,
}: {
  item: QualificationItem;
  instrumentId: number;
}) {
  const updateItem = useUpdateQualificationItem();
  const deleteItem = useDeleteQualificationItem();
  const [editing, setEditing] = useState(false);
  const [result, setResult] = useState(item.result ?? "");
  const [passed, setPassed] = useState<"yes" | "no" | "">(
    item.passed === true ? "yes" : item.passed === false ? "no" : "",
  );

  const save = async () => {
    await updateItem.mutateAsync({
      itemId: item.id,
      instrumentId,
      data: {
        result: result || null,
        passed: passed === "yes" ? true : passed === "no" ? false : null,
      },
    });
    setEditing(false);
  };

  return (
    <tr className="border-b last:border-0 text-xs">
      <td className="py-2 px-3 text-muted-foreground w-8">{item.item_number}</td>
      <td className="py-2 px-2">{item.description}</td>
      <td className="py-2 px-2 text-muted-foreground">{item.acceptance_criteria ?? "—"}</td>
      <td className="py-2 px-2">
        {editing ? (
          <Input className="h-6 text-xs" value={result} onChange={(e) => setResult(e.target.value)} />
        ) : (
          <span>{item.result ?? "—"}</span>
        )}
      </td>
      <td className="py-2 px-2 text-center">
        {editing ? (
          <select className="border rounded px-1 py-0.5 text-xs bg-background" value={passed}
            onChange={(e) => setPassed(e.target.value as "yes" | "no" | "")}>
            <option value="">—</option>
            <option value="yes">Pass</option>
            <option value="no">Fail</option>
          </select>
        ) : item.passed === true ? (
          <CheckCircle className="h-3.5 w-3.5 text-green-600 mx-auto" />
        ) : item.passed === false ? (
          <XCircle className="h-3.5 w-3.5 text-red-500 mx-auto" />
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="py-2 px-2">
        <div className="flex gap-1">
          {editing ? (
            <>
              <Button size="sm" className="h-5 text-xs px-1.5" onClick={save} disabled={updateItem.isPending}>Save</Button>
              <Button size="sm" variant="ghost" className="h-5 text-xs px-1.5" onClick={() => setEditing(false)}>✕</Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" className="h-5 w-5 p-0" onClick={() => setEditing(true)}>
                <Pencil className="h-3 w-3" />
              </Button>
              <Button size="sm" variant="ghost" className="h-5 w-5 p-0 text-destructive"
                onClick={() => deleteItem.mutateAsync({ itemId: item.id, instrumentId })}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

function QualificationCard({
  qual,
  instrumentId,
}: {
  qual: Qualification;
  instrumentId: number;
}) {
  const updateQual = useUpdateQualification();
  const approveQual = useApproveQualification();
  const deleteQual = useDeleteQualification();
  const addItem = useAddQualificationItem();
  const [expanded, setExpanded] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showEditStatus, setShowEditStatus] = useState(false);
  const [itemForm, setItemForm] = useState<QualificationItemCreate>({
    item_number: (qual.items.length || 0) + 1,
    description: "",
  });
  const [statusForm, setStatusForm] = useState<QualificationUpdate>({
    status: qual.status,
    conclusion: qual.conclusion,
    summary: qual.summary ?? "",
    completion_date: qual.completion_date ?? "",
  });

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    await addItem.mutateAsync({ qualId: qual.id, instrumentId, data: itemForm });
    setShowItemForm(false);
    setItemForm({ item_number: qual.items.length + 2, description: "" });
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateQual.mutateAsync({
      qualId: qual.id,
      instrumentId,
      data: {
        ...statusForm,
        completion_date: statusForm.completion_date || null,
        summary: statusForm.summary || null,
      },
    });
    setShowEditStatus(false);
  };

  const allPassed = qual.items.length > 0 && qual.items.every((i) => i.passed === true);
  const anyFailed = qual.items.some((i) => i.passed === false);
  const passCount = qual.items.filter((i) => i.passed === true).length;
  const failCount = qual.items.filter((i) => i.passed === false).length;
  const pendingCount = qual.items.filter((i) => i.passed === null).length;

  return (
    <div className="border rounded-lg">
      <div
        className="flex items-start justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-muted-foreground">{qual.reference_number}</span>
            <Badge label={qual.qualification_type.toUpperCase()} className="bg-indigo-100 text-indigo-700 font-bold" />
            <Badge label={qual.status} className={QUAL_STATUS_COLORS[qual.status] ?? "bg-gray-100 text-gray-500"} />
            <Badge label={qual.conclusion} className={CONCLUSION_COLORS[qual.conclusion] ?? "bg-gray-100 text-gray-500"} />
          </div>
          <p className="text-sm font-medium">{qual.title}</p>
          <div className="flex gap-3 text-xs text-muted-foreground">
            {qual.start_date && <span>Started: {qual.start_date}</span>}
            {qual.completion_date && <span>Completed: {qual.completion_date}</span>}
            {qual.items.length > 0 && (
              <span>
                {passCount} pass · {failCount} fail · {pendingCount} pending
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 ml-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {!qual.approved_at && (
            <Button size="sm" variant="outline" className="h-6 text-xs"
              onClick={() => approveQual.mutateAsync({ qualId: qual.id, instrumentId })}>
              <ShieldCheck className="h-3 w-3 mr-1" />Approve
            </Button>
          )}
          <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setShowEditStatus(true)}>
            <Pencil className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-destructive"
            onClick={() => deleteQual.mutateAsync({ qualId: qual.id, instrumentId })}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="border-t p-3 space-y-3">
          {qual.protocol && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Protocol</p>
              <p className="text-xs border rounded p-2 bg-muted/30">{qual.protocol}</p>
            </div>
          )}
          {qual.summary && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Summary / Findings</p>
              <p className="text-xs border rounded p-2 bg-muted/30">{qual.summary}</p>
            </div>
          )}
          {qual.approved_at && (
            <p className="text-xs text-green-700">
              Approved {new Date(qual.approved_at).toLocaleDateString()}
              {qual.next_requalification_due && ` · Next requalification: ${qual.next_requalification_due}`}
            </p>
          )}

          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold">Test Items ({qual.items.length})</p>
            <Button size="sm" variant="outline" className="h-6 text-xs" onClick={() => setShowItemForm(true)}>
              <Plus className="h-3 w-3 mr-1" />Add Item
            </Button>
          </div>

          {qual.items.length > 0 && (
            <div className="overflow-x-auto border rounded">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="text-left py-1.5 px-3 w-8">#</th>
                    <th className="text-left py-1.5 px-2">Description</th>
                    <th className="text-left py-1.5 px-2">Acceptance Criteria</th>
                    <th className="text-left py-1.5 px-2">Result</th>
                    <th className="text-center py-1.5 px-2">Pass</th>
                    <th className="py-1.5 px-2 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {qual.items.map((item) => (
                    <QualificationItemRow key={item.id} item={item} instrumentId={instrumentId} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add Item Dialog */}
      <Dialog open={showItemForm} onOpenChange={setShowItemForm}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Test Item</DialogTitle></DialogHeader>
          <form onSubmit={handleAddItem} className="space-y-3 mt-2">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Item #</Label>
                <Input type="number" required value={itemForm.item_number}
                  onChange={(e) => setItemForm((f) => ({ ...f, item_number: Number(e.target.value) }))} />
              </div>
              <div className="col-span-2 space-y-1">
                <Label>Description *</Label>
                <Input required value={itemForm.description}
                  onChange={(e) => setItemForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Acceptance Criteria</Label>
              <Textarea rows={2} value={itemForm.acceptance_criteria ?? ""}
                onChange={(e) => setItemForm((f) => ({ ...f, acceptance_criteria: e.target.value || null }))} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowItemForm(false)}>Cancel</Button>
              <Button type="submit" disabled={addItem.isPending}>Add Item</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Status Dialog */}
      <Dialog open={showEditStatus} onOpenChange={setShowEditStatus}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Update Qualification Status</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdateStatus} className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Status</Label>
                <select className="w-full border rounded px-2 py-1.5 text-sm bg-background"
                  value={statusForm.status}
                  onChange={(e) => setStatusForm((f) => ({ ...f, status: e.target.value as QualificationStatus }))}>
                  <option value="planned">Planned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Conclusion</Label>
                <select className="w-full border rounded px-2 py-1.5 text-sm bg-background"
                  value={statusForm.conclusion}
                  onChange={(e) => setStatusForm((f) => ({ ...f, conclusion: e.target.value as QualificationConclusion }))}>
                  <option value="pending">Pending</option>
                  <option value="conforming">Conforming</option>
                  <option value="conditional">Conditional</option>
                  <option value="non_conforming">Non-Conforming</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Completion Date</Label>
              <Input type="date" value={statusForm.completion_date ?? ""}
                onChange={(e) => setStatusForm((f) => ({ ...f, completion_date: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Summary / Findings</Label>
              <Textarea rows={3} value={statusForm.summary ?? ""}
                onChange={(e) => setStatusForm((f) => ({ ...f, summary: e.target.value }))} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditStatus(false)}>Cancel</Button>
              <Button type="submit" disabled={updateQual.isPending}>Update</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QualificationsTab({ instrument }: { instrument: InstrumentRead }) {
  const { data: quals = [], isLoading } = useQualifications(instrument.id);
  const createQual = useCreateQualification();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<QualificationCreate>({
    qualification_type: "iq",
    reference_number: "",
    title: "",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createQual.mutateAsync({ id: instrument.id, data: form });
    setShowForm(false);
    setForm({ qualification_type: "iq", reference_number: "", title: "" });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">IQ / OQ / PQ Qualifications</span>
        <Button size="sm" onClick={() => setShowForm(true)} className="h-7 text-xs">
          <Plus className="h-3.5 w-3.5 mr-1" />New Qualification
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : !quals.length ? (
        <p className="text-sm text-muted-foreground border rounded-lg p-6 text-center">
          No qualifications yet. Add an IQ, OQ, or PQ record to begin.
        </p>
      ) : (
        <div className="space-y-2">
          {quals.map((q) => (
            <QualificationCard key={q.id} qual={q} instrumentId={instrument.id} />
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Qualification</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Type *</Label>
                <select className="w-full border rounded px-2 py-1.5 text-sm bg-background" required
                  value={form.qualification_type}
                  onChange={(e) => setForm((f) => ({ ...f, qualification_type: e.target.value as QualificationType }))}>
                  <option value="iq">IQ — Installation</option>
                  <option value="oq">OQ — Operational</option>
                  <option value="pq">PQ — Performance</option>
                  <option value="requalification">Requalification</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Reference # *</Label>
                <Input required value={form.reference_number}
                  onChange={(e) => setForm((f) => ({ ...f, reference_number: e.target.value }))}
                  placeholder="e.g. IQ-2026-001" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input required value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Start Date</Label>
                <Input type="date" value={form.start_date ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value || null }))} />
              </div>
              <div className="space-y-1">
                <Label>Next Requalification</Label>
                <Input type="date" value={form.next_requalification_due ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, next_requalification_due: e.target.value || null }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Protocol Description</Label>
              <Textarea rows={3} placeholder="Describe the qualification protocol, test conditions, and acceptance criteria overview…"
                value={form.protocol ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, protocol: e.target.value || null }))} />
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea rows={2} value={form.notes ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value || null }))} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" disabled={createQual.isPending}>Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Instrument Form Dialog ────────────────────────────────────────────────────

function InstrumentFormDialog({
  open, editing, onClose,
}: {
  open: boolean;
  editing: InstrumentRead | null;
  onClose: () => void;
}) {
  const create = useCreateInstrument();
  const update = useUpdateInstrument();
  const [form, setForm] = useState<InstrumentCreate>(() =>
    editing
      ? { name: editing.name, code: editing.code, manufacturer: editing.manufacturer ?? null,
          model_number: editing.model_number ?? null, serial_number: editing.serial_number ?? null,
          location: editing.location ?? null, description: editing.description ?? null, notes: editing.notes ?? null }
      : { name: "", code: "", manufacturer: null, model_number: null, serial_number: null,
          location: null, description: null, notes: null },
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) await update.mutateAsync({ id: editing.id, data: form });
    else await create.mutateAsync(form);
    onClose();
  };

  const set = (k: keyof InstrumentCreate, v: string) =>
    setForm((f) => ({ ...f, [k]: v || null }));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{editing ? "Edit Instrument" : "Add Instrument"}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Name *</Label><Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Code *</Label><Input required value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Manufacturer</Label><Input value={form.manufacturer ?? ""} onChange={(e) => set("manufacturer", e.target.value)} /></div>
            <div className="space-y-1"><Label>Model</Label><Input value={form.model_number ?? ""} onChange={(e) => set("model_number", e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Serial #</Label><Input value={form.serial_number ?? ""} onChange={(e) => set("serial_number", e.target.value)} /></div>
            <div className="space-y-1"><Label>Location</Label><Input value={form.location ?? ""} onChange={(e) => set("location", e.target.value)} /></div>
          </div>
          <div className="space-y-1"><Label>Notes</Label><Textarea rows={2} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} /></div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={create.isPending || update.isPending}>{editing ? "Save" : "Add Instrument"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Page Root ─────────────────────────────────────────────────────────────────

const TABS = ["Details", "Calibration", "Int. Checks", "IQ/OQ/PQ"] as const;
type Tab = (typeof TABS)[number];

export function InstrumentsPage() {
  const [selected, setSelected] = useState<InstrumentRead | null>(null);
  const [tab, setTab] = useState<Tab>("Details");
  const [formOpen, setFormOpen] = useState(false);
  const [editingInstrument, setEditingInstrument] = useState<InstrumentRead | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InstrumentRead | null>(null);
  const remove = useDeleteInstrument();

  const openCreate = () => { setEditingInstrument(null); setFormOpen(true); };
  const openEdit = async (i: InstrumentRead) => {
    const full = await instrumentsApi.get(i.id);
    setEditingInstrument(full);
    setFormOpen(true);
  };
  const closeForm = () => { setFormOpen(false); setEditingInstrument(null); };

  return (
    <div className="flex h-[calc(100vh-8rem)] -mx-4 -my-4">
      {/* Left — instrument list */}
      <div className="w-64 flex-shrink-0 flex flex-col">
        <InstrumentListPanel
          selected={selected}
          onSelect={(i) => { setSelected(i); setTab("Details"); }}
          onAdd={openCreate}
        />
      </div>

      {/* Right — detail panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Select an instrument from the list to view details.
          </div>
        ) : (
          <>
            {/* Tab bar */}
            <div className="flex gap-0 border-b px-4 flex-shrink-0">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
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
              {tab === "Details" && (
                <DetailsTab
                  instrument={selected}
                  onEdit={() => openEdit(selected)}
                  onDelete={() => setDeleteTarget(selected)}
                />
              )}
              {tab === "Calibration" && <CalibrationTab instrument={selected} />}
              {tab === "Int. Checks" && <ChecksTab instrument={selected} />}
              {tab === "IQ/OQ/PQ" && <QualificationsTab instrument={selected} />}
            </div>
          </>
        )}
      </div>

      {/* Instrument create/edit dialog */}
      <InstrumentFormDialog
        open={formOpen}
        editing={editingInstrument}
        onClose={closeForm}
      />

      {/* Delete confirm */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Instrument</DialogTitle></DialogHeader>
          <p className="text-sm">
            Delete <strong>{deleteTarget?.name}</strong>? All calibration records, checks, and qualifications will be permanently removed.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" disabled={remove.isPending}
              onClick={async () => {
                await remove.mutateAsync(deleteTarget!.id);
                setDeleteTarget(null);
                setSelected(null);
              }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
