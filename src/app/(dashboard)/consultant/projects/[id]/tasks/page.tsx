"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, CheckCircle, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useCompleteTask,
} from "@/features/lims/consultancy/consultancy.queries";
import type { ConsultancyTaskCreate, TaskPriority } from "@/features/lims/consultancy/consultancy.api";

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-500",
  BLOCKED: "bg-red-100 text-red-600",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "text-gray-400",
  MEDIUM: "text-blue-500",
  HIGH: "text-orange-500",
  CRITICAL: "text-red-600",
};

const TASK_TYPES = [
  "SOP_CREATION", "METHOD_VALIDATION", "EQUIPMENT_CALIBRATION",
  "TRAINING", "COMPETENCY_SIGN_OFF", "CUSTOM",
];

const STATUS_FILTERS = ["", "OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED", "BLOCKED"];

export default function TasksPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const projectId = Number(id);

  const [statusFilter, setStatusFilter] = useState("");
  const { data: tasks = [], isLoading } = useTasks(projectId, statusFilter || undefined);
  const createTask = useCreateTask(projectId);
  const updateTask = useUpdateTask(projectId);
  const completeTask = useCompleteTask(projectId);

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<ConsultancyTaskCreate>({
    title: "",
    description: null,
    task_type: "CUSTOM",
    priority: "MEDIUM",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createTask.mutateAsync(form);
    setShowCreate(false);
    setForm({ title: "", description: null, task_type: "CUSTOM", priority: "MEDIUM" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href={`/consultant/projects/${projectId}`} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-lg font-semibold">Tasks</h1>
        <div className="flex-1" />
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" />New Task
        </Button>
      </div>

      {/* Status filter */}
      <div className="flex gap-1.5 flex-wrap">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-2.5 py-1 rounded text-xs border transition-colors ${
              statusFilter === s
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:bg-muted"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-muted-foreground animate-pulse">Loading tasks…</p>}

      {!isLoading && !tasks.length && (
        <div className="border rounded-lg p-10 text-center text-sm text-muted-foreground">
          No tasks found. Create tasks manually or use the provisioning engine.
        </div>
      )}

      <div className="space-y-2">
        {tasks.map((task) => (
          <div key={task.id} className="border rounded-lg px-4 py-3 flex items-start gap-3">
            <button
              onClick={() => {
                if (task.status !== "COMPLETED") {
                  completeTask.mutate(task.id);
                }
              }}
              className="flex-shrink-0 mt-0.5"
              disabled={task.status === "COMPLETED"}
            >
              {task.status === "COMPLETED" ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${task.status === "COMPLETED" ? "line-through text-muted-foreground" : ""}`}>
                {task.title}
              </p>
              {task.description && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{task.description}</p>
              )}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`text-xs px-1.5 py-0.5 rounded ${STATUS_COLORS[task.status]}`}>
                  {task.status.replace(/_/g, " ")}
                </span>
                <span className={`text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
                  {task.priority}
                </span>
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {task.task_type.replace(/_/g, " ")}
                </span>
                {task.due_date && (
                  <span className="text-xs text-muted-foreground">Due: {task.due_date}</span>
                )}
              </div>
            </div>
            {task.status !== "COMPLETED" && task.status !== "CANCELLED" && (
              <button
                onClick={() => updateTask.mutate({ id: task.id, data: { status: "IN_PROGRESS" } })}
                disabled={task.status === "IN_PROGRESS" || updateTask.isPending}
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
              >
                {task.status === "IN_PROGRESS" ? "In progress" : "Start"}
              </button>
            )}
          </div>
        ))}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Task</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3 mt-2">
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea
                rows={2}
                value={form.description ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value || null }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Type</Label>
                <select
                  className="w-full border rounded px-2 py-1.5 text-sm bg-background"
                  value={form.task_type}
                  onChange={(e) => setForm((f) => ({ ...f, task_type: e.target.value }))}
                >
                  {TASK_TYPES.map((t) => (
                    <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <Label>Priority</Label>
                <select
                  className="w-full border rounded px-2 py-1.5 text-sm bg-background"
                  value={form.priority}
                  onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as TaskPriority }))}
                >
                  {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={form.due_date ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value || null }))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button type="submit" disabled={createTask.isPending}>Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
