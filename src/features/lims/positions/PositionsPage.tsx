"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { LimsPageLayout } from "@/features/lims/components/LimsPageLayout";
import { LimsTable } from "@/features/lims/components/LimsTable";
import { usePositions, useCreatePosition, useUpdatePosition, useDeletePosition } from "./positions.queries";
import { useDepartments } from "@/features/lims/departments/departments.queries";
import type { PositionRead, PositionCreate, PositionUpdate } from "./positions.api";

const emptyCreate = (): PositionCreate => ({
  title: "",
  department_id: 0,
  job_definition: null,
  reports_to_position_id: null,
  is_active: true,
});

export function PositionsPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PositionRead | null>(null);
  const [form, setForm] = useState<PositionCreate>(emptyCreate());
  const [deleteTarget, setDeleteTarget] = useState<PositionRead | null>(null);

  const { data: positions = [], isLoading } = usePositions();
  const { data: departments = [] } = useDepartments();
  const create = useCreatePosition();
  const update = useUpdatePosition();
  const remove = useDeletePosition();

  const openCreate = () => { setEditing(null); setForm(emptyCreate()); setOpen(true); };
  const openEdit = (p: PositionRead) => {
    setEditing(p);
    setForm({
      title: p.title,
      department_id: p.department_id,
      job_definition: p.job_definition ?? null,
      reports_to_position_id: p.reports_to_position_id ?? null,
      is_active: p.is_active,
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      const payload: PositionUpdate = { ...form };
      await update.mutateAsync({ id: editing.id, data: payload });
    } else {
      await create.mutateAsync(form);
    }
    setOpen(false);
  };

  const deptName = (id: number) => departments.find((d) => d.id === id)?.name ?? `Dept #${id}`;
  const posTitle = (id: number | null | undefined) => {
    if (!id) return "—";
    return positions.find((p) => p.id === id)?.title ?? `#${id}`;
  };

  return (
    <LimsPageLayout
      title="Positions"
      description="Job titles and reporting structure"
      actionLabel="New Position"
      onAction={openCreate}
    >
      <LimsTable
        data={positions}
        isLoading={isLoading}
        emptyMessage="No positions configured."
        columns={[
          { header: "Title", render: (p) => <span className="font-medium">{p.title}</span> },
          { header: "Department", render: (p) => <span className="text-slate-600 text-sm">{deptName(p.department_id)}</span> },
          { header: "Reports To", render: (p) => <span className="text-slate-500 text-sm">{posTitle(p.reports_to_position_id)}</span> },
          {
            header: "Status",
            render: (p) => p.is_active
              ? <span className="text-xs font-medium text-green-700">Active</span>
              : <span className="text-xs text-slate-400">Inactive</span>,
          },
          {
            header: "",
            className: "w-20 text-right",
            render: (p) => (
              <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(p)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => setDeleteTarget(p)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Position" : "New Position"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 mt-2">
            <div className="space-y-1"><Label>Title *</Label><Input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
            <div className="space-y-1">
              <Label>Department *</Label>
              <Select
                value={form.department_id ? form.department_id.toString() : ""}
                onValueChange={(v) => setForm((f) => ({ ...f, department_id: Number(v) }))}
              >
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Reports To</Label>
              <Select
                value={form.reports_to_position_id?.toString() ?? "none"}
                onValueChange={(v) => setForm((f) => ({ ...f, reports_to_position_id: v === "none" ? null : Number(v) }))}
              >
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {positions
                    .filter((p) => !editing || p.id !== editing.id)
                    .map((p) => <SelectItem key={p.id} value={p.id.toString()}>{p.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Job Definition</Label><Textarea rows={2} value={form.job_definition ?? ""} onChange={(e) => setForm((f) => ({ ...f, job_definition: e.target.value || null }))} /></div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_active ?? true} onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))} />
              Active
            </label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!form.department_id || create.isPending || update.isPending}>
                {editing ? "Save" : <><Plus className="h-3.5 w-3.5 mr-1" />Create</>}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Position</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">Delete <strong>{deleteTarget?.title}</strong>? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" disabled={remove.isPending} onClick={() => { remove.mutateAsync(deleteTarget!.id); setDeleteTarget(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LimsPageLayout>
  );
}
