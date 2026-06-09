import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  iaApi,
  AuditStatus, FindingStatus, FindingType,
  IAAuditCreate, IAAuditUpdate,
  IAChecklistItemCreate, IAChecklistItemUpdate,
  IAFindingCreate, IAFindingUpdate,
  IAProgramCreate, IAProgramUpdate,
} from "./ia.api";

const KEYS = {
  summary: ["ia", "summary"] as const,
  programs: ["ia", "programs"] as const,
  audits: (p?: object) => ["ia", "audits", p] as const,
  audit: (id: number) => ["ia", "audit", id] as const,
  findings: (p?: object) => ["ia", "findings", p] as const,
};

// ── Summary ───────────────────────────────────────────────────────────────────

export function useIASummary() {
  return useQuery({
    queryKey: KEYS.summary,
    queryFn: () => iaApi.getSummary(),
    refetchInterval: 5 * 60 * 1000,
  });
}

// ── Programs ──────────────────────────────────────────────────────────────────

export function useIAPrograms() {
  return useQuery({ queryKey: KEYS.programs, queryFn: () => iaApi.listPrograms() });
}

export function useCreateIAProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: IAProgramCreate) => iaApi.createProgram(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ia", "programs"] }),
  });
}

export function useUpdateIAProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IAProgramUpdate }) => iaApi.updateProgram(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ia", "programs"] }),
  });
}

export function useDeleteIAProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => iaApi.deleteProgram(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ia", "programs"] }),
  });
}

// ── Audits ────────────────────────────────────────────────────────────────────

export function useIAAudits(params?: { program_id?: number; status?: AuditStatus }) {
  return useQuery({
    queryKey: KEYS.audits(params),
    queryFn: () => iaApi.listAudits(params),
  });
}

export function useIAAudit(id: number | null) {
  return useQuery({
    queryKey: KEYS.audit(id!),
    queryFn: () => iaApi.getAudit(id!),
    enabled: id != null,
  });
}

export function useCreateIAAudit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: IAAuditCreate) => iaApi.createAudit(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ia", "audits"] });
      qc.invalidateQueries({ queryKey: ["ia", "summary"] });
    },
  });
}

export function useUpdateIAAudit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IAAuditUpdate }) => iaApi.updateAudit(id, data),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["ia", "audits"] });
      qc.invalidateQueries({ queryKey: ["ia", "audit", id] });
    },
  });
}

export function useDeleteIAAudit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => iaApi.deleteAudit(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ia", "audits"] });
      qc.invalidateQueries({ queryKey: ["ia", "summary"] });
    },
  });
}

export function useOpenIAAudit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => iaApi.openAudit(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: ["ia", "audits"] });
      qc.invalidateQueries({ queryKey: ["ia", "audit", id] });
      qc.invalidateQueries({ queryKey: ["ia", "summary"] });
    },
  });
}

export function useReportIAAudit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, summary }: { id: number; summary: string }) =>
      iaApi.reportAudit(id, summary),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["ia", "audits"] });
      qc.invalidateQueries({ queryKey: ["ia", "audit", id] });
      qc.invalidateQueries({ queryKey: ["ia", "summary"] });
    },
  });
}

export function useCloseIAAudit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
      iaApi.closeAudit(id, notes),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["ia", "audits"] });
      qc.invalidateQueries({ queryKey: ["ia", "audit", id] });
      qc.invalidateQueries({ queryKey: ["ia", "summary"] });
    },
  });
}

// ── Checklist ─────────────────────────────────────────────────────────────────

export function useAddChecklistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ auditId, data }: { auditId: number; data: IAChecklistItemCreate }) =>
      iaApi.addChecklistItem(auditId, data),
    onSuccess: (item) => qc.invalidateQueries({ queryKey: ["ia", "audit", item.audit_id] }),
  });
}

export function useUpdateChecklistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, auditId, data }: { id: number; auditId: number; data: IAChecklistItemUpdate }) =>
      iaApi.updateChecklistItem(id, data),
    onSuccess: (_, { auditId }) => qc.invalidateQueries({ queryKey: ["ia", "audit", auditId] }),
  });
}

export function useDeleteChecklistItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, auditId }: { id: number; auditId: number }) =>
      iaApi.deleteChecklistItem(id),
    onSuccess: (_, { auditId }) => qc.invalidateQueries({ queryKey: ["ia", "audit", auditId] }),
  });
}

// ── Findings ──────────────────────────────────────────────────────────────────

export function useIAFindings(params?: { audit_id?: number; status?: FindingStatus; finding_type?: FindingType }) {
  return useQuery({
    queryKey: KEYS.findings(params),
    queryFn: () => iaApi.listFindings(params),
  });
}

export function useCreateIAFinding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ auditId, data }: { auditId: number; data: IAFindingCreate }) =>
      iaApi.createFinding(auditId, data),
    onSuccess: (f) => {
      qc.invalidateQueries({ queryKey: ["ia", "audit", f.audit_id] });
      qc.invalidateQueries({ queryKey: ["ia", "findings"] });
      qc.invalidateQueries({ queryKey: ["ia", "summary"] });
    },
  });
}

export function useUpdateIAFinding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IAFindingUpdate }) =>
      iaApi.updateFinding(id, data),
    onSuccess: (f) => {
      qc.invalidateQueries({ queryKey: ["ia", "audit", f.audit_id] });
      qc.invalidateQueries({ queryKey: ["ia", "findings"] });
    },
  });
}

export function useCloseIAFinding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ca }: { id: number; ca: string }) =>
      iaApi.closeFinding(id, ca),
    onSuccess: (f) => {
      qc.invalidateQueries({ queryKey: ["ia", "audit", f.audit_id] });
      qc.invalidateQueries({ queryKey: ["ia", "findings"] });
      qc.invalidateQueries({ queryKey: ["ia", "summary"] });
    },
  });
}

export function useLinkCapaFinding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, capa_finding_id }: { id: number; capa_finding_id: number }) =>
      iaApi.linkCapa(id, capa_finding_id),
    onSuccess: (f) => qc.invalidateQueries({ queryKey: ["ia", "audit", f.audit_id] }),
  });
}

export function useDeleteIAFinding() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, auditId }: { id: number; auditId: number }) =>
      iaApi.deleteFinding(id),
    onSuccess: (_, { auditId }) => {
      qc.invalidateQueries({ queryKey: ["ia", "audit", auditId] });
      qc.invalidateQueries({ queryKey: ["ia", "findings"] });
      qc.invalidateQueries({ queryKey: ["ia", "summary"] });
    },
  });
}
