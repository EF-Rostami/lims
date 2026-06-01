"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LimsPageLayout } from "@/features/lims/components/LimsPageLayout";
import { LimsTable } from "@/features/lims/components/LimsTable";
import { LimsStatusBadge } from "@/features/lims/components/LimsStatusBadge";
import { useResults, useEnterResult, useValidateResult, useApproveResult, useRejectResult } from "./results.queries";
import type { ResultRead, ResultEnter, ResultReject } from "./results.api";

export function ResultsPage() {
  const [enterTarget, setEnterTarget] = useState<ResultRead | null>(null);
  const [enterForm, setEnterForm] = useState<ResultEnter>({ result_value: "", result_unit: null, comments: null });
  const [rejectTarget, setRejectTarget] = useState<ResultRead | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: results = [], isLoading } = useResults();
  const enterMutation = useEnterResult();
  const validateMutation = useValidateResult();
  const approveMutation = useApproveResult();
  const rejectMutation = useRejectResult();

  const handleEnter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enterTarget) return;
    await enterMutation.mutateAsync({ id: enterTarget.id, data: enterForm });
    setEnterTarget(null);
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    await rejectMutation.mutateAsync({ id: rejectTarget.id, data: { rejection_reason: rejectReason } });
    setRejectTarget(null);
    setRejectReason("");
  };

  return (
    <LimsPageLayout title="Test Results" description="Enter, validate, and approve laboratory results">
      <LimsTable
        data={results}
        isLoading={isLoading}
        emptyMessage="No results yet."
        columns={[
          { header: "ID", render: (r) => <span className="font-mono text-xs text-slate-500">#{r.id}</span> },
          { header: "Order Item", render: (r) => <span className="font-mono text-sm">{r.order_item_id}</span> },
          { header: "Value", render: (r) => <span className="font-medium">{r.result_value ?? "—"} {r.result_unit ?? ""}</span> },
          { header: "Flag", render: (r) => r.result_flag ? <LimsStatusBadge status={r.result_flag} /> : <span className="text-slate-400">—</span> },
          { header: "Status", render: (r) => <LimsStatusBadge status={r.status} /> },
          {
            header: "",
            className: "w-10",
            render: (r) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {r.status === "PENDING" && (
                    <DropdownMenuItem onClick={() => { setEnterTarget(r); setEnterForm({ result_value: "", result_unit: null, comments: null }); }}>
                      Enter Result
                    </DropdownMenuItem>
                  )}
                  {r.status === "ENTERED" && (
                    <DropdownMenuItem onClick={() => validateMutation.mutateAsync(r.id)}>
                      Validate
                    </DropdownMenuItem>
                  )}
                  {r.status === "VALIDATED" && (
                    <DropdownMenuItem onClick={() => approveMutation.mutateAsync(r.id)}>
                      Approve
                    </DropdownMenuItem>
                  )}
                  {["ENTERED", "VALIDATED"].includes(r.status) && (
                    <DropdownMenuItem className="text-red-600" onClick={() => { setRejectTarget(r); setRejectReason(""); }}>
                      Reject
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
      />

      {/* Enter result dialog */}
      <Dialog open={!!enterTarget} onOpenChange={() => setEnterTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Enter Result</DialogTitle></DialogHeader>
          <form onSubmit={handleEnter} className="space-y-3 mt-2">
            <div className="space-y-1">
              <Label>Value *</Label>
              <Input required value={enterForm.result_value ?? ""} onChange={(e) => setEnterForm((f) => ({ ...f, result_value: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Unit</Label>
              <Input value={enterForm.result_unit ?? ""} onChange={(e) => setEnterForm((f) => ({ ...f, result_unit: e.target.value || null }))} />
            </div>
            <div className="space-y-1">
              <Label>Comments</Label>
              <Textarea rows={2} value={enterForm.comments ?? ""} onChange={(e) => setEnterForm((f) => ({ ...f, comments: e.target.value || null }))} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEnterTarget(null)}>Cancel</Button>
              <Button type="submit" disabled={enterMutation.isPending}>Save Result</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={() => setRejectTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Reject Result</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <Label>Reason *</Label>
            <Textarea rows={2} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
            <Button variant="destructive" disabled={!rejectReason || rejectMutation.isPending} onClick={handleReject}>Reject</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LimsPageLayout>
  );
}
