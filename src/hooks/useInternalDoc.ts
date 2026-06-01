// @ts-nocheck — pending migration to features/lims/ pattern
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useInternalDoc.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import { internalDocumentService } from "@/services/internalDocument/internalDocument.service";
import type { Schema } from "@/types/api-types";
import { useUserStore } from "@/store/useUserStore";

type InternalDoc = Schema["InternalDocumentRead"];

export const useInternalDoc = (docId: number) => {
  const [doc, setDoc] = useState<InternalDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentUser = useUserStore((state) => state.user);

  const fetchDoc = useCallback(async () => {
    try {
      setLoading(true);
      // 1. Destructure 'data' from the Axios response
      const response = await internalDocumentService.getById(docId);
      const data = response.data; 

      // 2. Check if data exists and has the 'id' property (Type Guard)
      if (data && "id" in data) {
        // Now casting is safe because 'data' is the actual object, not the Axios wrapper
        setDoc(data as InternalDoc);
      }
    } catch (error) {
      console.error("Failed to fetch document:", error);
    } finally {
      setLoading(false);
    }
  }, [docId]);

  useEffect(() => {
    if (docId) fetchDoc();
  }, [docId, fetchDoc]);

  // --- Permission Logic (Memoized for performance) ---
  
  const permissions = useMemo(() => {
    if (!doc || !currentUser) return { canVerify: false, canApprove: false, canReject: false, canEdit: false };

    const activeAssignment = doc.assignments?.find(
      (a) => a.user_id === currentUser.id && !a.is_completed
    );

    const isVerifier = activeAssignment?.assignment_role === "VERIFIER";
    const isApprover = activeAssignment?.assignment_role === "APPROVER";

    return {
      canVerify: doc.status === "PENDING_VERIFICATION" && isVerifier,
      canApprove: doc.status === "PENDING_APPROVAL" && isApprover,
      canReject: (doc.status === "PENDING_VERIFICATION" && isVerifier) || 
                 (doc.status === "PENDING_APPROVAL" && isApprover),
      canEdit: doc.status === "DRAFT" // Add logic here if only owner can edit: && doc.owner_id === currentUser.id
    };
  }, [doc, currentUser]);

  // --- Actions ---

  const wrapAction = async (action: () => Promise<any>) => {
    try {
      setIsSubmitting(true);
      await action();
      await fetchDoc(); // Refresh data to show updated status/assignments
    } catch (error) {
      console.error("Action failed:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = (comments: string) => 
    wrapAction(() => internalDocumentService.verify(docId, { comments }));

  const handleApprove = (comments: string) => 
    wrapAction(() => internalDocumentService.approve(docId, { comments }));

  const handleReject = (comments: string) => 
    wrapAction(() => internalDocumentService.reject(docId, { comments }));

  const handleRevise = () => 
    wrapAction(() => internalDocumentService.revise(docId));

  const handleUpdateContent = (content: string) =>
    wrapAction(() => internalDocumentService.updateContent(docId, content));

  const handleUpload = (file: File) =>
    wrapAction(() => internalDocumentService.uploadFile(docId, file));

  return { 
    doc, 
    loading, 
    isSubmitting,
    ...permissions, // Spreads canVerify, canApprove, canReject, canEdit
    handleVerify, 
    handleApprove,
    handleReject, 
    handleRevise,
    handleUpdateContent,
    handleUpload,
    refresh: fetchDoc 
  };
};