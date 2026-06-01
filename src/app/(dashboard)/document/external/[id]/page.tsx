// @ts-nocheck — legacy QMS/document pages pending backend_v3 migration
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { RefreshCcw, Calendar, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { externalDocumentService } from "@/services/externalDocument/externalDocument.service";
import { toast } from "sonner";

export default function ExternalDocReviewCard({ doc, onUpdate }: { doc: any, onUpdate: () => void }) {
  const [loading, setLoading] = useState(false);

  // ISO 17025 Logic: Check if last review was > 365 days ago
  const lastReview = new Date(doc.last_review_date);
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const isOverdue = lastReview < oneYearAgo || !doc.is_current;

  const handleReview = async () => {
    setLoading(true);
    try {
      await externalDocumentService.markReviewed(doc.id);
      toast.success("Compliance review logged successfully.");
      onUpdate(); // Refresh data
    } catch (err) {
      toast.error("You do not have permission to verify standards.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={isOverdue ? "border-red-500 bg-red-50/10" : "bg-slate-900 text-white"}>
      <CardHeader>
        <CardTitle className={`text-sm flex items-center gap-2 ${isOverdue ? "text-red-600" : "text-slate-400"}`}>
          {isOverdue ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4 text-green-500" />}
          LIMS Compliance Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1">
          <p className={`text-xs ${isOverdue ? "text-red-600" : "text-slate-500"}`}>Last Annual Review</p>
          <p className={`text-lg font-semibold ${isOverdue ? "text-red-700" : ""}`}>
            {lastReview.toLocaleDateString()}
          </p>
        </div>
        
        <div className="space-y-1">
          <p className="text-xs text-slate-500">Current Validity Status</p>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${doc.is_current ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-sm font-medium">{doc.is_current ? "Current / Active" : "Obsolete / Needs Review"}</span>
          </div>
        </div>

        <Button 
          onClick={handleReview} 
          disabled={loading}
          className={`w-full gap-2 ${isOverdue ? "bg-red-600 hover:bg-red-700" : "bg-slate-800 hover:bg-slate-700"}`}
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {isOverdue ? "Verify Current Version" : "Perform Periodic Review"}
        </Button>
      </CardContent>
    </Card>
  );
}