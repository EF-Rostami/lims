/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { 
  ClipboardCheck, Plus, Filter, Edit2, Trash2, 
  CheckCircle2, AlertTriangle, X, Search, Info
} from 'lucide-react';
import { PermissionGate } from '@/components/protection/PermissionGate';
import { useEquipments } from '@/services/equipment/equipment.hooks';
import { 
  useIntermediateChecks, 
  useCreateIntermediateCheck, 
  useUpdateIntermediateCheck, 
  useDeleteIntermediateCheck 
} from '@/services/intermediate-check/intermediate-check.hooks';
import { format } from 'date-fns';

export default function IntermediateChecksPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filters, setFilters] = useState({ equipment_id: '', status_filter: '' });

  const { data: checks = [], isLoading } = useIntermediateChecks({
    equipment_id: filters.equipment_id ? parseInt(filters.equipment_id) : undefined,
    status_filter: filters.status_filter || undefined,
  });
  
  const { data: equipmentList = [] } = useEquipments();
  
  const createMutation = useCreateIntermediateCheck();
  const updateMutation = useUpdateIntermediateCheck();
  const deleteMutation = useDeleteIntermediateCheck();

  const [formData, setFormData] = useState({
    equipment_id: '',
    check_date: '',
    next_check_date: '',
    overall_status: 'passed' as 'passed' | 'failed',
    check_parameters: '',
    findings: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { 
      ...formData, 
      equipment_id: parseInt(formData.equipment_id),
      next_check_date: formData.next_check_date || null,
      findings: formData.findings || null
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload }, { onSuccess: closeForm });
    } else {
      createMutation.mutate(payload, { onSuccess: closeForm });
    }
  };

  const handleEdit = (c: any) => {
    setFormData({
      equipment_id: c.equipment_id.toString(),
      check_date: c.check_date.split('T')[0],
      next_check_date: c.next_check_date?.split('T')[0] || '',
      overall_status: c.overall_status,
      check_parameters: c.check_parameters || '',
      findings: c.findings || '',
      notes: c.notes || ''
    });
    setEditingId(c.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      equipment_id: '', check_date: '', next_check_date: '',
      overall_status: 'passed', check_parameters: '', findings: '', notes: ''
    });
  };

  if (isLoading) return <div className="p-10 text-center animate-pulse text-gray-500 font-medium tracking-widest">VERIFYING COMPLIANCE RECORDS...</div>;

  return (
    <PermissionGate roles={['equipment_manager', 'admin']}>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <ClipboardCheck className="w-8 h-8 text-purple-600" /> Intermediate Checks
            </h1>
            <p className="text-gray-500 text-sm mt-1">Periodic verification of equipment performance between formal calibrations.</p>
          </div>
          <button 
            onClick={() => setShowForm(true)} 
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition shadow-lg active:scale-95"
          >
            <Plus className="w-5 h-5" /> New Verification
          </button>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-gray-400 mr-2">
            <Filter className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Filter By</span>
          </div>
          <select 
            value={filters.equipment_id} 
            onChange={(e) => setFilters(f => ({ ...f, equipment_id: e.target.value }))}
            className="border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none min-w-55"
          >
            <option value="">All Equipment</option>
            {equipmentList.filter(e => !('detail' in e)).map((eq: any) => (
              <option key={eq.id} value={eq.id}>{eq.name} ({eq.equipment_code})</option>
            ))}
          </select>
          <select 
            value={filters.status_filter} 
            onChange={(e) => setFilters(f => ({ ...f, status_filter: e.target.value }))}
            className="border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Table UI */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-left border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Asset Information</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Execution Date</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Findings</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {checks.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">No intermediate checks logged.</td></tr>
              ) : (
                checks.map((c) => (
                  <tr key={c.id} className="hover:bg-purple-50/20 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800 leading-tight">
                        {equipmentList.find((e: any) => e.id === c.equipment_id)?.name || 'Unknown'}
                      </p>
                      <p className="text-[10px] font-mono text-purple-500 mt-1 uppercase">ID: {c.equipment_id}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-600">
                      {format(new Date(c.check_date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                        c.overall_status === 'passed' 
                          ? 'bg-green-50 text-green-700 border-green-100' 
                          : 'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        {c.overall_status === 'passed' ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                        {c.overall_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-gray-500 line-clamp-1 italic">{c.findings || 'Standard criteria met.'}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => { if(confirm('Remove this check record?')) deleteMutation.mutate(c.id)}} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-purple-600" />
                  {editingId ? 'Edit Check Record' : 'Log Verification Check'}
                </h2>
                <button onClick={closeForm} className="p-2 hover:bg-gray-200 rounded-full transition"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Instrument</label>
                  <select required value={formData.equipment_id} onChange={e => setFormData({...formData, equipment_id: e.target.value})} className="w-full border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 font-bold">
                    <option value="">Select Equipment...</option>
                    {equipmentList.filter(e => !('detail' in e)).map((eq: any) => (
                      <option key={eq.id} value={eq.id}>{eq.name} ({eq.equipment_code})</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Check Date</label>
                    <input type="date" required value={formData.check_date} onChange={e => setFormData({...formData, check_date: e.target.value})} className="w-full border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 font-medium" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Outcome</label>
                    <select value={formData.overall_status} onChange={e => setFormData({...formData, overall_status: e.target.value as any})} className="w-full border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50 font-bold uppercase text-[11px]">
                      <option value="passed">Passed</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Findings / Deviations</label>
                  <textarea value={formData.findings} onChange={e => setFormData({...formData, findings: e.target.value})} className="w-full border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50" placeholder="Describe any observed deviations..." rows={2} />
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-50">
                  <button type="button" onClick={closeForm} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition">Discard</button>
                  <button type="submit" className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-100">Commit Record</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PermissionGate>
  );
}