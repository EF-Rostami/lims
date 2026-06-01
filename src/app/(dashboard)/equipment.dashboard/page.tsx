// @ts-nocheck — legacy QMS/document pages pending backend_v3 migration
'use client';

import { Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useEquipmentStats } from '@/services/equipment-dashboard/equipment-dashboard.hooks';
import { PermissionGate } from '@/components/protection/PermissionGate';
import { ServiceTaskQueue } from "@/components/equipment/ServiceTaskQueue";

export default function EquipmentDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useEquipmentStats();

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <PermissionGate roles={['admin', 'equipment_manager']}>
      <div className="px-4 py-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Command Center</h1>
            <p className="text-gray-500 mt-1">Real-time compliance and equipment health overview.</p>
          </div>
          <Link 
            href="equipment.dashboard/equipment" // Adjusted to standard route, change if your folder is literally named 'equipment.dashboard'
            className="flex items-center gap-2 text-sm font-semibold bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2.5 rounded-xl shadow-sm transition"
          >
            View Full Inventory
          </Link>
        </div>

        {/* 1. Statistics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total Assets', val: stats?.total_equipment, icon: CheckCircle, color: 'text-gray-600', bg: 'bg-gray-50' },
            { label: 'Operational', val: stats?.operational, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Under Repair', val: stats?.under_maintenance, icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Calibration Due', val: stats?.calibration_due, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Out of Service', val: stats?.out_of_service, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
          ].map((card, i) => (
            <div key={i} className={`p-5 rounded-2xl border border-gray-100 shadow-sm ${card.bg}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{card.label}</p>
                  <p className={`text-3xl font-bold mt-2 ${card.color}`}>{card.val || 0}</p>
                </div>
                <card.icon className={`w-6 h-6 ${card.color} opacity-40`} />
              </div>
            </div>
          ))}
        </div>

        

        {/* 2. Unified Service Worklist */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Service Worklist</h2>
            </div>
            <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
              Live Task Engine
            </span>
          </div>
          
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-1"> {/* Padding for the inner table border radius */}
              <ServiceTaskQueue />
            </div>
          </div>
          
          <p className="text-xs text-gray-400 italic px-2">
            * Overdue tasks are highlighted in red. Tasks scheduled are listed as PLANNED.
          </p>
        </div>
      </div>
    </PermissionGate>
  );
}