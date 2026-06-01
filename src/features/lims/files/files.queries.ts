import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { filesApi, type UploadFileParams, type ListFilesParams } from "./files.api";

export const fileKeys = {
  all: ["lims", "files"] as const,
  list: (params?: ListFilesParams) => [...fileKeys.all, "list", params] as const,
  detail: (id: number) => [...fileKeys.all, "detail", id] as const,
};

export function useFiles(params?: ListFilesParams) {
  return useQuery({
    queryKey: fileKeys.list(params),
    queryFn: () => filesApi.list(params),
    enabled: params ? Object.values(params).some(Boolean) : true,
  });
}

export function useFile(id: number) {
  return useQuery({
    queryKey: fileKeys.detail(id),
    queryFn: () => filesApi.get(id),
    enabled: !!id,
  });
}

export function useUploadFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: UploadFileParams) => filesApi.upload(params),
    onSuccess: () => qc.invalidateQueries({ queryKey: fileKeys.all }),
  });
}

export function useDeleteFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => filesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: fileKeys.all }),
  });
}
