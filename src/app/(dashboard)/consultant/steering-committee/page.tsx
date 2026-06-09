"use client";

import React, { useState, useMemo } from "react";
import {
  ShieldCheck, UserPlus, Loader2, X,
  Search, CheckCircle, Info, AlertCircle,
  UserCheck, UserMinus, Clock,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useEmployeeList, consultantKeys } from "@/features/consultant/consultant.queries";
import { useCreateUser, useAssignRole, useRemoveRole } from "@/features/lims/users/users.queries";
import type { EmployeeRead } from "@/features/consultant/consultant.api";
import type { TenantUserCreate } from "@/features/lims/users/users.api";

const STEER_ROLE = "steering_committee" as const;

type NewUserForm = {
  email: string;
  password: string;
  employee_id_number: string;
  first_name: string;
  last_name: string;
};

const EMPTY_FORM: NewUserForm = {
  email: "",
  password: "",
  employee_id_number: "",
  first_name: "",
  last_name: "",
};

export default function SteeringCommitteePage() {
  const qc = useQueryClient();
  const { data: employees = [], isLoading } = useEmployeeList();

  const createUser = useCreateUser();
  const assignRole = useAssignRole();
  const removeRole = useRemoveRole();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<NewUserForm>(EMPTY_FORM);

  const invalidateEmployees = () =>
    qc.invalidateQueries({ queryKey: consultantKeys.employees });

  const filteredEmployees = useMemo(
    () =>
      employees.filter((emp) =>
        `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [employees, searchTerm]
  );

  const committeeMembers = useMemo(
    () => employees.filter((emp) => emp.roles.includes(STEER_ROLE)),
    [employees]
  );

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: TenantUserCreate = { ...form, role_ids: [] };
    createUser.mutate(payload, {
      onSuccess: () => {
        setForm(EMPTY_FORM);
        setIsModalOpen(false);
        invalidateEmployees();
      },
    });
  };

  const handleToggleSteering = (emp: EmployeeRead) => {
    const isBoard = emp.roles.includes(STEER_ROLE);
    const mutation = isBoard ? removeRole : assignRole;
    mutation.mutate(
      { userId: emp.user_id, roleName: STEER_ROLE },
      { onSuccess: invalidateEmployees }
    );
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-slate-500 font-bold">Accessing Personnel Registry...</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 border-b border-slate-100 pb-10">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phase 1</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Steering Committee</h1>
            <p className="text-slate-500 mt-1 italic">
              Register personnel and designate laboratory oversight members.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
          >
            <UserPlus size={18} />
            Register New Personnel
          </button>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            placeholder="Search by name..."
            className="pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm w-full focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT: PERSONNEL LIST */}
        <section className="lg:col-span-7 space-y-4">
          <h2 className="font-bold text-lg text-slate-800">Personnel Directory</h2>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">
            {filteredEmployees.length === 0 ? (
              <div className="p-16 text-center space-y-3">
                <AlertCircle className="mx-auto text-slate-200" size={40} />
                <p className="text-slate-400 text-sm">No personnel registered yet.</p>
              </div>
            ) : (
              filteredEmployees.map((emp) => {
                const isBoard = emp.roles.includes(STEER_ROLE);
                const hasRoles = emp.roles.length > 0;
                const isToggling =
                  (assignRole.isPending || removeRole.isPending) &&
                  (assignRole.variables?.userId === emp.user_id ||
                    removeRole.variables?.userId === emp.user_id);

                return (
                  <div
                    key={emp.id}
                    className="p-5 flex justify-between items-center hover:bg-slate-50 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg transition-transform group-hover:scale-105 ${
                          isBoard ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {emp.first_name[0]}
                        {emp.last_name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900">
                            {emp.first_name} {emp.last_name}
                          </p>
                          {hasRoles ? (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md border border-emerald-100">
                              <UserCheck size={10} /> ACTIVE
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-md border border-amber-100">
                              <Clock size={10} /> PENDING AUTH
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 uppercase tracking-wide mt-0.5">
                          {emp.primary_department || "Unassigned"} •{" "}
                          {emp.primary_position || "Staff"}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleSteering(emp)}
                      disabled={isToggling}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        isBoard
                          ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                          : "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
                      } disabled:opacity-50`}
                    >
                      {isToggling ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : isBoard ? (
                        <UserMinus size={12} />
                      ) : (
                        <ShieldCheck size={12} />
                      )}
                      {isBoard ? "Remove" : "Authorize"}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* RIGHT: COMMITTEE BOARD */}
        <section className="lg:col-span-5">
          <div className="sticky top-8 bg-slate-900 rounded-3xl p-8 shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[80px] -mr-32 -mt-32 rounded-full" />
            <div className="relative z-10 space-y-8">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  <ShieldCheck className="text-blue-400" size={28} /> The Board
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Members with oversight and voting privileges.
                </p>
              </div>

              <div className="space-y-3">
                {committeeMembers.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-slate-500 border border-dashed border-slate-800 rounded-2xl">
                    <Info size={28} className="mb-3 text-slate-700" />
                    <p className="italic text-sm">No voting members designated.</p>
                  </div>
                ) : (
                  committeeMembers.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center gap-4 bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg">
                        {m.first_name[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-white text-sm">
                          {m.first_name} {m.last_name}
                        </p>
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-tighter mt-0.5">
                          {m.primary_position || "Voting Delegate"}
                        </p>
                      </div>
                      <CheckCircle size={18} className="text-blue-500 shrink-0" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* REGISTRATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="font-black text-slate-900">New Personnel Registration</h3>
                  <p className="text-xs text-slate-500">Provision a new laboratory user account</p>
                </div>
              </div>
              <button
                onClick={() => { setIsModalOpen(false); setForm(EMPTY_FORM); }}
                className="p-2 hover:bg-slate-200 rounded-lg transition"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="p-8 space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  placeholder="e.g. EMP-001"
                  className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 font-mono"
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
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Temporary Password</label>
                <input
                  required
                  type="password"
                  minLength={6}
                  className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setForm(EMPTY_FORM); }}
                  className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-lg transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createUser.isPending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2 text-sm disabled:opacity-70"
                >
                  {createUser.isPending && <Loader2 size={14} className="animate-spin" />}
                  Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
