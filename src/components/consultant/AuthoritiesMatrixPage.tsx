"use client";

import React from "react";
import { ShieldCheck, Lock, Loader2 } from "lucide-react";
import { useRolesList, usePermissionsList, useTogglePermission } from "@/features/consultant/consultant.queries";
import type { RoleRead, PermissionRead } from "@/features/consultant/consultant.api";

export default function AuthoritiesMatrixPage() {
  const { data: roles = [], isLoading: rolesLoading } = useRolesList();
  const { data: permissions = [], isLoading: permsLoading } = usePermissionsList();
  const updateMatrix = useTogglePermission();

  const handleToggle = (roleId: number, permissionCode: string, isEnabled: boolean) => {
    updateMatrix.mutate({ roleId, permissionCode, action: isEnabled ? "disconnect" : "connect" });
  };

  if (rolesLoading || permsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 text-slate-500">
        <Loader2 className="animate-spin mb-2" size={32} />
        <p>Loading Matrix Infrastructure...</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <header className="border-b pb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phase 2</span>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Authorities Matrix</h1>
        </div>
        <p className="text-gray-500 font-medium italic">
          Define access control for all laboratory roles. Changes are instant.
        </p>
      </header>

      <div className="bg-white border rounded-2xl shadow-xl overflow-x-auto overflow-y-visible">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="p-6 text-sm font-black text-slate-400 uppercase tracking-wider sticky left-0 bg-slate-50 z-30 border-r w-72 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                Capability / Action
              </th>
              {roles.map((role: RoleRead) => (
                <th key={role.id} className="p-4 min-w-16 border-r border-slate-100 last:border-r-0">
                  <div className="flex justify-center items-end h-32 pb-4">
                    <span className="[writing-mode:vertical-lr] rotate-180 text-[11px] font-bold text-blue-700 uppercase tracking-tighter text-center whitespace-nowrap">
                      {role.name.replace(/_/g, " ")}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {permissions.map((perm: PermissionRead) => (
              <tr key={perm.code} className="hover:bg-blue-50/40 transition-colors group">
                <td className="p-4 sticky left-0 bg-white group-hover:bg-blue-50 transition-colors border-r z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  <div className="font-bold text-slate-800 text-xs">{perm.description || perm.code}</div>
                  <div className="text-[9px] font-mono text-slate-400 uppercase mt-0.5">{perm.code}</div>
                </td>
                {roles.map((role: RoleRead) => {
                  const hasPermission = role.permissions?.some((p) => p.code === perm.code);
                  const isCurrentAction =
                    updateMatrix.isPending &&
                    updateMatrix.variables?.roleId === role.id &&
                    updateMatrix.variables?.permissionCode === perm.code;

                  return (
                    <td key={`${role.id}-${perm.code}`} className="p-2 text-center border-r border-slate-50 last:border-r-0">
                      <button
                        onClick={() => handleToggle(role.id, perm.code, !!hasPermission)}
                        disabled={updateMatrix.isPending}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto transition-all duration-200 ${
                          hasPermission
                            ? "bg-green-600 text-white shadow-md hover:bg-blue-700 active:scale-90"
                            : "bg-slate-50 text-slate-300 hover:bg-slate-200 hover:text-slate-400"
                        }`}
                      >
                        {isCurrentAction ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : hasPermission ? (
                          <ShieldCheck size={20} />
                        ) : (
                          <Lock size={14} className="opacity-50" />
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <div className="bg-white p-2 rounded-lg shadow-sm">
          <ShieldCheck className="text-blue-600" size={20} />
        </div>
        <div className="text-xs text-slate-500 leading-relaxed">
          <span className="font-bold text-slate-700">Matrix Tip: </span>
          Scroll horizontally to view all roles. Changes propagate to users on their next action.
        </div>
      </div>
    </div>
  );
}
