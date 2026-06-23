"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Check, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useCompleteTask,
} from "@/features/lims/consultancy/consultancy.queries";
import { useUsers } from "@/features/lims/users/users.queries";
import type {
  ConsultancyTaskCreate,
  ConsultancyTaskRead,
  ConsultancyTaskUpdate,
  TaskPriority,
} from "@/features/lims/consultancy/consultancy.api";

// ── Constants ─────────────────────────────────────────────────────────────────

const MUTABLE_STATUSES = ["OPEN", "IN_PROGRESS", "BLOCKED", "CANCELLED"] as const;
type MutableStatus = (typeof MUTABLE_STATUSES)[number];

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  BLOCKED: "Blocked",
};

const STATUS_STYLES: Record<string, string> = {
  OPEN: "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 border-amber-200",
  COMPLETED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-gray-100 text-gray-400 border-gray-200",
  BLOCKED: "bg-red-50 text-red-600 border-red-200",
};

const PRIORITY_BORDER: Record<string, string> = {
  LOW: "border-l-gray-300",
  MEDIUM: "border-l-blue-400",
  HIGH: "border-l-orange-400",
  CRITICAL: "border-l-red-500",
};

const PRIORITY_LABEL: Record<string, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

const TASK_TYPE_LABELS: Record<string, string> = {
  SOP_CREATION: "SOP Creation",
  METHOD_VALIDATION: "Method Validation",
  EQUIPMENT_CALIBRATION: "Calibration",
  TRAINING: "Training",
  COMPETENCY_SIGN_OFF: "Competency Sign-off",
  CUSTOM: "Custom",
};

const TASK_TYPES = Object.keys(TASK_TYPE_LABELS);
const STATUS_FILTERS = ["", ...MUTABLE_STATUSES, "COMPLETED"];

