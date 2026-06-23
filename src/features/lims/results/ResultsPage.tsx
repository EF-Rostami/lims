/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2, XCircle, Clock, FlaskConical, Filter, X,
  CheckCheck, ThumbsUp, AlertCircle, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { LimsPageLayout } from "@/features/lims/components/LimsPageLayout";
import { useResults, useEnterResult, useValidateResult, useApproveResult, useRejectResult } from "./results.queries";
import { useInstruments } from "@/features/lims/instruments/instruments.queries";
import type { ResultRead, ResultEnter, ResultFlag, ResultStatus } from "./results.api";

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ResultStatus, { label: string; className: string; icon: React.ElementType }> = {
  PENDING:   { label: "Pending",   className: "bg-slate-100 text-slate-600",  icon: Clock },
  ENTERED:   { label: "Entered",   className: "bg-blue-100 text-blue-700",    icon: FlaskConical },
  VALIDATED: { label: "Validated", className: "bg-amber-100 text-amber-700",  icon: CheckCircle2 },
  APPROVED:  { label: "Approved",  className: "bg-green-100 text-green-700",  icon: CheckCheck },
  REJECTED:  { label: "Rejected",  className: "bg-red-100 text-red-700",      icon: XCircle },
};

const FLAG_CONFIG: Record<ResultFlag, { label: string; className: string }> = {
  NORMAL:       { label: "Normal",       className: "bg-green-50 text-green-700 border border-green-200" },
  HIGH:         { label: "H",            className: "bg-amber-50 text-amber-700 border border-amber-200" },
  LOW:          { label: "L",            className: "bg-blue-50 text-blue-700 border border-blue-200" },
  CRITICAL_HIGH:{ label: "C-H",          className: "bg-red-50 text-red-700 border border-red-200 font-bold" },
  CRITICAL_LOW: { label: "C-L",          className: "bg-red-50 text-red-700 border border-red-200 font-bold" },
  ABNORMAL:     { label: "Abnormal",     className: "bg-purple-50 text-purple-700 border border-purple-200" },
};

