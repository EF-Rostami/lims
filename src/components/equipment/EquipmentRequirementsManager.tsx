/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef } from 'react';
import { Settings2, Trash2, Plus, ShieldCheck, Save, RotateCcw } from 'lucide-react';
import { 
  useAddRequirement, 
  useUpdateRequirement, 
  useDeleteRequirement 
} from '@/services/equipment/equipment.hooks';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface Props {
  equipment: any;
}

export default function EquipmentRequirementsManager({ equipment }: Props) {
  const addMutation = useAddRequirement();
  const updateMutation = useUpdateRequirement();
  const deleteMutation = useDeleteRequirement();
  
  const [requirements, setRequirements] = useState<any[]>([]);
  const originalValue = useRef<any>(null);

  useEffect(() => {
    if (equipment?.requirements) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRequirements(equipment.requirements);
    }
  }, [equipment]);

  // 1. Core Logic: Trigger Save via Toast Action
  const triggerSaveConfirm = (reqId: number, field: string, newValue: any, oldValue: any) => {
    if (newValue === oldValue) return;

    const label = field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

    toast(`Save changes to ${label}?`, {
      description: `Change from "${oldValue}" to "${newValue}"`,
      action: {
        label: "Confirm Save",
        onClick: () => {
          updateMutation.mutate({
            requirementId: reqId,
            data: { [field]: field === 'frequency_days' ? Number(newValue) : newValue }
          }, {
            onSuccess: () => toast.success(`${label} updated successfully`),
            onError: () => {
              // Revert local state on error
              setRequirements(prev => prev.map(r => r.id === reqId ? { ...r, [field]: oldValue } : r));
              toast.error("Failed to save changes");
            }
          });
        },
      },
      cancel: {
        label: "Revert",
        onClick: () => {
          // Revert local state if they hit cancel
          setRequirements(prev => prev.map(r => r.id === reqId ? { ...r, [field]: oldValue } : r));
        }
      },
      duration: 5000, // Give them 5 seconds to decide
    });
  };

  const handleAddRequirement = () => {
    if (!equipment?.id) return;
    addMutation.mutate({ 
      equipmentId: equipment.id, 
      data: {
        requirement_type: 'maintenance',
        description: 'New requirement',
        frequency_days: 365,
        scheduling_policy: 'fixed',
        is_mandatory: true
      } 
    }, {
      onSuccess: (res: any) => setRequirements(prev => [...prev, (res.data || res)])
    });
  };

  if (!equipment) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="flex justify-between items-center bg-slate-50/50 p-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <Settings2 className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800">Service Requirements</h3>
        </div>
        <button onClick={handleAddRequirement} className="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg font-bold">
          <Plus className="w-4 h-4 inline mr-1" /> Add
        </button>
      </div>

      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-45">Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="w-35">Frequency</TableHead>
            <TableHead className="w-20 text-center">Mandate</TableHead>
            <TableHead className="w-12.5"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requirements.map((req, index) => (
            <TableRow key={req.id || index} className="group">
              <TableCell>
                <select 
                  value={req.requirement_type}
                  onFocus={(e) => originalValue.current = e.target.value}
                  onChange={(e) => {
                    const val = e.target.value;
                    triggerSaveConfirm(req.id, 'requirement_type', val, originalValue.current);
                    setRequirements(prev => prev.map(r => r.id === req.id ? { ...r, requirement_type: val } : r));
                  }}
                  className="w-full bg-transparent border-none text-sm font-bold text-blue-700 outline-none"
                >
                  <option value="calibration">Calibration</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="intermediate_check">Inter-Check</option>
                </select>
              </TableCell>

              <TableCell>
                <input 
                  type="text"
                  value={req.description}
                  onFocus={(e) => originalValue.current = e.target.value}
                  onChange={(e) => {
                    const val = e.target.value;
                    setRequirements(prev => prev.map((r, i) => i === index ? { ...r, description: val } : r));
                  }}
                  onBlur={(e) => triggerSaveConfirm(req.id, 'description', e.target.value, originalValue.current)}
                  className="w-full bg-transparent border-none text-sm outline-none"
                />
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    value={req.frequency_days}
                    onFocus={(e) => originalValue.current = e.target.value}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRequirements(prev => prev.map((r, i) => i === index ? { ...r, frequency_days: val } : r));
                    }}
                    onBlur={(e) => triggerSaveConfirm(req.id, 'frequency_days', e.target.value, originalValue.current)}
                    className="w-16 bg-slate-50 border border-slate-100 rounded px-2 py-1 text-sm outline-none"
                  />
                  <span className="text-[10px] font-bold text-slate-400 font-mono">DAYS</span>
                </div>
              </TableCell>

              <TableCell className="text-center">
                <button
                  onClick={() => {
                    const old = req.is_mandatory;
                    const val = !old;
                    // For toggles, we trigger the save toast immediately
                    triggerSaveConfirm(req.id, 'is_mandatory', val, old);
                    setRequirements(prev => prev.map(r => r.id === req.id ? { ...r, is_mandatory: val } : r));
                  }}
                  className={`p-1.5 rounded-md ${req.is_mandatory ? 'text-emerald-600 bg-emerald-50' : 'text-slate-300'}`}
                >
                  <ShieldCheck className="w-5 h-5 mx-auto" />
                </button>
              </TableCell>

              <TableCell>
                <button onClick={() => deleteMutation.mutate(req.id)} className="p-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}