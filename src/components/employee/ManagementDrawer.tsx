/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { 
  X, 
  UserCog, 
  ArrowLeft,
  Settings2,
  UserPlus,
  Loader2
} from "lucide-react";
import EmployeeDetailView from "./EmployeeDetailView";
import { useEmployee } from "@/services/employee/employee.hooks";
import EmployeeRegistrationForm from "./EmployeeRegistrationForm";

interface ManagementDrawerProps {
  employeeId: number | null;
  isOpen: boolean;
  onClose: () => void;
  mode: "view" | "edit" | "create"; 
  onModeChange: (newMode: "view" | "edit" | "create") => void;
}

export default function ManagementDrawer({ 
  employeeId, 
  isOpen, 
  onClose,
  mode,
  onModeChange
}: ManagementDrawerProps) {
  
  // Fetch data only if we aren't in 'create' mode
  const isCreateMode = mode === "create";
  const { data: employee, isLoading, isError } = useEmployee(
    !isCreateMode && employeeId ? employeeId : 0
  );

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity animate-in fade-in duration-300" 
        onClick={handleClose} 
      />

      {/* Drawer Panel */}
      <aside className="fixed right-0 top-0 h-full w-200 bg-white shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right duration-300 border-l border-slate-200">
        
        {/* Header Navigation */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md z-20 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!isCreateMode && mode === "edit" ? (
              <button 
                onClick={() => onModeChange("view")}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
            ) : (
              <div className={`p-2 rounded-xl ${isCreateMode ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                {isCreateMode ? <UserPlus size={20} /> : <UserCog size={20} />}
              </div>
            )}
            <div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                {isCreateMode ? "New Personnel" : mode === "view" ? "Personnel File" : "Modify Authorizations"}
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {isCreateMode ? "Registry Entry" : `ID: #${String(employeeId).padStart(4, '0')}`}
              </p>
            </div>
          </div>
          
          <button onClick={handleClose} className="p-2 hover:bg-red-50 hover:text-red-500 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-8">
          {isLoading && !isCreateMode ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Retrieving Secure File...</p>
            </div>
          ) : isError ? (
            <div className="p-6 bg-red-50 rounded-2xl border border-red-100 text-center">
              <p className="text-sm font-bold text-red-600">Failed to load personnel record.</p>
              <button onClick={handleClose} className="mt-2 text-xs font-black uppercase text-red-400 underline">Close Drawer</button>
            </div>
          ) : (
            <>
              {mode === "view" && employeeId ? (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <EmployeeDetailView 
                    id={employeeId} 
                    onEditClick={() => onModeChange("edit")} 
                  />
                  
                  <button 
                    onClick={() => onModeChange("edit")}
                    className="w-full flex items-center justify-center gap-2 p-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 group"
                  >
                    <Settings2 size={16} className="group-hover:rotate-90 transition-transform duration-500" /> 
                    Edit System Access
                  </button>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <EmployeeRegistrationForm 
                    // Using a more descriptive key to differentiate create/edit intent
                    key={isCreateMode ? 'create-form' : `edit-${employeeId}`}
                    employeeToEdit={isCreateMode ? undefined : employee} 
                    onComplete={() => {
                      if (isCreateMode) {
                        handleClose();
                      } else {
                        onModeChange("view");
                      }
                    }} 
                  />
                </div>
              )}
            </>
          )}
        </div>
      </aside>
    </>
  );
}