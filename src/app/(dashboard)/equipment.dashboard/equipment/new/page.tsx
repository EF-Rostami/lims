/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Save, Loader2, Database, 
  ShieldCheck, Wrench, Info, MapPin, Tag 
} from 'lucide-react';
import Link from 'next/link';
import { useCreateEquipment } from '@/services/equipment/equipment.hooks';
import { PermissionGate } from '@/components/protection/PermissionGate';

export default function NewEquipmentPage() {
  const router = useRouter();
  const createMutation = useCreateEquipment();

  const [formData, setFormData] = useState({
    equipment_code: '',
    name: '',
    manufacturer: '',
    model: '',
    serial_number: '',
    location: '',
    category: 'analytical',
    status: 'operational' as const,
    purchase_date: '',
    warranty_expiry: '',
    cal_interval: 365,
    maint_interval: 180,
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      manufacturer: formData.manufacturer || null,
      model: formData.model || null,
      serial_number: formData.serial_number || null,
      location: formData.location || null,
      purchase_date: formData.purchase_date || null,
      warranty_expiry: formData.warranty_expiry || null,
      requirements: [
        {
          requirement_type: 'calibration' as const,
          description: `Standard calibration for ${formData.name}`,
          frequency_days: Number(formData.cal_interval),
          scheduling_policy: 'floating' as const,
          is_mandatory: true
        },
        {
          requirement_type: 'maintenance' as const,
          description: `Scheduled PM for ${formData.name}`,
          frequency_days: Number(formData.maint_interval),
          scheduling_policy: 'fixed' as const,
          is_mandatory: true
        }
      ]
    };

    createMutation.mutate(payload, {
      onSuccess: () => router.push('/equipment.dashboard/equipment'),
    });
  };

  return (
    <PermissionGate roles={['equipment_manager', 'admin']}>
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/equipment.dashboard/equipment" className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Register New Asset</h1>
            <p className="text-gray-500 text-sm font-medium">Initialize a new piece of equipment in the LIMS registry.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Core Identity */}
          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8">
            <h2 className="text-sm font-black mb-6 flex items-center gap-2 text-gray-400 uppercase tracking-widest">
              <Database className="w-4 h-4 text-blue-500" /> Core Identity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Asset Tag / ID *</label>
                <input
                  required
                  placeholder="e.g. HPLC-01"
                  className="w-full border-gray-200 bg-gray-50/50 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                  value={formData.equipment_code}
                  onChange={e => setFormData({...formData, equipment_code: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Equipment Name *</label>
                <input
                  required
                  placeholder="e.g. Waters Alliance HPLC"
                  className="w-full border-gray-200 bg-gray-50/50 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Asset Specifications (The missing fields) */}
          <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8">
            <h2 className="text-sm font-black mb-6 flex items-center gap-2 text-gray-400 uppercase tracking-widest">
              <Tag className="w-4 h-4 text-orange-500" /> Specifications & Location
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Manufacturer</label>
                <input
                  placeholder="e.g. Agilent"
                  className="w-full border-gray-100 bg-gray-50 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                  value={formData.manufacturer}
                  onChange={e => setFormData({...formData, manufacturer: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Model</label>
                <input
                  placeholder="e.g. 1260 Infinity"
                  className="w-full border-gray-100 bg-gray-50 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                  value={formData.model}
                  onChange={e => setFormData({...formData, model: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Serial Number</label>
                <input
                  placeholder="SN123456"
                  className="w-full border-gray-100 bg-gray-50 rounded-xl p-3 text-sm font-mono outline-none focus:ring-2 focus:ring-orange-500"
                  value={formData.serial_number}
                  onChange={e => setFormData({...formData, serial_number: e.target.value})}
                />
              </div>
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Current Location
                </label>
                <input
                  placeholder="e.g. Laboratory A, Bench 4"
                  className="w-full border-gray-100 bg-gray-50 rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-orange-500"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-500 ml-1">Category</label>
                <select
                  className="w-full border-gray-100 bg-gray-50 rounded-xl p-3 text-sm outline-none cursor-pointer"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="analytical">Analytical</option>
                  <option value="measurement">Measurement</option>
                  <option value="safety">Safety</option>
                  <option value="storage">Storage</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Compliance Setup */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8 group hover:border-green-200 transition-colors">
              <h2 className="text-sm font-black mb-4 flex items-center gap-2 text-gray-800 uppercase tracking-tighter">
                <ShieldCheck className="w-5 h-5 text-green-500" /> Calibration Cycle
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Interval (Days)</label>
                  <input
                    type="number"
                    className="w-full border-gray-100 bg-gray-50 rounded-xl p-3 mt-1 outline-none font-mono font-bold focus:ring-2 focus:ring-green-500"
                    value={formData.cal_interval}
                    onChange={e => setFormData({...formData, cal_interval: parseInt(e.target.value)})}
                  />
                </div>
                <div className="text-xs text-gray-400 font-bold mt-5 italic">~ {Math.round(formData.cal_interval / 30)} Months</div>
              </div>
            </div>

            <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-8 group hover:border-purple-200 transition-colors">
              <h2 className="text-sm font-black mb-4 flex items-center gap-2 text-gray-800 uppercase tracking-tighter">
                <Wrench className="w-5 h-5 text-purple-500" /> Maintenance Cycle
              </h2>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-[10px] font-black uppercase text-gray-400">Interval (Days)</label>
                  <input
                    type="number"
                    className="w-full border-gray-100 bg-gray-50 rounded-xl p-3 mt-1 outline-none font-mono font-bold focus:ring-2 focus:ring-purple-500"
                    value={formData.maint_interval}
                    onChange={e => setFormData({...formData, maint_interval: parseInt(e.target.value)})}
                  />
                </div>
                <div className="text-xs text-gray-400 font-bold mt-5 italic">~ {Math.round(formData.maint_interval / 30)} Months</div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <Link href="/equipment.dashboard/equipment" className="px-8 py-3 rounded-xl text-gray-400 text-sm font-bold hover:text-gray-600 transition">
              Discard Changes
            </Link>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="flex items-center gap-2 px-10 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition disabled:bg-gray-300 shadow-xl active:scale-95"
            >
              {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              <span className="font-bold text-sm">Initialize Asset</span>
            </button>
          </div>
        </form>
      </div>
    </PermissionGate>
  );
}