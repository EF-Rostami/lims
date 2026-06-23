"use client";

import { useState } from "react";
import { Plus, UserCheck, UserX, ShieldPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { LimsPageLayout } from "@/features/lims/components/LimsPageLayout";
import { LimsTable } from "@/features/lims/components/LimsTable";
import { LimsStatusBadge } from "@/features/lims/components/LimsStatusBadge";
import { useUsers, useCreateUser, useAssignRole, useRemoveRole, useUser } from "./users.queries";
import { useRoles } from "@/features/lims/roles/roles.queries";
import type { TenantUserCreate, UserRead } from "./users.api";

const CONSULTANT_ROLES = ["consultant", "lead_auditor"] as const;
type ConsultantRole = (typeof CONSULTANT_ROLES)[number];

const ROLE_LABELS: Record<ConsultantRole, string> = {
  consultant: "Consultant",
  lead_auditor: "Lead Auditor",
};

const emptyForm = (): TenantUserCreate => ({
  email: "",
  username: null,
  password: "",
  employee_id_number: "",
  first_name: "",
  last_name: "",
  role_ids: [],
});

function ManageRolesDialog({
  user,
  open,
  onClose,
}: {
  user: UserRead;
  open: boolean;
  onClose: () => void;
}) {
  const { data: detail } = useUser(user.id);
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();

  const currentRoles: string[] = detail?.roles ?? user.roles ?? [];

  const toggle = async (roleName: ConsultantRole) => {
    if (currentRoles.includes(roleName)) {
      await removeRole.mutateAsync({ userId: user.id, roleName });
    } else {
      await assignRole.mutateAsync({ userId: user.id, roleName });
    }
  };

  const isPending = assignRole.isPending || removeRole.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Manage Consultant Roles</DialogTitle>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </DialogHeader>
        <div className="space-y-3 py-2">
          {CONSULTANT_ROLES.map((role) => {
            const assigned = currentRoles.includes(role);
            return (
              <div key={role} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="text-sm font-medium">{ROLE_LABELS[role]}</p>
                  <p className="text-xs text-muted-foreground">
                    {role === "consultant"
                      ? "Manage projects, assessments, lifecycle transitions"
                      : "All consultant rights + approve go-live"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={assigned ? "destructive" : "outline"}
                  disabled={isPending}
                  onClick={() => toggle(role)}
                >
                  {assigned ? "Remove" : "Assign"}
                </Button>
              </div>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function UsersPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<TenantUserCreate>(emptyForm());
  const [manageUser, setManageUser] = useState<UserRead | null>(null);

  const { data: users = [], isLoading } = useUsers();
  const { data: roles = [] } = useRoles();
  const create = useCreateUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync(form);
    setCreateOpen(false);
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
      onAction={() => { setForm(emptyForm()); setCreateOpen(true); }}
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
          {
            header: "Consultant Roles",
            render: (u) => {
              const consultantRoles = (u.roles ?? []).filter((r) =>
                CONSULTANT_ROLES.includes(r as ConsultantRole)
              );
              return consultantRoles.length > 0 ? (
                <span className="text-xs text-blue-700 font-medium">
                  {consultantRoles.map((r) => ROLE_LABELS[r as ConsultantRole] ?? r).join(", ")}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              );
            },
          },
          {
            header: "",
            render: (u) => (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 gap-1 text-xs"
                onClick={() => setManageUser(u)}
              >
                <ShieldPlus className="h-3 w-3" />
                Roles
              </Button>
            ),
          },
        ]}
      />

      {/* Create user dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
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
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={create.isPending}><Plus className="h-3.5 w-3.5 mr-1" />Create User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Manage roles dialog */}
      {manageUser && (
        <ManageRolesDialog
          user={manageUser}
          open={!!manageUser}
          onClose={() => setManageUser(null)}
        />
      )}
    </LimsPageLayout>
  );
}
