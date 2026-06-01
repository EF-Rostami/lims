'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Wrench } from 'lucide-react'; // Removed Wrench

import { useEquipment } from '@/services/equipment/equipment.hooks';
import EquipmentRequirementsManager from '@/components/equipment/EquipmentRequirementsManager';
import EquipmentComplianceStatus from '@/components/equipment/EquipmentComplianceStatus';
import { EquipmentHistory } from '@/components/equipment/EquipmentHistory';
import type { Schema } from "@/types/api-types";
import EquipmentVerificationCard from '@/components/equipment/EquipmentVerificationCard';
import { PermissionGate } from '@/components/protection/PermissionGate';
import { CalibrationWizard } from '@/components/equipment/CalibrationWizard';

export default function EquipmentOverviewPage() {
  const { id } = useParams();
  const numericId = parseInt(id as string);
  
  // CHANGED: Use 'refetch' instead of 'mutate' for TanStack Query
  const { data: rawData, isLoading, refetch } = useEquipment(numericId);

  const [isCalibrating, setIsCalibrating] = useState(false);

  if (isLoading || !rawData || 'detail' in rawData) return null;
  const equipment = rawData as Schema["Equipment"];

  if (isCalibrating) {
    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between bg-blue-600 p-6 rounded-2xl shadow-lg shadow-blue-100 text-white">
          <div>
            <h2 className="text-xl font-bold">Calibration Session</h2>
            <p className="text-blue-100 text-sm">Recording precision data for {equipment.name}</p>
          </div>
          <button 
            onClick={() => setIsCalibrating(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/20"
          >
            <ArrowLeft size={16} />
            Cancel Session
          </button>
        </div>
        
        <CalibrationWizard 
          equipmentId={equipment.id} 
          onComplete={() => {
            setIsCalibrating(false);
            // CHANGED: Trigger TanStack refetch
            refetch(); 
          }} 
        />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* 0. Quick Action Bar (Optional but helpful) */}
      <div className="flex justify-end">
        <button 
          onClick={() => setIsCalibrating(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95"
        >
          <Wrench size={16} />
          Perform Calibration
        </button>
      </div>
      
      {equipment.status === 'pending_verification' && (
        <PermissionGate roles={['admin', 'manager', 'equipment_manager']}>
          <EquipmentVerificationCard 
            equipmentId={equipment.id} 
            equipmentName={equipment.name} 
          />
        </PermissionGate>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Serial Number</p>
          <p className="font-mono text-gray-800 font-bold">{equipment.serial_number || 'N/A'}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Model / Brand</p>
          <p className="text-gray-800 font-bold">{equipment.manufacturer} {equipment.model}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Category</p>
          <p className="text-gray-800 capitalize font-bold">{equipment.category?.replace('_', ' ') || 'General'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Maintenance Plans</h2>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
              {equipment.requirements?.length || 0} ACTIVE
            </span>
          </div>
          <div className="bg-white border border-gray-100 rounded-2xl p-2 shadow-sm">
            <EquipmentRequirementsManager equipment={equipment} />
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Compliance Health</h2>
          <EquipmentComplianceStatus 
            equipmentId={equipment.id} 
            requirements={equipment.requirements} 
            onActionClick={() => setIsCalibrating(true)} 
          />
        </section>
      </div>

      <section className="pt-8 border-t border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Activity Timeline</h2>
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
          <EquipmentHistory equipmentId={numericId} />
        </div>
      </section>
    </div>
  );
}