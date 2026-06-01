// @ts-nocheck — legacy QMS/document pages pending backend_v3 migration
'use client';

import { useEquipment } from '@/services/equipment/equipment.hooks';
import EquipmentRequirementsManager from '@/components/equipment/EquipmentRequirementsManager';
import { useParams } from 'next/navigation';
import EquipmentComplianceStatus from '@/components/equipment/EquipmentComplianceStatus';

import type { Schema } from "@/types/api-types";
import { EquipmentHistory } from '@/components/equipment/EquipmentHistory';

export default function EquipmentDetailPage() {
  const { id } = useParams();
  
  // 1. Convert the ID to a number immediately to avoid [object Object] errors
  const numericId = parseInt(id as string);

  const { data: rawData, isLoading, error } = useEquipment(numericId);

  if (isLoading) {
    return <div className="p-10 text-center text-gray-400 animate-pulse font-medium tracking-widest">SYNCHRONIZING ASSET DATA...</div>;
  }

  if (error || !rawData || 'detail' in rawData) {
    return (
      <div className="p-10 text-center border-2 border-dashed border-red-100 rounded-3xl m-6 bg-red-50/30">
        <p className="text-red-600 font-black text-lg uppercase tracking-tight">Access Denied or Asset Not Found</p>
        <p className="text-gray-500 text-sm mt-2 font-medium">Please verify the Equipment ID or your permission levels.</p>
      </div>
    );
  }

  const equipment = rawData as Schema["Equipment"];

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <header className="mb-10 border-b border-gray-100 pb-8">
        <div className="flex flex-col gap-2 mb-4">
          <span className="w-fit bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-md tracking-tighter uppercase">
            {equipment.equipment_code}
          </span>
          <h1 className="text-5xl font-black text-gray-900 tracking-tight leading-none">
            {equipment.name}
          </h1>
        </div>
        
        <div className="flex items-center gap-3 text-gray-500 font-medium bg-gray-50 w-fit px-4 py-2 rounded-xl border border-gray-100">
          <p className="text-sm">
            <span className="font-black text-gray-400 uppercase text-[10px] mr-2">Serial Number</span> 
            <span className="font-mono text-gray-800">{equipment.serial_number || 'N/A'}</span>
          </p>
          <span className="text-gray-200">|</span>
          <p className="text-sm">
            <span className="font-black text-gray-400 uppercase text-[10px] mr-2">Manufacturer</span>
            <span className="text-gray-800">{equipment.manufacturer} {equipment.model}</span>
          </p>
        </div>
      </header>

      <div className="space-y-8">
        <section className="pt-8 border-t border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Manage Requirements</h2>
          <EquipmentRequirementsManager equipment={equipment} />
        </section>
        
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Service Status Overview</h2>
          <EquipmentComplianceStatus 
            equipmentId={equipment.id} 
            requirements={equipment.requirements} 
          />
        </section>

        {/* 2. ADDED HISTORY SECTION: Using numericId directly */}
        <section className="pt-8 border-t border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Activity Timeline</h2>
          <EquipmentHistory equipmentId={numericId} />
        </section>


      </div>
    </div>
  );
}