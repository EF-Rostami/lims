"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, ArrowRight, Bell, ClipboardEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LimsPageLayout } from "@/features/lims/components/LimsPageLayout";
import { LimsTable } from "@/features/lims/components/LimsTable";
import { LimsStatusBadge } from "@/features/lims/components/LimsStatusBadge";
import {
  useComplaints,
  useCreateComplaint,
  useUpdateComplaint,
  useInvestigateComplaint,
  useResolveComplaint,
  useCloseComplaint,
  useNotifyCustomer,
} from "./complaints.queries";
import type { CustomerComplaintRead, CustomerComplaintCreate, CustomerComplaintUpdate, ComplaintCategory } from "./complaints.api";

const CATEGORIES: { value: ComplaintCategory; label: string }[] = [
  { value: "result_error", label: "Result Error" },
  { value: "report_delay", label: "Report Delay" },
  { value: "communication", label: "Communication" },
  { value: "sample_handling", label: "Sample Handling" },
  { value: "billing", label: "Billing" },
  { value: "other", label: "Other" },
];

const STATUS_LABELS: Record<string, string> = {
  received: "Received",
  under_investigation: "Under Investigation",
  resolved: "Resolved",
  closed: "Closed",
};

const NEXT_ACTION: Record<string, { label: string; action: "investigate" | "resolve" | "close" } | null> = {
  received: { label: "Start Investigation", action: "investigate" },
  under_investigation: { label: "Mark Resolved", action: "resolve" },
  resolved: { label: "Close", action: "close" },
  closed: null,
};

const emptyForm = (): CustomerComplaintCreate => ({
  customer_name: "",
  received_date: new Date().toISOString().slice(0, 10),
  category: "other",
  description: "",
  client_id: null,
});

