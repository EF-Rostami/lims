/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";


import { UserPlus } from "lucide-react";
import PersonnelStats from "@/components/employee/PersonnelStats";
import PersonnelTable from "@/components/employee/PersonnelTable";
import ManagementDrawer from "@/components/employee/ManagementDrawer";

export default function EmployeeDashboardPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [drawerState, setDrawerState] = useState<{
    isOpen: boolean;
    id: number | null;
    mode: 'view' | 'edit' | 'create';
  }>({
    isOpen: false,
    id: null,
    mode: 'view'
  });

  const handleSelect = (id: number) => {
    setDrawerState({ isOpen: true, id, mode: 'view' });
  };

  const handleCreate = () => {
    setDrawerState({ isOpen: true, id: null, mode: 'create' });
  };

  return (
    <div className="p-8 max-w-400 mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Personnel Systems</h1>
          <p className="text-slate-500 font-medium">Global laboratory access and authorization registry.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
        >
          <UserPlus size={18} />
          <span>Register Personnel</span>
        </button>
      </div>

      {/* 1. Stats Ribbon */}
      <PersonnelStats />

      {/* 2. Main Directory Table */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <PersonnelTable onSelect={handleSelect} />
        <ManagementDrawer 
          isOpen={drawerState.isOpen}
          employeeId={drawerState.id}
          mode={drawerState.mode}
          onClose={() => setDrawerState(prev => ({ ...prev, isOpen: false }))}
          onModeChange={(newMode) => setDrawerState(prev => ({ ...prev, mode: newMode }))}
        />
      </div>

    </div>
  );
}