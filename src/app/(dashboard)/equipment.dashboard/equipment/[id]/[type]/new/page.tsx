/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/equipment.dashboard/equipment/[id]/[type]/new/page.tsx
'use client';

import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
// Assuming you have an equipment hook
// import { useEquipment } from '@/services/equipment-service/hooks'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function NewServiceRecordPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  const equipmentId = params.id;
  const serviceType = params.type; // 'calibrate' or 'maintenance'
  const serviceTaskId = searchParams.get('service_task_id');

  // Logic to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would call your API to:
    // 1. Create the Calibration/Maintenance record
    // 2. Update the ServiceTask status to 'COMPLETED'
    console.log("Submitting for Task:", serviceTaskId);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold capitalize">
            New {serviceType} Record
          </h1>
          <p className="text-muted-foreground">
            Completing Task ID: <span className="font-mono text-blue-600">#{serviceTaskId}</span>
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Execution Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Performed Date</Label>
                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="space-y-2">
                <Label>Technician / Operator</Label>
                <Input placeholder="Enter name..." />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes / Observations</Label>
              <textarea 
                className="w-full min-h-25 p-3 rounded-md border text-sm" 
                placeholder="Describe any issues found..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => window.history.back()}>
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Save & Complete Task
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}