/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import React, { useState } from "react";
import { CheckCircle, Lock, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox"; // Assuming Shadcn

import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useVerifyCalibration } from "@/services/calibration/calibration.hooks";

interface Props {
  calibrationId: number;
  equipmentId: number;
  isLocked: boolean;
  canVerify: boolean;
  equipmentCode?: string;
}

export function CalibrationVerificationButton({ 
  calibrationId, 
  equipmentId, 
  isLocked, 
  canVerify,
  equipmentCode 
}: Props) {
  const queryClient = useQueryClient();
  const [confirmedDetails, setConfirmedDetails] = useState(false);
  const { mutate: verify, isPending } = useVerifyCalibration();

  // 1. Definite State: Record is already verified
  if (isLocked) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-bold shadow-sm">
        <ShieldCheck className="h-3.5 w-3.5" />
        Record Verified & Asset Released
      </div>
    );
  }

  // 2. Authorization Check
  if (!canVerify) return null;

  const handleVerify = () => {
    verify(calibrationId, {
      onSuccess: () => {
        toast.success("Record verified successfully", {
          description: `Asset ${equipmentCode || ''} has been returned to Operational status.`
        });
        // CRITICAL: Refresh all equipment-related data
        queryClient.invalidateQueries({ queryKey: ['equipment', equipmentId] });
        queryClient.invalidateQueries({ queryKey: ['equipment-tasks', equipmentId] });
      },
      onError: () => {
        toast.error("Verification failed. Please try again.");
      }
    });
  };

  return (
    <AlertDialog onOpenChange={() => setConfirmedDetails(false)}>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 transition-all shadow-sm">
          <CheckCircle className="h-4 w-4" />
          Verify & Release Asset
        </Button>
      </AlertDialogTrigger>
      
      <AlertDialogContent className="max-w-100">
        <AlertDialogHeader>
          <div className="mx-auto w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
          </div>
          <AlertDialogTitle className="text-center">Final Quality Verification</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            You are about to verify the calibration for <strong>{equipmentCode || 'this asset'}</strong>. 
            This action is permanent and will lock the record for audit.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Audit Acknowledgement */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 my-2 flex items-start gap-3">
          <Checkbox 
            id="audit-check" 
            checked={confirmedDetails} 
            onCheckedChange={(val) => setConfirmedDetails(!!val)}
            className="mt-1"
          />
          <label htmlFor="audit-check" className="text-xs text-slate-600 leading-snug cursor-pointer select-none">
            I confirm that I have reviewed the results and they meet the required laboratory specifications.
          </label>
        </div>

        <AlertDialogFooter className="sm:flex-col-reverse gap-2">
          <AlertDialogCancel className="w-full sm:w-full mt-0">Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleVerify}
            className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-full"
            disabled={isPending || !confirmedDetails}
          >
            {isPending ? "Processing..." : "Sign & Lock Record"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}