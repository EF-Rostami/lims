'use client';

import { useEquipment } from '@/services/equipment/equipment.hooks';
import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Activity, ClipboardList, History, Settings, ShieldCheck } from 'lucide-react';
// Import your Equipment type to help with type checking
import { Equipment } from '@/services/equipment/equipment.types';

export default function EquipmentDetailLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  
  // FIX 1: Convert string ID from params to Number
  const equipmentId = Number(params.id);
  const { data: eq, isLoading, isError } = useEquipment(equipmentId);

  if (isLoading) return <div className="p-8 animate-pulse text-gray-400">Loading Asset Frame...</div>;
  
  // FIX 2: Type Guard. 
  // If 'detail' exists, it's a FastAPI error. If 'eq' is missing, it's not found.
  if (isError || !eq || 'detail' in eq) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-lg border border-red-100">
        Asset not found or access denied.
      </div>
    );
  }

  // Now TypeScript knows for 100% certainty that 'eq' is an Equipment object
  const equipment = eq as Equipment; 

  const tabs = [
    { name: 'Overview', href: '', icon: Activity },
    { name: 'Tasks', href: '/tasks', icon: ClipboardList },
    { name: 'History', href: '/history', icon: History },
    { name: 'Audit', href: '/audit', icon: ShieldCheck },
    { name: 'Edit', href: '/edit', icon: Settings },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <span className="text-xs font-bold text-blue-600 font-mono tracking-widest uppercase">Asset Profile</span>
          <h1 className="text-2xl font-bold text-gray-900">{equipment.name}</h1>
          <p className="text-sm text-gray-500 font-mono">
            {equipment.equipment_code} | {equipment.location || 'No Location'}
          </p>
        </div>
        <div className="text-right">
            <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase border shadow-sm ${
                equipment.status === 'operational' 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'bg-orange-50 text-orange-700 border-orange-200'
            }`}>
                {equipment.status.replace('_', ' ')}
            </span>
        </div>
      </div>

      <nav className="flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => {
          // Adjust this base path to match your actual route structure
          const baseRoute = `/equipment/${equipmentId}`;
          const fullPath = `${baseRoute}${tab.href}`;
          
          // Match exactly or check if we are in a sub-path
          const isActive = tab.href === '' 
            ? pathname === baseRoute 
            : pathname.startsWith(fullPath);

          return (
            <Link
              key={tab.name}
              href={fullPath}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all border-b-2 ${
                isActive 
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={16} />
              {tab.name}
            </Link>
          );
        })}
      </nav>

      <div className="py-4">
        {children}
      </div>
    </div>
  );
}