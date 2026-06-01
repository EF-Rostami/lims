/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { 
  Settings2, CalendarClock, ShieldCheck, 
  Trash2, Plus, Save, Info, X 
} from 'lucide-react';
import { useUpdateEquipment } from '@/services/equipment/equipment.hooks';
import { toast } from 'sonner';


interface Props {
  equipment: any; // Ideally Equipment type from your updated types
}

export default function EquipmentRequirementsManager({ equipment }: Props) {
  const updateMutation = useUpdateEquipment();
  
  // Local state for the requirement list
  const [requirements, setRequirements] = useState<any[]>(equipment.requirements || []);

  const handleAddRequirement = () => {
    const newReq = {
      requirement_type: 'maintenance',
      description: '',
      frequency_days: 365,
      scheduling_policy: 'fixed',
      is_mandatory: true
    };
    setRequirements([...requirements, newReq]);
  };

  const handleRemoveRequirement = (index: number) => {
    const updated = requirements.filter((_, i) => i !== index);
    setRequirements(updated);
  };

  const handleChange = (index: number, field: string, value: any) => {
    const updated = [...requirements];
    updated[index] = { ...updated[index], [field]: value };
    setRequirements(updated);
  };

  const handleSavePlan = () => {
    // Basic validation: ensure frequency is a valid number
    const validatedRequirements = requirements.map(req => ({
      ...req,
      frequency_days: Number(req.frequency_days) || 365,
      description: req.description || `${req.requirement_type} requirement`,
      requirement_type: req.requirement_type as "calibration" | "maintenance" | "intermediate_check" | "safety_inspection",
      scheduling_policy: req.scheduling_policy as "floating" | "fixed",
    }));

    updateMutation.mutate({
      id: equipment.id,
      data: { 
        requirements: validatedRequirements,
        change_reason: "Updated service requirements and frequency policy"
      }
    }, {
      onSuccess: () => toast.success('Compliance plan updated successfully'),
      onError: (error: any) => toast.error(error.message || 'Failed to update plan')
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
        <div>
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-blue-600" /> 
            Compliance & Maintenance Plan
          </h3>
          <p className="text-xs text-gray-500">Define the recurring service requirements for this asset.</p>
        </div>
        <button 
          onClick={handleAddRequirement}
          className="flex items-center gap-2 text-sm font-bold bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4 text-blue-600" /> Add Requirement
        </button>
      </div>

      {/* Requirements List */}
      <div className="grid gap-4">
        {requirements.map((req, index) => (
          <div key={index} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm relative group hover:border-blue-100 transition-colors">
            {/* Remove Button */}
            <button 
              onClick={() => handleRemoveRequirement(index)}
              className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Type Selection */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Requirement Type</label>
                <select 
                  value={req.requirement_type}
                  onChange={(e) => handleChange(index, 'requirement_type', e.target.value)}
                  className="w-full border-gray-100 bg-gray-50 rounded-lg p-2 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
                >
                  <option value="calibration">Calibration</option>
                  <option value="maintenance">Maintenance (PM)</option>
                  <option value="intermediate_check">Inter-Check</option>
                  <option value="safety_inspection">Safety Inspection</option>
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2 space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Detailed Description</label>
                <input 
                  type="text"
                  placeholder="e.g., Annual external calibration by ISO 17025 lab"
                  value={req.description}
                  onChange={(e) => handleChange(index, 'description', e.target.value)}
                  className="w-full border-gray-100 bg-gray-50 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Frequency */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1">
                   Frequency 
                   <span title="Interval in days between services">
                     <Info className="w-3 h-3 text-gray-400 cursor-help" />
                   </span>
                </label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    value={req.frequency_days}
                    onChange={(e) => handleChange(index, 'frequency_days', e.target.value)}
                    className="w-full border-gray-100 bg-gray-50 rounded-lg p-2 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Days</span>
                </div>
              </div>

              {/* Scheduling Policy */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-gray-400">Policy</label>
                <select 
                  value={req.scheduling_policy}
                  onChange={(e) => handleChange(index, 'scheduling_policy', e.target.value)}
                  className="w-full border-gray-100 bg-gray-50 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="fixed">Fixed (Calendar based)</option>
                  <option value="floating">Floating (Usage based)</option>
                </select>
              </div>

              {/* Mandatory Toggle */}
              <div className="flex items-center gap-3 pt-4 md:pt-0">
                <div 
                  className="flex items-center gap-2 cursor-pointer select-none"
                  onClick={() => handleChange(index, 'is_mandatory', !req.is_mandatory)}
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${req.is_mandatory ? 'bg-blue-600 border-blue-600' : 'bg-gray-100 border-gray-200'}`}>
                    {req.is_mandatory && <ShieldCheck className="w-3 h-3 text-white" />}
                  </div>
                  <label className="text-xs font-bold text-gray-600 cursor-pointer">
                    Regulatory Mandate
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}

        {requirements.length === 0 && (
          <div className="border-2 border-dashed border-gray-100 rounded-3xl py-16 text-center">
            <CalendarClock className="w-12 h-12 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400 font-medium">No compliance requirements defined for this equipment.</p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-6 border-t border-gray-100 flex justify-end">
        <button 
          onClick={handleSavePlan}
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 bg-gray-900 text-white px-10 py-3 rounded-xl font-bold hover:bg-black transition shadow-xl disabled:bg-gray-300 disabled:shadow-none active:scale-95"
        >
          <Save className="w-5 h-5" />
          {updateMutation.isPending ? 'Updating Asset...' : 'Save Compliance Plan'}
        </button>
      </div>
    </div>
  );
}