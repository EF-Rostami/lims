"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LimsPageLayout } from "@/features/lims/components/LimsPageLayout";
import { LimsTable } from "@/features/lims/components/LimsTable";
import { LimsStatusBadge } from "@/features/lims/components/LimsStatusBadge";
import { useMethods, useCreateMethod, useUpdateMethod, useDeleteMethod } from "./methods.queries";
import { methodsApi } from "./methods.api";
import type { TestMethodRead, TestMethodCreate } from "./methods.api";

// const STATUSES = ["DRAFT", "ACTIVE", "UNDER_REVIEW", "DEPRECATED"] as const;

const emptyForm = (): TestMethodCreate => ({
  code: "",
  name: "",
  description: null,
  version: "1.0",
  instrument_id: null,
  sample_type_id: null,
  reference_range_male: null,
  reference_range_female: null,
  reference_range_default: null,
  unit: null,
});

export function MethodsPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TestMethodRead | null>(null);
  const [form, setForm] = useState<TestMethodCreate>(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState<TestMethodRead | null>(null);

  const { data: methods = [], isLoading } = useMethods();
  const create = useCreateMethod();
  const update = useUpdateMethod();
  const remove = useDeleteMethod();

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setOpen(true); };
  const openEdit = async (m: TestMethodRead) => {
    const full = await methodsApi.get(m.id);
    setEditing(full);
    setForm({
      code: full.code,
      name: full.name,
      description: full.description ?? null,
      version: full.version,
      instrument_id: full.instrument_id ?? null,
      sample_type_id: full.sample_type_id ?? null,
      reference_range_male: full.reference_range_male ?? null,
      reference_range_female: full.reference_range_female ?? null,
      reference_range_default: full.reference_range_default ?? null,
      unit: full.unit ?? null,
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) await update.mutateAsync({ id: editing.id, data: form });
    else await create.mutateAsync(form);
    setOpen(false);
  };

  const s = (field: keyof TestMethodCreate, v: string | null) => setForm((f) => ({ ...f, [field]: v || null }));

  return (
    <LimsPageLayout
      title="Test Methods"
      description="Define analytical methods and reference ranges"
      actionLabel="Add Method"
      onAction={openCreate}
    >
      <LimsTable
        data={methods}
        isLoading={isLoading}
        emptyMessage="No methods defined yet."
        columns={[
          { header: "Code", render: (m) => <span className="font-mono text-xs font-medium">{m.code}</span> },
          { header: "Name", render: (m) => <span className="font-medium">{m.name}</span> },
          { header: "Version", render: (m) => <span className="text-slate-500">{m.version}</span> },
          { header: "Unit", render: (m) => <span className="text-slate-500">{m.unit ?? "—"}</span> },
          { header: "Ref. Range", render: (m) => <span className="text-slate-500 text-xs">{m.reference_range_default ?? "—"}</span> },
          { header: "Status", render: (m) => <LimsStatusBadge status={m.status} /> },
          {
            header: "",
            className: "w-10",
            render: (m) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(m)}><Pencil className="h-3.5 w-3.5 mr-2" />Edit</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={() => setDeleteTarget(m)}><Trash2 className="h-3.5 w-3.5 mr-2" />Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Method" : "Add Method"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Code *</Label><Input required value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Version</Label><Input value={form.version} onChange={(e) => setForm((f) => ({ ...f, version: e.target.value }))} /></div>
            </div>
            <div className="space-y-1"><Label>Name *</Label><Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Description</Label><Textarea rows={2} value={form.description ?? ""} onChange={(e) => s("description", e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Unit</Label><Input value={form.unit ?? ""} onChange={(e) => s("unit", e.target.value)} /></div>
              <div className="space-y-1"><Label>Default Ref. Range</Label><Input value={form.reference_range_default ?? ""} onChange={(e) => s("reference_range_default", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Male Range</Label><Input value={form.reference_range_male ?? ""} onChange={(e) => s("reference_range_male", e.target.value)} /></div>
              <div className="space-y-1"><Label>Female Range</Label><Input value={form.reference_range_female ?? ""} onChange={(e) => s("reference_range_female", e.target.value)} /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={create.isPending || update.isPending}>{editing ? "Save" : "Add Method"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Method</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">Delete <strong>{deleteTarget?.name}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" disabled={remove.isPending} onClick={() => { remove.mutateAsync(deleteTarget!.id); setDeleteTarget(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LimsPageLayout>
  );
}
