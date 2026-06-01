// @ts-nocheck — legacy QMS/document pages pending backend_v3 migration
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Info, ShieldCheck, Wrench, History } from 'lucide-react';
import Link from 'next/link';
import { useEquipment, useUpdateEquipment } from '@/services/equipment/equipment.hooks';
import { PermissionGate } from '@/components/protection/PermissionGate';
import { Equipment } from '@/services/equipment/equipment.types';

type EquipmentStatus = "operational" | "under_maintenance" | "calibration_due" | "out_of_service" | "pending_verification";

export default function EditEquipmentPage() {
  const { id } = useParams();
  const router = useRouter();
  const equipmentId = parseInt(id as string);

  const { data, isLoading: isFetching } = useEquipment(equipmentId);
  const updateMutation = useUpdateEquipment();

  const [formData, setFormData] = useState({
    name: '',
    manufacturer: '',
    model: '',
    serial_number: '',
    location: '',
    status: 'operational' as EquipmentStatus,
    purchase_date: '',
    warranty_expiry: '',
    notes: ''
  });

  useEffect(() => {
    if (data && !('detail' in data)) {
      const eq = data as Equipment;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: eq.name || '',
        manufacturer: eq.manufacturer || '',
        model: eq.model || '',
        serial_number: eq.serial_number || '',
        location: eq.location || '',
        status: (eq.status as EquipmentStatus) || 'operational',
        purchase_date: eq.purchase_date?.split('T')[0] || '',
        warranty_expiry: eq.warranty_expiry?.split('T')[0] || '',
        notes: eq.notes || ''
      });
    }
  }, [data]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      purchase_date: formData.purchase_date || null,
      warranty_expiry: formData.warranty_expiry || null,
    };

    updateMutation.mutate({ id: equipmentId, data: payload }, {
      onSuccess: () => router.push(`/equipment.dashboard/equipment/${equipmentId}`)
    });
  };

  if (isFetching) return <div className="p-10 text-center animate-pulse text-gray-400 font-medium">Synchronizing Asset Data...</div>;

  return (
    <PermissionGate roles={['equipment_manager', 'admin']}>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/equipment.dashboard/equipment/${equipmentId}`} className="p-2 hover:bg-gray-100 rounded-full transition">
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Edit Asset</h1>
          </div>
          <div className="text-right">
             <p className="text-[10px] font-black uppercase text-gray-400">Asset ID</p>
             <p className="text-sm font-mono text-blue-600 font-bold">#{equipmentId}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Information */}
          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-800">
              <Info className="w-5 h-5 text-blue-500" /> Identity & Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-500 ml-1">Equipment Name</label>
                <input
                  required
                  className="w-full border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-black uppercase text-gray-500 ml-1">Asset Status</label>
                <select
                  className="w-full border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white font-semibold"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as EquipmentStatus})}
                >
                  <option value="operational">Operational</option>
                  <option value="under_maintenance">Under Maintenance</option>
                  <option value="calibration_due">Calibration Due</option>
                  <option value="out_of_service">Out of Service</option>
                  <option value="pending_verification">Pending Verification</option>
                </select>
              </div>
            </div>
          </div>

          {/* Technical Specs */}
          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8">
             <h2 className="text-lg font-bold mb-6 text-gray-800">Technical Specifications</h2>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-500">Manufacturer</label>
                  <input
                    className="w-full border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.manufacturer}
                    onChange={e => setFormData({...formData, manufacturer: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-500">Model</label>
                  <input
                    className="w-full border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.model}
                    onChange={e => setFormData({...formData, model: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase text-gray-500">Serial Number</label>
                  <input
                    className="w-full border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.serial_number}
                    onChange={e => setFormData({...formData, serial_number: e.target.value})}
                  />
                </div>
             </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end items-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition"
            >
              Discard Changes
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex items-center gap-2 px-10 py-3 bg-gray-900 text-white rounded-xl hover:bg-black disabled:bg-gray-300 transition shadow-lg active:scale-95"
            >
              {updateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span className="font-bold">Save Asset</span>
            </button>
          </div>
        </form>
      </div>
    </PermissionGate>
  );
}