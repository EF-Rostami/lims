"use client";

import React, { useState } from "react";
import { Plus, X, ShieldCheck, Loader2, Pencil, Trash2 } from "lucide-react";
import {
  useDocumentTypesList,
  useCreateDocumentType,
  useUpdateDocumentType,
  useDeleteDocumentType,
} from "@/features/consultant/consultant.queries";
import { useRolesList } from "@/features/consultant/consultant.queries";
import type { DocumentTypeRead } from "@/features/consultant/consultant.api";

type FormData = {
  name: string;
  prefix: string;
  description: string;
  can_create: string;
  can_verify: string;
  can_approve: string;
};

const DEFAULT_FORM: FormData = {
  name: "",
  prefix: "",
  description: "",
  can_create: "analyst",
  can_verify: "quality_manager",
  can_approve: "technical_manager",
};

export default function DocumentConfigPage() {
  const { data: docTypes = [], isLoading } = useDocumentTypesList();
  const { data: roles = [] } = useRolesList();

  const createMutation = useCreateDocumentType();
  const updateMutation = useUpdateDocumentType();
  const deleteMutation = useDeleteDocumentType();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(DEFAULT_FORM);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (type: DocumentTypeRead) => {
    setEditingId(type.id);
    setFormData({
      name: type.name,
      prefix: type.prefix,
      description: type.description || "",
      can_create: type.can_create,
      can_verify: type.can_verify,
      can_approve: type.can_approve,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const options = { onSuccess: () => { setIsModalOpen(false); setEditingId(null); } };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData }, options);
    } else {
      createMutation.mutate(formData, options);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Delete this document type? This may affect existing documents.")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="p-20 text-center">
        <Loader2 className="animate-spin mx-auto text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <header className="flex justify-between items-end border-b pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Phase 3</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Document Types & Roles</h1>
          <p className="text-slate-500 mt-1 italic">Map document categories to required authorization roles.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-100"
        >
          <Plus size={18} /> New Type
        </button>
      </header>

      {docTypes.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <ShieldCheck className="mx-auto mb-3 text-slate-200" size={40} />
          <p className="text-sm">No document types configured yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {docTypes.map((type: DocumentTypeRead) => (
            <div
              key={type.id}
              className="group p-6 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-mono font-bold border border-blue-100 uppercase text-sm shrink-0">
                    {type.prefix}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-slate-900">{type.name}</h2>
                    <p className="text-sm text-slate-500 mt-0.5 italic">
                      {type.description || "No description provided."}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenEdit(type)}
                    className="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(type.id)}
                    disabled={deleteMutation.isPending}
                    className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-5 pt-5 border-t border-slate-100 flex flex-wrap gap-3">
                <RolePolicy label="Draft" roleName={type.can_create} />
                <RolePolicy label="Verify" roleName={type.can_verify} />
                <RolePolicy label="Approve" roleName={type.can_approve} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative animate-in zoom-in-95 duration-200"
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 hover:bg-slate-100 rounded-lg transition"
            >
              <X size={18} className="text-slate-400" />
            </button>

            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ShieldCheck className="text-blue-600" size={22} />
              {editingId ? "Update Document Type" : "Register Document Type"}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Name</label>
                  <input
                    required
                    className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Prefix</label>
                  <input
                    required
                    className="w-full border rounded-lg p-2.5 text-sm font-mono uppercase outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    value={formData.prefix}
                    onChange={(e) => setFormData({ ...formData, prefix: e.target.value.toUpperCase() })}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Description</label>
                <textarea
                  rows={3}
                  className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 resize-none"
                  placeholder="Optional details about this document type..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Workflow Authorization
                </p>
                {(
                  [
                    { id: "can_create" as const, label: "Drafter Role" },
                    { id: "can_verify" as const, label: "Verifier Role" },
                    { id: "can_approve" as const, label: "Approver Role" },
                  ]
                ).map((field) => (
                  <div key={field.id} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">{field.label}</span>
                    <select
                      className="border rounded-lg p-1.5 text-sm bg-white capitalize outline-none focus:ring-2 focus:ring-blue-500/30"
                      value={formData[field.id]}
                      onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.name}>
                          {r.name.replace(/_/g, " ")}
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
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-lg transition text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2 text-sm disabled:opacity-70"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                {editingId ? "Save Changes" : "Create Type"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function RolePolicy({ label, roleName }: { label: string; roleName: string }) {
  return (
    <div className="px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm min-w-32">
      <span className="text-[10px] uppercase font-black text-slate-400 block mb-0.5 tracking-tight">
        {label}
      </span>
      <span className="text-xs font-bold text-slate-800 capitalize">
        {roleName?.toLowerCase().replace(/_/g, " ")}
      </span>
    </div>
  );
}
