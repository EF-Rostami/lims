"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { LimsPageLayout } from "@/features/lims/components/LimsPageLayout";
import { LimsTable } from "@/features/lims/components/LimsTable";
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from "./departments.queries";
import type { DepartmentRead, DepartmentCreate, DepartmentUpdate } from "./departments.api";

const emptyCreate = (): DepartmentCreate => ({ name: "", code: "", parent_id: null });

export function DepartmentsPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<DepartmentRead | null>(null);
  const [form, setForm] = useState<DepartmentCreate>(emptyCreate());
  const [deleteTarget, setDeleteTarget] = useState<DepartmentRead | null>(null);

  const { data: departments = [], isLoading } = useDepartments();
  const create = useCreateDepartment();
  const update = useUpdateDepartment();
  const remove = useDeleteDepartment();

  const openCreate = () => { setEditing(null); setForm(emptyCreate()); setOpen(true); };
  const openEdit = (d: DepartmentRead) => {
    setEditing(d);
    setForm({ name: d.name, code: d.code, parent_id: d.parent_id ?? null });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      const payload: DepartmentUpdate = { name: form.name, code: form.code, parent_id: form.parent_id };
      await update.mutateAsync({ id: editing.id, data: payload });
    } else {
      await create.mutateAsync(form);
    }
    setOpen(false);
  };

  const parentName = (id: number | null | undefined) => {
    if (!id) return "—";
    return departments.find((d) => d.id === id)?.name ?? `#${id}`;
  };

  return (
    <LimsPageLayout
      title="Departments"
      description="Organisational units within the laboratory"
      actionLabel="New Department"
      onAction={openCreate}
    >
      <LimsTable
        data={departments}
        isLoading={isLoading}
        emptyMessage="No departments configured."
        columns={[
          { header: "Name", render: (d) => <span className="font-medium">{d.name}</span> },
          { header: "Code", render: (d) => <span className="font-mono text-sm">{d.code}</span> },
          { header: "Parent", render: (d) => <span className="text-slate-500 text-sm">{parentName(d.parent_id)}</span> },
          { header: "Sub-departments", render: (d) => <span className="text-slate-400 text-xs">{d.children.length > 0 ? `${d.children.length} child(ren)` : "—"}</span> },
          {
            header: "",
            className: "w-20 text-right",
            render: (d) => (
              <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(d)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => setDeleteTarget(d)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Edit Department" : "New Department"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 mt-2">
            <div className="space-y-1"><Label>Name *</Label><Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Code *</Label><Input required value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} /></div>
            <div className="space-y-1">
              <Label>Parent Department</Label>
              <Select
                value={form.parent_id?.toString() ?? "none"}
                onValueChange={(v) => setForm((f) => ({ ...f, parent_id: v === "none" ? null : Number(v) }))}
              >
                <SelectTrigger><SelectValue placeholder="None (top-level)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (top-level)</SelectItem>
                  {departments
                    .filter((d) => !editing || d.id !== editing.id)
                    .map((d) => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={create.isPending || update.isPending}>
                {editing ? "Save" : <><Plus className="h-3.5 w-3.5 mr-1" />Create</>}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Department</DialogTitle></DialogHeader>
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
