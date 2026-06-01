"use client";

import { useState } from "react";
import { Plus, UserCheck, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { LimsPageLayout } from "@/features/lims/components/LimsPageLayout";
import { LimsTable } from "@/features/lims/components/LimsTable";
import { LimsStatusBadge } from "@/features/lims/components/LimsStatusBadge";
import { useUsers, useCreateUser } from "./users.queries";
import { useRoles } from "@/features/lims/roles/roles.queries";
import type { TenantUserCreate } from "./users.api";

const emptyForm = (): TenantUserCreate => ({
  email: "",
  username: null,
  password: "",
  employee_id_number: "",
  first_name: "",
  last_name: "",
  role_ids: [],
});

export function UsersPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<TenantUserCreate>(emptyForm());

  const { data: users = [], isLoading } = useUsers();
  const { data: roles = [] } = useRoles();
  const create = useCreateUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync(form);
    setOpen(false);
    setForm(emptyForm());
  };

  const toggleRole = (roleId: number) => {
    setForm((f) => ({
      ...f,
      role_ids: f.role_ids.includes(roleId)
        ? f.role_ids.filter((id) => id !== roleId)
        : [...f.role_ids, roleId],
    }));
  };

  return (
    <LimsPageLayout
      title="Users"
      description="Lab personnel and access management"
      actionLabel="New User"
      onAction={() => { setForm(emptyForm()); setOpen(true); }}
    >
      <LimsTable
        data={users}
        isLoading={isLoading}
        emptyMessage="No users found."
        columns={[
          { header: "Email", render: (u) => <span className="font-medium">{u.email}</span> },
          { header: "Type", render: (u) => <LimsStatusBadge status={u.user_type} /> },
          {
            header: "Status",
            render: (u) => u.is_active
              ? <span className="inline-flex items-center gap-1 text-xs text-green-700"><UserCheck className="h-3 w-3" />Active</span>
              : <span className="inline-flex items-center gap-1 text-xs text-red-600"><UserX className="h-3 w-3" />Inactive</span>,
          },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New User</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>First Name *</Label><Input required value={form.first_name} onChange={(e) => setForm((f) => ({ ...f, first_name: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Last Name *</Label><Input required value={form.last_name} onChange={(e) => setForm((f) => ({ ...f, last_name: e.target.value }))} /></div>
            </div>
            <div className="space-y-1"><Label>Email *</Label><Input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Employee ID *</Label><Input required value={form.employee_id_number} onChange={(e) => setForm((f) => ({ ...f, employee_id_number: e.target.value }))} /></div>
              <div className="space-y-1"><Label>Username</Label><Input value={form.username ?? ""} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value || null }))} /></div>
            </div>
            <div className="space-y-1"><Label>Password *</Label><Input required type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} /></div>
            {roles.length > 0 && (
              <div className="space-y-1">
                <Label>Roles</Label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {roles.map((r) => (
                    <label key={r.id} className="flex items-center gap-1.5 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.role_ids.includes(r.id)}
                        onChange={() => toggleRole(r.id)}
                      />
                      {r.name}
                    </label>
                  ))}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={create.isPending}><Plus className="h-3.5 w-3.5 mr-1" />Create User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </LimsPageLayout>
  );
}
