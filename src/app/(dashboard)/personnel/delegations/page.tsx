/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { 
  ShieldCheck, 
  FileText, 
  ArrowRightLeft 
} from "lucide-react";
import { DelegationManager } from "@/components/delegation/DelegationManager";
import { DelegationAlert } from "@/components/delegation/DelegationAlert";
import { useUserStore } from "@/store/useUserStore";

export default function DelegationsPage() {
  const user = useUserStore((state) => state.user);

  // Safely extract initials and name from metadata or defaults
  // Assuming UserMetadata has a 'username' or 'email' if names aren't top-level
  const userDisplayName = (user as any)?.full_name || user?.username || "User";
  const userInitials = (user as any)?.first_name 
    ? `${(user as any).first_name[0]}${(user as any).last_name[0]}`
    : userDisplayName.substring(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 space-y-8">
      
      {/* 1. Header Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-200">
              <ArrowRightLeft size={24} />
            </div>
            Authority Delegations
          </h1>
          <p className="text-slate-500 font-medium mt-1">
            Manage acting deputies and technical sign-off transfers (ISO 17025 Compliance).
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-600">
            {userInitials}
          </div>
          <div className="pr-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Logged User</p>
            <p className="text-sm font-bold text-slate-700">{userDisplayName}</p>
          </div>
        </div>
      </header>

      {/* 2. Critical Alerts Area */}
      {user?.id && <DelegationAlert currentUserId={user.id} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 3. Left Column: Main Management Interface */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-1">
              <DelegationManager />
            </div>
          </div>
        </div>

        {/* 4. Right Column: Informational/Compliance Sidebar */}
        <div className="space-y-6">
          
          {/* Quick Stats/Status Card */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10 space-y-6">
              <h3 className="text-lg font-black flex items-center gap-2">
                <ShieldCheck className="text-blue-400" size={20} />
                Compliance Status
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase">Audit Logging</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md font-black">ENABLED</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <span className="text-xs font-bold text-slate-400 uppercase">ISO 17025 Reference</span>
                  <span className="text-[10px] text-slate-300 font-bold">Clause 6.2.5</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic leading-relaxed">
                Delegating authority allows a Deputy to sign off on technical reports and validate data 
                during the Primary&apos;s absence. All actions taken by a Deputy are traced back to the delegation ID.
              </p>
            </div>
            
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl" />
          </div>

          {/* Guidelines Card */}
          <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <FileText size={16} className="text-slate-400" />
              Quick Guidelines
            </h4>
            <ul className="space-y-3">
              {[
                "Deputies must have appropriate training for the delegated position.",
                "Primary authorities are responsible for revoking access upon return.",
                "Delegations cannot exceed a maximum of 30 days without review.",
              ].map((tip, i) => (
                <li key={i} className="flex gap-3 text-[11px] font-bold text-slate-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}