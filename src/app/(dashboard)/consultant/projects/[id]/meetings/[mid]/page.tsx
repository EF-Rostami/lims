"use client";

import { useState, useMemo, use } from "react";
import Link from "next/link";
import {
  ArrowLeft, Plus, Check, ChevronDown, ChevronUp,
  Trash2, RotateCcw, Link2, UserPlus, Mail, FileText,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  useMeeting,
  useUpdateMeeting,
  useAddAgenda,
  useDeleteAgenda,
  useAddAction,
  useUpdateAction,
  useAddDecision,
  useRolloverActions,
  useMeetings,
  useAttendees,
  useAddAttendee,
  useUpdateAttendee,
  useRemoveAttendee,
  useSendInvitations,
  useSendMinutes,
} from "@/features/lims/consultancy/meetings.queries";
import { useTasks } from "@/features/lims/consultancy/consultancy.queries";
import type {
  MeetingAgendaRead,
  MeetingActionRead,
  MeetingAttendeeRead,
  ActionStatus,
  DecisionType,
  AttendeeRole,
  AttendanceStatus,
} from "@/features/lims/consultancy/meetings.api";
import type { ConsultancyTaskRead } from "@/features/lims/consultancy/consultancy.api";

// ── Constants ─────────────────────────────────────────────────────────────────

const ACTION_STATUS_COLORS: Record<ActionStatus, string> = {
  OPEN: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  DONE: "bg-green-100 text-green-700",
};

const DECISION_TYPE_COLORS: Record<DecisionType, string> = {
  APPROVAL: "bg-green-100 text-green-700",
  CHANGE_REQUEST: "bg-amber-100 text-amber-700",
  REJECTION: "bg-red-100 text-red-600",
};

const TASK_STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-amber-100 text-amber-700",
  IN_PROGRESS: "bg-blue-100 text-blue-700",
  BLOCKED: "bg-red-100 text-red-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

const TASK_PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: "text-red-600 font-semibold",
  HIGH: "text-orange-600",
  MEDIUM: "text-amber-600",
  LOW: "text-muted-foreground",
};

const ATTENDANCE_COLORS: Record<AttendanceStatus, string> = {
  PENDING: "bg-gray-100 text-gray-600",
  PRESENT: "bg-green-100 text-green-700",
  ABSENT: "bg-red-100 text-red-600",
  APOLOGY: "bg-amber-100 text-amber-700",
};

const ATTENDANCE_CYCLE: Record<AttendanceStatus, AttendanceStatus> = {
  PENDING: "PRESENT",
  PRESENT: "ABSENT",
  ABSENT: "APOLOGY",
  APOLOGY: "PENDING",
};

const ROLE_LABELS: Record<AttendeeRole, string> = {
  CHAIR: "Chair",
  SECRETARY: "Secretary",
  ATTENDEE: "Attendee",
  OBSERVER: "Observer",
};

// ── Action row ─────────────────────────────────────────────────────────────────

function ActionRow({
  action,
  meetingId,
  refId,
}: {
  action: MeetingActionRead;
  meetingId: number;
  refId: string;
}) {
  const updateAction = useUpdateAction();
  const next: Record<ActionStatus, ActionStatus> = {
    OPEN: "IN_PROGRESS",
    IN_PROGRESS: "DONE",
    DONE: "OPEN",
  };

  return (
    <div className="flex items-center gap-2 py-1.5 border-b last:border-0">
      <span className="shrink-0 text-xs font-mono text-muted-foreground w-16">{refId}</span>
      <button
        onClick={() =>
          updateAction.mutate({
            meetingId,
            actionId: action.id,
            data: { status: next[action.status as ActionStatus] },
          })
        }
        className={`shrink-0 text-xs px-1.5 py-0.5 rounded font-medium cursor-pointer ${ACTION_STATUS_COLORS[action.status as ActionStatus] ?? ""}`}
        title="Click to advance status"
      >
        {action.status}
      </button>
      <span className="flex-1 text-sm">{action.title}</span>
      {action.due_date && (
        <span className="text-xs text-muted-foreground">{action.due_date}</span>
      )}
    </div>
  );
}

// ── Agenda item ───────────────────────────────────────────────────────────────

