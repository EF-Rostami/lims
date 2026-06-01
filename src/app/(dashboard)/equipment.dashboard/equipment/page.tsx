/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Eye, MoreVertical } from 'lucide-react';
import { useEquipments } from '@/services/equipment/equipment.hooks';
import { PermissionGate } from '@/components/protection/PermissionGate';
import { Equipment } from '@/services/equipment/equipment.types';

export default function EquipmentInventoryPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const { data: equipment = [], isLoading } = useEquipments();

  // Unified Status Colors - Matches the V3 Dashboard style
  const getStatusStyles = (status: string) => {
    const styles: Record<string, string> = {
      operational: 'bg-green-100 text-green-700 border-green-200',
      under_maintenance: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      calibration_due: 'bg-orange-100 text-orange-700 border-orange-200',
      out_of_service: 'bg-red-100 text-red-700 border-red-200',
      pending_verification: 'bg-blue-100 text-blue-700 border-blue-200',
    };
    return styles[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Filter logic
  const filteredEquipment = equipment.filter((eq: Equipment) => {
    const matchesSearch = 
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.equipment_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || eq.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <PermissionGate roles={['admin', 'equipment_manager']}>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Equipment Inventory</h1>
            <p className="text-gray-500 text-sm mt-1">
              Showing {filteredEquipment.length} of {equipment.length} total assets
            </p>
          </div>
          <Link
            href="/equipment.dashboard/equipment/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Asset
          </Link>
        </div>

        {/* Filters Section */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or asset code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white min-w-45"
          >
            <option value="">All Statuses</option>
            <option value="operational">Operational</option>
            <option value="under_maintenance">Under Maintenance</option>
            <option value="calibration_due">Calibration Due</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="out_of_service">Out of Service</option>
          </select>
        </div>

        {/* Table Section */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Asset CODE</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Asset Details</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredEquipment.map((eq) => (
                  <tr key={eq.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-bold text-blue-600">
                      {eq.equipment_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{eq.name}</div>
                      <div className="text-xs text-gray-400">{eq.manufacturer || 'Generic'} {eq.model}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 italic">
                      {eq.location || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-[10px] font-black uppercase rounded-md border ${getStatusStyles(eq.status)}`}>
                        {eq.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link 
                          href={`/equipment.dashboard/equipment/${eq.id}`} 
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredEquipment.length === 0 && (
            <div className="text-center py-24 bg-gray-50/50">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="text-gray-400 w-8 h-8" />
              </div>
              <h3 className="text-gray-900 font-medium">No assets found</h3>
              <p className="text-gray-400 text-sm">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>
      </div>
    </PermissionGate>
  );
}