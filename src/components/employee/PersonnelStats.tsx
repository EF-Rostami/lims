/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useMemo } from "react";
import { useEmployees } from "@/services/employee/employee.hooks";
import { Users, ShieldAlert, Award, Fingerprint, Activity } from "lucide-react";

export default function PersonnelStats() {
  const { data: employees = [] } = useEmployees();

  const stats = useMemo(() => {
    const total = employees.length;
    
    // An employee is "Authorized" if they have a Primary Role assigned
    const authorized = employees.filter(e => !!e.primary_role_id).length;
    
    const pending = total - authorized;
    
    // Steering committee check (works whether it's their primary or secondary role)
    // const steering = employees.filter(e => e.role_names?.includes("steering_committee")).length;
    const steering = employees.filter(e => {
      const roles = (e as any).roles_list || [];
      return roles.some((r: any) => r.name === "steering_committee");
    }).length;
    // Track how many people have manual permission overrides (special_permissions)
    const withOverrides = employees.filter(e => (e.permission_ids?.length ?? 0) > 0).length;
    
    const authPercentage = total > 0 ? Math.round((authorized / total) * 100) : 0;

    return { total, authorized, pending, steering, withOverrides, authPercentage };
  }, [employees]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      
      {/* Total Card with Progress Ring */}
      <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center justify-between group hover:border-blue-200 transition-colors">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registry Total</p>
          <h3 className="text-3xl font-black text-slate-900 leading-none">{stats.total}</h3>
          <p className="text-[10px] font-bold text-blue-600">Active Personnel</p>
        </div>
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" 
              strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * stats.authPercentage) / 100}
              className="text-blue-600 transition-all duration-1000 ease-out" strokeLinecap="round" />
          </svg>
          <span className="absolute text-[10px] font-black text-blue-700">{stats.authPercentage}%</span>
        </div>
      </div>

      {/* Pending Authorization */}
      <StatCard 
        label="Pending Auth" 
        value={stats.pending} 
        subtext="Awaiting Role"
        icon={<ShieldAlert size={22} className="text-amber-500" />} 
        color="bg-amber-50" 
        active={stats.pending > 0}
      />

      {/* Steering Committee */}
      <StatCard 
        label="Steer-Co" 
        value={stats.steering} 
        subtext="Committee Members"
        icon={<Award size={22} className="text-indigo-500" />} 
        color="bg-indigo-50" 
      />

      {/* Security Overrides - Replaced the placeholder */}
      <StatCard 
        label="Privileged" 
        value={stats.withOverrides} 
        subtext="Manual Overrides"
        icon={<Fingerprint size={22} className="text-emerald-500" />} 
        color="bg-emerald-50" 
      />
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  subtext: string;
  icon: React.ReactNode;
  color: string;
  active?: boolean;
}

function StatCard({ label, value, subtext, icon, color, active }: StatCardProps) {
  return (
    <div className={`bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-5 transition-all hover:shadow-md ${active ? 'ring-2 ring-amber-100 border-amber-200' : ''}`}>
      <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate">{label}</p>
        <h3 className="text-2xl font-black text-slate-900 leading-tight">{value}</h3>
        <p className="text-[10px] font-bold text-slate-400 truncate">{subtext}</p>
      </div>
    </div>
  );
}