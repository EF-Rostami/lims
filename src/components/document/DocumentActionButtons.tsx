// src/components/document/DocumentActionButtons.tsx
import React, { useState } from 'react';
import { useInternalDoc } from "@/hooks/useInternalDoc";
import { SignOffDialog } from "./SignOffDialog";

interface Props {
  docId: number;
}

// src/components/document/DocumentActionButtons.tsx
export const DocumentActionButtons: React.FC<Props> = ({ docId }) => {
  const { doc, canVerify, handleVerify, handleReject } = useInternalDoc(docId);
  const [activeAction, setActiveAction] = useState<'verify' | 'reject' | null>(null);

  if (!doc) return null;

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm space-y-4">
      <h3 className="text-sm font-bold text-slate-800">Workflow Actions</h3>
      
      {canVerify ? (
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => setActiveAction('verify')}
            className="w-full py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700 transition-colors"
          >
            Review & Verify
          </button>
          <button 
            onClick={() => setActiveAction('reject')}
            className="w-full py-2 bg-white border border-red-200 text-red-600 rounded font-medium hover:bg-red-50 transition-colors"
          >
            Reject / Revise
          </button>
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic">No actions available for this status.</p>
      )}

      {/* VERIFY DIALOG */}
      <SignOffDialog
        isOpen={activeAction === 'verify'}
        onClose={() => setActiveAction(null)}
        onConfirm={handleVerify}
        title="Verify Document"
        actionLabel="Sign & Verify"
        variant="success"
      />

      {/* REJECT DIALOG */}
      <SignOffDialog
        isOpen={activeAction === 'reject'}
        onClose={() => setActiveAction(null)}
        onConfirm={handleReject}
        title="Reject Document"
        actionLabel="Confirm Rejection"
        variant="danger"
      />
    </div>
  );
};