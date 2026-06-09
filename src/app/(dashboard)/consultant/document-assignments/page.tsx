"use client";

import React, { useState } from "react";
import {
  Plus, PenTool, ShieldCheck, Search,
  CheckCircle2, User, Loader2, X, FileText,
} from "lucide-react";
import {
  useDocumentsList,
  useCreateDocument,
  useDocumentTypesList,
  useEmployeeList,
} from "@/features/consultant/consultant.queries";
import type { EmployeeRead, InternalDocumentRead } from "@/features/consultant/consultant.api";

type AssignmentRole = "DRAFTER" | "VERIFIER" | "APPROVER";

type NewDocForm = {
  title: string;
  document_type_id: number | "";
  drafter_user_id: number | "";
  verifier_user_id: number | "";
  approver_user_id: number | "";
};

const EMPTY_FORM: NewDocForm = {
  title: "",
  document_type_id: "",
  drafter_user_id: "",
  verifier_user_id: "",
  approver_user_id: "",
};

function getAssignees(assignments: InternalDocumentRead["assignments"], role: AssignmentRole) {
  return assignments.filter((a) => a.assignment_role === role);
}

export default function DocumentAssignmentsPage() {
  const { data: docs = [], isLoading: loadingDocs } = useDocumentsList();
  const { data: docTypes = [] } = useDocumentTypesList();
  const { data: employees = [] } = useEmployeeList();
  const createDoc = useCreateDocument();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [form, setForm] = useState<NewDocForm>(EMPTY_FORM);

  const filteredDocs = docs.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.system_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.document_type_id) return;

    const assignments: { user_id: number; assignment_role: string }[] = [];
    if (form.drafter_user_id)
      assignments.push({ user_id: Number(form.drafter_user_id), assignment_role: "DRAFTER" });
    if (form.verifier_user_id)
      assignments.push({ user_id: Number(form.verifier_user_id), assignment_role: "VERIFIER" });
    if (form.approver_user_id)
      assignments.push({ user_id: Number(form.approver_user_id), assignment_role: "APPROVER" });

    createDoc.mutate(
      {
        title: form.title,
        document_type_id: Number(form.document_type_id),
        assignments,
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setForm(EMPTY_FORM);
        },
      }
    );
  };

  const employeeName = (userId: number) => {
    const emp = employees.find((e: EmployeeRead) => e.user_id === userId);
    return emp ? `${emp.first_name} ${emp.last_name}` : `User #${userId}`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-8 border-b pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phase 4</span>
            <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-md font-bold italic">
              Critical for 17025
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Workflow Assignments</h1>
          <p className="text-slate-500 mt-1 italic">
            Assign Drafters, Verifiers, and Approvers to controlled documents.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
        >
          <Plus size={18} /> New Document
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Search by System ID or title..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b text-[10px] uppercase text-slate-500 font-black tracking-widest">
              <th className="p-4">Document</th>
              <th className="p-4">Drafter</th>
              <th className="p-4">Verifier</th>
              <th className="p-4">Approver</th>
              <th className="p-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loadingDocs ? (
              <tr>
                <td colSpan={5} className="p-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400">
                    <Loader2 className="animate-spin" size={28} />
                    <span className="text-sm">Loading documents...</span>
                  </div>
                </td>
              </tr>
            ) : filteredDocs.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-16 text-center text-slate-400 text-sm">
                  No documents found. Click &quot;New Document&quot; to start.
                </td>
              </tr>
            ) : (
              filteredDocs.map((doc: InternalDocumentRead) => (
                <tr key={doc.id} className="hover:bg-blue-50/20 group transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-800 group-hover:text-blue-700 transition-colors">
                      {doc.title}
                    </div>
                    <div className="text-xs font-mono text-blue-600 bg-blue-50 w-fit px-1.5 py-0.5 rounded mt-1">
                      {doc.system_id}
                    </div>
                  </td>

                  <td className="p-4">
                    {getAssignees(doc.assignments, "DRAFTER").map((a, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 bg-white text-slate-700 px-2 py-1 rounded-md text-xs border border-slate-200 shadow-sm w-fit"
                      >
                        <PenTool size={10} className="text-slate-400" />
                        {employeeName(a.user_id)}
                      </span>
                    ))}
                  </td>

                  <td className="p-4">
                    {getAssignees(doc.assignments, "VERIFIER").map((a, i) => (
                      <span
                        key={i}
                        className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs border shadow-sm w-fit ${
                          a.is_completed
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-orange-50 text-orange-700 border-orange-200"
                        }`}
                      >
                        <ShieldCheck size={10} />
                        {employeeName(a.user_id)}
                        {a.is_completed && <CheckCircle2 size={10} />}
                      </span>
                    ))}
                  </td>

                  <td className="p-4">
                    {getAssignees(doc.assignments, "APPROVER").map((a, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                          <User size={11} className="text-blue-600" />
                        </div>
                        {employeeName(a.user_id)}
                      </div>
                    ))}
                  </td>

                  <td className="p-4 text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                        doc.status === "RELEASED"
                          ? "bg-green-100 text-green-700 border-green-200"
                          : doc.status === "DRAFT"
                          ? "bg-slate-100 text-slate-600 border-slate-200"
                          : "bg-blue-100 text-blue-700 border-blue-200"
                      }`}
                    >
                      {doc.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative animate-in zoom-in-95 duration-200"
          >
            <button
              type="button"
              onClick={() => { setIsModalOpen(false); setForm(EMPTY_FORM); }}
              className="absolute top-5 right-5 p-1.5 hover:bg-slate-100 rounded-lg transition"
            >
              <X size={18} className="text-slate-400" />
            </button>

            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <FileText className="text-blue-600" size={22} />
              New Controlled Document
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Document Title</label>
                <input
                  required
                  className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  placeholder="e.g. Calibration Procedure for Spectrophotometer"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Document Type</label>
                <select
                  required
                  className="w-full border rounded-lg p-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  value={form.document_type_id}
                  onChange={(e) =>
                    setForm({ ...form, document_type_id: e.target.value === "" ? "" : Number(e.target.value) })
                  }
                >
                  <option value="">Select document type...</option>
                  {docTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.prefix}] {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Assign Workflow Roles
                </p>

                {(
                  [
                    { id: "drafter_user_id" as const, label: "Drafter", icon: <PenTool size={12} /> },
                    { id: "verifier_user_id" as const, label: "Verifier", icon: <ShieldCheck size={12} /> },
                    { id: "approver_user_id" as const, label: "Approver", icon: <User size={12} /> },
                  ]
                ).map((field) => (
                  <div key={field.id} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-slate-600 w-20 shrink-0">
                      {field.icon}
                      {field.label}
                    </span>
                    <select
                      className="flex-1 border rounded-lg p-1.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500/30"
                      value={form[field.id]}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          [field.id]: e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                    >
                      <option value="">Unassigned</option>
                      {employees.map((emp: EmployeeRead) => (
                        <option key={emp.user_id} value={emp.user_id}>
                          {emp.first_name} {emp.last_name}
                          {emp.primary_position ? ` (${emp.primary_position})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); setForm(EMPTY_FORM); }}
                className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-lg transition text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createDoc.isPending}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2 text-sm disabled:opacity-70"
              >
                {createDoc.isPending && <Loader2 size={14} className="animate-spin" />}
                Create Document
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
