import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reportsApi, type ReportCreate, type ListReportsParams } from "./reports.api";

export const reportKeys = {
  all: ["lims", "reports"] as const,
  list: (params?: ListReportsParams) => [...reportKeys.all, "list", params] as const,
  detail: (id: number) => [...reportKeys.all, "detail", id] as const,
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

export function useCreateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ReportCreate) => reportsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: reportKeys.all }),
  });
}

export function useIssueReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => reportsApi.issue(id),
    onSuccess: (_, id) => qc.invalidateQueries({ queryKey: reportKeys.detail(id) }),
  });
}
