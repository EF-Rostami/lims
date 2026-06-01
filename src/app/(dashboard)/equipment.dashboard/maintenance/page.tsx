// @ts-nocheck — legacy QMS/document pages pending backend_v3 migration
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { 
  Wrench, Plus, Filter, Edit2, Trash2, 
  CheckCircle2, Clock, AlertCircle, X, ExternalLink 
} from 'lucide-react';
import { PermissionGate } from '@/components/protection/PermissionGate';
import { useEquipments } from '@/services/equipment/equipment.hooks';
import { 
  useMaintenances, 
  useCreateMaintenance, 
  useUpdateMaintenance, 
  useDeleteMaintenance 
} from '@/services/maintenance/maintenance.hooks';
import { format } from 'date-fns';

export default function MaintenancePage() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filters, setFilters] = useState({ equipment_id: '', maintenance_type: '' });

  const { data: maintenances = [], isLoading } = useMaintenances({
    equipment_id: filters.equipment_id ? parseInt(filters.equipment_id) : undefined,
    maintenance_type: (filters.maintenance_type as any) || undefined,
  });
  const { data: equipmentList = [] } = useEquipments();
  
  const createMutation = useCreateMaintenance();
  const updateMutation = useUpdateMaintenance();
  const deleteMutation = useDeleteMaintenance();

  const [formData, setFormData] = useState({
    equipment_id: '',
    scheduled_date: '',
    completion_date: '', 
    maintenance_type: 'preventive' as 'preventive' | 'corrective' | 'predictive', 
    status: 'completed' as 'scheduled' | 'in_progress' | 'completed' | 'cancelled',
    description: '',
    performed_by_external: '',
    cost: 0,
    notes: ''
  });

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      equipment_id: '', scheduled_date: '', completion_date: '',
      maintenance_type: 'preventive', status: 'completed',
      description: '', performed_by_external: '', cost: 0, notes: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      equipment_id: parseInt(formData.equipment_id),
      completion_date: formData.completion_date || null,
      cost: Number(formData.cost)
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload }, { onSuccess: closeForm });
    } else {
      createMutation.mutate(payload, { onSuccess: closeForm });
    }
  };

  const handleEdit = (m: any) => {
    setFormData({
      equipment_id: m.equipment_id.toString(),
      scheduled_date: m.scheduled_date?.split('T')[0] || '',
      completion_date: m.completion_date?.split('T')[0] || '',
      maintenance_type: m.maintenance_type, 
      status: m.status,
      description: m.description || '',
      performed_by_external: m.performed_by_external || '',
      cost: m.cost || 0,
      notes: m.notes || ''
    });
    setEditingId(m.id);
    setShowForm(true);
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-50 text-green-700 border-green-100';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'scheduled': return 'bg-amber-50 text-amber-700 border-amber-100';
      default: return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  if (isLoading) return <div className="p-10 text-center animate-pulse text-gray-500 font-medium">Synchronizing Maintenance Records...</div>;

  return (
    <PermissionGate roles={['equipment_manager', 'admin']}>
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
              <Wrench className="w-8 h-8 text-blue-600" /> Maintenance Logs
            </h1>
            <p className="text-gray-500 text-sm mt-1">Track preventive and corrective service history for all assets.</p>
          </div>
          <button 
            onClick={() => setShowForm(true)} 
            className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition shadow-lg active:scale-95"
          >
            <Plus className="w-5 h-5" /> Log Service
          </button>
        </div>

        {/* Filter Section */}
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 text-gray-400 mr-2">
            <Filter className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Filter By</span>
          </div>
          <select 
            value={filters.equipment_id} 
            onChange={(e) => setFilters(f => ({ ...f, equipment_id: e.target.value }))}
            className="border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-w-55"
          >
            <option value="">All Equipment</option>
            {equipmentList.filter(e => !('detail' in e)).map((eq: any) => (
              <option key={eq.id} value={eq.id}>{eq.name} ({eq.equipment_code})</option>
            ))}
          </select>
          <select 
            value={filters.maintenance_type} 
            onChange={(e) => setFilters(f => ({ ...f, maintenance_type: e.target.value }))}
            className="border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Service Types</option>
            <option value="preventive">Preventive</option>
            <option value="corrective">Corrective</option>
            <option value="predictive">Predictive</option>
          </select>
        </div>

        {/* Maintenance Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-left border-b border-gray-100">
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Asset & Description</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Service Type</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Schedule</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {maintenances.map((m) => (
                <tr key={m.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-800 leading-tight">
                      {equipmentList.find((e: any) => e.id === m.equipment_id)?.name || 'Unknown Asset'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{m.description}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase bg-blue-50 text-blue-700 border border-blue-100">
                      {m.maintenance_type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-gray-700">
                        {m.scheduled_date ? format(new Date(m.scheduled_date), 'MMM dd, yyyy') : '---'}
                      </span>
                      {m.completion_date && (
                        <span className="text-[10px] text-green-600 font-medium">Done: {format(new Date(m.completion_date), 'MMM dd')}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${getStatusStyle(m.status)}`}>
                      {m.status === 'completed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {m.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(m)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => { if(confirm('Delete record?')) deleteMutation.mutate(m.id)}} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden border border-white/20">
              <div className="px-8 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-blue-600" />
                  {editingId ? 'Update Service Record' : 'Log New Service'}
                </h2>
                <button onClick={closeForm} className="p-2 hover:bg-gray-200 rounded-full transition"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Asset ID</label>
                  <select required value={formData.equipment_id} onChange={e => setFormData({...formData, equipment_id: e.target.value})} className="w-full border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-semibold text-gray-700">
                    <option value="">Select Equipment...</option>
                    {equipmentList.filter(e => !('detail' in e)).map((eq: any) => (
                      <option key={eq.id} value={eq.id}>{eq.name} ({eq.equipment_code})</option>
                    ))}
                  </select>
                </div>
                {/* ... other fields styled consistently ... */}
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-black uppercase text-gray-400 ml-1">Service Description</label>
                  <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border-gray-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 min-h-20" />
                </div>
                <div className="md:col-span-2 flex gap-4 pt-4 border-t border-gray-50">
                  <button type="button" onClick={closeForm} className="flex-1 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition">Discard</button>
                  <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100">Save Log Entry</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PermissionGate>
  );
}