export function ComplaintsPage() {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerComplaintRead | null>(null);
  const [form, setForm] = useState<CustomerComplaintCreate>(emptyForm());
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<CustomerComplaintRead | null>(null);
  const [investigateOpen, setInvestigateOpen] = useState(false);
  const [investigateTarget, setInvestigateTarget] = useState<CustomerComplaintRead | null>(null);
  const [investForm, setInvestForm] = useState<CustomerComplaintUpdate>({});

  const { data: complaints = [], isLoading } = useComplaints();
  const create = useCreateComplaint();
  const update = useUpdateComplaint();
  const investigate = useInvestigateComplaint();
  const resolve = useResolveComplaint();
  const close = useCloseComplaint();
  const notify = useNotifyCustomer();

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setOpen(true);
  };

  const openEdit = (c: CustomerComplaintRead) => {
    setEditing(c);
    setForm({
      customer_name: c.customer_name,
      received_date: c.received_date,
      category: c.category,
      description: c.description,
      client_id: c.client_id,
    });
    setOpen(true);
  };

  const openDetail = (c: CustomerComplaintRead) => {
    setSelected(c);
    setDetailOpen(true);
  };

  const openInvestigate = (c: CustomerComplaintRead) => {
    setInvestigateTarget(c);
    setInvestForm({
      investigation_notes: c.investigation_notes ?? "",
      root_cause: c.root_cause ?? "",
      resolution_description: c.resolution_description ?? "",
      preventive_action: c.preventive_action ?? "",
    });
    setInvestigateOpen(true);
  };

  const handleInvestigateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investigateTarget) return;
    await update.mutateAsync({ id: investigateTarget.id, data: investForm });
    setInvestigateOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await update.mutateAsync({ id: editing.id, data: form });
    } else {
      await create.mutateAsync(form);
    }
    setOpen(false);
  };

  const handleTransition = async (c: CustomerComplaintRead) => {
    const next = NEXT_ACTION[c.status];
    if (!next) return;
    if (next.action === "investigate") await investigate.mutateAsync(c.id);
    else if (next.action === "resolve") await resolve.mutateAsync(c.id);
    else if (next.action === "close") await close.mutateAsync(c.id);
  };

  const set = (field: keyof CustomerComplaintCreate, value: string | null) =>
    setForm((f) => ({ ...f, [field]: value || null }));

  return (
    <LimsPageLayout
      title="Customer Complaints"
      description="Track and resolve customer complaints per ISO 17025 §8.9"
      actionLabel="New Complaint"
      onAction={openCreate}
    >
      <LimsTable
        data={complaints}
        isLoading={isLoading}
        emptyMessage="No complaints recorded."
        columns={[
          {
            header: "Number",
            render: (c) => <span className="font-mono text-xs font-semibold">{c.complaint_number}</span>,
          },
          {
            header: "Customer",
            render: (c) => <span className="font-medium">{c.customer_name}</span>,
          },
          {
            header: "Category",
            render: (c) => (
              <LimsStatusBadge status={c.category.replace("_", " ").toUpperCase()} />
            ),
          },
          {
            header: "Status",
            render: (c) => <LimsStatusBadge status={c.status.toUpperCase()} />,
          },
          {
            header: "Received",
            render: (c) => <span className="text-slate-500 text-sm">{c.received_date}</span>,
          },
          {
            header: "Notified",
            render: (c) => (
              <span className="text-slate-500 text-sm">
                {c.customer_notified_at ? new Date(c.customer_notified_at).toLocaleDateString() : "—"}
              </span>
            ),
          },
          {
            header: "",
            className: "w-10",
            render: (c) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openDetail(c)}>
                    View Details
                  </DropdownMenuItem>
                  {c.status !== "closed" && (
                    <DropdownMenuItem onClick={() => openEdit(c)}>
                      <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                    </DropdownMenuItem>
                  )}
                  {(c.status === "under_investigation" || c.status === "resolved") && (
                    <DropdownMenuItem onClick={() => openInvestigate(c)}>
                      <ClipboardEdit className="h-3.5 w-3.5 mr-2" /> Update Investigation
                    </DropdownMenuItem>
                  )}
                  {NEXT_ACTION[c.status] && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleTransition(c)}>
                        <ArrowRight className="h-3.5 w-3.5 mr-2" />
                        {NEXT_ACTION[c.status]!.label}
                      </DropdownMenuItem>
                    </>
                  )}
                  {!c.customer_notified_at && c.status !== "received" && (
                    <DropdownMenuItem onClick={() => notify.mutateAsync(c.id)}>
                      <Bell className="h-3.5 w-3.5 mr-2" /> Mark Customer Notified
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
      />

      {/* Create / Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Complaint" : "New Complaint"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Customer Name *</Label>
                <Input
                  required
                  value={form.customer_name}
                  onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Received Date *</Label>
                <Input
                  type="date"
                  required
                  value={form.received_date}
                  onChange={(e) => setForm((f) => ({ ...f, received_date: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Category *</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm((f) => ({ ...f, category: v as ComplaintCategory }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Description *</Label>
              <Textarea
                required
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={create.isPending || update.isPending}>
                {editing ? "Save Changes" : "Record Complaint"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Investigation update dialog */}
      <Dialog open={investigateOpen} onOpenChange={setInvestigateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Update Investigation — {investigateTarget?.complaint_number}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleInvestigateSubmit} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label>Investigation Notes</Label>
              <Textarea
                rows={3}
                value={(investForm.investigation_notes as string) ?? ""}
                onChange={(e) => setInvestForm((f) => ({ ...f, investigation_notes: e.target.value || null }))}
                placeholder="Describe the investigation process and findings..."
              />
            </div>
            <div className="space-y-1">
              <Label>Root Cause</Label>
              <Textarea
                rows={2}
                value={(investForm.root_cause as string) ?? ""}
                onChange={(e) => setInvestForm((f) => ({ ...f, root_cause: e.target.value || null }))}
                placeholder="Identified root cause of the complaint..."
              />
            </div>
            <div className="space-y-1">
              <Label>Resolution</Label>
              <Textarea
                rows={2}
                value={(investForm.resolution_description as string) ?? ""}
                onChange={(e) => setInvestForm((f) => ({ ...f, resolution_description: e.target.value || null }))}
                placeholder="Actions taken to resolve the complaint..."
              />
            </div>
            <div className="space-y-1">
              <Label>Preventive Action</Label>
              <Textarea
                rows={2}
                value={(investForm.preventive_action as string) ?? ""}
                onChange={(e) => setInvestForm((f) => ({ ...f, preventive_action: e.target.value || null }))}
                placeholder="Steps taken to prevent recurrence..."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setInvestigateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={update.isPending}>Save Investigation</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selected?.complaint_number} — {selected?.customer_name}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm mt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Status</p>
                  <LimsStatusBadge status={selected.status.toUpperCase()} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Category</p>
                  <p>{CATEGORIES.find((c) => c.value === selected.category)?.label ?? selected.category}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">Description</p>
                <p className="text-slate-700">{selected.description}</p>
              </div>
              {selected.investigation_notes && (
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Investigation Notes</p>
                  <p className="text-slate-700">{selected.investigation_notes}</p>
                </div>
              )}
              {selected.root_cause && (
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Root Cause</p>
                  <p className="text-slate-700">{selected.root_cause}</p>
                </div>
              )}
              {selected.resolution_description && (
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Resolution</p>
                  <p className="text-slate-700">{selected.resolution_description}</p>
                </div>
              )}
              {selected.preventive_action && (
                <div>
                  <p className="text-xs text-slate-500 mb-0.5">Preventive Action</p>
                  <p className="text-slate-700">{selected.preventive_action}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-500 pt-2 border-t">
                <span>Received: {selected.received_date}</span>
                <span>
                  Notified:{" "}
                  {selected.customer_notified_at
                    ? new Date(selected.customer_notified_at).toLocaleDateString()
                    : "No"}
                </span>
                {selected.resolved_at && (
                  <span>Resolved: {new Date(selected.resolved_at).toLocaleDateString()}</span>
                )}
                {selected.closed_at && (
                  <span>Closed: {new Date(selected.closed_at).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LimsPageLayout>
  );
}