function AgendaItem({
  item,
  meetingId,
  linkedTask,
  actionRefs,
  decisionRefs,
}: {
  item: MeetingAgendaRead;
  meetingId: number;
  linkedTask?: ConsultancyTaskRead;
  actionRefs: Map<number, string>;
  decisionRefs: Map<number, string>;
}) {
  const [expanded, setExpanded] = useState(true);
  const [addActionOpen, setAddActionOpen] = useState(false);
  const [addDecisionOpen, setAddDecisionOpen] = useState(false);
  const [actionTitle, setActionTitle] = useState("");
  const [decisionText, setDecisionText] = useState("");
  const [decisionType, setDecisionType] = useState<DecisionType>("APPROVAL");

  const addAction = useAddAction();
  const addDecision = useAddDecision();
  const deleteAgenda = useDeleteAgenda();

  const handleAddAction = async (e: React.FormEvent) => {
    e.preventDefault();
    await addAction.mutateAsync({ meetingId, agendaId: item.id, data: { title: actionTitle } });
    setActionTitle("");
    setAddActionOpen(false);
  };

  const handleAddDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDecision.mutateAsync({
      meetingId,
      agendaId: item.id,
      data: { decision_text: decisionText, type: decisionType },
    });
    setDecisionText("");
    setAddDecisionOpen(false);
  };

  const openActions = item.actions.filter((a) => a.status !== "DONE").length;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-muted/50">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="shrink-0 text-muted-foreground"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        <span className="flex-1 text-sm font-medium min-w-0 truncate">{item.title}</span>

        {linkedTask && (
          <>
            <Link2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span
              className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ${TASK_STATUS_COLORS[linkedTask.status] ?? ""}`}
            >
              {linkedTask.status}
            </span>
            <span
              className={`text-xs shrink-0 ${TASK_PRIORITY_COLORS[linkedTask.priority] ?? ""}`}
            >
              {linkedTask.priority}
            </span>
          </>
        )}

        {openActions > 0 && (
          <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded shrink-0">
            {openActions} open
          </span>
        )}

        <button
          onClick={() => deleteAgenda.mutate({ meetingId, agendaId: item.id })}
          className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {expanded && (
        <div className="px-4 py-3 space-y-3">
          {item.description && (
            <p className="text-sm text-muted-foreground">{item.description}</p>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Actions
              </p>
              <button
                onClick={() => setAddActionOpen(true)}
                className="text-xs text-primary hover:underline flex items-center gap-0.5"
              >
                <Plus className="h-3 w-3" />Add
              </button>
            </div>
            {item.actions.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No actions</p>
            ) : (
              <div>
                {item.actions.map((a) => (
                  <ActionRow
                    key={a.id}
                    action={a}
                    meetingId={meetingId}
                    refId={actionRefs.get(a.id) ?? ""}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Decisions
              </p>
              <button
                onClick={() => setAddDecisionOpen(true)}
                className="text-xs text-primary hover:underline flex items-center gap-0.5"
              >
                <Plus className="h-3 w-3" />Add
              </button>
            </div>
            {item.decisions.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No decisions</p>
            ) : (
              <div className="space-y-1">
                {item.decisions.map((d) => (
                  <div key={d.id} className="flex items-start gap-2 text-sm">
                    <span className="shrink-0 text-xs font-mono text-muted-foreground w-16 mt-0.5">
                      {decisionRefs.get(d.id) ?? ""}
                    </span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-medium shrink-0 mt-0.5 ${DECISION_TYPE_COLORS[d.type as DecisionType] ?? ""}`}
                    >
                      {d.type.replace(/_/g, " ")}
                    </span>
                    <span>{d.decision_text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <Dialog open={addActionOpen} onOpenChange={setAddActionOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add Action</DialogTitle></DialogHeader>
          <form onSubmit={handleAddAction} className="space-y-3 mt-2">
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input
                required
                value={actionTitle}
                onChange={(e) => setActionTitle(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddActionOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addAction.isPending}>Add</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={addDecisionOpen} onOpenChange={setAddDecisionOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Add Decision</DialogTitle></DialogHeader>
          <form onSubmit={handleAddDecision} className="space-y-3 mt-2">
            <div className="space-y-1">
              <Label>Type *</Label>
              <Select
                value={decisionType}
                onValueChange={(v) => setDecisionType(v as DecisionType)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="APPROVAL">Approval</SelectItem>
                  <SelectItem value="CHANGE_REQUEST">Change Request</SelectItem>
                  <SelectItem value="REJECTION">Rejection</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Decision *</Label>
              <Textarea
                required
                value={decisionText}
                onChange={(e) => setDecisionText(e.target.value)}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddDecisionOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addDecision.isPending}>Add</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Attendee row ──────────────────────────────────────────────────────────────

function AttendeeRow({
  attendee,
  meetingId,
}: {
  attendee: MeetingAttendeeRead;
  meetingId: number;
}) {
  const updateAttendee = useUpdateAttendee();
  const removeAttendee = useRemoveAttendee();

  const cycleAttendance = () => {
    const next = ATTENDANCE_CYCLE[attendee.attendance as AttendanceStatus];
    updateAttendee.mutate({
      meetingId,
      attendeeId: attendee.id,
      data: { attendance: next },
    });
  };

  return (
    <div className="flex items-center gap-2 py-2 border-b last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{attendee.name}</p>
        {attendee.email && (
          <p className="text-xs text-muted-foreground truncate">{attendee.email}</p>
        )}
      </div>
      <span className="text-xs text-muted-foreground shrink-0">
        {ROLE_LABELS[attendee.role as AttendeeRole] ?? attendee.role}
      </span>
      <button
        onClick={cycleAttendance}
        disabled={updateAttendee.isPending}
        title="Click to cycle attendance status"
        className={`shrink-0 text-xs px-2 py-0.5 rounded font-medium cursor-pointer transition-opacity disabled:opacity-50 ${ATTENDANCE_COLORS[attendee.attendance as AttendanceStatus] ?? ""}`}
      >
        {attendee.attendance}
      </button>
      <button
        onClick={() => removeAttendee.mutate({ meetingId, attendeeId: attendee.id })}
        disabled={removeAttendee.isPending}
        className="text-muted-foreground hover:text-destructive transition-colors shrink-0 disabled:opacity-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ── Add Attendee Dialog ───────────────────────────────────────────────────────

function AddAttendeeDialog({
  open,
  onClose,
  meetingId,
}: {
  open: boolean;
  onClose: () => void;
  meetingId: number;
}) {
  const [mode, setMode] = useState<"external" | "internal">("external");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<AttendeeRole>("ATTENDEE");

  const addAttendee = useAddAttendee();

  const handleClose = () => {
    setName("");
    setEmail("");
    setUserId("");
    setRole("ATTENDEE");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "external") {
      await addAttendee.mutateAsync({
        meetingId,
        data: { name, email: email || null, role },
      });
    } else {
      await addAttendee.mutateAsync({
        meetingId,
        data: { user_id: Number(userId), role },
      });
    }
    handleClose();
  };

  const canSubmit =
    mode === "external"
      ? !!name.trim() && !!email.trim()
      : !!userId && !isNaN(Number(userId));

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Add Attendee</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="flex gap-1 border rounded-lg p-0.5 bg-muted">
            {(["external", "internal"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 text-xs py-1.5 rounded transition-colors font-medium ${
                  mode === m
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "external" ? "External" : "Internal User"}
              </button>
            ))}
          </div>

          {mode === "external" ? (
            <>
              <div className="space-y-1">
                <Label>Name *</Label>
                <Input
                  autoFocus
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                />
              </div>
              <div className="space-y-1">
                <Label>Email *</Label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="person@example.com"
                />
              </div>
            </>
          ) : (
            <div className="space-y-1">
              <Label>User ID *</Label>
              <Input
                autoFocus
                required
                type="number"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter numeric user ID"
              />
              <p className="text-xs text-muted-foreground">
                Name and email will be resolved from their profile.
              </p>
            </div>
          )}

          <div className="space-y-1">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as AttendeeRole)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CHAIR">Chair</SelectItem>
                <SelectItem value="SECRETARY">Secretary</SelectItem>
                <SelectItem value="ATTENDEE">Attendee</SelectItem>
                <SelectItem value="OBSERVER">Observer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
            <Button type="submit" disabled={!canSubmit || addAttendee.isPending}>
              <UserPlus className="h-3.5 w-3.5 mr-1" />Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Add Agenda Dialog ─────────────────────────────────────────────────────────

function AddAgendaDialog({
  open,
  onClose,
  meetingId,
  projectId,
  alreadyLinkedTaskIds,
}: {
  open: boolean;
  onClose: () => void;
  meetingId: number;
  projectId: number;
  alreadyLinkedTaskIds: Set<number>;
}) {
  const [mode, setMode] = useState<"tasks" | "custom">("tasks");
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<number>>(new Set());
  const [customTitle, setCustomTitle] = useState("");
  const [customDesc, setCustomDesc] = useState("");

  const { data: tasks = [] } = useTasks(projectId);
  const addAgenda = useAddAgenda();

  const availableTasks = tasks.filter(
    (t) =>
      !["COMPLETED", "CANCELLED"].includes(t.status) &&
      !alreadyLinkedTaskIds.has(t.id)
  );

  const toggleTask = (id: number) => {
    setSelectedTaskIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleClose = () => {
    setSelectedTaskIds(new Set());
    setCustomTitle("");
    setCustomDesc("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "tasks") {
      const toAdd = availableTasks.filter((t) => selectedTaskIds.has(t.id));
      for (const task of toAdd) {
        await addAgenda.mutateAsync({
          meetingId,
          data: {
            title: task.title,
            linked_entity_type: "TASK",
            linked_entity_id: task.id,
          },
        });
      }
    } else {
      await addAgenda.mutateAsync({
        meetingId,
        data: {
          title: customTitle.trim(),
          description: customDesc.trim() || null,
        },
      });
    }
    handleClose();
  };

  const canSubmit =
    mode === "tasks" ? selectedTaskIds.size > 0 : !!customTitle.trim();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Agenda Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="flex gap-1 border rounded-lg p-0.5 bg-muted">
            {(["tasks", "custom"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 text-xs py-1.5 rounded transition-colors font-medium ${
                  mode === m
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "tasks" ? "From Tasks" : "Custom Item"}
              </button>
            ))}
          </div>

          {mode === "tasks" && (
            <div className="space-y-2">
              {availableTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6 border rounded-lg">
                  No open tasks available to add.
                </p>
              ) : (
                <div className="border rounded-lg max-h-60 overflow-y-auto divide-y">
                  {availableTasks.map((task) => (
                    <label
                      key={task.id}
                      className="flex items-start gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-muted transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTaskIds.has(task.id)}
                        onChange={() => toggleTask(task.id)}
                        className="mt-0.5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm leading-snug">{task.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <span
                            className={`inline-block px-1 rounded ${TASK_STATUS_COLORS[task.status] ?? ""} mr-1`}
                          >
                            {task.status}
                          </span>
                          <span className={TASK_PRIORITY_COLORS[task.priority] ?? ""}>
                            {task.priority}
                          </span>
                          {task.due_date && ` · Due ${task.due_date}`}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {selectedTaskIds.size > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedTaskIds.size} task{selectedTaskIds.size !== 1 ? "s" : ""} selected
                </p>
              )}
            </div>
          )}

          {mode === "custom" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Title *</Label>
                <Input
                  autoFocus
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Risk review, Training status update…"
                />
              </div>
              <div className="space-y-1">
                <Label>Description</Label>
                <Textarea
                  rows={2}
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="Optional context…"
                  className="resize-none text-sm"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSubmit || addAgenda.isPending}>
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add{selectedTaskIds.size > 1 ? ` ${selectedTaskIds.size} Items` : ""}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MeetingWorkspacePage({
  params,
}: {
  params: Promise<{ id: string; mid: string }>;
}) {
  const { id, mid } = use(params);
  const projectId = Number(id);
  const meetingId = Number(mid);

  const { data: meeting, isLoading } = useMeeting(meetingId);
  const { data: attendees = [] } = useAttendees(meetingId);
  const { data: projectMeetings = [] } = useMeetings({ project_id: projectId });
  const { data: tasks = [] } = useTasks(projectId);
  const updateMeeting = useUpdateMeeting();
  const rollover = useRolloverActions();
  const sendInvitations = useSendInvitations();
  const sendMinutes = useSendMinutes();

  const [addAgendaOpen, setAddAgendaOpen] = useState(false);
  const [addAttendeeOpen, setAddAttendeeOpen] = useState(false);
  const [rolloverOpen, setRolloverOpen] = useState(false);
  const [rolloverSourceId, setRolloverSourceId] = useState<number | null>(null);

  const taskMap = useMemo(() => {
    const m = new Map<number, ConsultancyTaskRead>();
    tasks.forEach((t) => m.set(t.id, t));
    return m;
  }, [tasks]);

  const actionRefs = useMemo(() => {
    const refs = new Map<number, string>();
    if (!meeting) return refs;
    let i = 1;
    meeting.agendas.forEach((a) => a.actions.forEach((ac) => {
      refs.set(ac.id, `M${meeting.sequence_number}-A${i++}`);
    }));
    return refs;
  }, [meeting]);

  const decisionRefs = useMemo(() => {
    const refs = new Map<number, string>();
    if (!meeting) return refs;
    let i = 1;
    meeting.agendas.forEach((a) => a.decisions.forEach((d) => {
      refs.set(d.id, `M${meeting.sequence_number}-D${i++}`);
    }));
    return refs;
  }, [meeting]);

  const alreadyLinkedTaskIds = useMemo(() => {
    const s = new Set<number>();
    meeting?.agendas.forEach((a) => {
      if (a.linked_entity_type === "TASK" && a.linked_entity_id) {
        s.add(a.linked_entity_id);
      }
    });
    return s;
  }, [meeting?.agendas]);

  if (isLoading) return <p className="text-sm text-muted-foreground animate-pulse p-4">Loading…</p>;
  if (!meeting) return <p className="text-sm text-red-500 p-4">Meeting not found.</p>;

  const totalActions = meeting.agendas.flatMap((a) => a.actions).length;
  const openActions = meeting.agendas.flatMap((a) => a.actions).filter((a) => a.status !== "DONE").length;

  const handleComplete = () => {
    updateMeeting.mutate({ id: meetingId, data: { status: "COMPLETED" } });
  };

  const handleRollover = async () => {
    if (!rolloverSourceId) return;
    await rollover.mutateAsync({ meetingId, fromMeetingId: rolloverSourceId });
    setRolloverOpen(false);
  };

  const handleSendInvitations = async () => {
    const result = await sendInvitations.mutateAsync(meetingId);
    alert(`Invitations sent to ${result.sent} attendee(s).`);
  };

  const handleSendMinutes = async () => {
    const result = await sendMinutes.mutateAsync(meetingId);
    alert(`Minutes sent to ${result.sent} attendee(s).`);
  };

  const previousMeetings = projectMeetings.filter(
    (m) => m.id !== meetingId && m.status === "COMPLETED"
  );

  const minutesSentAt = meeting.minutes_sent_at
    ? new Date(meeting.minutes_sent_at).toLocaleString()
    : null;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          href={`/consultant/projects/${projectId}/meetings`}
          className="text-muted-foreground hover:text-foreground transition-colors mt-1"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-mono text-muted-foreground">M{meeting.sequence_number}</span>
            <h1 className="text-xl font-semibold">{meeting.title}</h1>
            <span
              className={`text-xs px-2 py-0.5 rounded font-medium ${
                meeting.status === "COMPLETED"
                  ? "bg-green-100 text-green-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {meeting.status}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {meeting.type} · {new Date(meeting.scheduled_at).toLocaleString()}
            {meeting.location ? ` · ${meeting.location}` : ""}
          </p>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap justify-end">
          {previousMeetings.length > 0 && (
            <Button size="sm" variant="outline" onClick={() => setRolloverOpen(true)}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" />Roll Over
            </Button>
          )}
          {meeting.status === "PLANNED" && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSendInvitations}
                disabled={sendInvitations.isPending || attendees.length === 0}
                title={attendees.length === 0 ? "Add attendees first" : undefined}
              >
                <Mail className="h-3.5 w-3.5 mr-1" />
                {sendInvitations.isPending ? "Sending…" : "Send Invitations"}
              </Button>
              <Button size="sm" onClick={handleComplete} disabled={updateMeeting.isPending}>
                <Check className="h-3.5 w-3.5 mr-1" />Complete
              </Button>
            </>
          )}
          {meeting.status === "COMPLETED" && (
            <>
              <Link href={`/consultant/projects/${projectId}/meetings/${meetingId}/minutes`}>
                <Button size="sm" variant="outline">
                  <FileText className="h-3.5 w-3.5 mr-1" />View Minutes
                </Button>
              </Link>
              <div className="flex flex-col items-end gap-0.5">
                <Button
                  size="sm"
                  onClick={handleSendMinutes}
                  disabled={sendMinutes.isPending || attendees.length === 0}
                >
                  <Send className="h-3.5 w-3.5 mr-1" />
                  {sendMinutes.isPending
                    ? "Sending…"
                    : minutesSentAt
                    ? "Resend Minutes"
                    : "Send Minutes"}
                </Button>
                {minutesSentAt && (
                  <span className="text-xs text-muted-foreground">
                    Last sent: {minutesSentAt}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="border rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Agenda Items</p>
          <p className="text-2xl font-bold mt-0.5">{meeting.agendas.length}</p>
        </div>
        <div className="border rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Open Actions</p>
          <p className={`text-2xl font-bold mt-0.5 ${openActions > 0 ? "text-amber-600" : "text-green-600"}`}>
            {openActions}
          </p>
        </div>
        <div className="border rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Total Actions</p>
          <p className="text-2xl font-bold mt-0.5">{totalActions}</p>
        </div>
        <div className="border rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Attendees</p>
          <p className="text-2xl font-bold mt-0.5">{attendees.length}</p>
        </div>
      </div>

      {/* Notes */}
      {meeting.notes && (
        <div className="border rounded-lg p-4 bg-muted/30">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Notes
          </p>
          <p className="text-sm">{meeting.notes}</p>
        </div>
      )}

      {/* Attendees */}
      <div className="border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b">
          <h2 className="text-sm font-semibold">
            Attendees
            {attendees.length > 0 && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                {attendees.filter((a) => a.attendance === "PRESENT").length}/{attendees.length} present
              </span>
            )}
          </h2>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs"
            onClick={() => setAddAttendeeOpen(true)}
          >
            <UserPlus className="h-3.5 w-3.5 mr-1" />Add
          </Button>
        </div>
        {attendees.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6 px-4">
            No attendees yet. Add internal users or external participants.
          </p>
        ) : (
          <div className="px-4 divide-y">
            {attendees.map((att) => (
              <AttendeeRow key={att.id} attendee={att} meetingId={meetingId} />
            ))}
          </div>
        )}
      </div>

      {/* Agenda */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Agenda</h2>
          <Button size="sm" variant="outline" onClick={() => setAddAgendaOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />Add Item
          </Button>
        </div>

        {meeting.agendas.length === 0 && (
          <p className="text-sm text-muted-foreground border rounded-lg p-6 text-center">
            No agenda items yet. Add tasks or custom items using the button above.
          </p>
        )}

        {meeting.agendas.map((item) => (
          <AgendaItem
            key={item.id}
            item={item}
            meetingId={meetingId}
            linkedTask={
              item.linked_entity_type === "TASK" && item.linked_entity_id
                ? taskMap.get(item.linked_entity_id)
                : undefined
            }
            actionRefs={actionRefs}
            decisionRefs={decisionRefs}
          />
        ))}
      </div>

      {/* Dialogs */}
      <AddAgendaDialog
        open={addAgendaOpen}
        onClose={() => setAddAgendaOpen(false)}
        meetingId={meetingId}
        projectId={projectId}
        alreadyLinkedTaskIds={alreadyLinkedTaskIds}
      />

      <AddAttendeeDialog
        open={addAttendeeOpen}
        onClose={() => setAddAttendeeOpen(false)}
        meetingId={meetingId}
      />

      <Dialog open={rolloverOpen} onOpenChange={setRolloverOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Roll Over Open Actions</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Select a previous meeting to copy all open actions into this one.
            </p>
            <Select
              value={rolloverSourceId?.toString() ?? ""}
              onValueChange={(v) => setRolloverSourceId(Number(v))}
            >
              <SelectTrigger><SelectValue placeholder="Select a meeting…" /></SelectTrigger>
              <SelectContent>
                {previousMeetings.map((m) => (
                  <SelectItem key={m.id} value={m.id.toString()}>
                    M{m.sequence_number} {m.title} — {new Date(m.scheduled_at).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRolloverOpen(false)}>Cancel</Button>
            <Button
              disabled={!rolloverSourceId || rollover.isPending}
              onClick={handleRollover}
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />Roll Over
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
