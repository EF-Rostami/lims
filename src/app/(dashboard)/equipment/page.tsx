'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { useEquipments } from '@/services/equipment/equipment.hooks';
import { PermissionGate } from '@/components/protection/PermissionGate';
import { EquipmentTable } from '@/components/equipment/EquipmentTable';

export default function EquipmentInventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const { data: equipment = [], isLoading } = useEquipments();

  const filteredEquipment = useMemo(() => {
    return equipment.filter((eq) => {
      const matchesSearch = 
        eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        eq.equipment_code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || eq.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [equipment, searchTerm, statusFilter]);

  if (isLoading) return <LoadingSpinner />;

  return (
    <PermissionGate roles={['admin', 'equipment_manager']}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Equipment Inventory</h1>
            <p className="text-gray-500 text-sm">Managing {filteredEquipment.length} assets</p>
          </div>
          <Link href="/equipment.dashboard/equipment/new" className="btn-primary flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg">
            <Plus size={18} /> Add Asset
          </Link>
        </div>

        {/* Filters */}
        <div className="flex gap-4 bg-white p-4 rounded-xl shadow-sm border">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              className="pl-10 w-full border rounded-lg py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search assets..."
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-4 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="operational">Operational</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="out_of_service">Out of Service</option>
          </select>
        </div>

        {/* Table Component */}
        {filteredEquipment.length > 0 ? (
          <EquipmentTable data={filteredEquipment} />
        ) : (
          <EmptyState />
        )}
      </div>
    </PermissionGate>
  );
}

// Sub-components for better readability
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-96">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const EmptyState = () => (
  <div className="text-center py-24 bg-gray-50 rounded-xl border-2 border-dashed">
    <Search className="mx-auto text-gray-300 w-12 h-12 mb-3" />
    <h3 className="text-gray-600 font-medium">No assets matching your criteria</h3>
  </div>
);