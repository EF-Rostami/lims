import React from 'react';
import { useEquipmentTimeline } from '@/services/equipment/equipment.hooks';
import { ACTIVITY_UI_CONFIG } from '@/services/equipment/equipment.types';
import { CheckCircle2, Info } from 'lucide-react';
import { format } from 'date-fns';
import type { Schema } from "@/types/api-types";

// Correctly pointing to the unified timeline schema
type TimelineEvent = Schema["EquipmentTimelineItem"]; 

interface Props {
  equipmentId: number;
}

// ... (imports remain same)
import { FileText, ExternalLink } from 'lucide-react'; // Added icons

export const EquipmentHistory: React.FC<Props> = ({ equipmentId }) => {
  const { data, isLoading, isError } = useEquipmentTimeline(equipmentId);
  const history = Array.isArray(data) ? (data as unknown as TimelineEvent[]) : [];

  if (isLoading) return <div className="p-12 text-center animate-pulse text-gray-400 font-bold tracking-widest uppercase">Reading System Records...</div>;
  if (isError) return <div className="p-8 text-red-500 text-center bg-red-50 rounded-xl border border-red-100">Failed to retrieve asset lifecycle.</div>;

  return (
    <div className="flow-root p-2">
      <ul role="list" className="-mb-8">
        {history.map((event: TimelineEvent, eventIdx: number) => {
          const typeKey = event.event_type; 
          const config = ACTIVITY_UI_CONFIG[typeKey as keyof typeof ACTIVITY_UI_CONFIG] || {
            color: 'text-gray-500 bg-gray-100',
            icon: Info
          };

          const Icon = config.icon;

          return (
            <li key={event.ref_id || eventIdx}>
              <div className="relative pb-8">
                {/* Connector Line */}
                {eventIdx !== history.length - 1 && (
                  <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-100" aria-hidden="true" />
                )}

                <div className="relative flex items-start space-x-4">
                  {/* Icon Node */}
                  <div className="relative">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ring-4 ring-white shadow-sm ${config.color}`}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                  </div>

                  {/* Content Card */}
                  <div className="min-w-0 flex-1 bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow group">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-black text-blue-600 uppercase tracking-tighter">
                          {typeKey.replace('_', ' ')}
                        </span>
                        <h4 className="text-sm font-bold text-gray-900 mt-0.5">
                          {event.remarks || 'No description provided'}
                        </h4>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="text-[10px] font-bold text-gray-400">
                           {event.date ? format(new Date(event.date), 'MMM dd, yyyy HH:mm') : 'N/A'}
                        </span>
                        {/* Status Chip */}
                        <div className="mt-1 flex items-center">
                           {event.status === 'completed' ? (
                            <span className="flex items-center text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> COMPLETED
                            </span>
                          ) : (
                            <span className="flex items-center text-[10px] text-orange-600 font-bold bg-orange-50 px-2 py-0.5 rounded border border-orange-100">
                                <Info className="w-3 h-3 mr-1" /> {event.status?.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Footer: Meta Info & Actions */}
                    <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
                      <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-1 rounded">
                        REF: #{event.ref_id}
                      </span>
                      
                      {/* Action Button: Conditional based on type */}
                      {(typeKey === 'calibration' || typeKey === 'maintenance') && (
                        <button className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                           <FileText size={14} />
                           View Certificate
                           <ExternalLink size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      {history.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
           <Info className="mx-auto text-gray-300 mb-2" />
           <p className="text-gray-400 font-medium">No lifecycle activity recorded for this asset.</p>
        </div>
      )}
    </div>
  );
};