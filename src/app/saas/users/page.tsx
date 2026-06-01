"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SaasPageHeader } from "@/features/saas/components/SaasPageHeader";
import { SaasDataTable } from "@/features/saas/components/SaasDataTable";
import { SaasEmptyState } from "@/features/saas/components/SaasEmptyState";
import { SaasStatusBadge } from "@/features/saas/components/SaasStatusBadge";
import {
  usersApi,
  getRoleName,
  type SaaSUser,
  type SaaSRole,
  type CreateUserPayload,
  type UpdateUserPayload,
} from "@/features/saas/users/users.api";

const ROLES: { value: SaaSRole; label: string }[] = [
  { value: "platform_owner", label: "Platform Owner" },
  { value: "platform_admin", label: "Platform Admin" },
  { value: "support_engineer", label: "Support Engineer" },
  { value: "billing_admin", label: "Billing Admin" },
];

function UserForm({
  user,
  onClose,
}: {
  user: SaaSUser | null;
  onClose: () => void;
}) {
  const isEdit = Boolean(user);
  const qc = useQueryClient();

  const [email, setEmail] = useState(user?.email ?? "");
  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<SaaSRole>(
    (getRoleName(user ?? { user_roles: [] } as unknown as SaaSUser) as SaaSRole) ?? "platform_admin"
  );
  const [isActive, setIsActive] = useState(user?.is_active ?? true);
  const [isSuperuser, setIsSuperuser] = useState(user?.is_superuser ?? false);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.create(payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["saas-users"] }); onClose(); },
    onError: (err) => {
      const e = err as AxiosError<{ detail?: string }>;
      setError(e.response?.data?.detail ?? e.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      usersApi.update(id, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["saas-users"] }); onClose(); },
    onError: (err) => {
      const e = err as AxiosError<{ detail?: string }>;
      setError(e.response?.data?.detail ?? e.message);
    },
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (isEdit && user) {
      updateMutation.mutate({
        id: user.id,
        payload: {
          first_name: firstName || null,
          last_name: lastName || null,
          role,
          is_active: isActive,
          is_superuser: isSuperuser,
        },
      });
    } else {
      createMutation.mutate({
        email,
        first_name: firstName || null,
        last_name: lastName || null,
        password,
        role,
        is_active: isActive,
        is_superuser: isSuperuser,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate-700">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isEdit}
            required={!isEdit}
            placeholder="admin@platform.com"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Jane"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Smith"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        {!isEdit && (
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="Min. 8 characters"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as SaaSRole)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-3 pt-1">
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={isSuperuser}
              onChange={(e) => setIsSuperuser(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300"
            />
            Super Admin
          </label>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : isEdit ? "Update User" : "Create User"}
        </button>
      </div>
    </form>
  );
}

export default function UsersPage() {
  const qc = useQueryClient();
  const [formUser, setFormUser] = useState<SaaSUser | null | undefined>(undefined);

  const { data: users = [], isLoading, error } = useQuery<SaaSUser[]>({
    queryKey: ["saas-users"],
    queryFn: usersApi.list,
    staleTime: 1000 * 60 * 5,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saas-users"] }),
  });

  function handleDelete(user: SaaSUser) {
    if (!window.confirm(`Delete user "${user.email}"? This cannot be undone.`)) return;
    deleteMutation.mutate(user.id);
  }

  const showForm = formUser !== undefined;

  return (
    <div>
      <SaasPageHeader
        title="Platform Users"
        description="Manage admin accounts that can access this console."
        actionLabel="New User"
        onAction={() => setFormUser(null)}
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Failed to load users.
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(open) => { if (!open) setFormUser(undefined); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{formUser ? "Edit User" : "New User"}</DialogTitle>
          </DialogHeader>
          {showForm && (
            <UserForm
              key={formUser?.id ?? "new"}
              user={formUser ?? null}
              onClose={() => setFormUser(undefined)}
            />
          )}
        </DialogContent>
      </Dialog>

      {isLoading && users.length === 0 ? (
        <div className="rounded-xl bg-white p-6 text-sm text-slate-500 shadow-sm">Loading users...</div>
      ) : users.length === 0 ? (
        <SaasEmptyState
          title="No users yet"
          description="Create the first platform admin user."
          actionLabel="Create User"
          onAction={() => setFormUser(null)}
        />
      ) : (
        <SaasDataTable
          data={users}
          columns={[
            { header: "Email", accessor: "email" },
            {
              header: "Name",
              render: (row) =>
                [row.first_name, row.last_name].filter(Boolean).join(" ") || "—",
            },
            {
              header: "Role",
              render: (row) => (
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                  {getRoleName(row)}
                </span>
              ),
            },
            {
              header: "Status",
              render: (row) => (
                <SaasStatusBadge status={row.is_active ? "active" : "inactive"} />
              ),
            },
            {
              header: "Super Admin",
              render: (row) => (
                <span className={`text-xs font-medium ${row.is_superuser ? "text-amber-600" : "text-slate-400"}`}>
                  {row.is_superuser ? "Yes" : "No"}
                </span>
              ),
            },
            {
              header: "Joined",
              render: (row) => new Date(row.created_at).toLocaleDateString(),
            },
            {
              header: "Actions",
              render: (row) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => setFormUser(row)}
                    className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(row)}
                    disabled={deleteMutation.isPending}
                    className="rounded-md border border-red-300 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              ),
            },
          ]}
        />
      )}
    </div>
  );
}
