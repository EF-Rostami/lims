"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Folder, Calendar, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useProjects, useCreateProject, useFrameworks } from "@/features/lims/consultancy/consultancy.queries";
import type { ConsultancyProjectCreate } from "@/features/lims/consultancy/consultancy.api";

const STATUS_COLORS: Record<string, string> = {
  SCOPING: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  ON_HOLD: "bg-gray-100 text-gray-500",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
};

export default function ProjectsPage() {
  const { data: projects = [], isLoading } = useProjects();
  const { data: frameworks = [] } = useFrameworks();
  const createProject = useCreateProject();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<ConsultancyProjectCreate>({
    name: "",
    framework_id: 0,
    start_date: null,
    target_go_live: null,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createProject.mutateAsync(form);
    setOpen(false);
    setForm({ name: "", framework_id: 0, start_date: null, target_go_live: null });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Consultancy Projects</h1>
          <p className="text-sm text-muted-foreground">Manage laboratory accreditation and compliance projects</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />New Project
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground animate-pulse">Loading projects…</p>}

      {!isLoading && !projects.length && (
        <div className="border rounded-lg p-12 text-center text-muted-foreground">
          <Folder className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No projects yet. Create your first consultancy project.</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map((p) => (
          <Link
            key={p.id}
            href={`/consultant/projects/${p.id}`}
            className="border rounded-lg p-4 hover:bg-muted transition-colors group block"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">{p.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {frameworks.find((f) => f.id === p.framework_id)?.code ?? `Framework #${p.framework_id}`}
                </p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded font-medium flex-shrink-0 ${STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-600"}`}>
                {p.status.replace(/_/g, " ")}
              </span>
            </div>
            {(p.target_go_live || p.actual_go_live) && (
              <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {p.actual_go_live
                  ? `Went live: ${p.actual_go_live}`
                  : `Target: ${p.target_go_live}`}
              </div>
            )}
            <div className="flex items-center justify-end mt-2">
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Consultancy Project</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3 mt-2">
            <div className="space-y-1">
              <Label>Project Name *</Label>
              <Input
                required
                placeholder="e.g. ISO 17025 Accreditation 2026"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Framework *</Label>
              <select
                required
                className="w-full border rounded px-2 py-1.5 text-sm bg-background"
                value={form.framework_id || ""}
                onChange={(e) => setForm((f) => ({ ...f, framework_id: Number(e.target.value) }))}
              >
                <option value="">Select framework…</option>
                {frameworks.map((fw) => (
                  <option key={fw.id} value={fw.id}>{fw.code} — {fw.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={form.start_date ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value || null }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Target Go-Live</Label>
                <Input
                  type="date"
                  value={form.target_go_live ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, target_go_live: e.target.value || null }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createProject.isPending || !form.framework_id}>
                {createProject.isPending ? "Creating…" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
