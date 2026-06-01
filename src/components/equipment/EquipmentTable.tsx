'use client';

import Link from 'next/link';
import { Eye } from 'lucide-react';
import { Equipment } from '@/services/equipment/equipment.types';

interface EquipmentTableProps {
  data: Equipment[];
}

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

export function EquipmentTable({ data }: EquipmentTableProps) {
  return (
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
            {data.map((eq) => (
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
                  <Link 
                    href={`/equipment/${eq.id}`} 
                    className="p-2 inline-block text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}