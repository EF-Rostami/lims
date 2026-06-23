import { limsApi } from "@/lib/lims-api";

// ── Types ─────────────────────────────────────────────────────────────────────

export type MeetingType = "KICKOFF" | "WEEKLY" | "REVIEW" | "PRE_AUDIT";
export type MeetingStatus = "PLANNED" | "COMPLETED";
export type ActionPriority = "HIGH" | "MEDIUM" | "LOW";
export type ActionStatus = "OPEN" | "IN_PROGRESS" | "DONE";
export type DecisionType = "APPROVAL" | "CHANGE_REQUEST" | "REJECTION";

export interface MeetingCreate {
  project_id: number;
  title: string;
  type: MeetingType;
  scheduled_at: string; // ISO datetime string
  location?: string | null;
  notes?: string | null;
  next_meeting_date?: string | null; // ISO date string
}

export interface MeetingUpdate {
  title?: string;
  type?: MeetingType;
  scheduled_at?: string;
  status?: MeetingStatus;
  location?: string | null;
  notes?: string | null;
  next_meeting_date?: string | null;
}

export interface MeetingRead {
  id: number;
  project_id: number;
  sequence_number: number;
  title: string;
  type: MeetingType;
  scheduled_at: string;
  status: MeetingStatus;
  location: string | null;
  notes: string | null;
  next_meeting_date: string | null;
  minutes_sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface MeetingActionRead {
  id: number;
  agenda_id: number;
  title: string;
  assigned_to_id: number | null;
  priority: ActionPriority;
  due_date: string | null;
  status: ActionStatus;
  created_at: string;
  updated_at: string;
}

export interface MeetingDecisionRead {
  id: number;
  agenda_id: number;
  decision_text: string;
  type: DecisionType;
  created_at: string;
}

export interface MeetingAgendaRead {
  id: number;
  meeting_id: number;
  order_index: number;
  title: string;
  description: string | null;
  linked_entity_type: string | null;
  linked_entity_id: number | null;
  actions: MeetingActionRead[];
  decisions: MeetingDecisionRead[];
}

export interface MeetingDetail extends MeetingRead {
  agendas: MeetingAgendaRead[];
}

export interface MeetingAgendaCreate {
  title: string;
  description?: string | null;
  order_index?: number;
  linked_entity_type?: string | null;
  linked_entity_id?: number | null;
}

export interface MeetingAgendaUpdate {
  title?: string;
  description?: string | null;
  order_index?: number;
  linked_entity_type?: string | null;
  linked_entity_id?: number | null;
}

export interface MeetingActionCreate {
  title: string;
  assigned_to_id?: number | null;
  priority?: ActionPriority;
  due_date?: string | null;
}

export interface MeetingActionUpdate {
  title?: string;
  assigned_to_id?: number | null;
  priority?: ActionPriority;
  due_date?: string | null;
  status?: ActionStatus;
}

export interface MeetingDecisionCreate {
  decision_text: string;
  type: DecisionType;
}

export type AttendeeRole = "CHAIR" | "SECRETARY" | "ATTENDEE" | "OBSERVER";
export type AttendanceStatus = "PENDING" | "PRESENT" | "ABSENT" | "APOLOGY";

export interface MeetingAttendeeCreate {
  user_id?: number | null;
  name?: string | null;
  email?: string | null;
  role?: AttendeeRole;
}

export interface MeetingAttendeeUpdate {
  role?: AttendeeRole;
  attendance?: AttendanceStatus;
  name?: string;
  email?: string | null;
}

export interface MeetingAttendeeRead {
  id: number;
  meeting_id: number;
  user_id: number | null;
  name: string;
  email: string | null;
  role: AttendeeRole;
  attendance: AttendanceStatus;
}

export interface MeetingRolloverResult {
  actions_rolled_over: number;
}

// ── API ────────────────────────────────────────────────────────────────────────

export const meetingsApi = {
  list: async (params?: { project_id?: number; status?: MeetingStatus }): Promise<MeetingRead[]> => {
    const res = await limsApi.get<MeetingRead[]>("/consultancy/meetings", { params });
    return res.data;
  },

  get: async (meetingId: number): Promise<MeetingDetail> => {
    const res = await limsApi.get<MeetingDetail>(`/consultancy/meetings/${meetingId}`);
    return res.data;
  },

  create: async (data: MeetingCreate): Promise<MeetingRead> => {
    const res = await limsApi.post<MeetingRead>("/consultancy/meetings", data);
    return res.data;
  },

  update: async (meetingId: number, data: MeetingUpdate): Promise<MeetingRead> => {
    const res = await limsApi.patch<MeetingRead>(`/consultancy/meetings/${meetingId}`, data);
    return res.data;
  },

  addAgenda: async (meetingId: number, data: MeetingAgendaCreate): Promise<MeetingAgendaRead> => {
    const res = await limsApi.post<MeetingAgendaRead>(
      `/consultancy/meetings/${meetingId}/agendas`,
      data
    );
    return res.data;
  },

  updateAgenda: async (
    meetingId: number,
    agendaId: number,
    data: MeetingAgendaUpdate
  ): Promise<MeetingAgendaRead> => {
    const res = await limsApi.patch<MeetingAgendaRead>(
      `/consultancy/meetings/${meetingId}/agendas/${agendaId}`,
      data
    );
    return res.data;
  },

  deleteAgenda: async (meetingId: number, agendaId: number): Promise<void> => {
    await limsApi.delete(`/consultancy/meetings/${meetingId}/agendas/${agendaId}`);
  },

  addAction: async (
    meetingId: number,
    agendaId: number,
    data: MeetingActionCreate
  ): Promise<MeetingActionRead> => {
    const res = await limsApi.post<MeetingActionRead>(
      `/consultancy/meetings/${meetingId}/agendas/${agendaId}/actions`,
      data
    );
    return res.data;
  },

  updateAction: async (
    meetingId: number,
    actionId: number,
    data: MeetingActionUpdate
  ): Promise<MeetingActionRead> => {
    const res = await limsApi.patch<MeetingActionRead>(
      `/consultancy/meetings/${meetingId}/actions/${actionId}`,
      data
    );
    return res.data;
  },

  addDecision: async (
    meetingId: number,
    agendaId: number,
    data: MeetingDecisionCreate
  ): Promise<MeetingDecisionRead> => {
    const res = await limsApi.post<MeetingDecisionRead>(
      `/consultancy/meetings/${meetingId}/agendas/${agendaId}/decisions`,
      data
    );
    return res.data;
  },

  listAttendees: async (meetingId: number): Promise<MeetingAttendeeRead[]> => {
    const res = await limsApi.get<MeetingAttendeeRead[]>(`/consultancy/meetings/${meetingId}/attendees`);
    return res.data;
  },

  addAttendee: async (meetingId: number, data: MeetingAttendeeCreate): Promise<MeetingAttendeeRead> => {
    const res = await limsApi.post<MeetingAttendeeRead>(`/consultancy/meetings/${meetingId}/attendees`, data);
    return res.data;
  },

  updateAttendee: async (
    meetingId: number,
    attendeeId: number,
    data: MeetingAttendeeUpdate,
  ): Promise<MeetingAttendeeRead> => {
    const res = await limsApi.patch<MeetingAttendeeRead>(
      `/consultancy/meetings/${meetingId}/attendees/${attendeeId}`,
      data,
    );
    return res.data;
  },

  removeAttendee: async (meetingId: number, attendeeId: number): Promise<void> => {
    await limsApi.delete(`/consultancy/meetings/${meetingId}/attendees/${attendeeId}`);
  },

  sendInvitations: async (meetingId: number): Promise<{ sent: number }> => {
    const res = await limsApi.post<{ sent: number }>(`/consultancy/meetings/${meetingId}/send-invitations`);
    return res.data;
  },

  sendMinutes: async (meetingId: number): Promise<{ sent: number }> => {
    const res = await limsApi.post<{ sent: number }>(`/consultancy/meetings/${meetingId}/send-minutes`);
    return res.data;
  },

  rollover: async (meetingId: number, fromMeetingId: number): Promise<MeetingRolloverResult> => {
    const res = await limsApi.post<MeetingRolloverResult>(
      `/consultancy/meetings/${meetingId}/rollover`,
      null,
      { params: { from_meeting_id: fromMeetingId } }
    );
    return res.data;
  },
};
