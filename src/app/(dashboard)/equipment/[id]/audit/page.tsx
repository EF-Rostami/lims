/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useParams } from 'next/navigation';
import { useAuditLogs, AuditLog } from '@/services/auditLog/audit.hooks'; // Path fixed
import { ShieldCheck, User, Clock } from 'lucide-react';

export default function EquipmentAuditPage() {
  const params = useParams();
  const id = Number(params.id);
  
  const { data: logs = [], isLoading } = useAuditLogs(id);

  if (isLoading) return <div className="p-8 text-center text-gray-500">Loading compliance logs...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <ShieldCheck className="text-blue-600" size={20} />
        <h2 className="text-lg font-bold text-gray-800">System Audit Trail</h2>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs font-bold text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-4 text-left">Timestamp</th>
              <th className="px-6 py-4 text-left">User</th>
              <th className="px-6 py-4 text-left">Event</th>
              <th className="px-6 py-4 text-left">Reason for Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {/* FIX: Explicitly typed 'log' as AuditLog */}
            {logs.map((log: AuditLog) => (
              <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gray-300" />
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] text-blue-700">
                      {log.user.name.charAt(0)}
                    </div>
                    {log.user.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${
                    log.action === 'VERIFY' 
                      ? 'bg-purple-50 text-purple-700 border-purple-100' 
                      : 'bg-gray-50 text-gray-600 border-gray-100'
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 italic max-w-xs truncate">
                  &quot;{log.change_reason || 'No reason documented'}&quot;
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <div className="p-12 text-center text-gray-400 italic">
            No audit records found for this asset.
          </div>
        )}
      </div>
    </div>
  );
}