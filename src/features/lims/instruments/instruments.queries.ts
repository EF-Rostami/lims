import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  instrumentsApi,
  type CalibrationRecordCreate, type CalibrationRecordUpdate,
  type IntermediateCheckCreate, type IntermediateCheckUpdate,
  type InstrumentCreate, type InstrumentUpdate,
  type ListInstrumentsParams, type MaintenanceLogCreate,
  type QualificationCreate, type QualificationItemCreate,
  type QualificationItemUpdate, type QualificationUpdate,
} from "./instruments.api";

export const instrumentKeys = {
  all: ["lims", "instruments"] as const,
  list: (params?: ListInstrumentsParams) => [...instrumentKeys.all, "list", params] as const,
  detail: (id: number) => [...instrumentKeys.all, "detail", id] as const,
  maintenance: (id: number) => [...instrumentKeys.all, id, "maintenance"] as const,
  calibrations: (id: number) => [...instrumentKeys.all, id, "calibrations"] as const,
  checks: (id: number) => [...instrumentKeys.all, id, "checks"] as const,
  qualifications: (id: number) => [...instrumentKeys.all, id, "qualifications"] as const,
};

// ── Instruments ───────────────────────────────────────────────────────────────

export function useInstruments(params?: ListInstrumentsParams) {
  return useQuery({
    queryKey: instrumentKeys.list(params),
    queryFn: () => instrumentsApi.list(params),
  });
}

export function useInstrument(id: number) {
  return useQuery({
    queryKey: instrumentKeys.detail(id),
    queryFn: () => instrumentsApi.get(id),
    enabled: !!id,
  });
}

export function useCreateInstrument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InstrumentCreate) => instrumentsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: instrumentKeys.all }),
  });
}

export function useUpdateInstrument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: InstrumentUpdate }) =>
      instrumentsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: instrumentKeys.all }),
  });
}

export function useDeleteInstrument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => instrumentsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: instrumentKeys.all }),
  });
}

// ── Maintenance ───────────────────────────────────────────────────────────────

export function useMaintenance(id: number) {
  return useQuery({
    queryKey: instrumentKeys.maintenance(id),
    queryFn: () => instrumentsApi.getMaintenance(id),
    enabled: !!id,
  });
}

export function useLogMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: MaintenanceLogCreate }) =>
      instrumentsApi.logMaintenance(id, data),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: instrumentKeys.maintenance(id) }),
  });
}

// ── Calibration Records ───────────────────────────────────────────────────────

export function useCalibrations(id: number) {
  return useQuery({
    queryKey: instrumentKeys.calibrations(id),
    queryFn: () => instrumentsApi.listCalibrations(id),
    enabled: !!id,
  });
}

export function useCreateCalibration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CalibrationRecordCreate }) =>
      instrumentsApi.createCalibration(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: instrumentKeys.calibrations(id) });
      qc.invalidateQueries({ queryKey: instrumentKeys.all });
    },
  });
}

export function useUpdateCalibration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ calId, data }: { calId: number; instrumentId: number; data: CalibrationRecordUpdate }) =>
      instrumentsApi.updateCalibration(calId, data),
    onSuccess: (res) => qc.invalidateQueries({ queryKey: instrumentKeys.calibrations(res.instrument_id) }),
  });
}

export function useApproveCalibration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ calId }: { calId: number; instrumentId: number }) =>
      instrumentsApi.approveCalibration(calId),
    onSuccess: (res) => qc.invalidateQueries({ queryKey: instrumentKeys.calibrations(res.instrument_id) }),
  });
}

export function useDeleteCalibration() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ calId }: { calId: number; instrumentId: number }) =>
      instrumentsApi.deleteCalibration(calId),
    onSuccess: (_, { instrumentId }) =>
      qc.invalidateQueries({ queryKey: instrumentKeys.calibrations(instrumentId) }),
  });
}

// ── Intermediate Checks ───────────────────────────────────────────────────────

export function useChecks(id: number) {
  return useQuery({
    queryKey: instrumentKeys.checks(id),
    queryFn: () => instrumentsApi.listChecks(id),
    enabled: !!id,
  });
}

export function useCreateCheck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IntermediateCheckCreate }) =>
      instrumentsApi.createCheck(id, data),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: instrumentKeys.checks(id) }),
  });
}

export function useUpdateCheck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ checkId, data }: { checkId: number; instrumentId: number; data: IntermediateCheckUpdate }) =>
      instrumentsApi.updateCheck(checkId, data),
    onSuccess: (res) => qc.invalidateQueries({ queryKey: instrumentKeys.checks(res.instrument_id) }),
  });
}

export function useDeleteCheck() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ checkId }: { checkId: number; instrumentId: number }) =>
      instrumentsApi.deleteCheck(checkId),
    onSuccess: (_, { instrumentId }) =>
      qc.invalidateQueries({ queryKey: instrumentKeys.checks(instrumentId) }),
  });
}

// ── Qualifications ────────────────────────────────────────────────────────────

export function useQualifications(id: number) {
  return useQuery({
    queryKey: instrumentKeys.qualifications(id),
    queryFn: () => instrumentsApi.listQualifications(id),
    enabled: !!id,
  });
}

export function useCreateQualification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: QualificationCreate }) =>
      instrumentsApi.createQualification(id, data),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: instrumentKeys.qualifications(id) }),
  });
}

export function useUpdateQualification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ qualId, data }: { qualId: number; instrumentId: number; data: QualificationUpdate }) =>
      instrumentsApi.updateQualification(qualId, data),
    onSuccess: (res) => qc.invalidateQueries({ queryKey: instrumentKeys.qualifications(res.instrument_id) }),
  });
}

export function useApproveQualification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ qualId }: { qualId: number; instrumentId: number }) =>
      instrumentsApi.approveQualification(qualId),
    onSuccess: (res) => qc.invalidateQueries({ queryKey: instrumentKeys.qualifications(res.instrument_id) }),
  });
}

export function useDeleteQualification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ qualId }: { qualId: number; instrumentId: number }) =>
      instrumentsApi.deleteQualification(qualId),
    onSuccess: (_, { instrumentId }) =>
      qc.invalidateQueries({ queryKey: instrumentKeys.qualifications(instrumentId) }),
  });
}

export function useAddQualificationItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ qualId, data }: { qualId: number; instrumentId: number; data: QualificationItemCreate }) =>
      instrumentsApi.addQualificationItem(qualId, data),
    onSuccess: (_, { instrumentId }) =>
      qc.invalidateQueries({ queryKey: instrumentKeys.qualifications(instrumentId) }),
  });
}

export function useUpdateQualificationItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: number; instrumentId: number; data: QualificationItemUpdate }) =>
      instrumentsApi.updateQualificationItem(itemId, data),
    onSuccess: (_, { instrumentId }) =>
      qc.invalidateQueries({ queryKey: instrumentKeys.qualifications(instrumentId) }),
  });
}

export function useDeleteQualificationItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId }: { itemId: number; instrumentId: number }) =>
      instrumentsApi.deleteQualificationItem(itemId),
    onSuccess: (_, { instrumentId }) =>
      qc.invalidateQueries({ queryKey: instrumentKeys.qualifications(instrumentId) }),
  });
}
