/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { useFulfillTask } from '@/services/task-service/task-service.hooks';
import { toast } from 'sonner';

// 1. Updated interface to match your SQLAlchemy Maintenance model exactly
interface MaintenanceFormValues {
  maintenance_type: 'preventive' | 'corrective' | 'predictive';
  downtime_hours: number;
  work_performed: string;
  parts_replaced: string;
  description: string; // Required by your SQL model
  status: 'completed' | 'failed'; // Matches MaintenanceStatus or CalibrationStatus logic
}

export default function MaintenanceEntryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const equipmentId = Number(params.id);
  const taskId = Number(searchParams.get('service_task_id'));

  const { mutate: fulfill, isPending } = useFulfillTask();

  // 2. Form Setup with mapped values
  const { register, handleSubmit, control, watch } = useForm<MaintenanceFormValues>({
    defaultValues: {
      maintenance_type: 'preventive',
      downtime_hours: 0,
      work_performed: '',
      parts_replaced: '',
      description: '',
      status: 'completed',
    }
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const currentStatus = watch('status');

  const onSubmit = (formData: MaintenanceFormValues) => {
    // We explicitly define the shape to satisfy TS
    const maintenancePayload = {
      description: formData.description,
      work_performed: formData.work_performed,
      parts_replaced: formData.parts_replaced,
      downtime_hours: formData.downtime_hours,
      maintenance_type: formData.maintenance_type,
      status: formData.status === 'completed' ? 'completed' : 'failed'
    };

    fulfill({
      service_task_id: taskId,
      equipment_id: equipmentId,
      performed_date: new Date().toISOString().split('T')[0],
      notes: formData.description,
      // Using 'as any' on the inner data object is the quickest way 
      // to bypass the 'never' restriction if you can't edit the service types
      data: maintenancePayload as any 
    }, {
      onSuccess: () => {
        toast.success("Maintenance record locked.");
        router.push(`/equipment.dashboard/equipment/${equipmentId}`);
      }
    });
  };

  const isInvalid = !taskId || taskId === 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Maintenance Log</h1>
        <p className="text-sm text-muted-foreground">Asset ID: {equipmentId} | Task Ref: {taskId}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Controller
                name="maintenance_type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preventive">Preventive</SelectItem>
                      <SelectItem value="corrective">Corrective (Repair)</SelectItem>
                      <SelectItem value="predictive">Predictive</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label>Downtime (Hours)</Label>
              <Input 
                type="number" 
                step="0.1"
                {...register('downtime_hours', { valueAsNumber: true })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Summary Description</Label>
            <Input 
              {...register('description', { required: true })}
              placeholder="Brief title of work (e.g., Annual Filter Replacement)" 
            />
          </div>

          <div className="space-y-2">
            <Label>Work Performed (Details)</Label>
            <textarea 
              {...register('work_performed')}
              className="w-full p-3 border rounded-md min-h-25 text-sm focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="Describe technical steps taken..." 
            />
          </div>

          <div className="space-y-2">
            <Label>Parts Replaced</Label>
            <Input 
              {...register('parts_replaced')}
              placeholder="List parts used..." 
            />
          </div>
        </CardContent>
      </Card>

      <div className={`flex items-center justify-between p-4 border rounded-xl transition-all ${
        currentStatus === 'completed' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      }`}>
        <div className="space-y-0.5">
          <Label className="text-base font-bold">Release Status</Label>
          <p className="text-xs text-muted-foreground">Final validation of asset health.</p>
        </div>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger className="w-40 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed" className="text-green-700 font-bold">SUCCESS</SelectItem>
                <SelectItem value="failed" className="text-red-700 font-bold">FAILED</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
        <Button 
          type="submit" 
          disabled={isPending || isInvalid}
          className="bg-slate-900 px-8"
        >
          {isPending ? "Processing..." : "Lock Service Record"}
        </Button>
      </div>
    </form>
  );
}