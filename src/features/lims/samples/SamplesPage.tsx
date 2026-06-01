"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LimsPageLayout } from "@/features/lims/components/LimsPageLayout";
import { LimsTable } from "@/features/lims/components/LimsTable";
import { LimsStatusBadge } from "@/features/lims/components/LimsStatusBadge";
import {
  useSamples, useSampleTypes, useCreateSample, useReceiveSample, useRejectSample,
} from "./samples.queries";
import type { SampleRead, SampleCreate } from "./samples.api";

const emptyForm = (): SampleCreate => ({
  barcode: "",
  sample_type_id: 0,
  client_id: null,
  external_ref: null,
  collected_at: null,
  notes: null,
  collected_by: null,
});

export function SamplesPage() {
  const [open, setOpen] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<SampleRead | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [form, setForm] = useState<SampleCreate>(emptyForm());

  const { data: samples = [], isLoading } = useSamples();
  const { data: types = [] } = useSampleTypes();
  const create = useCreateSample();
  const receive = useReceiveSample();
  const reject = useRejectSample();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync(form);
    setOpen(false);
    setForm(emptyForm());
  };

  const handleReceive = async (s: SampleRead) => {
    await receive.mutateAsync({ id: s.id, data: { received_at: new Date().toISOString() } });
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    await reject.mutateAsync({ id: rejectTarget.id, data: { rejection_reason: rejectReason } });
    setRejectTarget(null);
    setRejectReason("");
  };

  return (
    <LimsPageLayout
      title="Samples"
      description="Track sample registration, receipt, and custody"
      actionLabel="Register Sample"
      onAction={() => { setForm(emptyForm()); setOpen(true); }}
    >
      <LimsTable
        data={samples}
        isLoading={isLoading}
        emptyMessage="No samples registered yet."
        columns={[
          { header: "Barcode", render: (s) => <span className="font-mono text-sm font-medium">{s.barcode}</span> },
          { header: "Type", render: (s) => <span className="text-slate-700">{types.find((t) => t.id === s.sample_type_id)?.name ?? s.sample_type_id}</span> },
          { header: "External Ref", render: (s) => <span className="text-slate-500">{s.external_ref ?? "—"}</span> },
          { header: "Collected", render: (s) => <span className="text-slate-500">{s.collected_at ? new Date(s.collected_at).toLocaleDateString() : "—"}</span> },
          { header: "Status", render: (s) => <LimsStatusBadge status={s.status} /> },
          {
            header: "",
            className: "w-10",
            render: (s) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {s.status === "PENDING" && (
                    <DropdownMenuItem onClick={() => handleReceive(s)}>
                      <CheckCircle className="h-3.5 w-3.5 mr-2 text-green-600" /> Receive
                    </DropdownMenuItem>
                  )}
                  {(s.status === "PENDING" || s.status === "RECEIVED") && (
                    <DropdownMenuItem className="text-red-600" onClick={() => { setRejectTarget(s); setRejectReason(""); }}>
                      <XCircle className="h-3.5 w-3.5 mr-2" /> Reject
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem disabled className="text-slate-400">
                    <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
      />

      {/* Create dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Register Sample</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Barcode *</Label>
                <Input required value={form.barcode} onChange={(e) => setForm((f) => ({ ...f, barcode: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>External Ref</Label>
                <Input value={form.external_ref ?? ""} onChange={(e) => setForm((f) => ({ ...f, external_ref: e.target.value || null }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Sample Type *</Label>
              <Select
                value={form.sample_type_id ? String(form.sample_type_id) : ""}
                onValueChange={(v) => setForm((f) => ({ ...f, sample_type_id: Number(v) }))}
              >
                <SelectTrigger><SelectValue placeholder="Select type…" /></SelectTrigger>
                <SelectContent>
                  {types.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Collected At</Label>
                <Input type="datetime-local" value={form.collected_at?.slice(0, 16) ?? ""} onChange={(e) => setForm((f) => ({ ...f, collected_at: e.target.value || null }))} />
              </div>
              <div className="space-y-1">
                <Label>Collected By</Label>
                <Input value={form.collected_by ?? ""} onChange={(e) => setForm((f) => ({ ...f, collected_by: e.target.value || null }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea rows={2} value={form.notes ?? ""} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value || null }))} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={create.isPending}>Register</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={() => setRejectTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Reject Sample</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <p className="text-sm text-slate-600">Rejecting <strong>{rejectTarget?.barcode}</strong>. Please provide a reason.</p>
            <div className="space-y-1">
              <Label>Reason *</Label>
              <Textarea rows={2} required value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
            <Button variant="destructive" disabled={!rejectReason || reject.isPending} onClick={handleReject}>Reject Sample</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LimsPageLayout>
  );
}
