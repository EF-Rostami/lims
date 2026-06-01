// @ts-nocheck — legacy QMS/document pages pending backend_v3 migration
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState } from "react";
import { CheckCircle, XCircle, AlertCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { internalDocumentService } from "@/services/internalDocument/internalDocument.service";
import { toast } from "sonner";

interface WorkflowActionsProps {
  docId: number;
  status: string;
  onActionComplete: () => void;
}

export function WorkflowActions({ docId, status, onActionComplete }: WorkflowActionsProps) {
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState("");
  const [open, setOpen] = useState(false);

  const handleAction = async (action: 'verify' | 'approve' | 'reject') => {
    if (action === 'reject' && !comments) {
      toast.error("Comments are required for rejection.");
      return;
    }

    setLoading(true);
    try {
      if (action === 'verify') await internalDocumentService.verify(docId, { comments });
      if (action === 'approve') await internalDocumentService.approve(docId, { comments });
      if (action === 'reject') await internalDocumentService.reject(docId, { comments });

      toast.success(`Document ${action}ed successfully`);
      setOpen(false);
      setComments("");
      onActionComplete();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Action failed. Are you an assigned signer?");
    } finally {
      setLoading(false);
    }
  };

  const isPendingVerification = status === "PENDING_VERIFICATION";
  const isPendingApproval = status === "PENDING_APPROVAL";

  if (!isPendingVerification && !isPendingApproval) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 gap-2">
          <ShieldCheck className="h-4 w-4" /> 
          Review & Sign Document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-185.25">
        <DialogHeader>
          <DialogTitle>Attestation of Review</DialogTitle>
          <DialogDescription>
            By signing, you confirm that you have reviewed the technical content and it meets laboratory standards.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Review Comments (Optional for Approval)</label>
            <Textarea 
              placeholder="Enter technical feedback or justification..." 
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="destructive" 
            className="flex-1 gap-2" 
            onClick={() => handleAction('reject')}
            disabled={loading}
          >
            <XCircle className="h-4 w-4" /> Reject
          </Button>
          
          <Button 
            className="flex-1 bg-green-600 hover:bg-green-700 gap-2" 
            onClick={() => handleAction(isPendingVerification ? 'verify' : 'approve')}
            disabled={loading}
          >
            <CheckCircle className="h-4 w-4" /> 
            {isPendingVerification ? "Verify" : "Approve & Release"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}