/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useForm, Controller } from 'react-hook-form';
import { useParams, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

// Hooks and Types
import { useFulfillTask } from '@/services/task-service/task-service.hooks';
import { CheckData } from '@/services/task-service/task-service.types';

export default function IntermediateCheckPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  // 1. Context extraction (matching your working Calibration logic)
  const equipmentId = Number(params.id);
  const taskId = Number(searchParams.get('service_task_id'));

  const [status, setStatus] = useState<'passed' | 'failed'>('passed');

  // 2. Mutation hook
  const { mutate: fulfill, isPending } = useFulfillTask();

  // 3. Form Setup
  const { register, handleSubmit, control } = useForm<CheckData & { visual_pass: boolean }>({
    defaultValues: {
      status: 'passed',
      functional_pass: true,
      visual_pass: true
    }
  });

  const onSubmit = (formData: any) => {
    // Construct the payload for the backend
    fulfill({
      service_task_id: taskId,
      equipment_id: equipmentId,
      performed_date: new Date().toISOString().split('T')[0],
      notes: `Intermediate check performed. Visual: ${formData.visual_pass ? 'OK' : 'FAIL'}`,
      data: {
        ...formData,
        status: status // Use the Select component state
      }
    } as any);
  };

  const isInvalid = !taskId || taskId === 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Intermediate Performance Check</h1>
        {isInvalid && <span className="text-destructive font-medium text-sm">Error: Task ID missing</span>}
      </div>

      <Card>
        <CardHeader><CardTitle>Pass/Fail Inspection</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          {/* Using Controller for UI components like Checkbox */}
          <div className="flex items-center space-x-2">
            <Controller
              name="visual_pass"
              control={control}
              render={({ field }) => (
                <Checkbox 
                  id="visual" 
                  checked={field.value} 
                  onCheckedChange={field.onChange} 
                />
              )}
            />
            <Label htmlFor="visual" className="cursor-pointer">Visual Inspection Passed</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Controller
              name="functional_pass"
              control={control}
              render={({ field }) => (
                <Checkbox 
                  id="func" 
                  checked={field.value} 
                  onCheckedChange={field.onChange} 
                />
              )}
            />
            <Label htmlFor="func" className="cursor-pointer">Functional Test Passed</Label>
          </div>

          <hr className="my-4" />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Reference Value</Label>
              <Input 
                type="number" 
                step="0.01" 
                {...register('reference_value' as any)} 
                placeholder="10.00" 
              />
            </div>
            <div className="space-y-2">
              <Label>Measured Value</Label>
              <Input 
                type="number" 
                step="0.01" 
                {...register('measured_value' as any)} 
                placeholder="10.02" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

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
          disabled={isPending || isInvalid}
        >
          {isPending ? "Saving..." : "Complete & Lock Record"}
        </Button>
      </div>
    </form>
  );
}