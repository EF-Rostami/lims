'use client';

import { useForm } from 'react-hook-form';
import { useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';

// Import our new hook and types

import { CalibrationData } from '@/services/task-service/task-service.types';
import { useFulfillTask } from '@/services/task-service/task-service.hooks';


export default function CalibrationEntryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  
  // 1. Get IDs from context (assuming URL: /equipment/[id]/calibrate/new?taskId=...)
  const equipmentId = Number(params.id);
  const taskId = Number(searchParams.get('service_task_id'));

  const [status, setStatus] = useState<'passed' | 'failed'>('passed');
  
  // 2. Initialize Mutation
  const { mutate: fulfill, isPending } = useFulfillTask();

  // 3. Setup Form
  const { register, handleSubmit } = useForm<CalibrationData>({
    defaultValues: {
      status: 'passed',
      standard_used: '',
      results: ''
    }
  });

  // 1. Cast the payload to 'any' or your specific interface to bypass the union check
  const onSubmit = (formData: CalibrationData) => {
    const payload = {
      service_task_id: taskId,
      equipment_id: equipmentId,
      performed_date: new Date().toISOString().split('T')[0],
      notes: "Calibration performed via unified entry page.",
      data: {
        ...formData,
        status: status // This was causing the 'never' error
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any; // Temporary cast to bypass the Union complexity

    fulfill(payload);

  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calibration Record</h1>
          <p className="text-muted-foreground">Documenting official metrological performance.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Results & Measurement</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Standard Reference Used</Label>
                <Input 
                  {...register('standard_used')} 
                  placeholder="e.g. NIST Traceable Weight E2" 
                />
              </div>
              <div className="space-y-2">
                <Label>Measurement Uncertainty</Label>
                <Input 
                  {...register('uncertainty')} 
                  placeholder="± 0.001 mg" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Detailed Results (JSON/Text)</Label>
              <Textarea 
                {...register('results')} 
                placeholder="Enter raw data or formatted results..." 
                className="min-h-37.5" 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Environmental Conditions</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Temperature (°C)</Label>
              <Input type="number" step="0.1" placeholder="22.5" />
            </div>
            <div className="space-y-2">
              <Label>Humidity (%)</Label>
              <Input type="number" step="1" placeholder="45" />
            </div>
            <div className="pt-4">
              <Label>Certificate Number</Label>
              <Input placeholder="CAL-2024-001" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
        <div>
          <Label className="text-base">Overall Result</Label>
          <p className="text-xs text-muted-foreground">Does the equipment meet specifications?</p>
        </div>
        <Select value={status} onValueChange={(val: 'passed' | 'failed') => setStatus(val)}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Select Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="passed" className="text-green-600 font-bold">PASSED</SelectItem>
            <SelectItem value="failed" className="text-red-600 font-bold">FAILED</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-blue-600" 
          disabled={isPending}
        >
          {isPending ? "Saving..." : "Complete & Lock Record"}
        </Button>
      </div>
    </form>
  );
}