"use client";

import { useState } from "react";
import {
  Bell, CheckCheck, AlertTriangle, AlertCircle, Clock, Plus,
  Pencil, Trash2, Send, Package, ClipboardList, Info, ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { LimsPageLayout } from "@/features/lims/components/LimsPageLayout";
import {
  useNotifications, useMarkRead, useMarkAllRead, useSendNotification,
  useSlaStatus, useSlaRules, useCreateSlaRule, useUpdateSlaRule, useDeleteSlaRule,
  useUnreadCount,
} from "./notifications.queries";
import type {
  Notification, NotificationType, SlaRule, SlaRuleCreate, SlaEntityType,
} from "./notifications.api";

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function NotifIcon({ type }: { type: NotificationType }) {
  const map: Record<NotificationType, { icon: React.ElementType; color: string }> = {
    TASK_ASSIGNED: { icon: ClipboardList, color: "text-blue-500" },
    SAMPLE_OVERDUE: { icon: Package, color: "text-amber-500" },
    ORDER_DUE: { icon: Clock, color: "text-orange-500" },
    SLA_WARNING: { icon: AlertTriangle, color: "text-amber-500" },
    SLA_BREACH: { icon: AlertCircle, color: "text-red-500" },
    GENERAL: { icon: Info, color: "text-slate-400" },
  };
  const { icon: Icon, color } = map[type] ?? { icon: Bell, color: "text-slate-400" };
  return <Icon className={`h-4 w-4 shrink-0 ${color}`} />;
}

// ── SLA status panel ──────────────────────────────────────────────────────────

function SlaStatusPanel() {
  const { data: status, isLoading } = useSlaStatus();
  const [expanded, setExpanded] = useState(false);

  if (isLoading) return null;

  const total = (status?.warning_count ?? 0) + (status?.breach_count ?? 0);

  return (
    <div className="border rounded-lg bg-white overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <span className="font-medium text-sm text-slate-800">SLA Status</span>
          <div className="flex gap-2">
            {(status?.breach_count ?? 0) > 0 && (
              <Badge variant="destructive" className="text-xs">
                {status!.breach_count} breached
              </Badge>
            )}
            {(status?.warning_count ?? 0) > 0 && (
              <Badge className="text-xs bg-amber-500 hover:bg-amber-500">
                {status!.warning_count} at risk
              </Badge>
            )}
            {total === 0 && (
              <Badge variant="secondary" className="text-xs">All clear</Badge>
            )}
          </div>
        </div>
        {total > 0 && (
          expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {expanded && status && status.items.length > 0 && (
        <div className="border-t divide-y">
          {status.items.map((item, i) => {
            const isBreached = item.status === "BREACH";
            const hrs = Math.abs(item.hours_remaining);
            const label = isBreached
              ? `Overdue by ${hrs}h`
              : `${hrs}h remaining`;

            return (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                {isBreached ? (
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />
                ) : (
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                )}
                <Badge
                  variant="outline"
                  className={`text-xs shrink-0 ${item.entity_type === "order" ? "border-blue-300 text-blue-700" : "border-green-300 text-green-700"}`}
                >
                  {item.entity_type.toUpperCase()}
                </Badge>
                <span className="font-mono font-medium text-slate-800 shrink-0">{item.identifier}</span>
                <span className="text-slate-500 truncate flex-1">{item.details}</span>
                <span className={`shrink-0 text-xs font-medium ${isBreached ? "text-red-600" : "text-amber-600"}`}>
                  {label}
                </span>
                <span className="text-xs text-slate-400 shrink-0">{item.rule_name}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Notifications list ────────────────────────────────────────────────────────

function NotificationItem({
  notif,
  onMarkRead,
}: {
  notif: Notification;
  onMarkRead: (id: number) => void;
}) {
  return (
    <div
      className={`flex gap-3 px-4 py-3 border-b last:border-0 transition-colors ${
        notif.is_read ? "bg-white" : "bg-blue-50/40"
      }`}
    >
      <div className="mt-0.5">
        <NotifIcon type={notif.notification_type} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${notif.is_read ? "text-slate-700" : "font-medium text-slate-900"}`}>
          {notif.title}
        </p>
        {notif.body && (
          <p className="text-xs text-slate-500 mt-0.5 truncate">{notif.body}</p>
        )}
        <p className="text-xs text-slate-400 mt-1">{timeAgo(notif.created_at)}</p>
      </div>
      {!notif.is_read && (
        <button
          onClick={() => onMarkRead(notif.id)}
          className="shrink-0 mt-1 p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          title="Mark as read"
        >
          <CheckCheck className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

function NotificationsTab() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [sendForm, setSendForm] = useState<{ user_id: string; title: string; body: string; type: NotificationType }>({
    user_id: "", title: "", body: "", type: "GENERAL",
  });

  const { data: notifications = [], isLoading } = useNotifications({ unread_only: unreadOnly || undefined });
  const { data: unread } = useUnreadCount();
  const markRead = useMarkRead();
  const markAll = useMarkAllRead();
  const sendNotif = useSendNotification();

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendForm.user_id) return;
    await sendNotif.mutateAsync({
      user_id: Number(sendForm.user_id),
      notification_type: sendForm.type,
      title: sendForm.title,
      body: sendForm.body || null,
    });
    setSendOpen(false);
    setSendForm({ user_id: "", title: "", body: "", type: "GENERAL" });
  };

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={!unreadOnly ? "default" : "outline"}
            onClick={() => setUnreadOnly(false)}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={unreadOnly ? "default" : "outline"}
            onClick={() => setUnreadOnly(true)}
          >
            Unread
            {(unread?.count ?? 0) > 0 && (
              <Badge className="ml-1.5 h-4 px-1 text-xs">{unread!.count}</Badge>
            )}
          </Button>
        </div>
        <div className="flex gap-2">
          {(unread?.count ?? 0) > 0 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1.5" /> Mark all read
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => setSendOpen(true)}>
            <Send className="h-3.5 w-3.5 mr-1.5" /> Send
          </Button>
        </div>
      </div>

      <div className="border rounded-lg bg-white overflow-hidden">
        {isLoading ? (
          <p className="px-4 py-8 text-sm text-slate-400 text-center">Loading…</p>
        ) : notifications.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Bell className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">
              {unreadOnly ? "No unread notifications." : "No notifications yet."}
            </p>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notif={n}
              onMarkRead={(id) => markRead.mutate(id)}
            />
          ))
        )}
      </div>

      {/* Send notification dialog */}
      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent className="max-w-sm" aria-describedby={undefined}>
          <DialogHeader><DialogTitle>Send Notification</DialogTitle></DialogHeader>
          <form onSubmit={handleSend} className="space-y-3 mt-2">
            <div className="space-y-1">
              <Label>User ID *</Label>
              <Input
                required
                type="number"
                placeholder="Recipient user ID"
                value={sendForm.user_id}
                onChange={(e) => setSendForm((f) => ({ ...f, user_id: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Type</Label>
              <Select
                value={sendForm.type}
                onValueChange={(v) => setSendForm((f) => ({ ...f, type: v as NotificationType }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TASK_ASSIGNED">Task Assigned</SelectItem>
                  <SelectItem value="ORDER_DUE">Order Due</SelectItem>
                  <SelectItem value="SAMPLE_OVERDUE">Sample Overdue</SelectItem>
                  <SelectItem value="SLA_WARNING">SLA Warning</SelectItem>
                  <SelectItem value="SLA_BREACH">SLA Breach</SelectItem>
                  <SelectItem value="GENERAL">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input
                required
                value={sendForm.title}
                onChange={(e) => setSendForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Body</Label>
              <Textarea
                rows={2}
                value={sendForm.body}
                onChange={(e) => setSendForm((f) => ({ ...f, body: e.target.value }))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSendOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={sendNotif.isPending}>Send</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── SLA Rules tab ─────────────────────────────────────────────────────────────

const ORDER_PRIORITIES = ["ROUTINE", "URGENT", "STAT"];

const emptySlaForm = (): SlaRuleCreate => ({
  name: "",
  entity_type: "ORDER",
  entity_filter: null,
  warning_hours: 2,
  breach_hours: 8,
  is_active: true,
});

function SlaRulesTab() {
  const { data: rules = [], isLoading } = useSlaRules();
  const createRule = useCreateSlaRule();
  const updateRule = useUpdateSlaRule();
  const deleteRule = useDeleteSlaRule();

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SlaRule | null>(null);
  const [form, setForm] = useState<SlaRuleCreate>(emptySlaForm());

  const set = (patch: Partial<SlaRuleCreate>) => setForm((f) => ({ ...f, ...patch }));

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptySlaForm());
    setFormOpen(true);
  };

  const openEdit = (r: SlaRule) => {
    setEditTarget(r);
    setForm({
      name: r.name,
      entity_type: r.entity_type,
      entity_filter: r.entity_filter,
      warning_hours: r.warning_hours,
      breach_hours: r.breach_hours,
      is_active: r.is_active,
    });
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editTarget) {
      await updateRule.mutateAsync({ id: editTarget.id, data: form });
    } else {
      await createRule.mutateAsync(form);
    }
    setFormOpen(false);
  };

  const handleDelete = async (r: SlaRule) => {
    if (!confirm(`Delete SLA rule "${r.name}"?`)) return;
    await deleteRule.mutateAsync(r.id);
  };

  const filterLabel = (r: SlaRule) => {
    if (!r.entity_filter) return "All";
    return r.entity_filter;
  };

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-500">
          Define when orders and samples trigger warnings or breach SLA deadlines.
        </p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Rule
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-400 py-4">Loading…</p>
      ) : rules.length === 0 ? (
        <div className="border rounded-lg bg-white py-10 text-center">
          <Clock className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No SLA rules configured.</p>
          <button className="mt-1 text-sm text-primary underline" onClick={openCreate}>Add one</button>
        </div>
      ) : (
        <div className="border rounded-lg bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b text-xs text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-2.5 text-left">Name</th>
                <th className="px-4 py-2.5 text-left">Applies To</th>
                <th className="px-4 py-2.5 text-left">Filter</th>
                <th className="px-4 py-2.5 text-right">Warning</th>
                <th className="px-4 py-2.5 text-right">Breach</th>
                <th className="px-4 py-2.5 text-left">Status</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {rules.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-2.5 font-medium text-slate-800">{r.name}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant="outline" className="text-xs">
                      {r.entity_type}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{filterLabel(r)}</td>
                  <td className="px-4 py-2.5 text-right text-amber-600 font-mono">{r.warning_hours}h</td>
                  <td className="px-4 py-2.5 text-right text-red-600 font-mono">{r.breach_hours}h</td>
                  <td className="px-4 py-2.5">
                    <Badge variant={r.is_active ? "default" : "secondary"} className="text-xs">
                      {r.is_active ? "Active" : "Off"}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => openEdit(r)}>
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-600"
                        onClick={() => handleDelete(r)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{editTarget ? "Edit SLA Rule" : "New SLA Rule"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label>Rule Name *</Label>
              <Input
                required
                placeholder="e.g. STAT Orders — 4h TAT"
                value={form.name}
                onChange={(e) => set({ name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Applies To *</Label>
                <Select
                  value={form.entity_type}
                  onValueChange={(v) => set({ entity_type: v as SlaEntityType, entity_filter: null })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ORDER">Orders</SelectItem>
                    <SelectItem value="SAMPLE">Samples</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>
                  {form.entity_type === "ORDER" ? "Priority filter" : "Sample type code"}
                </Label>
                {form.entity_type === "ORDER" ? (
                  <Select
                    value={form.entity_filter ?? "__all__"}
                    onValueChange={(v) => set({ entity_filter: v === "__all__" ? null : v })}
                  >
                    <SelectTrigger><SelectValue placeholder="All priorities" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All priorities</SelectItem>
                      {ORDER_PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder="e.g. BLOOD (or blank = all)"
                    value={form.entity_filter ?? ""}
                    onChange={(e) => set({ entity_filter: e.target.value.toUpperCase() || null })}
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Warning after (hours) *</Label>
                <Input
                  required
                  type="number"
                  min={0}
                  value={form.warning_hours}
                  onChange={(e) => set({ warning_hours: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1">
                <Label>Breach after (hours) *</Label>
                <Input
                  required
                  type="number"
                  min={1}
                  value={form.breach_hours}
                  onChange={(e) => set({ breach_hours: Number(e.target.value) })}
                />
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Both are measured from order creation (or sample receipt for samples).
            </p>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="sla-active"
                checked={form.is_active}
                onChange={(e) => set({ is_active: e.target.checked })}
                className="h-4 w-4 rounded border-slate-300"
              />
              <Label htmlFor="sla-active">Active</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createRule.isPending || updateRule.isPending}>
                {editTarget ? "Save Changes" : "Create Rule"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Page root ─────────────────────────────────────────────────────────────────

export function NotificationsPage() {
  const { data: unread } = useUnreadCount();

  return (
    <LimsPageLayout
      title="Notifications"
      description="In-app alerts, task assignments, and SLA deadline tracking"
    >
      <div className="space-y-4">
        <SlaStatusPanel />

        <Tabs defaultValue="inbox">
          <TabsList>
            <TabsTrigger value="inbox">
              Inbox
              {(unread?.count ?? 0) > 0 && (
                <Badge className="ml-1.5 h-4 px-1 text-xs">{unread!.count}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sla-rules">SLA Rules</TabsTrigger>
          </TabsList>
          <TabsContent value="inbox" className="mt-4">
            <NotificationsTab />
          </TabsContent>
          <TabsContent value="sla-rules" className="mt-4">
            <SlaRulesTab />
          </TabsContent>
        </Tabs>
      </div>
    </LimsPageLayout>
  );
}
