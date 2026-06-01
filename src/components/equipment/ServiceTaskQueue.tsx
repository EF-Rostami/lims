/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useMemo } from 'react';
import { useTaskQueue } from '@/services/task-service/task-service.hooks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, startOfDay, differenceInDays } from 'date-fns';
import { ClipboardCheck, Settings, Search, AlertCircle, ArrowUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation'; 

interface TaskQueueProps {
  equipmentId?: number; // Optional: if provided, filters for this asset
  onExecute: (task: any) => void; // Trigger the wizard mode
}

export const ServiceTaskQueue = ({ equipmentId, onExecute }: TaskQueueProps) => {
  // Fetch planned tasks
  const { data: tasks, isLoading } = useTaskQueue({ status: 'planned' });
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const processedTasks = useMemo(() => {
    if (!tasks) return [];
    
    return tasks
      .filter((task: any) => {
        // 1. Filter by Equipment ID if provided
        if (equipmentId && task.equipment_id !== equipmentId) return false;

        // 2. Filter by Search Query
        const searchStr = searchQuery.toLowerCase();
        return (
          task.equipment_code?.toLowerCase().includes(searchStr) ||
          task.equipment_name?.toLowerCase().includes(searchStr) ||
          (task.effective_type || '').toLowerCase().includes(searchStr)
        );
      })
      .sort((a: any, b: any) => new Date(a.planned_date).getTime() - new Date(b.planned_date).getTime());
  }, [tasks, searchQuery, equipmentId]);

  const handleAction = (task: any) => {
    const typeLabel = (task.effective_type || 'service').toLowerCase();
    let route = 'maintenance'; 
    if (typeLabel.includes('calib')) route = 'calibrate';
    else if (typeLabel.includes('check')) route = 'check';

    router.push(`/equipment.dashboard/equipment/${task.equipment_id}/${route}/new?service_task_id=${task.id}`);
  };

  if (isLoading) return <div className="p-8 text-center text-sm animate-pulse text-slate-400">Loading Worklist...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <div className="flex items-center gap-2 max-w-sm relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search worklist..."
            className="pl-9 bg-white border-slate-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {processedTasks.length} Pending Tasks
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-[10px] uppercase font-black text-slate-500">Asset</TableHead>
              <TableHead className="text-[10px] uppercase font-black text-slate-500">Task Details</TableHead>
              <TableHead className="text-[10px] uppercase font-black text-slate-500">Deadline</TableHead>
              <TableHead className="text-[10px] uppercase font-black text-slate-500">Urgency</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedTasks.map((task: any) => {
              const diff = differenceInDays(new Date(task.planned_date), startOfDay(new Date()));
              const taskType = task.effective_type || 'General Service';
              const isOverdue = diff < 0;

              return (
                <TableRow key={task.id} className="group transition-colors">
                  {/* Column 1: Asset Identification */}
                  <TableCell>
                    <div className="flex flex-col">
                      <button 
                        onClick={() => router.push(`/equipment.dashboard/equipment/${task.equipment_id}`)}
                        className="font-mono text-xs font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {task.equipment_code} <ArrowUpRight className="w-2.5 h-2.5" />
                      </button>
                      <span className="text-sm font-semibold text-slate-700 truncate max-w-45">
                        {task.equipment_name}
                      </span>
                    </div>
                  </TableCell>

                  {/* Column 2: Task Type */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {taskType.toLowerCase().includes('calib') ? 
                          <ClipboardCheck className="w-4 h-4 text-blue-500" /> : 
                          <Settings className="w-4 h-4 text-purple-500" />
                        }
                        <span className="text-sm capitalize">{taskType}</span>
                      </div>
                    </TableCell>

                  {/* Column 3: Date */}
                  <TableCell className="text-xs font-medium text-slate-500">
                    {format(new Date(task.planned_date), 'MMM dd, yyyy')}
                  </TableCell>

                  {/* Column 4: Dynamic Urgency */}
                  <TableCell>
                    <Badge 
                      variant={isOverdue ? "destructive" : "secondary"} 
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${isOverdue ? 'animate-pulse' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {isOverdue ? (
                        <span className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {Math.abs(diff)}d Overdue
                        </span>
                      ) : (
                        <span>{diff === 0 ? 'Due Today' : `In ${diff} days`}</span>
                      )}
                    </Badge>
                  </TableCell>

                  {/* Column 5: Action */}
                  <TableCell className="text-right">
                    <Button 
                      onClick={() => handleAction(task)}
                      className="h-8 px-4 text-[10px] font-black bg-slate-900 hover:bg-blue-600 transition-all rounded-lg"
                    >
                      EXECUTE
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};