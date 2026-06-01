/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from 'react';
import { 
  useDocumentTypes, 
  useCreateDocumentType, 
  useUpdateDocumentType,
  useDeleteDocumentType,
} from "@/services/internalDocument/internalDocument.hooks";
import { useRolesMatrix } from "@/services/admin/admin.hooks";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X, ShieldCheck, Loader2, Pencil, Trash2 } from "lucide-react";

export default function DocumentConfigPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const { data: docTypes = [], isLoading: loadingTypes } = useDocumentTypes();
  const { data: roles = [] } = useRolesMatrix();
  
  const createMutation = useCreateDocumentType();
  const updateMutation = useUpdateDocumentType();
  const deleteMutation = useDeleteDocumentType();

  const [formData, setFormData] = useState({
    name: '',
    prefix: '',
    description: '',
    can_create: 'ANALYST',
    can_verify: 'QUALITY_MANAGER',
    can_approve: 'TECHNICAL_MANAGER'
  });

  // --- Handlers ---
  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ 
      name: '', prefix: '', description: '', 
      can_create: 'ANALYST', can_verify: 'QUALITY_MANAGER', can_approve: 'TECHNICAL_MANAGER' 
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (type: any) => {
    setEditingId(type.id);
    setFormData({
      name: type.name,
      prefix: type.prefix,
      description: type.description || '',
      can_create: type.can_create,
      can_verify: type.can_verify,
      can_approve: type.can_approve
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const options = {
      onSuccess: () => {
        setIsModalOpen(false);
        setEditingId(null);
      }
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData }, options);
    } else {
      createMutation.mutate(formData, options);
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure? This may affect existing documents of this type.")) {
      deleteMutation.mutate(id);
    }
  };

  if (loadingTypes) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" /></div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">QMS Document Hierarchy</h1>
          <p className="text-slate-500">Map document categories to required authorization roles.</p>
        </div>
        <button 
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-100"
        >
           <Plus size={18}/> New Type
        </button>
      </header>

      <div className="grid gap-4">
        {docTypes.map((type: any) => (
          <Card key={type.id} className="group border-slate-200 hover:border-blue-300 transition-all hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-mono font-bold border border-blue-100 uppercase">
                    {type.prefix}
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-slate-900">{type.name}</h2>
                    <p className="text-sm text-slate-500 max-w-md mt-1 italic">
                      {type.description || "No description provided."}
                    </p>
                  </div>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenEdit(type)}
                    className="p-2 hover:bg-blue-50 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <Pencil size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(type.id)}
                    disabled={deleteMutation.isPending}
                    className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                  >
                    {deleteMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap gap-3">
                 <RolePolicy label="Draft" roleName={type.can_create} />
                 <RolePolicy label="Verify" roleName={type.can_verify} />
                 <RolePolicy label="Approve" roleName={type.can_approve} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* MODAL (Unified Create/Edit) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative animate-in zoom-in duration-200">
            <button type="button" onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>

            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <ShieldCheck className="text-blue-600" /> 
              {editingId ? 'Update Category' : 'Register Category'}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold uppercase text-slate-500 ml-1">Name</label>
                  <input required className="w-full border rounded-xl p-2.5 mt-1 focus:ring-2 ring-blue-500 outline-none" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-slate-500 ml-1">Prefix</label>
                  <input required className="w-full border rounded-xl p-2.5 mt-1 font-mono uppercase focus:ring-2 ring-blue-500 outline-none" 
                    value={formData.prefix} onChange={e => setFormData({...formData, prefix: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-500 ml-1">Description</label>
                <textarea 
                  className="w-full border rounded-xl p-2.5 mt-1 focus:ring-2 ring-blue-500 outline-none min-h-20" 
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Optional details about this document type..."
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-100">
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Workflow Authorization</p>
                {[
                  { id: 'can_create', label: 'Drafter Role' },
                  { id: 'can_verify', label: 'Verifier Role' },
                  { id: 'can_approve', label: 'Approver Role' }
                ].map(field => (
                  <div key={field.id} className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-600">{field.label}</span>
                    <select 
                      className="border rounded-lg p-1.5 text-sm bg-white capitalize"
                      value={(formData as any)[field.id]}
                      onChange={e => setFormData({...formData, [field.id]: e.target.value})}
                    >
                      {roles.map((r: any) => <option key={r.id} value={r.name}>{r.name.replace(/_/g, ' ')}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition">Cancel</button>
              <button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending} 
                className="bg-blue-600 text-white px-8 py-2 rounded-xl font-bold hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-70"
              >
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingId ? 'Save Changes' : 'Create Category'}
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
    <div className="px-4 py-2 bg-white rounded-lg border border-slate-200 min-w-35 shadow-sm">
      <span className="text-[10px] uppercase font-black text-slate-400 block mb-0.5 tracking-tighter">{label}</span>
      <span className="text-xs font-bold text-slate-800 capitalize">
        {roleName?.toLowerCase().replace(/_/g, ' ')}
      </span>
    </div>
  );
}