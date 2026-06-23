"use client";

import Link from "next/link";
import { CalendarDays, ArrowRight } from "lucide-react";
import { useMeetings } from "@/features/lims/consultancy/meetings.queries";

const TYPE_LABELS: Record<string, string> = {
  KICKOFF: "Kickoff",
  WEEKLY: "Weekly",
  REVIEW: "Review",
  PRE_AUDIT: "Pre-Audit",
};

const STATUS_COLORS: Record<string, string> = {
  PLANNED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
};

export default function AllMeetingsPage() {
  const { data: meetings = [], isLoading } = useMeetings();

  const upcoming = meetings.filter((m) => m.status === "PLANNED");
  const completed = meetings.filter((m) => m.status === "COMPLETED");

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold">Meetings</h1>
        <p className="text-sm text-muted-foreground">All upcoming and completed meetings across projects</p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground animate-pulse">Loading meetings…</p>}

      {[
        { label: "Upcoming", items: upcoming },
        { label: "Completed", items: completed },
      ].map(({ label, items }) => (
        <section key={label}>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">{label}</h2>
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground border rounded-lg p-4">No {label.toLowerCase()} meetings.</p>
          ) : (
            <div className="space-y-2">
              {items.map((m) => (
                <Link
                  key={m.id}
                  href={`/consultant/projects/${m.project_id}/meetings/${m.id}`}
                  className="flex items-center gap-4 border rounded-lg p-4 hover:bg-muted transition-colors group"
                >
                  <CalendarDays className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      <span className="text-muted-foreground font-mono mr-1.5">M{m.sequence_number}</span>
                      {m.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {TYPE_LABELS[m.type] ?? m.type} · {new Date(m.scheduled_at).toLocaleDateString()}
                      {m.location ? ` · ${m.location}` : ""}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium shrink-0 ${STATUS_COLORS[m.status] ?? ""}`}>
                    {m.status}
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
