"use client";

import Link from "next/link";
import { Target, CalendarDays, ArrowRight, Folder, ClipboardList } from "lucide-react";
import { useProjects } from "@/features/lims/consultancy/consultancy.queries";
import { useMeetings } from "@/features/lims/consultancy/meetings.queries";
import { useBranding } from "@/features/lims/branding/BrandingProvider";

function toLabel(str: string): string {
  return str.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

const STATUS_COLORS: Record<string, string> = {
  SCOPING: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  ON_HOLD: "bg-gray-100 text-gray-500",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
};

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border rounded-lg p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}

export default function ConsultantHomePage() {
  const { companyName } = useBranding();
  const { data: projects = [], isLoading: loadingProjects } = useProjects();
  const { data: meetings = [], isLoading: loadingMeetings } = useMeetings({ status: "PLANNED" });

  const activeProjects = projects.filter(
    (p) => !["COMPLETED", "CANCELLED"].includes(p.status),
  );

  const now = new Date();
  const cutoff = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const upcoming = meetings
    .filter((m) => {
      const d = new Date(m.scheduled_at);
      return d >= now && d <= cutoff;
    })
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p.name]));

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold">Consultant Workspace</h1>
        <p className="text-sm text-muted-foreground">
          Currently working in{" "}
          <span className="font-medium text-foreground">{companyName}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Active Projects" value={activeProjects.length} />
        <StatCard label="Upcoming Meetings" value={upcoming.length} />
        <StatCard label="All Planned Meetings" value={meetings.length} />
      </div>

      {/* Active projects */}
      <section>
        <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          Active Projects
        </h2>

        {loadingProjects && (
          <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>
        )}

        {!loadingProjects && activeProjects.length === 0 && (
          <div className="border rounded-lg p-6 text-center">
            <Folder className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm text-muted-foreground">No active projects in this lab.</p>
          </div>
        )}

        <div className="space-y-2">
          {activeProjects.map((p) => (
            <Link
              key={p.id}
              href={`/consultant/projects/${p.id}`}
              className="flex items-center gap-3 border rounded-lg p-3 hover:bg-muted transition-colors group"
            >
              <ClipboardList className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="flex-1 text-sm font-medium group-hover:text-primary transition-colors truncate">
                {p.name}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded font-medium shrink-0 ${STATUS_COLORS[p.status] ?? "bg-gray-100 text-gray-600"}`}
              >
                {toLabel(p.status)}
              </span>
              {p.target_go_live && (
                <span className="text-xs text-muted-foreground hidden sm:block shrink-0">
                  {new Date(p.target_go_live).toLocaleDateString(undefined, {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </Link>
          ))}
        </div>
      </section>

      {/* Upcoming meetings */}
      <section>
        <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          Upcoming Meetings
          <span className="font-normal text-muted-foreground">(next 14 days)</span>
        </h2>

        {loadingMeetings && (
          <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>
        )}

        {!loadingMeetings && upcoming.length === 0 && (
          <p className="text-sm text-muted-foreground border rounded-lg p-4">
            No meetings scheduled in the next 14 days.
          </p>
        )}

        <div className="space-y-2">
          {upcoming.map((m) => (
            <Link
              key={m.id}
              href={`/consultant/projects/${m.project_id}/meetings/${m.id}`}
              className="flex items-center gap-3 border rounded-lg p-3 hover:bg-muted transition-colors group"
            >
              <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {m.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {projectMap[m.project_id] ?? `Project #${m.project_id}`} ·{" "}
                  {new Date(m.scheduled_at).toLocaleDateString(undefined, {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                  {m.location ? ` · ${m.location}` : ""}
                </p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
