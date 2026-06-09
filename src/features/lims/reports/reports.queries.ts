import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  reportsApi,
  type ListReportsParams,
  type TemplateCreate,
  type TemplateUpdate,
} from "./reports.api";

const _base = ["lims", "reports"] as const;

export const reportKeys = {
  all: _base,
  list: (params?: ListReportsParams) => [..._base, "list", params] as const,
  detail: (id: number) => [..._base, "detail", id] as const,
  coa: (id: number) => [..._base, "coa", id] as const,
  templates: [..._base, "templates"] as const,
};

export function useReports(params?: ListReportsParams) {
  return useQuery({
    queryKey: reportKeys.list(params),
    queryFn: () => reportsApi.list(params),
  });
}

export function useReport(id: number) {
  return useQuery({
    queryKey: reportKeys.detail(id),
    queryFn: () => reportsApi.get(id),
    enabled: !!id,
  });
}

export function useCoaData(id: number | null) {
  return useQuery({
    queryKey: reportKeys.coa(id!),
    queryFn: () => reportsApi.getCoa(id!),
    enabled: !!id,
    staleTime: 60_000,
  });
}

export function useCreateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reportsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: reportKeys.all }),
  });
}

export function useIssueReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reportsApi.issue(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: reportKeys.all }),
  });
}

export function useTemplates() {
  return useQuery({
    queryKey: reportKeys.templates,
    queryFn: () => reportsApi.listTemplates(),
  });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: TemplateCreate) => reportsApi.createTemplate(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: reportKeys.templates }),
  });
}

export function useUpdateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TemplateUpdate }) =>
      reportsApi.updateTemplate(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: reportKeys.templates }),
  });
}

export function useDeleteTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reportsApi.deleteTemplate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: reportKeys.templates }),
  });
}
