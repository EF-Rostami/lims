"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from "./clients.queries";
import { clientsApi } from "./clients.api";
import type { ClientRead, ClientCreate } from "./clients.api";

const CLIENT_TYPES = ["HOSPITAL", "CLINIC", "INDIVIDUAL", "CORPORATE", "RESEARCH", "OTHER"] as const;

const emptyForm = (): ClientCreate => ({
  name: "",
  code: "",
  client_type: "OTHER",
  contact_name: null,
  contact_email: null,
  contact_phone: null,
  address_line1: null,
  city: null,
  country: null,
  notes: null,
  contacts: [],
});

export function ClientsPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClientRead | null>(null);
  const [form, setForm] = useState<ClientCreate>(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState<ClientRead | null>(null);

  const { data: clients = [], isLoading } = useClients();
  const create = useCreateClient();
  const update = useUpdateClient();
  const remove = useDeleteClient();

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setOpen(true);
  };

  const openEdit = async (c: ClientRead) => {
    const full = await clientsApi.get(c.id);
    setEditing(full);
    setForm({
      name: full.name,
      code: full.code,
      client_type: full.client_type,
      contact_name: full.contact_name ?? null,
      contact_email: full.contact_email ?? null,
      contact_phone: full.contact_phone ?? null,
      address_line1: full.address_line1 ?? null,
      city: full.city ?? null,
      country: full.country ?? null,
      notes: full.notes ?? null,
      contacts: [],
    });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await update.mutateAsync({ id: editing.id, data: form });
    } else {
      await create.mutateAsync(form);
    }
    setOpen(false);
  };

  const confirmDelete = async () => {
    if (deleteTarget) {
      await remove.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    }
  };

  const set = (field: keyof ClientCreate, value: string | null) =>
    setForm((f) => ({ ...f, [field]: value || null }));

  return (
    <LimsPageLayout
      title="Clients"
      description="External clients and referring organisations"
      actionLabel="Add Client"
      onAction={openCreate}
    >
      <LimsTable
        data={clients}
        isLoading={isLoading}
        emptyMessage="No clients yet. Add your first client."
        columns={[
          { header: "Name", render: (c) => <span className="font-medium">{c.name}</span> },
          { header: "Code", render: (c) => <span className="font-mono text-xs">{c.code}</span> },
          { header: "Type", render: (c) => <LimsStatusBadge status={c.client_type} /> },
          { header: "Contact", render: (c) => <span className="text-slate-500">{c.contact_email ?? c.contact_phone ?? "—"}</span> },
          { header: "Active", render: (c) => <LimsStatusBadge status={c.is_active ? "ACTIVE" : "INACTIVE"} /> },
          {
            header: "",
            className: "w-10",
            render: (c) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(c)}>
                    <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={() => setDeleteTarget(c)}>
                    <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
      />

      {/* Create / Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Client" : "New Client"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Name *</Label>
                <Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Code *</Label>
                <Input required value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select value={form.client_type} onValueChange={(v) => setForm((f) => ({ ...f, client_type: v as ClientCreate["client_type"] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CLIENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Contact Name</Label>
                <Input value={form.contact_name ?? ""} onChange={(e) => set("contact_name", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Contact Email</Label>
                <Input type="email" value={form.contact_email ?? ""} onChange={(e) => set("contact_email", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input value={form.contact_phone ?? ""} onChange={(e) => set("contact_phone", e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>City</Label>
                <Input value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea rows={2} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={create.isPending || update.isPending}>
                {editing ? "Save Changes" : "Create Client"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Client</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={remove.isPending}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LimsPageLayout>
  );
}
