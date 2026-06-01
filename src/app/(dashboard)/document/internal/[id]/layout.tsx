"use client";

import React, { use } from "react";
import { useRouter } from "next/navigation";
import { Send, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSubmitDocument, useViewDocument } from "@/services/internalDocument/internalDocument.hooks";


export default function InternalDocDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>; // Typed as Promise for Next.js 15
}) {
  const router = useRouter();
  
  // 1. Unwrap the params promise
  const resolvedParams = use(params);
  const docId = parseInt(resolvedParams.id);

  // 2. Use React Query hook for fetching data
  const { data: doc, isLoading, refetch } = useViewDocument(docId);

  // 3. Use Mutation hook for submission
  const submitMutation = useSubmitDocument();

  const handleSubmit = async () => {
    if (!confirm("Are you sure? This will lock the document for verification.")) return;
    
    submitMutation.mutate(docId, {
      onSuccess: () => {
        toast.success("Document submitted successfully");
        refetch(); // Refetch the doc to update UI state to read-only
        router.refresh();
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (err: any) => {
        const errorDetail = err.response?.data?.detail || "Submission failed.";
        toast.error(typeof errorDetail === 'string' ? errorDetail : "Check if content is missing.");
      }
    });
  };

  return (
    <div className="flex flex-col h-full">
      <header className="border-b bg-white px-8 py-4 flex items-center justify-between sticky top-0 z-20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : doc?.title}
            </h1>
            {doc?.system_id && (
              <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                {doc.system_id}
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1 capitalize">
              Status: <b className={doc?.status === 'DRAFT' ? 'text-amber-600' : 'text-blue-600'}>
                {doc?.status?.replace("_", " ") || "..."}
              </b>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {doc?.status === "DRAFT" ? (
            <Button 
              onClick={handleSubmit} 
              disabled={submitMutation.isPending} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              {submitMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {submitMutation.isPending ? "Submitting..." : "Submit for Verification"}
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground bg-slate-50 px-3 py-2 rounded-md border text-sm font-medium">
              <Lock className="h-4 w-4" /> Read Only Mode
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 p-8 overflow-y-auto bg-slate-50/30">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}