function isOverdue(dueDate: string | null, status: string) {
  if (!dueDate || status === "COMPLETED" || status === "CANCELLED") return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

// ── Status select ─────────────────────────────────────────────────────────────
// Renders as a badge; completed tasks show a static chip.

function StatusBadge({
  task,
  onUpdate,
  disabled,
}: {
  task: ConsultancyTaskRead;
  onUpdate: (status: string) => void;
  disabled: boolean;
}) {
  if (task.status === "COMPLETED") {
    return (
      <span className={`text-xs px-2 py-0.5 rounded border ${STATUS_STYLES.COMPLETED}`}>
        Completed
      </span>
    );
  }
  return (
    <select
      value={task.status}
      disabled={disabled}
      onChange={(e) => {
        if (e.target.value !== task.status) onUpdate(e.target.value);
      }}
      className={`text-xs px-2 py-0.5 rounded border cursor-pointer font-medium appearance-none focus:outline-none focus:ring-1 focus:ring-ring pr-5 ${STATUS_STYLES[task.status]}`}
      style={{ backgroundImage: "none" }}
      title="Change status"
    >
      {MUTABLE_STATUSES.map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}

// ── Task card ─────────────────────────────────────────────────────────────────

function TaskCard({
  task,
  onStatusChange,
  onComplete,
  onEdit,
  isPending,
}: {
  task: ConsultancyTaskRead;
  onStatusChange: (status: string) => void;
  onComplete: () => void;
  onEdit: () => void;
  isPending: boolean;
}) {
  const overdue = isOverdue(task.due_date, task.status);
  const done = task.status === "COMPLETED";
  const inactive = task.status === "CANCELLED";

  return (
    <div
      className={`border border-l-4 rounded-lg px-4 py-3 flex gap-3 transition-opacity ${
        PRIORITY_BORDER[task.priority] ?? "border-l-gray-300"
      } ${inactive ? "opacity-50" : ""}`}
    >
      {/* Body */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium leading-snug ${
            done ? "line-through text-muted-foreground" : ""
          }`}
        >
          {task.title}
        </p>

        {task.description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <StatusBadge task={task} onUpdate={onStatusChange} disabled={isPending} />

          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            {TASK_TYPE_LABELS[task.task_type] ?? task.task_type.replace(/_/g, " ")}
          </span>

          <span className="text-xs text-muted-foreground">
            {PRIORITY_LABEL[task.priority] ?? task.priority} priority
          </span>

          {task.due_date && (
            <span
              className={`text-xs font-medium ${
                overdue ? "text-red-600" : "text-muted-foreground"
              }`}
            >
              {overdue ? "⚠ Overdue · " : "Due "}
              {new Date(task.due_date + "T00:00:00").toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}

          {done && task.completed_at && (
            <span className="text-xs text-muted-foreground">
              Completed{" "}
              {new Date(task.completed_at).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
          )}
        </div>
      </div>

      {/* Action buttons — hidden for done/cancelled tasks */}
      {!done && !inactive && (
        <div className="flex items-start gap-0.5 shrink-0 pt-0.5">
          <button
            onClick={onEdit}
            className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="Edit task"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onComplete}
            disabled={isPending}
            className="p-1.5 rounded hover:bg-green-50 text-muted-foreground hover:text-green-600 transition-colors"
            title="Mark as completed"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const EMPTY_FORM: ConsultancyTaskCreate = {
  title: "",
  description: null,
  task_type: "CUSTOM",
  priority: "MEDIUM",
  due_date: null,
  assigned_to_id: null,
};

export default function TasksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const projectId = Number(id);

  const [statusFilter, setStatusFilter] = useState("");
  const { data: tasks = [], isLoading } = useTasks(projectId, statusFilter || undefined);
  const { data: users = [] } = useUsers();
  const createTask = useCreateTask(projectId);
  const updateTask = useUpdateTask(projectId);
  const completeTask = useCompleteTask(projectId);

  // Create dialog
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<ConsultancyTaskCreate>(EMPTY_FORM);

  // Edit dialog
  const [editTarget, setEditTarget] = useState<ConsultancyTaskRead | null>(null);
  const [editForm, setEditForm] = useState<ConsultancyTaskUpdate>({});

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTask.mutateAsync(createForm);
    setShowCreate(false);
    setCreateForm(EMPTY_FORM);
  };

  const openEdit = (task: ConsultancyTaskRead) => {
    setEditTarget(task);
    setEditForm({
      title: task.title,
      description: task.description,
      priority: task.priority as TaskPriority,
      due_date: task.due_date,
      assigned_to_id: task.assigned_to_id,
    });
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    await updateTask.mutateAsync({ id: editTarget.id, data: editForm });
    setEditTarget(null);
  };

  const counts: Record<string, number> = {};
  tasks.forEach((t) => {
    counts[t.status] = (counts[t.status] ?? 0) + 1;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/consultant/projects/${projectId}`}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-lg font-semibold">Tasks</h1>
        <div className="flex-1" />
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" />
          New Task
        </Button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-2.5 py-1 rounded text-xs border transition-colors ${
              statusFilter === s
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {s ? STATUS_LABELS[s] : "All"}
          </button>
        ))}
      </div>

      {/* Legend */}
      <p className="text-xs text-muted-foreground">
        Click the status badge on a task to change its status. Click{" "}
        <Check className="h-3 w-3 inline" /> to mark a task as completed.
      </p>

      {isLoading && (
        <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>
      )}

      {!isLoading && !tasks.length && (
        <div className="border rounded-lg p-10 text-center text-sm text-muted-foreground">
          No tasks found. Create tasks manually or run the provisioning engine from the project page.
        </div>
      )}

      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onStatusChange={(status) =>
              updateTask.mutate({ id: task.id, data: { status: status as MutableStatus } })
            }
            onComplete={() => completeTask.mutate(task.id)}
            onEdit={() => openEdit(task)}
            isPending={updateTask.isPending || completeTask.isPending}
          />
        ))}
      </div>

      {/* ── Create dialog ────────────────────────────────────────────────────── */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3 mt-1">
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input
                required
                autoFocus
                value={createForm.title}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                rows={2}
                value={createForm.description ?? ""}
                onChange={(e) =>
                  setCreateForm((f) => ({
                    ...f,
                    description: e.target.value || null,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Type</Label>
                <select
                  className="w-full border rounded px-2 py-1.5 text-sm bg-background"
                  value={createForm.task_type}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, task_type: e.target.value }))
                  }
                >
                  {TASK_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {TASK_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label>Priority</Label>
                <select
                  className="w-full border rounded px-2 py-1.5 text-sm bg-background"
                  value={createForm.priority ?? "MEDIUM"}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      priority: e.target.value as TaskPriority,
                    }))
                  }
                >
                  {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as TaskPriority[]).map(
                    (p) => (
                      <option key={p} value={p}>
                        {PRIORITY_LABEL[p]}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={createForm.due_date ?? ""}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      due_date: e.target.value || null,
                    }))
                  }
                />
              </div>

              <div className="space-y-1">
                <Label>Assign To</Label>
                <select
                  className="w-full border rounded px-2 py-1.5 text-sm bg-background"
                  value={createForm.assigned_to_id ?? ""}
                  onChange={(e) =>
                    setCreateForm((f) => ({
                      ...f,
                      assigned_to_id: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.email}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreate(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createTask.isPending}>
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit dialog ──────────────────────────────────────────────────────── */}
      <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-3 mt-1">
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input
                required
                autoFocus
                value={editForm.title ?? ""}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, title: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                rows={2}
                value={editForm.description ?? ""}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    description: e.target.value || null,
                  }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Priority</Label>
                <select
                  className="w-full border rounded px-2 py-1.5 text-sm bg-background"
                  value={editForm.priority ?? "MEDIUM"}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      priority: e.target.value as TaskPriority,
                    }))
                  }
                >
                  {(["LOW", "MEDIUM", "HIGH", "CRITICAL"] as TaskPriority[]).map(
                    (p) => (
                      <option key={p} value={p}>
                        {PRIORITY_LABEL[p]}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <Label>Due Date</Label>
                <Input
                  type="date"
                  value={editForm.due_date ?? ""}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      due_date: e.target.value || null,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Assign To</Label>
              <select
                className="w-full border rounded px-2 py-1.5 text-sm bg-background"
                value={editForm.assigned_to_id ?? ""}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    assigned_to_id: e.target.value ? Number(e.target.value) : null,
                  }))
                }
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.email}
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditTarget(null)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateTask.isPending}>
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
