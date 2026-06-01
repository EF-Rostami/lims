//* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { use } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, ShieldCheck, Tag, FileType, AlertCircle, Loader2 } from "lucide-react";
import { WorkflowActions } from "@/components/document/workflow-actions";
import { useViewDocument } from "@/services/internalDocument/internalDocument.hooks";


export default function DocumentOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  // 1. Unwrap the Next.js 15 params promise
  const resolvedParams = use(params);
  const docId = parseInt(resolvedParams.id);

  // 2. Use React Query hook instead of manual useEffect
  const { 
    data: doc, 
    isLoading, 
    isError, 
    refetch 
  } = useViewDocument(docId);

  // 3. Loading and Error states
  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-2" />
        <p>Loading document metadata...</p>
      </div>
    );
  }

  if (isError || !doc) {
    return (
      <div className="flex h-64 items-center justify-center text-destructive border-2 border-dashed border-destructive/20 rounded-xl bg-destructive/5">
        <AlertCircle className="mr-2 h-5 w-5" />
        <p className="font-semibold">Document not found or error loading record.</p>
      </div>
    );
  }

  const isActionable = ["PENDING_VERIFICATION", "PENDING_APPROVAL"].includes(doc.status);
  const latestVersion = doc.versions?.[doc.versions.length - 1];
  const owner = doc.assignments?.find(
  a => a.assignment_role === "OWNER"
);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. Action Banner - Using refetch to update UI after workflow action */}
      {isActionable && (
        <Card className="border-indigo-200 bg-indigo-50/30 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg">
                   <AlertCircle className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-indigo-900 leading-none mb-1">Review Required</h3>
                  <p className="text-sm text-indigo-700">
                    This document is in the <strong className="uppercase">{doc.status.replace("_", " ")}</strong> stage.
                  </p>
                </div>
              </div>
              <div className="w-full md:w-auto">
                <WorkflowActions 
                  docId={doc.id} 
                  status={doc.status} 
                  onActionComplete={() => refetch()} 
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 2. Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System ID</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tracking-tight">{doc.system_id}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Version</CardTitle>
            <FileType className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          
          <CardContent>
            <div className="text-2xl font-bold">
              {latestVersion?.version_tag
                ? `v${latestVersion.version_tag}`
                : "v1.0 (Draft)"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Main Document Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Document Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-md">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground font-medium">Original Author</p>
                  <p className="font-semibold text-slate-900">{owner?.user_id || "Unassigned"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-md">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground font-medium">Classification</p>
                  <p className="font-semibold text-slate-900">{doc.doc_type_id || "Standard Internal Document"}</p>
                </div>
              </div>
            </div>
            <div className="space-y-5">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-md">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm">
                  <p className="text-muted-foreground font-medium">Creation Date</p>
                  <p className="font-semibold text-slate-900">
                    {doc.created_at ? new Date(doc.created_at).toLocaleDateString(undefined, { dateStyle: 'long' }) : "N/A"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 h-10">
                <Badge 
                  variant={doc.status === 'PUBLISHED' ? 'default' : 'outline'} 
                  className={`capitalize px-3 py-1 text-sm ${doc.status === 'DRAFT' ? 'bg-amber-50 text-amber-700 border-amber-200' : ''}`}
                >
                  Current Status: {doc.status.replace("_", " ")}
                </Badge>
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Objective & Scope
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed bg-slate-50 p-4 rounded-lg border italic">
              {doc.title || "No specific scope or description provided for this record."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 4. History Footer */}
      <Card className="bg-slate-50/50 border-dashed">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-slate-500 uppercase tracking-wider">Compliance Note</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Full version history, audit logs, and electronic signature timestamps are stored in the database. 
            To view signatures or associated files, please use the <strong>Assignments</strong> and <strong>History</strong> tabs.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}