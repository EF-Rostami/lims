/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React from 'react';
import { 
  ShieldCheck, Wrench, Microscope, 
  AlertTriangle, Calendar, CheckCircle, 
  Clock, AlertCircle, PlayCircle 
} from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';
import { useEquipmentTasks } from '@/services/task-service/task-service.hooks';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Requirement {
  id: number;
  requirement_type: 'calibration' | 'maintenance' | 'intermediate_check' | 'safety_inspection';
  description: string;
  frequency_days: number;
  is_mandatory: boolean;
}

interface ComplianceProps {
  equipmentId: number;
  requirements: Requirement[];
  onActionClick: () => void; // Bridge to open the wizard
}

export default function EquipmentComplianceStatus({ 
  equipmentId, 
  requirements,
  onActionClick
}: ComplianceProps) {
  const { data: tasks, isLoading } = useEquipmentTasks(equipmentId);
  
  const getStyle = (type: string) => {
    switch (type) {
      case 'calibration': 
        return { icon: <ShieldCheck className="w-3.5 h-3.5" />, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Calibration' };
      case 'maintenance': 
        return { icon: <Wrench className="w-3.5 h-3.5" />, color: 'text-purple-600', bg: 'bg-purple-50', label: 'Maintenance' };
      case 'intermediate_check': 
        return { icon: <Microscope className="w-3.5 h-3.5" />, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Inter-Check' };
      case 'safety_inspection': 
        return { icon: <AlertTriangle className="w-3.5 h-3.5" />, color: 'text-red-600', bg: 'bg-red-50', label: 'Safety' };
      default: 
        return { icon: <Calendar className="w-3.5 h-3.5" />, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Service' };
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-400 animate-pulse text-sm">Loading compliance data...</div>;

  if (!requirements || requirements.length === 0) {
    return (
      <div className="p-12 text-center border border-slate-200 bg-slate-50/30 rounded-xl">
        <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-400 text-sm font-medium">No compliance requirements defined.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-800">Compliance Monitor</h3>
        </div>
        <Badge variant="outline" className="bg-white text-[10px] font-bold text-slate-500 uppercase">
          Live Tracking
        </Badge>
      </div>

      <Table>
        <TableHeader className="bg-white">
          <TableRow className="hover:bg-transparent border-slate-100">
            <TableHead className="text-[10px] uppercase font-black text-slate-400">Type</TableHead>
            <TableHead className="text-[10px] uppercase font-black text-slate-400">Next Due</TableHead>
            <TableHead className="text-[10px] uppercase font-black text-slate-400 text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requirements.map((req) => {
            const plannedTask = tasks?.find(t => t.requirement_id === req.id && t.status === 'planned');
            const lastTask = tasks?.find(t => t.requirement_id === req.id && t.status === 'completed');
            
            const lastActionDate = lastTask?.performed_date;
            const nextDueDate = plannedTask?.planned_date 
              ? new Date(plannedTask.planned_date) 
              : addDays(lastActionDate ? new Date(lastActionDate) : new Date(), req.frequency_days);
            
            const daysLeft = differenceInDays(nextDueDate, new Date());
            const isOverdue = daysLeft < 0;
            const style = getStyle(req.requirement_type);

            return (
              <TableRow key={req.id} className="border-slate-50 group hover:bg-slate-50 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={`${style.bg} ${style.color} p-1.5 rounded-md`}>{style.icon}</div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700">{req.description}</span>
                      <span className="text-[9px] uppercase font-bold text-slate-400">{style.label}</span>
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-col">
                    <span className={`text-xs font-bold ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}>
                      {format(nextDueDate, 'MMM dd, yyyy')}
                    </span>
                    <span className="text-[9px] text-slate-400 font-bold uppercase">
                       {daysLeft === 0 ? 'Due Today' : isOverdue ? `${Math.abs(daysLeft)}d Overdue` : `${daysLeft}d Left`}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="text-right">
                  {/* FULFILL BUTTON: Visible on hover of the row */}
                  <div className="relative h-8 flex items-center justify-end">
                    <div className="group-hover:hidden flex flex-col items-end">
                      <span className={`text-[10px] font-black uppercase ${isOverdue ? 'text-red-600' : 'text-emerald-600'}`}>
                        {isOverdue ? 'Action Required' : 'Compliant'}
                      </span>
                    </div>
                    <button 
                      onClick={onActionClick}
                      className="hidden group-hover:flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold shadow-md shadow-blue-100 hover:bg-blue-700 transition-all animate-in zoom-in-95 duration-200"
                    >
                      <PlayCircle size={12} />
                      FULFILL
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}