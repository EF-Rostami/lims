"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LimsPageLayout } from "@/features/lims/components/LimsPageLayout";
import { LimsTable } from "@/features/lims/components/LimsTable";
import { LimsStatusBadge } from "@/features/lims/components/LimsStatusBadge";
import { useInstruments, useCreateInstrument, useUpdateInstrument, useDeleteInstrument, useLogMaintenance } from "./instruments.queries";
import { instrumentsApi } from "./instruments.api";
import type { InstrumentRead, InstrumentCreate, MaintenanceLogCreate } from "./instruments.api";

const emptyForm = (): InstrumentCreate => ({
  name: "",
  code: "",
  manufacturer: null,
  model_number: null,
  serial_number: null,
  location: null,
  description: null,
  notes: null,
});

export function InstrumentsPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InstrumentRead | null>(null);
  const [form, setForm] = useState<InstrumentCreate>(emptyForm());
  const [maintTarget, setMaintTarget] = useState<InstrumentRead | null>(null);
  const [maintForm, setMaintForm] = useState<MaintenanceLogCreate>({ action: "", notes: null, performed_at: new Date().toISOString() });
  const [deleteTarget, setDeleteTarget] = useState<InstrumentRead | null>(null);

  const { data: instruments = [], isLoading } = useInstruments();
  const create = useCreateInstrument();
  const update = useUpdateInstrument();
  const remove = useDeleteInstrument();
  const logMaint = useLogMaintenance();

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setOpen(true); };
  const openEdit = async (i: InstrumentRead) => {
    const full = await instrumentsApi.get(i.id);
    setEditing(full);
    setForm({ name: full.name, code: full.code, manufacturer: full.manufacturer ?? null, model_number: full.model_number ?? null, serial_number: full.serial_number ?? null, location: full.location ?? null, description: full.description ?? null, notes: full.notes ?? null });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) await update.mutateAsync({ id: editing.id, data: form });
    else await create.mutateAsync(form);
    setOpen(false);
  };

  const handleMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintTarget) return;
    await logMaint.mutateAsync({ id: maintTarget.id, data: maintForm });
    setMaintTarget(null);
  };

  const set = (field: keyof InstrumentCreate, v: string | null) => setForm((f) => ({ ...f, [field]: v || null }));

  return (
    <LimsPageLayout
      title="Instruments"
      description="Laboratory instrument registry"
      actionLabel="Add Instrument"
      onAction={openCreate}
    >
      <LimsTable
        data={instruments}
        isLoading={isLoading}
        emptyMessage="No instruments registered yet."
        columns={[
          { header: "Name", render: (i) => <span className="font-medium">{i.name}</span> },
          { header: "Code", render: (i) => <span className="font-mono text-xs">{i.code}</span> },
          { header: "Manufacturer", render: (i) => <span className="text-slate-500">{i.manufacturer ?? "—"}</span> },
          { header: "Serial #", render: (i) => <span className="font-mono text-xs text-slate-500">{i.serial_number ?? "—"}</span> },
          { header: "Status", render: (i) => <LimsStatusBadge status={i.status} /> },
          { header: "Calibration", render: (i) => <LimsStatusBadge status={i.calibration_status} /> },
          {
            header: "",
            className: "w-10",
            render: (i) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(i)}><Pencil className="h-3.5 w-3.5 mr-2" /> Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setMaintTarget(i); setMaintForm({ action: "", notes: null, performed_at: new Date().toISOString() }); }}>
                    <Wrench className="h-3.5 w-3.5 mr-2" /> Log Maintenance
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={() => setDeleteTarget(i)}><Trash2 className="h-3.5 w-3.5 mr-2" /> Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
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
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={create.isPending || update.isPending}>{editing ? "Save" : "Add Instrument"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!maintTarget} onOpenChange={() => setMaintTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Log Maintenance — {maintTarget?.name}</DialogTitle></DialogHeader>
          <form onSubmit={handleMaintenance} className="space-y-3 mt-2">
            <div className="space-y-1"><Label>Action *</Label><Input required value={maintForm.action} onChange={(e) => setMaintForm((f) => ({ ...f, action: e.target.value }))} placeholder="e.g. Calibration, cleaning, repair…" /></div>
            <div className="space-y-1"><Label>Performed At *</Label><Input required type="datetime-local" value={maintForm.performed_at.slice(0, 16)} onChange={(e) => setMaintForm((f) => ({ ...f, performed_at: e.target.value ? new Date(e.target.value).toISOString() : f.performed_at }))} /></div>
            <div className="space-y-1"><Label>Notes</Label><Textarea rows={2} value={maintForm.notes ?? ""} onChange={(e) => setMaintForm((f) => ({ ...f, notes: e.target.value || null }))} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setMaintTarget(null)}>Cancel</Button>
              <Button type="submit" disabled={logMaint.isPending}>Log</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Instrument</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">Delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" disabled={remove.isPending} onClick={() => { remove.mutateAsync(deleteTarget!.id); setDeleteTarget(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LimsPageLayout>
  );
}
