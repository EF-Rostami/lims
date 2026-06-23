"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Settings, Users, ShieldAlert, FileText, ChevronRight,
  CheckCircle2, Lock, UserPlus, ClipboardList, Loader2, X, UserCog,
} from "lucide-react";
import { useQMSReadiness, useRolesList } from "@/features/consultant/consultant.queries";
import { useCreateUser } from "@/features/lims/users/users.queries";
import type { TenantUserCreate } from "@/features/lims/users/users.api";

const CONSULTANT_ROLES = ["consultant", "lead_auditor"] as const;

const EMPTY_FORM: TenantUserCreate = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  employee_id_number: "",
  role_ids: [],
};

export default function ConsultantPortal() {
  const { data: readiness, isLoading } = useQMSReadiness();
  const { data: roles = [] } = useRolesList();
  const createUser = useCreateUser();

  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [form, setForm] = useState<TenantUserCreate>(EMPTY_FORM);
  const [selectedRoleId, setSelectedRoleId] = useState<number | "">("");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: TenantUserCreate = {
      ...form,
      role_ids: selectedRoleId !== "" ? [Number(selectedRoleId)] : [],
    };
    createUser.mutate(payload, {
      onSuccess: () => {
        setForm(EMPTY_FORM);
        setSelectedRoleId("");
        setIsInviteOpen(false);
      },
    });
  };

  const consultantRoles = roles.filter((r) =>
    CONSULTANT_ROLES.includes(r.name as typeof CONSULTANT_ROLES[number])
  );

  if (isLoading || !readiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-500 font-medium">Loading QMS Readiness State...</p>
      </div>
    );
  }

  const steps = [
    {
      id: 0, title: "Lab Organization",
      path: "/consultant/lab-organization",
      icon: <Settings />,
      done: readiness.step0, locked: false,
      description: "Define departments and hierarchical positions.",
    },
    {
      id: 1, title: "Steering Committee",
      path: "/consultant/steering-committee",
      icon: <Users />,
      done: readiness.step1, locked: !readiness.step0,
      description: "Register personnel and assign oversight roles.",
    },
    {
      id: 2, title: "Authorities Matrix",
      path: "/consultant/role-permission-matrix",
      icon: <ShieldAlert />,
      done: readiness.step2, locked: !readiness.step1,
      description: "Configure access control for all laboratory roles.",
    },
    {
      id: 3, title: "Document Types & Roles",
      path: "/consultant/document-config",
      icon: <ClipboardList />,
      done: readiness.step3, locked: !readiness.step2,
      description: "Map document categories to required authorization roles.",
    },
    {
      id: 4, title: "Workflow Assignments",
      path: "/consultant/document-assignments",
      icon: <UserPlus />,
      done: readiness.step4, locked: !readiness.step3,
      description: "Assign Drafters, Verifiers, and Approvers to documents.",
    },
    {
      id: 5, title: "Document Workspace",
      path: "/document/workspace",
      icon: <FileText />,
      done: false, locked: !readiness.step4,
      description: "Start creating and managing controlled documents.",
    },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">QMS Implementation Portal</h1>
          <p className="text-gray-500 mt-2">Transitioning from Organizational Setup to Technical Operation.</p>
        </div>
        <div className="flex items-center gap-3">
          {readiness.overall_progress === 100 && (
            <div className="flex gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-100 text-sm font-bold animate-in zoom-in">
              <CheckCircle2 size={18} /> Operation Ready
            </div>
          )}
          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-all shadow-md"
          >
            <UserCog size={16} />
            Introduce Consultant
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {steps.map((step) => (
          <Link
            href={step.locked ? "#" : step.path}
            key={step.id}
            onClick={(e) => step.locked && e.preventDefault()}
            className={`group flex items-center justify-between p-6 border rounded-2xl transition-all duration-300 ${
              step.locked
                ? "opacity-50 cursor-not-allowed bg-gray-50"
                : step.done
                ? "bg-white border-green-200 shadow-sm"
                : "bg-blue-50/40 border-blue-200 shadow-md hover:translate-x-1"
            }`}
          >
            <div className="flex items-center gap-6">
              <div className={`p-4 rounded-xl transition-colors ${
                step.done ? "bg-green-100 text-green-600" : "bg-white text-blue-600 border"
              }`}>
                {React.cloneElement(step.icon as React.ReactElement<{ size?: number }>, { size: 28 })}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    Phase {step.id}
                  </span>
                  {step.id === 4 && (
                    <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-md font-bold italic">
                      Critical for 17025
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-800">{step.title}</h2>
                <p className="text-sm text-gray-500">{step.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {step.done ? (
                <CheckCircle2 className="text-green-500" size={32} />
              ) : step.locked ? (
                <Lock className="text-gray-300" size={24} />
              ) : (
                <div className="bg-blue-600 p-2 rounded-full text-white group-hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                  <ChevronRight size={24} />
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* INVITE CONSULTANT MODAL */}
      {isInviteOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleInvite}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative animate-in zoom-in-95 duration-200"
          >
            <button
              type="button"
              onClick={() => setIsInviteOpen(false)}
              className="absolute top-5 right-5 p-1.5 hover:bg-slate-100 rounded-lg transition"
            >
              <X size={18} className="text-slate-400" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                <UserCog size={20} />
              </div>
              <div>
                <h2 className="font-black text-slate-900">Introduce Consultant</h2>
                <p className="text-xs text-slate-500">Create a user account with QMS setup privileges</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">First Name</label>
                  <input
                    required
                    className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Last Name</label>
                  <input
                    required
                    className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Employee ID</label>
                <input
                  required
                  placeholder="e.g. CON-001"
                  className="w-full border rounded-lg p-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  value={form.employee_id_number}
                  onChange={(e) => setForm({ ...form, employee_id_number: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Email</label>
                <input
                  required
                  type="email"
                  className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                  Temporary Password
                </label>
                <input
                  required
                  type="password"
                  minLength={6}
                  className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                  Assigned Role
                </label>
                <select
                  required
                  className="w-full border rounded-lg p-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 capitalize"
                  value={selectedRoleId}
                  onChange={(e) =>
                    setSelectedRoleId(e.target.value === "" ? "" : Number(e.target.value))
                  }
                >
                  <option value="">Select a role...</option>
                  {consultantRoles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-lg transition text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createUser.isPending}
                className="px-6 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition flex items-center gap-2 text-sm disabled:opacity-70"
              >
                {createUser.isPending && <Loader2 size={14} className="animate-spin" />}
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}

      <footer className="mt-12 p-8 bg-gray-900 rounded-3xl text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ShieldAlert size={120} />
        </div>
        <div className="flex justify-between items-center relative z-10">
          <div>
            <h3 className="font-bold text-2xl text-blue-400">Total Implementation Progress</h3>
            <p className="text-gray-400 text-sm mt-1">Steps required for ISO/IEC 17025 Digital Compliance.</p>
          </div>
          <div className="text-right">
            <span className="text-5xl font-mono font-bold tracking-tighter">{readiness.overall_progress}%</span>
          </div>
        </div>
        <div className="mt-6 w-full h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="bg-blue-500 h-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,0.5)]"
            style={{ width: `${readiness.overall_progress}%` }}
          />
        </div>
      </footer>
    </div>
  );
}
