import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi, type SettingCreate, type SettingUpdate } from "./settings.api";

export const settingKeys = {
  all: ["lims", "settings"] as const,
  list: () => [...settingKeys.all, "list"] as const,
  detail: (key: string) => [...settingKeys.all, "detail", key] as const,
};

export function useSettings() {
  return useQuery({ queryKey: settingKeys.list(), queryFn: settingsApi.list });
}

export function useSetting(key: string) {
  return useQuery({
    queryKey: settingKeys.detail(key),
    queryFn: () => settingsApi.get(key),
    enabled: !!key,
  });
}

export function useCreateSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SettingCreate) => settingsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: settingKeys.all }),
  });
}

export function useUpdateSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ key, data }: { key: string; data: SettingUpdate }) =>
      settingsApi.update(key, data),
    onSuccess: (_, { key }) => qc.invalidateQueries({ queryKey: settingKeys.detail(key) }),
  });
}

export function useDeleteSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => settingsApi.delete(key),
    onSuccess: () => qc.invalidateQueries({ queryKey: settingKeys.all }),
  });
}
