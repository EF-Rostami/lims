/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { X, UserPlus, Shield, CheckCircle, Loader2, AlertCircle } from "lucide-react";

import type { Schema } from "@/types/api-types";
import { useEmployees } from "@/services/employee/employee.hooks";
type Employee = Schema["EmployeeResponse"];

interface AssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: any) => Promise<void>;
  docTypes: any[];
  isLoading?: boolean; // Passed from parent mutation state
}



export default function AssignmentModal({ 
  isOpen, 
  onClose, 
  onCreate, 
  docTypes, 
  isLoading: isSubmitting 
}: AssignmentModalProps) {
  const [title, setTitle] = useState("");
  const [docTypeId, setDocTypeId] = useState<number | "">("");
  
  // Assignment State
  const [drafterIds, setDrafterIds] = useState<number[]>([]);
  const [verifierIds, setVerifierIds] = useState<number[]>([]);
  const [approverId, setApproverId] = useState<number | "">("");

  // 1. Fetch Employees via Hook
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees(isOpen);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreate({
      title,
      doc_type_id: Number(docTypeId),
      initial_version_tag: "1.0",
      drafter_ids: drafterIds,
      verifier_ids: verifierIds,
      approver_id: Number(approverId),
    });
    // Reset local state on success
    setTitle("");
    setDrafterIds([]);
    setVerifierIds([]);
    setApproverId("");
  };

  const toggleSelection = (id: number, list: number[], setList: (val: number[]) => void) => {
    if (list.includes(id)) {
      setList(list.filter(i => i !== id));
    } else {
      setList([...list, id]);
    }
  };

  const getEmployeeLabel = (emp: Employee) => {
    const primaryPosition = emp.positions_list?.find(
      p => p.id === emp.primary_position_id
    )?.title;

    return `${emp.first_name} ${emp.last_name} — ${
      primaryPosition || emp.positions_list?.[0]?.title || "No Position"
    } (${emp.primary_department_name || "No Dept"})`;
  };

  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Configure Document Workflow</h2>
            <p className="text-sm text-slate-500">Define the technical review and approval chain for ISO 17025 compliance.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-2 hover:bg-slate-200 rounded-full">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 grid grid-cols-12 gap-8">
          {/* Left Column: Basic Details */}
          <div className="col-span-12 lg:col-span-4 space-y-6 border-r-0 lg:border-r lg:pr-8 border-slate-100">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600">Document Profile</h3>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Document Title</label>
                <textarea
                  required rows={4}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all"
                  value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., SOP for Analytical Balance Calibration"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Document Category</label>
                <select
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  value={docTypeId} onChange={(e) => setDocTypeId(e.target.value === "" ? "" : Number(e.target.value))}
                >
                  <option value="">Select Category...</option>
                  {docTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>

            {isLoadingEmployees && (
              <div className="p-4 bg-blue-50 rounded-xl flex items-center gap-3 text-blue-700">
                <Loader2 className="animate-spin" size={18} />
                <span className="text-xs font-medium">Syncing employee list...</span>
              </div>
            )}
          </div>

          {/* Right Column: Personnel Selection */}
          <div className="col-span-12 lg:col-span-8 space-y-8">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600">Workflow Matrix</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Drafters Multi-Select */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <UserPlus size={16} className="text-slate-400" /> Authorized Drafter(s)
                </label>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="h-48 overflow-y-auto bg-slate-50 divide-y divide-slate-100">
                    {employees.map(emp => (
                      <div 
                        key={emp.id} 
                        onClick={() => toggleSelection(emp.id, drafterIds, setDrafterIds)}
                        className={`p-3 text-xs cursor-pointer flex items-center justify-between hover:bg-white transition-colors ${drafterIds.includes(emp.id) ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                      >
                        <div>
                          <div className="font-bold text-slate-800">{emp.first_name} {emp.last_name}</div>
                          <div className="text-slate-500">
                            {emp.positions_list?.find(p => p.id === emp.primary_position_id)?.title ||
                            emp.positions_list?.[0]?.title ||
                            "No Position"}
                          </div>
                        </div>
                        {drafterIds.includes(emp.id) && <CheckCircle size={14} className="text-blue-500" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Verifiers Multi-Select */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                  <Shield size={16} className="text-orange-500" /> Technical Verifiers
                </label>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="h-48 overflow-y-auto bg-slate-50 divide-y divide-slate-100">
                    {employees.map(emp => (
                      <div 
                        key={emp.id} 
                        onClick={() => toggleSelection(emp.id, verifierIds, setVerifierIds)}
                        className={`p-3 text-xs cursor-pointer flex items-center justify-between hover:bg-white transition-colors ${verifierIds.includes(emp.id) ? 'bg-orange-50 border-l-4 border-orange-500' : ''}`}
                      >
                        <div>
                          <div className="font-bold text-slate-800">{emp.first_name} {emp.last_name}</div>
                          <div className="text-slate-500">
                            {emp.positions_list?.find(p => p.id === emp.primary_position_id)?.title ||
                            emp.positions_list?.[0]?.title ||
                            "No Position"}
                          </div>
                        </div>
                        {verifierIds.includes(emp.id) && <CheckCircle size={14} className="text-orange-500" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Approver Single Select */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <CheckCircle size={16} className="text-green-600" /> Final Approval Authority
              </label>
              <select
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 text-sm font-medium"
                value={approverId} onChange={(e) => setApproverId(Number(e.target.value))}
              >
                <option value="">Select responsible authority...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {getEmployeeLabel(emp)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500">
             <AlertCircle size={16} />
             <span className="text-xs italic">Assignments can be modified until the document is submitted.</span>
          </div>
          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || drafterIds.length === 0} 
              onClick={handleSubmit}
              className="px-10 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Initializing...
                </>
              ) : "Create Document Workflow"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}