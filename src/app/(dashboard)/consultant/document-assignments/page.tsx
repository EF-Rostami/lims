/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { 
  Plus, PenTool, ShieldCheck, 
  Search, CheckCircle2, User, Loader2 
} from "lucide-react";

// Hooks integration


import AssignmentModal from "@/components/document/AssignmentModal";
import { useCreateDraft, useDocumentTypes, useListInternalDocuments } from "@/services/internalDocument/internalDocument.hooks";
// import type { Schema } from "@/types/api-types";
// type InternalDocument = Schema["InternalDocumentRead"];
// type Assignment = Schema["DocumentAssignmentRead"];

export default function AssignmentManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 1. TanStack Query Hooks
  const { data: docs = [], isLoading: loadingDocs } = useListInternalDocuments();
  const { data: docTypes = [], isLoading: loadingTypes } = useDocumentTypes();
  const createDraftMutation = useCreateDraft();

  // 2. Helper Logic
  const getAssignees = (assignments: any[] | undefined, role: string) => {
    if (!assignments) return [];
    return assignments.filter((a: any) => a.assignment_role === role);
  };

  const renderName = (a: any) => {
    if (a.employee) {
      return `${a.employee.first_name} ${a.employee.last_name}`;
    }
    return a.user_name || `User #${a.user_id}`;
  };

  const filteredDocs = docs.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.system_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateDocument = async (formData: any) => {
    try {
      await createDraftMutation.mutateAsync(formData);
      setIsModalOpen(false);
    } catch (error) {
      // toast is already handled in the hook if you added it there
      console.error("Draft creation failed", error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Workflow Assignment Matrix</h1>
          <p className="text-slate-500 mt-1">Define document ownership and technical review chains for ISO 17025.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
        >
          <Plus size={20} /> New Document & Team
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by System ID or Title..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b text-[10px] uppercase text-slate-500 font-black tracking-widest">
              <th className="p-4">Document Details</th>
              <th className="p-4">Drafter(s)</th>
              <th className="p-4">Technical Verifiers</th>
              <th className="p-4">Approval Authority</th>
              <th className="p-4 text-center">Current Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loadingDocs ? (
               <tr>
                 <td colSpan={5} className="p-20 text-center">
                   <div className="flex flex-col items-center gap-2 text-slate-400">
                     <Loader2 className="animate-spin" size={32} />
                     <span className="text-sm font-medium">Syncing Document Matrix...</span>
                   </div>
                 </td>
               </tr>
            ) : filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-20 text-center text-slate-400">
                  No documents found. Click &quot;New Document&quot; to start.
                </td>
              </tr>
            ) : filteredDocs.map((doc) => (
              <tr key={doc.id} className="hover:bg-blue-50/20 group transition-colors">
                <td className="p-4">
                  <div className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{doc.title}</div>
                  <div className="text-xs font-mono text-blue-600 bg-blue-50 w-fit px-1.5 py-0.5 rounded mt-1">
                    {doc.system_id}
                  </div>
                </td>

                <td className="p-4">
                  <div className="flex flex-wrap gap-1.5">
                    {getAssignees(doc.assignments, "DRAFTER").map((a, i) => (
                      <span key={i} className="flex items-center gap-1.5 bg-white text-slate-700 px-2 py-1 rounded-md text-xs border border-slate-200 shadow-sm">
                        <PenTool size={12} className="text-slate-400" /> {renderName(a)}
                      </span>
                    ))}
                  </div>
                </td>

                <td className="p-4">
                  <div className="flex flex-wrap gap-1.5">
                    {getAssignees(doc.assignments, "VERIFIER").map((a, i) => (
                      <span key={i} className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs border shadow-sm ${
                        a.is_completed ? "bg-green-50 text-green-700 border-green-200" : "bg-orange-50 text-orange-700 border-orange-200"
                      }`}>
                        <ShieldCheck size={12} /> {renderName(a)}
                        {a.is_completed && <CheckCircle2 size={12} className="ml-0.5" />}
                      </span>
                    ))}
                  </div>
                </td>

                <td className="p-4">
                  {getAssignees(doc.assignments, "APPROVER").map((a, i) => (
                    <div key={i} className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <User size={14} className="text-blue-600" />
                      </div>
                      {renderName(a)}
                    </div>
                  ))}
                </td>

                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                    doc.status === "RELEASED" 
                      ? "bg-green-100 text-green-700 border-green-300" 
                      : doc.status === "DRAFT"
                      ? "bg-slate-100 text-slate-600 border-slate-300"
                      : "bg-blue-100 text-blue-700 border-blue-300"
                  }`}>
                    {doc.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Assignment Modal with Mutation Integration */}
      <AssignmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        docTypes={docTypes}
        isLoading={createDraftMutation.isPending}
        onCreate={handleCreateDocument}
      />
    </div>
  );
}