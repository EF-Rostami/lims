"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { LimsPageLayout } from "@/features/lims/components/LimsPageLayout";
import { LimsTable } from "@/features/lims/components/LimsTable";
import { useSettings, useCreateSetting, useUpdateSetting, useDeleteSetting } from "./settings.queries";
import type { SettingListItem, SettingCreate, SettingUpdate } from "./settings.api";

const emptyCreate = (): SettingCreate => ({
  key: "",
  value: null,
  value_json: undefined,
  description: null,
  is_secret: false,
});

export function SettingsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SettingListItem | null>(null);
  const [editValue, setEditValue] = useState("");
  const [createForm, setCreateForm] = useState<SettingCreate>(emptyCreate());
  const [deleteTarget, setDeleteTarget] = useState<SettingListItem | null>(null);

  const { data: settings = [], isLoading } = useSettings();
  const create = useCreateSetting();
  const update = useUpdateSetting();
  const remove = useDeleteSetting();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync(createForm);
    setCreateOpen(false);
    setCreateForm(emptyCreate());
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    const payload: SettingUpdate = { value: editValue || null };
    await update.mutateAsync({ key: editTarget.key, data: payload });
    setEditTarget(null);
  };

  return (
    <LimsPageLayout
      title="Lab Settings"
      description="Key-value configuration for the laboratory"
      actionLabel="Add Setting"
      onAction={() => { setCreateForm(emptyCreate()); setCreateOpen(true); }}
    >
      <LimsTable
        data={settings}
        isLoading={isLoading}
        emptyMessage="No settings configured."
        columns={[
          { header: "Key", render: (s) => <span className="font-mono text-sm font-medium">{s.key}</span> },
          { header: "Value", render: (s) => <span className="text-slate-600">{s.is_secret ? "••••••••" : <span className="text-slate-400 italic">—</span>}</span> },
          { header: "Description", render: (s) => <span className="text-slate-500 text-sm">{s.description ?? "—"}</span> },
          { header: "Secret", render: (s) => s.is_secret ? <span className="text-xs font-medium text-orange-600">Secret</span> : null },
          {
            header: "",
            className: "w-20 text-right",
            render: (s) => (
              <div className="flex items-center justify-end gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditTarget(s); setEditValue(""); }}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => setDeleteTarget(s)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Setting</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3 mt-2">
            <div className="space-y-1"><Label>Key *</Label><Input required value={createForm.key} onChange={(e) => setCreateForm((f) => ({ ...f, key: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Value</Label><Input value={createForm.value ?? ""} onChange={(e) => setCreateForm((f) => ({ ...f, value: e.target.value || null }))} /></div>
            <div className="space-y-1"><Label>Description</Label><Textarea rows={2} value={createForm.description ?? ""} onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value || null }))} /></div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={createForm.is_secret} onChange={(e) => setCreateForm((f) => ({ ...f, is_secret: e.target.checked }))} />
              Secret (value will be masked)
            </label>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={create.isPending}><Plus className="h-3.5 w-3.5 mr-1" /> Add</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Edit — {editTarget?.key}</DialogTitle></DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-3 mt-2">
            <div className="space-y-1"><Label>Value</Label><Input value={editValue} onChange={(e) => setEditValue(e.target.value)} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
              <Button type="submit" disabled={update.isPending}>Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Setting</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">Delete <strong>{deleteTarget?.key}</strong>?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" disabled={remove.isPending} onClick={() => { remove.mutateAsync(deleteTarget!.key); setDeleteTarget(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LimsPageLayout>
  );
}
