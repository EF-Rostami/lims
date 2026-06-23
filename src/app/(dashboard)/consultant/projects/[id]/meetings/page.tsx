"use client";

import { useState, use } from "react";
import Link from "next/link";
import { Plus, ArrowLeft, CalendarDays, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useMeetings, useCreateMeeting } from "@/features/lims/consultancy/meetings.queries";
import type { MeetingCreate, MeetingType } from "@/features/lims/consultancy/meetings.api";

const MEETING_TYPES: { value: MeetingType; label: string }[] = [
  { value: "KICKOFF", label: "Kickoff" },
  { value: "WEEKLY", label: "Weekly" },
  { value: "REVIEW", label: "Review" },
  { value: "PRE_AUDIT", label: "Pre-Audit" },
];

const STATUS_COLORS: Record<string, string> = {
  PLANNED: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
};

const emptyForm = (projectId: number): MeetingCreate => ({
  project_id: projectId,
  title: "",
  type: "WEEKLY",
  scheduled_at: "",
  location: null,
  notes: null,
});

export default function ProjectMeetingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const projectId = Number(id);

  const { data: meetings = [], isLoading } = useMeetings({ project_id: projectId });
  const createMeeting = useCreateMeeting();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<MeetingCreate>(emptyForm(projectId));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMeeting.mutateAsync(form);
    setOpen(false);
    setForm(emptyForm(projectId));
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link
          href={`/consultant/projects/${projectId}`}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Meetings</h1>
          <p className="text-sm text-muted-foreground">Project #{projectId}</p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />New Meeting
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground animate-pulse">Loading meetings…</p>}

      {!isLoading && meetings.length === 0 && (
        <div className="border rounded-lg p-8 text-center text-sm text-muted-foreground">
          No meetings scheduled. Create the first one.
        </div>
      )}

      <div className="space-y-2">
        {meetings.map((m) => (
          <Link
            key={m.id}
            href={`/consultant/projects/${projectId}/meetings/${m.id}`}
            className="flex items-center gap-4 border rounded-lg p-4 hover:bg-muted transition-colors group"
          >
            <CalendarDays className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                <span className="text-muted-foreground font-mono mr-1.5">M{m.sequence_number}</span>
                {m.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {m.type} · {new Date(m.scheduled_at).toLocaleString()}
                {m.location ? ` · ${m.location}` : ""}
              </p>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded font-medium shrink-0 ${STATUS_COLORS[m.status] ?? ""}`}
            >
              {m.status}
            </span>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>New Meeting</DialogTitle></DialogHeader>
          <form onSubmit={handleCreate} className="space-y-3 mt-2">
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input
                required
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Weekly check-in"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Type *</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm((f) => ({ ...f, type: v as MeetingType }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MEETING_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Date & Time *</Label>
                <Input
                  required
                  type="datetime-local"
                  value={form.scheduled_at}
                  onChange={(e) => setForm((f) => ({ ...f, scheduled_at: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Location</Label>
              <Input
                value={form.location ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value || null }))}
                placeholder="Room, video link, etc."
              />
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Input
                value={form.notes ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value || null }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Next Meeting Date</Label>
              <Input
                type="date"
                value={form.next_meeting_date ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, next_meeting_date: e.target.value || null }))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMeeting.isPending}>
                <Plus className="h-3.5 w-3.5 mr-1" />Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
