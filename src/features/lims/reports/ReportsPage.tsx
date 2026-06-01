"use client";

import { useState } from "react";
import { MoreHorizontal, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LimsPageLayout } from "@/features/lims/components/LimsPageLayout";
import { LimsTable } from "@/features/lims/components/LimsTable";
import { LimsStatusBadge } from "@/features/lims/components/LimsStatusBadge";
import { useReports, useCreateReport, useIssueReport } from "./reports.queries";
import type { ReportRead, ReportCreate } from "./reports.api";

const emptyForm = (): ReportCreate => ({
  title: "",
  order_id: null,
  client_id: null,
  notes: null,
});

export function ReportsPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ReportCreate>(emptyForm());

  const { data: reports = [], isLoading } = useReports();
  const create = useCreateReport();
  const issue = useIssueReport();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync(form);
    setOpen(false);
    setForm(emptyForm());
  };

  return (
    <LimsPageLayout
      title="Reports"
      description="Generate and issue laboratory reports"
      actionLabel="New Report"
      onAction={() => { setForm(emptyForm()); setOpen(true); }}
    >
      <LimsTable
        data={reports}
        isLoading={isLoading}
        emptyMessage="No reports yet."
        columns={[
          { header: "Report #", render: (r) => <span className="font-mono text-sm font-medium">{r.report_number}</span> },
          { header: "Title", render: (r) => <span className="font-medium">{r.title}</span> },
          { header: "Order", render: (r) => <span className="text-slate-500">{r.order_id ? `#${r.order_id}` : "—"}</span> },
          { header: "Status", render: (r) => <LimsStatusBadge status={r.status} /> },
          { header: "Date", render: (r) => <span className="text-slate-500">{r.issued_at ? new Date(r.issued_at).toLocaleDateString() : r.generated_at ? new Date(r.generated_at).toLocaleDateString() : "—"}</span> },
          {
            header: "",
            className: "w-10",
            render: (r) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {r.status === "DRAFT" && (
                    <DropdownMenuItem onClick={() => issue.mutateAsync(r.id)}>
                      <Send className="h-3.5 w-3.5 mr-2 text-blue-600" /> Issue Report
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Report</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 mt-2">
            <div className="space-y-1"><Label>Title *</Label><Input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Order ID</Label><Input type="number" value={form.order_id ?? ""} onChange={(e) => setForm((f) => ({ ...f, order_id: e.target.value ? Number(e.target.value) : null }))} /></div>
              <div className="space-y-1"><Label>Client ID</Label><Input type="number" value={form.client_id ?? ""} onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value ? Number(e.target.value) : null }))} /></div>
            </div>
            <div className="space-y-1"><Label>Notes</Label><Textarea rows={2} value={form.notes ?? ""} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value || null }))} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={create.isPending}>Create Report</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </LimsPageLayout>
  );
}
