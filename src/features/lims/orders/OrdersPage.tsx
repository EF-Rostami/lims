"use client";

import { useState } from "react";
import { MoreHorizontal, CheckCircle, XCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LimsPageLayout } from "@/features/lims/components/LimsPageLayout";
import { LimsTable } from "@/features/lims/components/LimsTable";
import { LimsStatusBadge } from "@/features/lims/components/LimsStatusBadge";
import { useOrders, useCreateOrder, useSubmitOrder, useCancelOrder } from "./orders.queries";
import { ordersApi } from "./orders.api";
import { useClients } from "@/features/lims/clients/clients.queries";
import type { OrderRead, OrderListItem, OrderCreate } from "./orders.api";

const PRIORITIES = ["ROUTINE", "URGENT", "STAT"] as const;

const emptyForm = (): Omit<OrderCreate, "items"> => ({
  client_id: null,
  requested_by: null,
  clinician_name: null,
  clinical_notes: null,
  priority: "ROUTINE",
  due_date: null,
});

export function OrdersPage() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Omit<OrderCreate, "items">>(emptyForm());
  const [viewOrder, setViewOrder] = useState<OrderRead | null>(null);

  const { data: orders = [], isLoading } = useOrders();
  const { data: clients = [] } = useClients();
  const create = useCreateOrder();
  const submit = useSubmitOrder();
  const cancel = useCancelOrder();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync({ ...form, items: [] });
    setOpen(false);
    setForm(emptyForm());
  };

  return (
    <LimsPageLayout
      title="Work Orders"
      description="Manage test requests and workflow"
      actionLabel="New Order"
      onAction={() => { setForm(emptyForm()); setOpen(true); }}
    >
      <LimsTable
        data={orders}
        isLoading={isLoading}
        emptyMessage="No orders yet."
        columns={[
          { header: "Order #", render: (o) => <span className="font-mono text-sm font-medium">{o.order_number}</span> },
          { header: "Client", render: (o) => <span>{clients.find((c) => c.id === o.client_id)?.name ?? "—"}</span> },
          { header: "Priority", render: (o) => <LimsStatusBadge status={o.priority} /> },
          { header: "Status", render: (o) => <LimsStatusBadge status={o.status} /> },
          { header: "Items", render: (o: OrderListItem) => <span className="text-slate-500">{o.item_count}</span> },
          { header: "Due", render: (o) => <span className="text-slate-500">{o.due_date ? new Date(o.due_date).toLocaleDateString() : "—"}</span> },
          {
            header: "",
            className: "w-10",
            render: (o) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={async () => setViewOrder(await ordersApi.get(o.id))}>
                    <Eye className="h-3.5 w-3.5 mr-2" /> View Items
                  </DropdownMenuItem>
                  {o.status === "DRAFT" && (
                    <DropdownMenuItem onClick={() => submit.mutateAsync(o.id)}>
                      <CheckCircle className="h-3.5 w-3.5 mr-2 text-green-600" /> Submit
                    </DropdownMenuItem>
                  )}
                  {!["COMPLETED", "CANCELLED"].includes(o.status) && (
                    <DropdownMenuItem className="text-red-600" onClick={() => cancel.mutateAsync(o.id)}>
                      <XCircle className="h-3.5 w-3.5 mr-2" /> Cancel
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
      />

      {/* Create dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Work Order</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label>Client</Label>
              <Select
                value={form.client_id ? String(form.client_id) : "none"}
                onValueChange={(v) => setForm((f) => ({ ...f, client_id: v === "none" ? null : Number(v) }))}
              >
                <SelectTrigger><SelectValue placeholder="Select client…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No client</SelectItem>
                  {clients.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v as OrderCreate["priority"] }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Due Date</Label>
                <Input type="date" value={form.due_date ?? ""} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value || null }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Requesting Clinician</Label>
              <Input value={form.clinician_name ?? ""} onChange={(e) => setForm((f) => ({ ...f, clinician_name: e.target.value || null }))} />
            </div>
            <div className="space-y-1">
              <Label>Clinical Notes</Label>
              <Textarea rows={2} value={form.clinical_notes ?? ""} onChange={(e) => setForm((f) => ({ ...f, clinical_notes: e.target.value || null }))} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={create.isPending}>Create Order</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Order detail */}
      <Dialog open={!!viewOrder} onOpenChange={() => setViewOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Order {viewOrder?.order_number}</DialogTitle></DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="flex gap-3 flex-wrap">
              <LimsStatusBadge status={viewOrder?.status ?? ""} />
              <LimsStatusBadge status={viewOrder?.priority ?? ""} />
            </div>
            <p className="text-sm text-slate-600">{viewOrder?.clinical_notes ?? "No clinical notes."}</p>
            {viewOrder?.items && viewOrder.items.length > 0 ? (
              <div className="rounded-lg border divide-y">
                {viewOrder.items.map((item) => (
                  <div key={item.id} className="px-3 py-2 flex items-center justify-between text-sm">
                    <span>{item.test_code} — {item.test_name}</span>
                    <LimsStatusBadge status={item.status} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No items in this order.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOrder(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LimsPageLayout>
  );
}
