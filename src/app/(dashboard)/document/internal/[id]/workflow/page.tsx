// @ts-nocheck — legacy QMS/document pages pending backend_v3 migration
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  UserPlus, 
  ShieldCheck, 
  AlertCircle 
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { internalDocumentService } from "@/services/internalDocument/internalDocument.service";

export default function DocumentWorkflowPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [docStatus, setDocStatus] = useState<string>("");

  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        const [docRes, assignRes] = await Promise.all([
          internalDocumentService.getById(parseInt(params.id)),
          internalDocumentService.getAssignments(params.id)
        ]);
        
        // Handle response data wrapper consistency
        setAssignments((assignRes as any).data || assignRes);
        setDocStatus((docRes as any).data?.status || (docRes as any).status);
      } catch (err) {
        console.error("Failed to load workflow assignments", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkflow();
  }, [params.id]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "APPROVER": return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200">Final Approver</Badge>;
      case "VERIFIER": return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">Technical Verifier</Badge>;
      default: return <Badge variant="outline">Drafter</Badge>;
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading workflow sequence...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Approval Chain</h2>
          <p className="text-sm text-muted-foreground">The sequence of signatures required for release.</p>
        </div>
        {docStatus === "DRAFT" && (
          <Button variant="outline" size="sm" className="gap-2">
            <UserPlus className="h-4 w-4" /> Modify Team
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {assignments.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center">
              <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No workflow assignments found for this document.</p>
            </CardContent>
          </Card>
        ) : (
          assignments.map((asgn, index) => (
            <Card key={asgn.id} className={asgn.is_completed ? "bg-slate-50/50" : ""}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center justify-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      asgn.is_completed ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      {index + 1}
                    </div>
                    {index !== assignments.length - 1 && (
                      <div className="w-0.5 h-8 bg-slate-100 my-1" />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">
                        {asgn.user?.first_name} {asgn.user?.last_name}
                      </p>
                      {getRoleBadge(asgn.assignment_role)}
                    </div>
                    <p className="text-xs text-muted-foreground">{asgn.user?.email}</p>
                  </div>
                </div>

                <div className="text-right">
                  {asgn.is_completed ? (
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                        <CheckCircle2 className="h-4 w-4" /> Signed
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(asgn.completed_at).toLocaleString()}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-slate-400 text-sm italic">
                      <Clock className="h-4 w-4" /> Pending
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Separator />

      <Card className="bg-slate-900 text-white">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blue-400" /> Compliance Note
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-slate-400 leading-relaxed">
            In accordance with ISO 17025:2017, all technical documents must be verified by personnel 
            other than those who performed the work. This workflow ensures a distinct &quot;separation of duties&quot; 
            before any policy or method is released for laboratory use.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}