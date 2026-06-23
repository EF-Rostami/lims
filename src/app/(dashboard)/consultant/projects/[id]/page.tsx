"use client";

import Link from "next/link";
import { use } from "react";
import { ClipboardList, BarChart2, CheckCircle, Rocket, ArrowLeft, CalendarDays } from "lucide-react";
import { useProject, useAssessments, useTasks } from "@/features/lims/consultancy/consultancy.queries";

const STATUS_COLORS: Record<string, string> = {
  SCOPING: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  ON_HOLD: "bg-gray-100 text-gray-500",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
};

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const projectId = Number(id);

  const { data: project, isLoading } = useProject(projectId);
  const { data: assessments = [] } = useAssessments(projectId);
  const { data: tasks = [] } = useTasks(projectId);

  if (isLoading) return <p className="text-sm text-muted-foreground animate-pulse p-4">Loading project…</p>;
  if (!project) return <p className="text-sm text-red-500 p-4">Project not found.</p>;

  const openTasks = tasks.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link href="/consultant/projects" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold truncate">{project.name}</h1>
          <p className="text-sm text-muted-foreground">Framework #{project.framework_id}</p>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded font-medium ${STATUS_COLORS[project.status] ?? "bg-gray-100 text-gray-600"}`}>
          {project.status.replace(/_/g, " ")}
        </span>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Start Date", value: project.start_date ?? "—" },
          { label: "Target Go-Live", value: project.target_go_live ?? "—" },
          { label: "Actual Go-Live", value: project.actual_go_live ?? "—" },
          { label: "Mode", value: project.mode },
        ].map(({ label, value }) => (
          <div key={label} className="border rounded-lg p-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-medium mt-0.5">{value}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="border rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Assessments</p>
          <p className="text-2xl font-bold mt-0.5">{assessments.length}</p>
        </div>
        <div className="border rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Open Tasks</p>
          <p className="text-2xl font-bold mt-0.5 text-amber-600">{openTasks}</p>
        </div>
        <div className="border rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Completed Tasks</p>
          <p className="text-2xl font-bold mt-0.5 text-green-600">{completedTasks}</p>
        </div>
        <div className="border rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Total Tasks</p>
          <p className="text-2xl font-bold mt-0.5">{tasks.length}</p>
        </div>
      </div>

      {/* Navigation links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {[
          {
            href: `/consultant/projects/${projectId}/assessment`,
            icon: BarChart2,
            label: "Gap Assessments",
            description: `${assessments.length} assessment(s)`,
            color: "text-violet-600",
          },
          {
            href: `/consultant/projects/${projectId}/tasks`,
            icon: ClipboardList,
            label: "Tasks",
            description: `${openTasks} open / ${completedTasks} completed`,
            color: "text-amber-600",
          },
          {
            href: `/consultant/projects/${projectId}/meetings`,
            icon: CalendarDays,
            label: "Meetings",
            description: "Schedule and manage project meetings",
            color: "text-blue-600",
          },
          {
            href: `/consultant/projects/${projectId}/go-live`,
            icon: Rocket,
            label: "Go-Live Readiness",
            description: "Check all readiness criteria",
            color: "text-green-600",
          },
        ].map(({ href, icon: Icon, label, description, color }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-4 border rounded-lg p-4 hover:bg-muted transition-colors group"
          >
            <div className={`flex-shrink-0 ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm group-hover:text-primary transition-colors">{label}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
