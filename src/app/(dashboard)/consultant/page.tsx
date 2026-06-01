"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Settings, Users, ShieldAlert, FileText, ChevronRight, 
  CheckCircle2, Lock, UserPlus, ClipboardList, Loader2 
} from 'lucide-react';
import { useReadiness } from "@/services/admin/admin.hooks";

export default function AdminDashboard() {
  // Use our new hook - handles fetching, loading state, and caching automatically
  const { data: readiness, isLoading } = useReadiness();

  // Loading state while fetching backend readiness
  if (isLoading || !readiness) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-500 font-medium">Loading QMS Readiness State...</p>
      </div>
    );
  }

  const steps = [
    { id: 0, title: "Lab Organization", path: "/consultant/lab-organization", icon: <Settings />, done: readiness.step0, locked: false },
    { id: 1, title: "Steering Committee", path: "/consultant/steering-committee", icon: <Users />, done: readiness.step1, locked: !readiness.step0 },
    { id: 2, title: "Authorities Matrix", path: "/consultant/role-permission-matrix", icon: <ShieldAlert />, done: readiness.step2, locked: !readiness.step1 },
    { id: 3, title: "Document Types & Roles", path: "/consultant/document-config", icon: <ClipboardList />, done: readiness.step3, locked: !readiness.step2 },
    { id: 4, title: "Workflow Assignments", path: "/consultant/document-assignments", icon: <UserPlus />, done: readiness.step4, locked: !readiness.step3 },
    { id: 5, title: "Document Workspace", path: "/documents/workspace", icon: <FileText />, done: false, locked: !readiness.step4 },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">QMS Implementation Portal</h1>
          <p className="text-gray-500 mt-2">Transitioning from Organizational Setup to Technical Operation.</p>
        </div>
        
        {readiness.overall_progress === 100 && (
          <div className="flex gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-100 text-sm font-bold animate-in zoom-in">
            <CheckCircle2 size={18} /> Operation Ready
          </div>
        )}
      </header>

      <div className="grid grid-cols-1 gap-4">
        {steps.map((step) => (
          <Link 
            href={step.locked ? '#' : step.path} 
            key={step.id}
            className={`group flex items-center justify-between p-6 border rounded-2xl transition-all duration-300 ${
              step.locked ? 'opacity-50 cursor-not-allowed bg-gray-50' : 
              step.done ? 'bg-white border-green-200 shadow-sm' : 'bg-blue-50/40 border-blue-200 shadow-md hover:translate-x-1'
            }`}
          >
            <div className="flex items-center gap-6">
              <div className={`p-4 rounded-xl transition-colors ${
                step.done ? 'bg-green-100 text-green-600' : 'bg-white text-blue-600 border'
              }`}>
                {React.cloneElement(step.icon as React.ReactElement<{ size?: number }>, { size: 28 })}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phase {step.id}</span>
                  {step.id === 4 && <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-md font-bold italic">Critical for 17025</span>}
                </div>
                <h2 className="text-xl font-bold text-gray-800">{step.title}</h2>
                <p className="text-sm text-gray-500">
                  {step.id === 4 ? "Assign Drafters, Verifiers, and Viewers to documents." : `Configure system ${step.title.toLowerCase()}.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
               {step.done ? <CheckCircle2 className="text-green-500" size={32} /> : 
                step.locked ? <Lock className="text-gray-300" size={24} /> : 
                <div className="bg-blue-600 p-2 rounded-full text-white group-hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                  <ChevronRight size={24} />
                </div>
               }
            </div>
          </Link>
        ))}
      </div>

      <footer className="mt-12 p-8 bg-gray-900 rounded-3xl text-white shadow-2xl relative overflow-hidden">
        {/* Background decorative element */}
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
          ></div>
        </div>
      </footer>
    </div>
  );
}