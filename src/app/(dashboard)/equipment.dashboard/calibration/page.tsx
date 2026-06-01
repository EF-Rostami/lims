/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { 
  Plus, Search, Filter, Edit2, Trash2, 
  CheckCircle, XCircle, Calendar, FileText, X 
} from 'lucide-react';
import { 
  useCalibrations, 
  useCreateCalibration, 
  useUpdateCalibration, 
  useDeleteCalibration 
} from '@/services/calibration/calibration.hooks';
import { PermissionGate } from '@/components/protection/PermissionGate';
import { useEquipments } from '@/services/equipment/equipment.hooks';
import { format } from 'date-fns';

export default function CalibrationsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filters, setFilters] = useState({ equipment_id: '', status_filter: '' });

  // TanStack Query Hooks
  const { data: calibrations = [], isLoading } = useCalibrations({
    equipment_id: filters.equipment_id ? parseInt(filters.equipment_id) : undefined,
    status_filter: filters.status_filter || undefined,
  });
  
  const { data: equipmentList = [] } = useEquipments();
  
  const createMutation = useCreateCalibration();
  const updateMutation = useUpdateCalibration();
  const deleteMutation = useDeleteCalibration();

  const [formData, setFormData] = useState({
    equipment_id: '',
    calibration_date: '',
    next_calibration_date: '',
    status: 'passed' as 'passed' | 'failed',
    calibration_standard: '',
    certificate_number: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { 
      ...formData, 
      equipment_id: parseInt(formData.equipment_id),
      // V3 usually prefers null for empty optional strings
      certificate_number: formData.certificate_number || null,
      next_calibration_date: formData.next_calibration_date || null
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload }, { onSuccess: () => closeForm() });
    } else {
      createMutation.mutate(payload, { onSuccess: () => closeForm() });
    }
  };

  const handleEdit = (cal: any) => {
    setFormData({
      equipment_id: cal.equipment_id.toString(),
      calibration_date: cal.calibration_date.split('T')[0],
      next_calibration_date: cal.next_calibration_date?.split('T')[0] || '',
      status: cal.status,
      calibration_standard: cal.calibration_standard,
      certificate_number: cal.certificate_number || '',
      notes: cal.notes || ''
    });
    setEditingId(cal.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      equipment_id: '', calibration_date: '', next_calibration_date: '',
      status: 'passed', calibration_standard: '', certificate_number: '', notes: ''
    });
  };

  if (isLoading) return <div className="p-10 text-center animate-pulse text-gray-500 font-medium">Loading Calibration Records...</div>;

  return (
    <PermissionGate roles={['equipment_manager', 'admin']}>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Calibration Logs</h1>
            <p className="text-gray-500 text-sm">Review and manage asset calibration history.</p>
          </div>
          <button 
            onClick={() => setShowForm(true)} 
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
          >
            <Plus className="w-5 h-5" /> Log New Calibration
          </button>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-gray-400 mr-2">
            <Filter className="w-4 h-4" />
            <span className="text-xs font-black uppercase tracking-widest">Filters</span>
          </div>
          <select 
            value={filters.equipment_id} 
            onChange={(e) => setFilters(f => ({ ...f, equipment_id: e.target.value }))}
            className="border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-w-50"
          >
            <option value="">All Equipment</option>
            {equipmentList.filter(e => !('detail' in e)).map((eq: any) => (
              <option key={eq.id} value={eq.id}>{eq.name} ({eq.equipment_code})</option>
            ))}
          </select>
          <select 
            value={filters.status_filter} 
            onChange={(e) => setFilters(f => ({ ...f, status_filter: e.target.value }))}
            className="border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Outcomes</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-left border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Asset Information</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Standard / Certificate</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Execution Date</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Outcome</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {calibrations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 italic">No calibration records found.</td>
                </tr>
              ) : (
                calibrations.map((cal) => (
                  <tr key={cal.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-800 leading-tight">
                        {equipmentList.find((e: any) => e.id === cal.equipment_id)?.name || 'Unknown Asset'}
                      </p>
                      <p className="text-[10px] font-mono text-blue-500 mt-0.5 uppercase">ID: {cal.equipment_id}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-gray-400" /> {cal.standard_used}
                        </span>
                        {cal.certificate_number && (
                          <span className="text-[11px] text-gray-400 mt-1 italic">Cert: {cal.certificate_number}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-600">
                      {format(new Date(cal.calibration_date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                        cal.status === 'passed' 
                          ? 'bg-green-50 text-green-700 border-green-100' 
                          : 'bg-red-50 text-red-700 border-red-100'
                      }`}>
                        {cal.status === 'passed' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {cal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(cal)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit Record">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => { if(confirm('Permanently delete this record?')) deleteMutation.mutate(cal.id)}} 
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal Logic */}
        {showForm && (
           <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-white/20">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-500" />
                    {editingId ? 'Edit Calibration Record' : 'Log New Calibration'}
                  </h2>
                  <button onClick={closeForm} className="p-2 hover:bg-gray-200 rounded-full transition"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400">Target Equipment</label>
                    <select 
                      required
                      value={formData.equipment_id} 
                      onChange={e => setFormData({...formData, equipment_id: e.target.value})}
                      className="w-full border-gray-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-medium"
                    >
                      <option value="">Select Asset...</option>
                      {equipmentList.filter(e => !('detail' in e)).map((eq: any) => (
                        <option key={eq.id} value={eq.id}>{eq.name} ({eq.equipment_code})</option>
                      ))}
                    </select>
                  </div>
                  {/* ... other fields follow same styling pattern ... */}
                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={closeForm} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition">Cancel</button>
                    <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition">
                      {editingId ? 'Update Log' : 'Save Record'}
                    </button>
                  </div>
                </form>
              </div>
           </div>
        )}
      </div>
    </PermissionGate>
  );
}