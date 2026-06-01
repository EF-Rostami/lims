
'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  History, 
  ShieldCheck, 
  Download, 
  Filter,
  FileSpreadsheet
} from 'lucide-react';
import { EquipmentHistory } from '@/components/equipment/EquipmentHistory';
import { useResourceAudit } from '@/services/auditLog/auditLog.hooks';
import { format } from 'date-fns';
import { AuditLogEntry } from '@/services/auditLog/auditLog.types';

export default function EquipmentHistoryPage() {
  const { id } = useParams();
  const equipmentId = Number(id);
  const [activeTab, setActiveTab] = useState<'work' | 'system'>('work');

  const { data: auditLogs = [], isLoading: loadingAudit } = useResourceAudit('equipment', equipmentId);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Sub-Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <History className="text-blue-600 w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Lifecycle & Traceability</h2>
            <p className="text-xs text-gray-500 font-medium">Complete regulatory trail for Asset #{equipmentId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 rounded-lg border transition">
            <Download size={14} /> Export PDF
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-100 transition">
            <FileSpreadsheet size={14} /> CSV
          </button>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex p-1 bg-gray-100 w-fit rounded-xl">
        <button
          onClick={() => setActiveTab('work')}
          className={`flex items-center gap-2 px-6 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'work' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <History size={16} /> Work History
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-6 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'system' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ShieldCheck size={16} /> System Audit
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-100">
        {activeTab === 'work' ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Calibration & Maintenance Log</h3>
              <Filter size={16} className="text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
            <EquipmentHistory equipmentId={equipmentId} />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* FIXED: Wrapped tbody in a table and added proper semantic structure */}
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Change Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(auditLogs as AuditLogEntry[]).map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono">
                      {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold">
                          {/* UPDATED: Changed .name to .username to match Pydantic schema */}
                          {String(log.user?.username || 'U').charAt(0)}
                        </div>
                        <span className="text-xs font-bold text-gray-900">
                          {String(log.user?.username || 'System')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                        log.action === 'VERIFY' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                        log.action === 'UPDATE' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        'bg-gray-50 text-gray-600 border-gray-200'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600 italic">
                      {log.change_reason || 'No reason provided'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {auditLogs.length === 0 && !loadingAudit && (
              <div className="p-10 text-center text-gray-400 text-sm">
                No system audit records found for this asset.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}