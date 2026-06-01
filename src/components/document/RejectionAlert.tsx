// src/components/document/RejectionAlert.tsx
import React from 'react';
import type { Schema } from "@/types/api-types";

type InternalDoc = Schema["InternalDocumentRead"];

export const RejectionAlert = ({ doc }: { doc: InternalDoc }) => {
  // Find the most recent assignment that was "completed" but resulted in rejection
  // This logic assumes your backend records the rejection comment in the assignment
  const lastRejection = [...(doc.assignments || [])]
    .filter(a => a.is_completed && a.completed_at)
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())[0];

  if (doc.status !== "DRAFT" || !lastRejection?.comments) return null;

  return (
    <div className="mb-6 border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg shadow-sm">
      <div className="flex items-center mb-2">
        <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <h3 className="text-sm font-bold text-red-800 uppercase tracking-wide">
          Revision Required
        </h3>
      </div>
      <p className="text-sm text-red-700 italic bg-white/50 p-3 rounded border border-red-100">
        &quot;{lastRejection.comments}&quot;
      </p>
      <p className="text-[10px] text-red-500 mt-2 font-medium">
        Rejected by User ID: {lastRejection.user_id} on {new Date(lastRejection.completed_at!).toLocaleDateString()}
      </p>
    </div>
  );
};