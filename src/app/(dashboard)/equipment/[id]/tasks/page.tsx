/* eslint-disable @typescript-eslint/no-explicit-any */
// app/equipment/[id]/tasks/page.tsx
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { ServiceTaskQueue } from '@/components/equipment/ServiceTaskQueue';
import { CalibrationWizard } from '@/components/equipment/CalibrationWizard';

export default function EquipmentTasksPage() {
  const { id } = useParams();
  const [isExecuting, setIsExecuting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeTask, setActiveTask] = useState<any>(null);

  const handleStartTask = (task: any) => {
    setActiveTask(task);
    setIsExecuting(true);
  };

  if (isExecuting) {
    return (
      <CalibrationWizard 
        equipmentId={Number(id)}
        // You can pass activeTask.id to the wizard if the wizard
        // needs to update the specific Service Task status to 'completed'
        onComplete={() => setIsExecuting(false)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h2 className="text-xl font-bold text-gray-900">Task Queue</h2>
        <p className="text-sm text-gray-500">Scheduled maintenance and calibration requirements</p>
      </div>
      
      <ServiceTaskQueue 
        equipmentId={Number(id)} 
        onExecute={handleStartTask} 
      />
    </div>
  );
}