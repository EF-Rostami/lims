"use client";

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { ShieldCheck } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useUserStore } from "@/store/useUserStore";
import { useCreateDelegation } from "@/services/delegation/delegation.hooks";
import { useEmployees, useEmployee } from "@/services/employee/employee.hooks";

import type { Schema } from "@/types/api-types";

type DelegationCreate = Schema["DelegationCreate"] & { permission_ids?: number[] };
type EmployeeResponse = Schema["EmployeeResponse"];

interface DelegationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DelegationModal = ({ isOpen, onClose }: DelegationModalProps) => {
  const user = useUserStore((state) => state.user);
  
  const { data: myProfile } = useEmployee(user?.id ?? 0);
  const { data: employees } = useEmployees();
  const createMutation = useCreateDelegation();

  const { register, handleSubmit, setValue, watch, reset } = useForm<DelegationCreate>({
    defaultValues: {
      scope: "full_authority",
      permission_ids: []
    }
  });

  // Watch values for UI state
  // eslint-disable-next-line react-hooks/incompatible-library
  const selectedPositionId = watch("position_id");
  const selectedPermissions = watch("permission_ids") || [];

  const employeeData = (myProfile && !("detail" in myProfile)) 
    ? (myProfile as EmployeeResponse) 
    : null;

  // Granular selection logic
  const togglePermission = (id: number) => {
    const current = [...selectedPermissions];
    const index = current.indexOf(id);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(id);
    }
    setValue("permission_ids", current);
    
    // Update scope text dynamically
    if (current.length === 0) {
      setValue("scope", "full_authority");
    } else {
      setValue("scope", `granular_authority: ${current.length} perms`);
    }
  };

  const onSubmit: SubmitHandler<DelegationCreate> = (data) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="text-blue-600" />
            Establish Acting Authority
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          
          {/* DEPUTY SELECTION */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
              Acting Deputy
            </Label>
            <Select onValueChange={(val) => setValue("deputy_employee_id", parseInt(val))}>
              <SelectTrigger className="rounded-xl border-slate-200">
                <SelectValue placeholder="Select Colleague..." />
              </SelectTrigger>
              <SelectContent>
                {employees?.filter(e => e.id !== user?.id).map(emp => (
                  <SelectItem key={emp.id} value={emp.id.toString()}>
                    {emp.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* POSITION SELECTION */}
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-blue-600 tracking-widest">
                Position to Delegate
              </Label>
              <div className="flex flex-col gap-2">
                {employeeData?.positions_list?.map((pos) => (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => setValue("position_id", pos.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      selectedPositionId === pos.id 
                      ? "border-blue-600 bg-blue-50 shadow-sm" 
                      : "border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <p className="text-[11px] font-black uppercase leading-tight">{pos.title}</p>
                    <p className="text-[9px] font-bold text-slate-400">{pos.department_name}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* GRANULAR PERMISSIONS */}
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">
                Permissions Scope
              </Label>
              <div className="bg-slate-50/50 p-4 rounded-[1.5rem] border border-slate-100 min-h-35 space-y-2">
                {/* Note: For this to work best, we usually need the ID and the Name. 
                   Assuming your permission_names and permission_ids arrays match indices.
                */}
                {employeeData?.permission_names?.map((name: string, idx: number) => {
                  const permId = employeeData.permission_ids?.[idx];
                  if (!permId) return null;

                  return (
                    <label key={permId} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={selectedPermissions.includes(permId)}
                        onChange={() => togglePermission(permId)}
                        className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-[11px] font-bold text-slate-600 group-hover:text-emerald-600 transition-colors uppercase tracking-tight">
                        {name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Start Date</Label>
              <Input type="datetime-local" {...register("start_date")} required />
            </div>
            <div className="grid gap-2">
              <Label>End Date</Label>
              <Input type="datetime-local" {...register("end_date")} required />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Processing..." : "Confirm Delegation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};