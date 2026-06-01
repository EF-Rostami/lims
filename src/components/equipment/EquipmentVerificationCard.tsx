/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';
import { ShieldCheck, CheckCircle, Loader2 } from 'lucide-react';
import { useUpdateEquipment } from '@/services/equipment/equipment.hooks';

interface Props {
  equipmentId: number;
  equipmentName: string;
}

export default function EquipmentVerificationCard({ equipmentId, equipmentName }: Props) {
  const [reason, setReason] = useState('');
  const updateMutation = useUpdateEquipment();

  const handleVerify = () => {
    if (reason.length < 5) return;

    // Transition back to operational via a 'VERIFY' action
    updateMutation.mutate({ 
      id: equipmentId, 
      data: { 
        status: 'operational',
        change_reason: `Verification Approved: ${reason}` 
      } 
    });
  };

  return (
    <div className="bg-linear-to-br from-purple-50 to-white border-2 border-purple-200 rounded-2xl p-6 shadow-md mb-8">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-purple-100 rounded-xl">
          <ShieldCheck className="text-purple-700 w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-purple-900">Pending Technical Verification</h3>
          <p className="text-sm text-purple-700 mt-1">
            This instrument was recently modified or serviced. A supervisor review is required to return it to <span className="font-bold">Operational</span> status.
          </p>
          
          <div className="mt-4 space-y-3">
            <textarea
              placeholder="Enter verification notes (e.g., Reviewed calibration certificate #123, tolerances are within limits)."
              className="w-full border-purple-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none min-h-20 bg-white/50"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            
            <div className="flex justify-end gap-3">
              <button 
                disabled={reason.length < 5 || updateMutation.isPending}
                onClick={handleVerify}
                className="flex items-center gap-2 px-6 py-2 bg-purple-700 text-white rounded-lg hover:bg-purple-800 disabled:bg-gray-300 transition-all font-bold text-sm shadow-sm"
              >
                {updateMutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle size={16} />}
                Approve & Release Asset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}