function StatusBadge({ status }: { status: ResultStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${cfg.className}`}>
      <Icon size={11} />
      {cfg.label}
    </span>
  );
}

function FlagBadge({ flag }: { flag: ResultFlag | null | undefined }) {
  if (!flag) return <span className="text-slate-300 text-xs">—</span>;
  const cfg = FLAG_CONFIG[flag];
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <FlaskConical className="h-10 w-10 text-slate-300 mb-3" />
      <p className="text-sm font-medium text-slate-600">
        {filtered ? "No results match your filters" : "No test results yet"}
      </p>
      <p className="text-xs text-slate-400 mt-1">
        {filtered ? "Try clearing the filters" : "Results will appear here once orders are processed"}
      </p>
    </div>
  );
}

// ── Enter Result Dialog ───────────────────────────────────────────────────────

const FLAG_OPTIONS: { value: ResultFlag; label: string }[] = [
  { value: "NORMAL",        label: "Normal" },
  { value: "HIGH",          label: "High (H)" },
  { value: "LOW",           label: "Low (L)" },
  { value: "CRITICAL_HIGH", label: "Critical High (C-H)" },
  { value: "CRITICAL_LOW",  label: "Critical Low (C-L)" },
  { value: "ABNORMAL",      label: "Abnormal" },
];

function nowLocalIso() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

interface EnterDialogProps {
  result: ResultRead | null;
  onClose: () => void;
}

function EnterDialog({ result, onClose }: EnterDialogProps) {
  const { data: instruments = [] } = useInstruments({ active_only: true });
  const enterMutation = useEnterResult();

  const [form, setForm] = useState<ResultEnter>({
    result_value: "",
    result_unit: null,
    reference_range: null,
    result_flag: null,
    comments: null,
    instrument_id: null,
    run_date: nowLocalIso(),
    dilution_factor: null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result) return;
    const payload: ResultEnter = {
      ...form,
      run_date: form.run_date ? new Date(form.run_date).toISOString() : null,
      dilution_factor: form.dilution_factor ? Number(form.dilution_factor) : null,
    };
    await enterMutation.mutateAsync({ id: result.id, data: payload });
    onClose();
  };

  const set = (patch: Partial<ResultEnter>) => setForm((f) => ({ ...f, ...patch }));

  return (
    <Dialog open={!!result} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Enter Result</DialogTitle>
          {result && (
            <p className="text-xs text-slate-500 mt-0.5">
              {result.test_name}{" "}
              <span className="font-mono text-slate-400">({result.test_code})</span>
              {" · "}Order Item #{result.order_item_id}
            </p>
          )}
          {result?.previous_result_value && (
            <p className="text-xs text-amber-600 mt-1 bg-amber-50 border border-amber-100 rounded px-2 py-1">
              Previous value: <strong>{result.previous_result_value}</strong>
            </p>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 mt-1">
          {/* Instrument */}
          <div className="space-y-1">
            <Label>Instrument used</Label>
            <select
              className="w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              value={form.instrument_id ?? ""}
              onChange={(e) => set({ instrument_id: e.target.value ? Number(e.target.value) : null })}
            >
              <option value="">— No instrument —</option>
              {instruments.map((inst: any) => (
                <option key={inst.id} value={inst.id}>
                  {inst.name} ({inst.code})
                </option>
              ))}
            </select>
          </div>

          {/* Value + Unit */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 space-y-1">
              <Label>Result value *</Label>
              <Input
                required
                placeholder="e.g. 5.4"
                value={form.result_value ?? ""}
                onChange={(e) => set({ result_value: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Unit</Label>
              <Input
                placeholder="e.g. mmol/L"
                value={form.result_unit ?? ""}
                onChange={(e) => set({ result_unit: e.target.value || null })}
              />
            </div>
          </div>

          {/* Ref range + Flag */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label>Reference range</Label>
              <Input
                placeholder="e.g. 3.5–5.5"
                value={form.reference_range ?? ""}
                onChange={(e) => set({ reference_range: e.target.value || null })}
              />
            </div>
            <div className="space-y-1">
              <Label>Flag</Label>
              <select
                className="w-full rounded-md border px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                value={form.result_flag ?? ""}
                onChange={(e) => set({ result_flag: (e.target.value as ResultFlag) || null })}
              >
                <option value="">— Not set —</option>
                {FLAG_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Run date + Dilution */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label>Run date/time</Label>
              <Input
                type="datetime-local"
                value={form.run_date ?? ""}
                onChange={(e) => set({ run_date: e.target.value || null })}
              />
            </div>
            <div className="space-y-1">
              <Label>Dilution factor</Label>
              <Input
                type="number"
                step="0.0001"
                min="0"
                placeholder="e.g. 2"
                value={form.dilution_factor ?? ""}
                onChange={(e) => set({ dilution_factor: e.target.value ? Number(e.target.value) : null })}
              />
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-1">
            <Label>Comments</Label>
            <Textarea
              rows={2}
              placeholder="Optional notes…"
              value={form.comments ?? ""}
              onChange={(e) => set({ comments: e.target.value || null })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={enterMutation.isPending}>
              {enterMutation.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
              Save Result
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Reject Dialog ─────────────────────────────────────────────────────────────

interface RejectDialogProps {
  result: ResultRead | null;
  onClose: () => void;
}

function RejectDialog({ result, onClose }: RejectDialogProps) {
  const [reason, setReason] = useState("");
  const rejectMutation = useRejectResult();

  const handleReject = async () => {
    if (!result || !reason.trim()) return;
    await rejectMutation.mutateAsync({ id: result.id, data: { rejection_reason: reason } });
    setReason("");
    onClose();
  };

  return (
    <Dialog open={!!result} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Reject Result</DialogTitle>
          {result && (
            <p className="text-xs text-slate-500">{result.test_name} · #{result.id}</p>
          )}
        </DialogHeader>
        <div className="space-y-2 mt-1">
          <Label>Reason *</Label>
          <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            variant="destructive"
            disabled={!reason.trim() || rejectMutation.isPending}
            onClick={handleReject}
          >
            {rejectMutation.isPending ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
            Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

const STATUS_FILTERS: { value: ResultStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "PENDING",   label: "Pending" },
  { value: "ENTERED",   label: "Entered" },
  { value: "VALIDATED", label: "Validated" },
  { value: "APPROVED",  label: "Approved" },
  { value: "REJECTED",  label: "Rejected" },
];

export function ResultsPage() {
  const [statusFilter, setStatusFilter] = useState<ResultStatus | "">("");
  const [instrumentFilter, setInstrumentFilter] = useState<number | "">("");
  const [enterTarget, setEnterTarget] = useState<ResultRead | null>(null);
  const [rejectTarget, setRejectTarget] = useState<ResultRead | null>(null);

  const queryParams = useMemo(() => ({
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(instrumentFilter ? { instrument_id: Number(instrumentFilter) } : {}),
  }), [statusFilter, instrumentFilter]);

  const { data: results = [], isLoading } = useResults(queryParams);
  const { data: instruments = [] } = useInstruments({ active_only: true });

  const validateMutation = useValidateResult();
  const approveMutation = useApproveResult();

  const hasFilters = !!statusFilter || !!instrumentFilter;
  const clearFilters = () => { setStatusFilter(""); setInstrumentFilter(""); };

  return (
    <LimsPageLayout
      title="Test Results"
      description="Enter, validate, and approve laboratory results"
    >
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Filter size={15} className="text-slate-400 shrink-0" />

        <select
          className="rounded-md border px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ResultStatus | "")}
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <select
          className="rounded-md border px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          value={instrumentFilter}
          onChange={(e) => setInstrumentFilter(e.target.value ? Number(e.target.value) : "")}
        >
          <option value="">All instruments</option>
          {(instruments as any[]).map((inst) => (
            <option key={inst.id} value={inst.id}>{inst.name} ({inst.code})</option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 px-2 py-1 rounded border hover:bg-slate-50"
          >
            <X size={12} />
            Clear
          </button>
        )}

        <span className="ml-auto text-xs text-slate-400">
          {results.length} result{results.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 gap-2 text-slate-500 text-sm">
          <Loader2 size={16} className="animate-spin" />
          Loading results…
        </div>
      ) : results.length === 0 ? (
        <EmptyState filtered={hasFilters} />
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Test</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Value</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Ref Range</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Flag</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Instrument</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Run Date</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <ResultRow
                  key={r.id}
                  result={r}
                  onEnter={() => setEnterTarget(r)}
                  onValidate={() => validateMutation.mutateAsync(r.id)}
                  onApprove={() => approveMutation.mutateAsync(r.id)}
                  onReject={() => setRejectTarget(r)}
                  isValidating={validateMutation.isPending}
                  isApproving={approveMutation.isPending}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <EnterDialog result={enterTarget} onClose={() => setEnterTarget(null)} />
      <RejectDialog result={rejectTarget} onClose={() => setRejectTarget(null)} />
    </LimsPageLayout>
  );
}

// ── Result Row ────────────────────────────────────────────────────────────────

interface ResultRowProps {
  result: ResultRead;
  onEnter: () => void;
  onValidate: () => void;
  onApprove: () => void;
  onReject: () => void;
  isValidating: boolean;
  isApproving: boolean;
}

function ResultRow({ result: r, onEnter, onValidate, onApprove, onReject, isValidating, isApproving }: ResultRowProps) {
  return (
    <tr className="border-b last:border-0 hover:bg-slate-50/50 transition-colors">
      {/* Test */}
      <td className="px-4 py-3">
        <p className="font-medium text-slate-900 text-sm">{r.test_name}</p>
        <p className="text-xs text-slate-400 font-mono">{r.test_code} · item #{r.order_item_id}</p>
      </td>

      {/* Value */}
      <td className="px-4 py-3">
        {r.result_value ? (
          <span className="font-medium text-slate-900">
            {r.result_value}
            {r.result_unit && <span className="text-slate-500 text-xs ml-1">{r.result_unit}</span>}
          </span>
        ) : (
          <span className="text-slate-300 text-xs">—</span>
        )}
        {r.dilution_factor && (
          <p className="text-xs text-slate-400">×{r.dilution_factor} dilution</p>
        )}
        {r.previous_result_value && r.status === "REJECTED" && (
          <p className="text-xs text-amber-600 mt-0.5" title="Value before rejection">
            Prev: {r.previous_result_value}
          </p>
        )}
      </td>

      {/* Ref Range */}
      <td className="px-4 py-3 text-xs text-slate-500">
        {r.reference_range ?? <span className="text-slate-300">—</span>}
      </td>

      {/* Flag */}
      <td className="px-3 py-3">
        <FlagBadge flag={r.result_flag} />
      </td>

      {/* Instrument */}
      <td className="px-4 py-3">
        {r.instrument_name ? (
          <div>
            <p className="text-sm text-slate-700">{r.instrument_name}</p>
            <p className="text-xs text-slate-400 font-mono">{r.instrument_code}</p>
          </div>
        ) : (
          <span className="text-slate-300 text-xs">—</span>
        )}
      </td>

      {/* Run Date */}
      <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
        {formatDate(r.run_date)}
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusBadge status={r.status} />
        {r.rejection_reason && (
          <p className="text-xs text-red-500 mt-0.5 max-w-35 truncate" title={r.rejection_reason}>
            {r.rejection_reason}
          </p>
        )}
      </td>

      {/* Actions */}
      <td className="px-3 py-3">
        <div className="flex items-center justify-end gap-1">
          {(r.status === "PENDING" || r.status === "REJECTED") && (
            <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={onEnter}>
              <FlaskConical size={12} className="mr-1" />
              Enter
            </Button>
          )}
          {r.status === "ENTERED" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs text-amber-700 border-amber-200 hover:bg-amber-50"
                onClick={onValidate}
                disabled={isValidating}
              >
                <CheckCircle2 size={12} className="mr-1" />
                Validate
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-red-600"
                onClick={onReject}
              >
                Reject
              </Button>
            </>
          )}
          {r.status === "VALIDATED" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-xs text-green-700 border-green-200 hover:bg-green-50"
                onClick={onApprove}
                disabled={isApproving}
              >
                <ThumbsUp size={12} className="mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2 text-xs text-red-600"
                onClick={onReject}
              >
                <AlertCircle size={12} className="mr-1" />
                Reject
              </Button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}
