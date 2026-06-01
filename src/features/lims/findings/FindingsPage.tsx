"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, CheckCircle } from "lucide-react";
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
import { useFindings, useCreateFinding, useUpdateFinding, useResolveFinding } from "./findings.queries";
import { findingsApi } from "./findings.api";
import type { FindingRead, FindingCreate } from "./findings.api";

const SEVERITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

const emptyForm = (): FindingCreate => ({
  title: "",
  description: "",
  severity: "MEDIUM",
  entity_type: null,
  entity_id: null,
  assigned_to_user_id: null,
  due_date: null,
});

export function FindingsPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<FindingRead | null>(null);
  const [form, setForm] = useState<FindingCreate>(emptyForm());
  const [resolveTarget, setResolveTarget] = useState<FindingRead | null>(null);
  const [resolution, setResolution] = useState("");

  const { data: findings = [], isLoading } = useFindings();
  const create = useCreateFinding();
  const update = useUpdateFinding();
  const resolve = useResolveFinding();

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setOpen(true); };
  const openEdit = async (f: FindingRead) => {
    const full = await findingsApi.get(f.id);
    setEditing(full);
    setForm({ title: full.title, description: full.description, severity: full.severity, entity_type: full.entity_type ?? null, entity_id: full.entity_id ?? null, assigned_to_user_id: full.assigned_to_user_id ?? null, due_date: full.due_date ?? null });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) await update.mutateAsync({ id: editing.id, data: form });
    else await create.mutateAsync(form);
    setOpen(false);
  };

  const handleResolve = async () => {
    if (!resolveTarget) return;
    await resolve.mutateAsync({ id: resolveTarget.id, data: { corrective_action: resolution } });
    setResolveTarget(null);
    setResolution("");
  };

  return (
    <LimsPageLayout
      title="Findings"
      description="Non-conformances, observations, and corrective actions"
      actionLabel="New Finding"
      onAction={openCreate}
    >
      <LimsTable
        data={findings}
        isLoading={isLoading}
        emptyMessage="No findings recorded."
        columns={[
          { header: "Title", render: (f) => <span className="font-medium">{f.title}</span> },
          { header: "Severity", render: (f) => <LimsStatusBadge status={f.severity} /> },
          { header: "Status", render: (f) => <LimsStatusBadge status={f.status} /> },
          { header: "Due", render: (f) => <span className="text-slate-500">{f.due_date ? new Date(f.due_date).toLocaleDateString() : "—"}</span> },
          { header: "Entity", render: (f) => <span className="text-slate-500 text-xs">{f.entity_type ?? "—"} {f.entity_id ? `#${f.entity_id}` : ""}</span> },
          {
            header: "",
            className: "w-10",
            render: (f) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(f)}><Pencil className="h-3.5 w-3.5 mr-2" />Edit</DropdownMenuItem>
                  {f.status !== "CLOSED" && (
                    <DropdownMenuItem onClick={() => { setResolveTarget(f); setResolution(""); }}>
                      <CheckCircle className="h-3.5 w-3.5 mr-2 text-green-600" />Resolve
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit Finding" : "New Finding"}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 mt-2">
            <div className="space-y-1"><Label>Title *</Label><Input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Description *</Label><Textarea required rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Severity</Label>
                <Select value={form.severity} onValueChange={(v) => setForm((f) => ({ ...f, severity: v as FindingCreate["severity"] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SEVERITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Due Date</Label><Input type="date" value={form.due_date ?? ""} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value || null }))} /></div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={create.isPending || update.isPending}>{editing ? "Save" : "Create Finding"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!resolveTarget} onOpenChange={() => setResolveTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Resolve Finding</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <p className="text-sm text-slate-600">Resolving: <strong>{resolveTarget?.title}</strong></p>
            <div className="space-y-1"><Label>Resolution Notes *</Label><Textarea rows={3} value={resolution} onChange={(e) => setResolution(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResolveTarget(null)}>Cancel</Button>
            <Button disabled={!resolution || resolve.isPending} onClick={handleResolve}>Mark Resolved</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LimsPageLayout>
  );
}
