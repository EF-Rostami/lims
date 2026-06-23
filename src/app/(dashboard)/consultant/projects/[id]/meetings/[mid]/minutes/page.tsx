"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMeeting, useAttendees } from "@/features/lims/consultancy/meetings.queries";
import type {
  MeetingAgendaRead,
  AttendeeRole,
  AttendanceStatus,
  ActionStatus,
  DecisionType,
} from "@/features/lims/consultancy/meetings.api";

const ROLE_LABELS: Record<AttendeeRole, string> = {
  CHAIR: "Chair",
  SECRETARY: "Secretary",
  ATTENDEE: "Attendee",
  OBSERVER: "Observer",
};

function actionRefs(agendas: MeetingAgendaRead[], seq: number): Map<number, string> {
  const refs = new Map<number, string>();
  let i = 1;
  agendas.forEach((a) => a.actions.forEach((ac) => {
    refs.set(ac.id, `M${seq}-A${i++}`);
  }));
  return refs;
}

function decisionRefs(agendas: MeetingAgendaRead[], seq: number): Map<number, string> {
  const refs = new Map<number, string>();
  let i = 1;
  agendas.forEach((a) => a.decisions.forEach((d) => {
    refs.set(d.id, `M${seq}-D${i++}`);
  }));
  return refs;
}

const ATTENDANCE_LABELS: Record<AttendanceStatus, string> = {
  PENDING: "Pending",
  PRESENT: "Present",
  ABSENT: "Absent",
  APOLOGY: "Apology",
};

const ACTION_STATUS_LABELS: Record<ActionStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

const DECISION_TYPE_LABELS: Record<DecisionType, string> = {
  APPROVAL: "Approval",
  CHANGE_REQUEST: "Change Request",
  REJECTION: "Rejection",
};

