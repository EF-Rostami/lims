"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SaasStatusBadge } from "@/features/saas/components/SaasStatusBadge";
import { membersApi, type MemberRole, type OrgMember } from "./members.api";
import { usersApi, type SaaSUser } from "@/features/saas/users/users.api";
import type { Organization } from "@/generated/saas/models";

const ROLES: MemberRole[] = ["OWNER", "ADMIN", "BILLING_MANAGER", "VIEWER"];

function roleLabel(role: MemberRole) {
  return role.charAt(0) + role.slice(1).toLowerCase().replace("_", " ");
}

function memberStatusVariant(status: string): "active" | "inactive" | "pending" {
  if (status === "ACTIVE") return "active";
  if (status === "INVITED") return "pending";
  return "inactive";
}

type Props = {
  organization: Organization | null;
  onClose: () => void;
};

export function OrgMembersModal({ organization, onClose }: Props) {
  const qc = useQueryClient();
  const open = Boolean(organization);

  const [addUserId, setAddUserId] = useState("");
  const [addRole, setAddRole] = useState<MemberRole>("VIEWER");
  const [addError, setAddError] = useState<string | null>(null);

  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: ["members", organization?.id],
    queryFn: () => membersApi.listByOrg(organization!.id),
    enabled: Boolean(organization),
  });

  const { data: users = [] } = useQuery<SaaSUser[]>({
    queryKey: ["saas-users"],
    queryFn: usersApi.list,
    staleTime: 1000 * 60 * 5,
    enabled: Boolean(organization),
  });

  const memberUserIds = new Set(members.map((m) => m.saas_user_id));
  const availableUsers = users.filter((u) => !memberUserIds.has(u.id));

  const userEmailById = new Map(users.map((u) => [u.id, u.email]));

  const addMutation = useMutation({
    mutationFn: (payload: Parameters<typeof membersApi.add>[0]) => membersApi.add(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["members", organization?.id] });
      setAddUserId("");
      setAddRole("VIEWER");
      setAddError(null);
    },
    onError: (err) => {
      const e = err as AxiosError<{ detail?: string }>;
      setAddError(e.response?.data?.detail ?? e.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof membersApi.update>[1] }) =>
      membersApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members", organization?.id] }),
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) => membersApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["members", organization?.id] }),
  });

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!organization || !addUserId) return;
    addMutation.mutate({ organization_id: organization.id, saas_user_id: addUserId, role: addRole });
  }

  function handleRoleChange(member: OrgMember, role: MemberRole) {
    updateMutation.mutate({ id: member.id, payload: { role } });
  }

  function handleRemove(member: OrgMember) {
    if (!window.confirm(`Remove ${userEmailById.get(member.saas_user_id) ?? member.saas_user_id} from this organization?`))
      return;
    removeMutation.mutate(member.id);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Members — {organization?.name}</DialogTitle>
        </DialogHeader>

        {/* Add member form */}
        <form onSubmit={handleAdd} className="flex gap-2 border-b border-slate-100 pb-4">
          <select
            value={addUserId}
            onChange={(e) => setAddUserId(e.target.value)}
            required
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Select user to add...</option>
            {availableUsers.map((u) => (
              <option key={u.id} value={u.id}>{u.email}</option>
            ))}
          </select>
          <select
            value={addRole}
            onChange={(e) => setAddRole(e.target.value as MemberRole)}
            className="w-40 rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            {ROLES.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
          </select>
          <button
            type="submit"
            disabled={addMutation.isPending || !addUserId}
            className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            Add
          </button>
        </form>

        {addError && (
          <p className="text-sm text-red-600">{addError}</p>
        )}

        {availableUsers.length === 0 && users.length > 0 && (
          <p className="text-xs text-slate-400">All platform users are already members of this organization.</p>
        )}

        {/* Members list */}
        {membersLoading ? (
          <p className="py-4 text-sm text-slate-500">Loading members...</p>
        ) : members.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-500">No members yet.</p>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-2 py-2">User</th>
                  <th className="px-2 py-2">Role</th>
                  <th className="px-2 py-2">Status</th>
                  <th className="px-2 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.map((m) => (
                  <tr key={m.id} className="text-slate-700">
                    <td className="px-2 py-2.5 text-xs">{userEmailById.get(m.saas_user_id) ?? m.saas_user_id.slice(0, 8)}</td>
                    <td className="px-2 py-2.5">
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m, e.target.value as MemberRole)}
                        disabled={updateMutation.isPending}
                        className="rounded border border-slate-200 px-2 py-1 text-xs"
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{roleLabel(r)}</option>)}
                      </select>
                    </td>
                    <td className="px-2 py-2.5">
                      <SaasStatusBadge status={memberStatusVariant(m.status)} />
                    </td>
                    <td className="px-2 py-2.5 text-right">
                      <button
                        onClick={() => handleRemove(m)}
                        disabled={removeMutation.isPending}
                        className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
