'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Info, ShieldCheck, AlertCircle } from 'lucide-react';
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

  const [reason, setReason] = useState(''); // NEW: Audit Reason
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

  // Track initial data to detect changes
  const [initialData, setInitialData] = useState<typeof formData | null>(null);

  useEffect(() => {
    if (data && !('detail' in data)) {
      const eq = data as Equipment;
      const mappedData = {
        name: eq.name || '',
        manufacturer: eq.manufacturer || '',
        model: eq.model || '',
        serial_number: eq.serial_number || '',
        location: eq.location || '',
        status: (eq.status as EquipmentStatus) || 'operational',
        purchase_date: eq.purchase_date?.split('T')[0] || '',
        warranty_expiry: eq.warranty_expiry?.split('T')[0] || '',
        notes: eq.notes || ''
      };
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData(mappedData);
      setInitialData(mappedData);
    }
  }, [data]);

  // Detect if form has changed
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialData);
  }, [formData, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isDirty && reason.length < 5) {
      alert("A valid reason for change is required for compliance.");
      return;
    }

    const payload = {
      ...formData,
      purchase_date: formData.purchase_date || null,
      warranty_expiry: formData.warranty_expiry || null,
      change_reason: reason // NEW: Passed to backend audit log
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
          {/* Identity & Status */}
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

          {/* Technical Specs Block (Manufacturer, Model, etc.) - Omitted for brevity */}

          {/* COMPLIANCE BLOCK: Reason for Change */}
          {isDirty && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-8 animate-in slide-in-from-top-2 duration-300">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-orange-800">
                <ShieldCheck className="w-5 h-5" /> Compliance: Reason for Change
              </h2>
              <p className="text-sm text-orange-700 mb-4 font-medium">
                Changes detected. Please document the reason for this modification for the audit trail.
              </p>
              <textarea
                required
                placeholder="e.g., Updated status following successful external calibration report #4421."
                className="w-full border-orange-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-orange-500 outline-none min-h-25"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              {reason.length < 5 && (
                <p className="mt-2 text-[10px] text-orange-600 font-bold flex items-center gap-1">
                  <AlertCircle size={12} /> Minimum 5 characters required.
                </p>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end items-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-100"
            >
              Discard
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending || (isDirty && reason.length < 5)}
              className="flex items-center gap-2 px-10 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 transition shadow-lg shadow-blue-200"
            >
              {updateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span className="font-bold">Commit Changes</span>
            </button>
          </div>
        </form>
      </div>
    </PermissionGate>
  );
}