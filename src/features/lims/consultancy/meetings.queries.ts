import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  meetingsApi,
  type MeetingCreate,
  type MeetingUpdate,
  type MeetingStatus,
  type MeetingAgendaCreate,
  type MeetingAgendaUpdate,
  type MeetingActionCreate,
  type MeetingActionUpdate,
  type MeetingDecisionCreate,
  type MeetingAttendeeCreate,
  type MeetingAttendeeUpdate,
} from "./meetings.api";

export const attendeeKeys = {
  list: (meetingId: number) => ["lims", "meetings", meetingId, "attendees"] as const,
};

export const meetingKeys = {
  all: ["lims", "meetings"] as const,
  list: (params?: { project_id?: number; status?: MeetingStatus }) =>
    [...meetingKeys.all, "list", params] as const,
  detail: (id: number) => [...meetingKeys.all, "detail", id] as const,
};

export function useMeetings(params?: { project_id?: number; status?: MeetingStatus }) {
  return useQuery({
    queryKey: meetingKeys.list(params),
    queryFn: () => meetingsApi.list(params),
  });
}

export function useMeeting(id: number) {
  return useQuery({
    queryKey: meetingKeys.detail(id),
    queryFn: () => meetingsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MeetingCreate) => meetingsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: meetingKeys.all }),
  });
}

export function useUpdateMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MeetingUpdate }) =>
      meetingsApi.update(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: meetingKeys.detail(id) });
      qc.invalidateQueries({ queryKey: meetingKeys.list() });
    },
  });
}

export function useAddAgenda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ meetingId, data }: { meetingId: number; data: MeetingAgendaCreate }) =>
      meetingsApi.addAgenda(meetingId, data),
    onSuccess: (item) => qc.invalidateQueries({ queryKey: meetingKeys.detail(item.meeting_id) }),
  });
}

export function useUpdateAgenda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      meetingId,
      agendaId,
      data,
    }: {
      meetingId: number;
      agendaId: number;
      data: MeetingAgendaUpdate;
    }) => meetingsApi.updateAgenda(meetingId, agendaId, data),
    onSuccess: (item) => qc.invalidateQueries({ queryKey: meetingKeys.detail(item.meeting_id) }),
  });
}

export function useDeleteAgenda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ meetingId, agendaId }: { meetingId: number; agendaId: number }) =>
      meetingsApi.deleteAgenda(meetingId, agendaId),
    onSuccess: (_, { meetingId }) =>
      qc.invalidateQueries({ queryKey: meetingKeys.detail(meetingId) }),
  });
}

export function useAddAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      meetingId,
      agendaId,
      data,
    }: {
      meetingId: number;
      agendaId: number;
      data: MeetingActionCreate;
    }) => meetingsApi.addAction(meetingId, agendaId, data),
    onSuccess: (_, { meetingId }) =>
      qc.invalidateQueries({ queryKey: meetingKeys.detail(meetingId) }),
  });
}

export function useUpdateAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      meetingId,
      actionId,
      data,
    }: {
      meetingId: number;
      actionId: number;
      data: MeetingActionUpdate;
    }) => meetingsApi.updateAction(meetingId, actionId, data),
    onSuccess: (_, { meetingId }) =>
      qc.invalidateQueries({ queryKey: meetingKeys.detail(meetingId) }),
  });
}

export function useAddDecision() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      meetingId,
      agendaId,
      data,
    }: {
      meetingId: number;
      agendaId: number;
      data: MeetingDecisionCreate;
    }) => meetingsApi.addDecision(meetingId, agendaId, data),
    onSuccess: (_, { meetingId }) =>
      qc.invalidateQueries({ queryKey: meetingKeys.detail(meetingId) }),
  });
}

export function useRolloverActions() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      meetingId,
      fromMeetingId,
    }: {
      meetingId: number;
      fromMeetingId: number;
    }) => meetingsApi.rollover(meetingId, fromMeetingId),
    onSuccess: (_, { meetingId }) =>
      qc.invalidateQueries({ queryKey: meetingKeys.detail(meetingId) }),
  });
}

export function useAttendees(meetingId: number) {
  return useQuery({
    queryKey: attendeeKeys.list(meetingId),
    queryFn: () => meetingsApi.listAttendees(meetingId),
    enabled: !!meetingId,
  });
}

export function useAddAttendee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ meetingId, data }: { meetingId: number; data: MeetingAttendeeCreate }) =>
      meetingsApi.addAttendee(meetingId, data),
    onSuccess: (_, { meetingId }) =>
      qc.invalidateQueries({ queryKey: attendeeKeys.list(meetingId) }),
  });
}

export function useUpdateAttendee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      meetingId,
      attendeeId,
      data,
    }: {
      meetingId: number;
      attendeeId: number;
      data: MeetingAttendeeUpdate;
    }) => meetingsApi.updateAttendee(meetingId, attendeeId, data),
    onSuccess: (_, { meetingId }) =>
      qc.invalidateQueries({ queryKey: attendeeKeys.list(meetingId) }),
  });
}

export function useRemoveAttendee() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ meetingId, attendeeId }: { meetingId: number; attendeeId: number }) =>
      meetingsApi.removeAttendee(meetingId, attendeeId),
    onSuccess: (_, { meetingId }) =>
      qc.invalidateQueries({ queryKey: attendeeKeys.list(meetingId) }),
  });
}

export function useSendInvitations() {
  return useMutation({
    mutationFn: (meetingId: number) => meetingsApi.sendInvitations(meetingId),
  });
}

export function useSendMinutes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (meetingId: number) => meetingsApi.sendMinutes(meetingId),
    onSuccess: (_, meetingId) => {
      qc.invalidateQueries({ queryKey: meetingKeys.detail(meetingId) });
      qc.invalidateQueries({ queryKey: meetingKeys.list() });
    },
  });
}