export default function MeetingMinutesPage({
  params,
}: {
  params: Promise<{ id: string; mid: string }>;
}) {
  const { id, mid } = use(params);
  const projectId = Number(id);
  const meetingId = Number(mid);

  const { data: meeting, isLoading } = useMeeting(meetingId);
  const { data: attendees = [] } = useAttendees(meetingId);

  if (isLoading) return <p className="text-sm text-muted-foreground animate-pulse p-8">Loading…</p>;
  if (!meeting) return <p className="text-sm text-red-500 p-8">Meeting not found.</p>;

  const aRefs = actionRefs(meeting.agendas, meeting.sequence_number);
  const dRefs = decisionRefs(meeting.agendas, meeting.sequence_number);

  const formattedDate = new Date(meeting.scheduled_at).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const formattedTime = new Date(meeting.scheduled_at).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const nextDateStr = meeting.next_meeting_date
    ? new Date(meeting.next_meeting_date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  const chair = attendees.find((a) => a.role === "CHAIR");
  const secretary = attendees.find((a) => a.role === "SECRETARY");

  return (
    <>
      {/* Print controls — hidden on print */}
      <div className="print:hidden flex items-center gap-3 mb-6">
        <Link
          href={`/consultant/projects/${projectId}/meetings/${meetingId}`}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-sm font-medium flex-1">Minutes of Meeting</span>
        <Button size="sm" onClick={() => window.print()}>
          <Printer className="h-3.5 w-3.5 mr-1" />Print PDF
        </Button>
      </div>

      {/* Minutes document */}
      <div
        id="minutes-document"
        className="
          max-w-3xl mx-auto bg-white p-8 text-sm
          print:max-w-none print:p-0 print:shadow-none
        "
        style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: "#1a1a1a" }}
      >
        {/* Document header */}
        <div className="text-center mb-8 pb-6 border-b-2 border-gray-800">
          <p className="text-xs tracking-widest uppercase text-gray-500 mb-1">
            Minutes of Meeting
          </p>
          <h1 className="text-2xl font-bold">{meeting.title}</h1>
          <p className="text-base font-mono mt-1 text-gray-600">M{meeting.sequence_number}</p>
        </div>

        {/* Meeting details table */}
        <table className="w-full text-sm mb-8 border-collapse">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="py-2 pr-4 font-semibold text-gray-600 w-36">Date</td>
              <td className="py-2">{formattedDate}</td>
              <td className="py-2 pr-4 font-semibold text-gray-600 w-36">Time</td>
              <td className="py-2">{formattedTime}</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="py-2 pr-4 font-semibold text-gray-600">Type</td>
              <td className="py-2">{meeting.type.replace(/_/g, " ")}</td>
              <td className="py-2 pr-4 font-semibold text-gray-600">Location</td>
              <td className="py-2">{meeting.location || "—"}</td>
            </tr>
            {chair && (
              <tr className="border-b border-gray-200">
                <td className="py-2 pr-4 font-semibold text-gray-600">Chair</td>
                <td className="py-2">{chair.name}</td>
                <td className="py-2 pr-4 font-semibold text-gray-600">Secretary</td>
                <td className="py-2">{secretary?.name ?? "—"}</td>
              </tr>
            )}
            {nextDateStr && (
              <tr className="border-b border-gray-200">
                <td className="py-2 pr-4 font-semibold text-gray-600">Next Meeting</td>
                <td className="py-2 col-span-3" colSpan={3}>{nextDateStr}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Notes */}
        {meeting.notes && (
          <div className="mb-8">
            <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-3">Notes</h2>
            <p className="leading-relaxed">{meeting.notes}</p>
          </div>
        )}

        {/* Attendance */}
        {attendees.length > 0 && (
          <div className="mb-8">
            <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-3">
              Attendance ({attendees.filter((a) => a.attendance === "PRESENT").length}/{attendees.length} present)
            </h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left py-2 px-3 font-semibold border border-gray-200">Name</th>
                  <th className="text-left py-2 px-3 font-semibold border border-gray-200">Role</th>
                  <th className="text-left py-2 px-3 font-semibold border border-gray-200">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((att) => (
                  <tr key={att.id} className="border-b border-gray-100">
                    <td className="py-2 px-3 border border-gray-200">{att.name}</td>
                    <td className="py-2 px-3 border border-gray-200">
                      {ROLE_LABELS[att.role as AttendeeRole] ?? att.role}
                    </td>
                    <td className="py-2 px-3 border border-gray-200">
                      {ATTENDANCE_LABELS[att.attendance as AttendanceStatus] ?? att.attendance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Agenda items */}
        {meeting.agendas.length > 0 && (
          <div className="mb-8">
            <h2 className="text-base font-bold border-b border-gray-300 pb-1 mb-4">Agenda</h2>
            <div className="space-y-6">
              {meeting.agendas.map((item, idx) => (
                <div key={item.id} className="break-inside-avoid">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    {idx + 1}. {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-gray-600 mb-3 ml-4 leading-relaxed">{item.description}</p>
                  )}

                  {/* Actions */}
                  {item.actions.length > 0 && (
                    <div className="ml-4 mb-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
                        Actions
                      </p>
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-left py-1.5 px-2 font-semibold border border-gray-200 w-20">Ref</th>
                            <th className="text-left py-1.5 px-2 font-semibold border border-gray-200">Action</th>
                            <th className="text-left py-1.5 px-2 font-semibold border border-gray-200 w-24">Status</th>
                            <th className="text-left py-1.5 px-2 font-semibold border border-gray-200 w-24">Due Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.actions.map((ac) => (
                            <tr key={ac.id}>
                              <td className="py-1.5 px-2 border border-gray-200 font-mono text-xs">
                                {aRefs.get(ac.id) ?? ""}
                              </td>
                              <td className="py-1.5 px-2 border border-gray-200">{ac.title}</td>
                              <td className="py-1.5 px-2 border border-gray-200">
                                {ACTION_STATUS_LABELS[ac.status as ActionStatus] ?? ac.status}
                              </td>
                              <td className="py-1.5 px-2 border border-gray-200">
                                {ac.due_date ?? "—"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Decisions */}
                  {item.decisions.length > 0 && (
                    <div className="ml-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">
                        Decisions
                      </p>
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="text-left py-1.5 px-2 font-semibold border border-gray-200 w-20">Ref</th>
                            <th className="text-left py-1.5 px-2 font-semibold border border-gray-200 w-32">Type</th>
                            <th className="text-left py-1.5 px-2 font-semibold border border-gray-200">Decision</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.decisions.map((d) => (
                            <tr key={d.id}>
                              <td className="py-1.5 px-2 border border-gray-200 font-mono text-xs">
                                {dRefs.get(d.id) ?? ""}
                              </td>
                              <td className="py-1.5 px-2 border border-gray-200">
                                {DECISION_TYPE_LABELS[d.type as DecisionType] ?? d.type}
                              </td>
                              <td className="py-1.5 px-2 border border-gray-200">{d.decision_text}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Signature block */}
        <div className="mt-12 pt-6 border-t border-gray-300 grid grid-cols-2 gap-12">
          <div>
            <p className="font-semibold mb-8">{chair?.name ?? "Chair"}</p>
            <div className="border-b border-gray-400 mb-1" />
            <p className="text-xs text-gray-500">Signature / Date</p>
          </div>
          <div>
            <p className="font-semibold mb-8">{secretary?.name ?? "Secretary"}</p>
            <div className="border-b border-gray-400 mb-1" />
            <p className="text-xs text-gray-500">Signature / Date</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
          <p>Generated by BLIMS · M{meeting.sequence_number} · {formattedDate}</p>
        </div>
      </div>

      {/* Print styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          #minutes-document, #minutes-document * { visibility: visible; }
          #minutes-document {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            padding: 2cm;
          }
        }
      ` }} />
    </>
  );
}
