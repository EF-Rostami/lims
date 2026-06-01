// src/features/audit-trails/components/ReasonForChangeModal.tsx
"use client";
import { useAuditStore } from "../audit-store";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export function ReasonForChangeModal() {
  const { isOpen, submitReason, close } = useAuditStore();
  const [val, setVal] = useState("");

  const handleSubmit = () => {
    if (val.length >= 5) {
      submitReason(val);
      setVal("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reason for Change (Audit Requirement)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Compliance policy requires a brief explanation for modifying this record.
          </p>
          <Textarea 
            placeholder="e.g., Correcting typo in entry, updating based on re-calibration result"
            value={val}
            onChange={(e) => setVal(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={close}>Cancel</Button>
            <Button disabled={val.length < 5} onClick={handleSubmit}>Confirm & Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}