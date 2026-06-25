"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, KeyRound, ChevronDown, UserCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { tenantsApi } from "@/features/saas/tenants/tenants.api";
import { tenantUsersApi, type CreateTenantUserPayload, type TenantUser, type SeedDemoResult } from "@/features/saas/tenant-users/tenant-users.api";

const ROLE_OPTIONS = [
  "admin",
  "head_of_laboratory",
  "quality_manager",
  "technical_manager",
  "hr",
  "analyst",
  "technician",
  "consultant",
  "auditor",
  "guest",
];

function RoleBadge({ role }: { role: string | null }) {
  if (!role) return <span className="text-slate-400">—</span>;
  const label = role.replace(/_/g, " ");
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 capitalize">
      {label}
    </span>
  );
}

type CreateFormState = {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
};

const emptyForm: CreateFormState = { email: "", password: "", first_name: "", last_name: "", role: "analyst" };

export default function TenantUsersPage() {
  const qc = useQueryClient();
  const [selectedTenantId, setSelectedTenantId] = useState<string>("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateFormState>(emptyForm);
  const [resetTarget, setResetTarget] = useState<TenantUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);
  const [seedResult, setSeedResult] = useState<SeedDemoResult | null>(null);

  const { data: tenants = [] } = useQuery({
    queryKey: ["saas", "tenants"],
    queryFn: tenantsApi.list,
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["saas", "tenant-users", selectedTenantId],
    queryFn: () => tenantUsersApi.list(selectedTenantId),
    enabled: !!selectedTenantId,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateTenantUserPayload) => tenantUsersApi.create(selectedTenantId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saas", "tenant-users", selectedTenantId] });
      setShowCreate(false);
      setForm(emptyForm);
      setFormError(null);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Failed to create user";
      setFormError(msg);
    },
  });

  const resetMutation = useMutation({
    mutationFn: ({ userId, password }: { userId: number; password: string }) =>
      tenantUsersApi.resetPassword(selectedTenantId, userId, { new_password: password }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["saas", "tenant-users", selectedTenantId] });
      setResetTarget(null);
      setNewPassword("");
    },
  });

  const seedDemoMutation = useMutation({
    mutationFn: () => tenantUsersApi.seedDemo(selectedTenantId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["saas", "tenant-users", selectedTenantId] });
      setShowSeedConfirm(false);
      setSeedResult(data);
    },
  });

  const activeTenants = tenants.filter((t) => t.status === "ACTIVE");

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Tenant Users</h1>
        <p className="mt-1 text-sm text-slate-500">
          View and manage users inside any active tenant.
        </p>
      </div>

      {/* Tenant selector */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <select
            value={selectedTenantId}
            onChange={(e) => { setSelectedTenantId(e.target.value); setShowCreate(false); }}
            className="appearance-none rounded-lg border border-slate-300 bg-white pl-4 pr-10 py-2.5 text-sm font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400 min-w-[220px]"
          >
            <option value="">Select a tenant…</option>
            {activeTenants.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        </div>

        {selectedTenantId && (
          <button
            onClick={() => { setShowCreate(true); setForm(emptyForm); setFormError(null); }}
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-800 mb-4">New User</h2>
          {formError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            {(["first_name", "last_name", "email", "password"] as const).map((field) => (
              <div key={field} className={field === "email" || field === "password" ? "col-span-2 sm:col-span-1" : ""}>
                <label className="block text-xs font-medium text-slate-600 mb-1 capitalize">
                  {field.replace("_", " ")}
                </label>
                <input
                  type={field === "password" ? "password" : "text"}
                  value={form[field]}
                  onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  placeholder={field === "password" ? "Temporary password" : ""}
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-2 justify-end">
            <button
              onClick={() => { setShowCreate(false); setFormError(null); }}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={() => createMutation.mutate(form)}
              disabled={createMutation.isPending || !form.email || !form.password || !form.first_name || !form.last_name}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
            >
              {createMutation.isPending ? "Creating…" : "Create User"}
            </button>
          </div>
        </div>
      )}

      {/* Password reset modal */}
      {resetTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-xl bg-white shadow-xl p-6 w-full max-w-sm">
            <h2 className="text-sm font-semibold text-slate-800 mb-1">Reset Password</h2>
            <p className="text-xs text-slate-500 mb-4">
              Set a new password for <span className="font-medium">{resetTarget.email}</span>
            </p>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <div className="mt-4 flex gap-2 justify-end">
              <button
                onClick={() => { setResetTarget(null); setNewPassword(""); }}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => resetMutation.mutate({ userId: resetTarget.id, password: newPassword })}
                disabled={resetMutation.isPending || !newPassword}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
              >
                {resetMutation.isPending ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seed-demo confirmation modal */}
      {showSeedConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-xl bg-white shadow-xl p-6 w-full max-w-sm">
            <div className="flex items-start gap-3 mb-4">
              <div className="rounded-full bg-red-100 p-2 flex-none">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Reset Demo Data?</h2>
                <p className="mt-1 text-xs text-slate-500">
                  This will <span className="font-semibold text-red-600">permanently delete all existing data</span> in
                  this tenant and re-seed it with fresh demo data. This cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowSeedConfirm(false)}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => seedDemoMutation.mutate()}
                disabled={seedDemoMutation.isPending}
                className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {seedDemoMutation.isPending ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Resetting…
                  </>
                ) : (
                  "Yes, Reset All Data"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users table */}
      {!selectedTenantId ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-12 flex flex-col items-center gap-3 text-center">
          <div className="rounded-full bg-slate-100 p-4">
            <Users className="h-7 w-7 text-slate-400" />
          </div>
          <p className="text-sm text-slate-500">Select a tenant to see its users.</p>
        </div>
      ) : usersLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-8 text-center text-sm text-slate-400 animate-pulse">
          Loading users…
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-8 text-center text-sm text-slate-400">
          No users found in this tenant.
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <UserCircle className="h-4 w-4 text-slate-400" />
              Users
            </h2>
            <span className="text-xs text-slate-400">{users.length} total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {u.first_name || u.last_name ? `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim() : "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${u.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => { setResetTarget(u); setNewPassword(""); }}
                        className="flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                        Reset Password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Seed result banner */}
      {seedResult && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 flex items-center justify-between">
          <span>
            Demo reset complete — <span className="font-medium">{seedResult.tables_cleared} tables cleared</span>,
            demo user: <span className="font-medium">{seedResult.demo_email}</span>
          </span>
          <button onClick={() => setSeedResult(null)} className="text-green-600 hover:text-green-800 text-xs underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Danger Zone */}
      {selectedTenantId && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-sm font-semibold text-red-800 flex items-center gap-2 mb-1">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </h2>
          <p className="text-xs text-red-700 mb-4">
            Irreversible actions that affect all data in the selected tenant.
          </p>
          <div className="flex items-center justify-between rounded-lg border border-red-200 bg-white px-4 py-3">
            <div>
              <p className="text-sm font-medium text-slate-800">Reset demo data</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Wipe all tenant data and re-seed with fresh LIMS demo data.
              </p>
            </div>
            <button
              onClick={() => setShowSeedConfirm(true)}
              className="flex items-center gap-2 rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reset Demo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
