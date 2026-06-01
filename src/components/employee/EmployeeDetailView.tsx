/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React from "react";
import { 
  ShieldCheck, 
  Mail, 
  Building2, 
  CheckCircle2, 
  Lock,
  Loader2,
  AlertCircle,
  Star,
  Shield,
  UserCircle,
  Briefcase
} from "lucide-react";
import { useEmployee } from "@/services/employee/employee.hooks";
import type { Schema } from "@/types/api-types";

type Employee = Schema["EmployeeResponse"];

interface DetailProps {
  id: number;
  onEditClick: () => void;
}

export default function EmployeeDetailView({ id, onEditClick }: DetailProps) {
  const { data, isLoading, isError } = useEmployee(id);

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-sm font-bold text-slate-400 animate-pulse">Loading Personnel Profile...</p>
    </div>
  );
  
  if (isError || !data) return (
    <div className="p-10 text-center border-2 border-dashed rounded-[2rem] border-slate-200 bg-slate-50/50">
      <AlertCircle className="mx-auto text-slate-300 mb-3" size={48} />
      <p className="text-base font-bold text-slate-600">Profile Not Found</p>
      <p className="text-xs text-slate-400 mt-1">Could not retrieve data for ID: {id}</p>
    </div>
  );

  const employee = data as any; // Using any to handle the dynamic list keys we updated

  const positions = employee.positions_list || [];
  const roles = employee.roles_list || [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Profile Header Card */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-900/20">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
          {/* Avatar */}
          <div className="w-24 h-24 bg-linear-to-br from-blue-500 to-indigo-600 rounded-[2rem] flex items-center justify-center text-4xl font-black shadow-inner border border-white/20">
            {employee.first_name[0]}{employee.last_name[0]}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-3xl font-black tracking-tight">{employee.full_name}</h3>
              {employee.primary_role_id && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase rounded-lg backdrop-blur-md">
                  <ShieldCheck size={12} /> Authorized
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-slate-400">
              <span className="flex items-center gap-1.5 text-xs font-bold bg-white/5 px-3 py-1 rounded-full"><Mail size={14} className="text-blue-400"/> {employee.email}</span>
              <span className="flex items-center gap-1.5 text-xs font-bold bg-white/5 px-3 py-1 rounded-full"><Building2 size={14} className="text-blue-400"/> {employee.primary_department_name || "Unassigned"}</span>
            </div>

            {/* Header Secondary Positions */}
            <div className="flex flex-wrap gap-2 pt-2">
              {positions.filter((p: any) => p.type !== 'primary').map((pos: any) => (
                <span key={pos.id} className="text-[10px] font-black text-blue-300/60 uppercase tracking-tighter bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/10">
                  + {pos.title.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        {/* Background Decorative Gradients */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/20 rounded-full blur-[100px]" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-[100px]" />
      </div>

      {/* 2. Organization & Hierarchy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Assigned Positions */}
        <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <UserCircle size={16} className="text-slate-400" />
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Organizational Positions</h4>
          </div>
          
          <div className="space-y-3">
            {positions.map((pos: any) => {
              const isPrimary = pos.type === "primary";
              return (
                <div key={pos.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isPrimary ? "bg-blue-50 border-blue-100 ring-1 ring-blue-50" : "bg-white border-slate-100"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isPrimary ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-slate-100 text-slate-400"}`}>
                      {isPrimary ? <Star size={14} fill="currentColor" /> : <Briefcase size={14} />}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{pos.title.replace(/_/g, ' ')}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{pos.department_name}</p>
                    </div>
                  </div>
                  {isPrimary && <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-0.5 rounded-full">PRIMARY</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* System Roles */}
        <div className="p-6 bg-white rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={16} className="text-slate-400" />
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Access Roles</h4>
          </div>

          <div className="space-y-3">
            {roles.length > 0 ? roles.map((role: any) => {
              const isPrimary = role.is_primary;
              return (
                <div key={role.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isPrimary ? "bg-emerald-50 border-emerald-100 ring-1 ring-emerald-50" : "bg-white border-slate-100"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${isPrimary ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" : "bg-slate-100 text-slate-400"}`}>
                      <ShieldCheck size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{role.name.replace(/_/g, ' ')}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{isPrimary ? "Authority Lead" : "Standard Access"}</p>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-4 border-2 border-dashed border-slate-50 rounded-2xl">
                <p className="text-[10px] font-bold text-slate-400">NO ROLES ASSIGNED</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Effective Permissions Grid */}
      <div className="p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-slate-400" />
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Calculated Access Rights</h4>
          </div>
          <span className="text-[10px] font-black text-blue-600 bg-blue-100 px-3 py-1 rounded-full uppercase">
            {employee.permission_names?.length || 0} Permissions
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {employee.permission_names && employee.permission_names.length > 0 ? (
            employee.permission_names.map((perm: string) => (
              <div key={perm} className="flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-blue-200 transition-colors group">
                <div className="w-6 h-6 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                  <CheckCircle2 size={12} className="text-emerald-500 group-hover:text-white" />
                </div>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">{perm}</span>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10 bg-white/50 rounded-[2rem] border border-dashed border-slate-200">
              <p className="text-xs font-medium text-slate-400 italic">No granular permissions detected for this profile.</p>
            </div>
          )}
        </div>
      </div>

      {/* 4. Action Footer */}
      <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
          Last Sync: {new Date().toLocaleDateString(undefined, { dateStyle: 'full' })}
        </p>
        <div className="flex gap-2">
           <button className="px-6 py-2 text-xs font-black bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all">Audit Logs</button>
           <button onClick={onEditClick} className="px-6 py-2 text-xs font-black bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">Modify Profile</button>
        </div>
      </div>
    </div>
  );
}