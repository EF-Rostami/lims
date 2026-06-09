import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inventoryApi, ItemCategory, LotStatus } from "./inventory.api";

const KEYS = {
  suppliers: ["inventory", "suppliers"] as const,
  items: (category?: ItemCategory, activeOnly?: boolean) =>
    ["inventory", "items", { category, activeOnly }] as const,
  lots: (itemId?: number, status?: LotStatus) =>
    ["inventory", "lots", { itemId, status }] as const,
  alerts: ["inventory", "alerts"] as const,
  usage: (lotId: number) => ["inventory", "usage", lotId] as const,
};

// Suppliers
export function useSuppliers() {
  return useQuery({ queryKey: KEYS.suppliers, queryFn: inventoryApi.listSuppliers });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.createSupplier,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof inventoryApi.updateSupplier>[1] }) =>
      inventoryApi.updateSupplier(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.deleteSupplier,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });
}

// Items
export function useInventoryItems(category?: ItemCategory, activeOnly = true) {
  return useQuery({
    queryKey: KEYS.items(category, activeOnly),
    queryFn: () => inventoryApi.listItems({ category, active_only: activeOnly }),
  });
}

export function useCreateInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.createItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });
}

export function useUpdateInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof inventoryApi.updateItem>[1] }) =>
      inventoryApi.updateItem(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });
}

export function useDeleteInventoryItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.deleteItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });
}

// Lots
export function useInventoryLots(itemId?: number, status?: LotStatus) {
  return useQuery({
    queryKey: KEYS.lots(itemId, status),
    queryFn: () => inventoryApi.listLots({ item_id: itemId, status }),
  });
}

export function useCreateInventoryLot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inventoryApi.createLot,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });
}

export function useUpdateInventoryLot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Parameters<typeof inventoryApi.updateLot>[1] }) =>
      inventoryApi.updateLot(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });
}

// Usage
export function useRecordUsage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ lotId, data }: { lotId: number; data: Parameters<typeof inventoryApi.recordUsage>[1] }) =>
      inventoryApi.recordUsage(lotId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });
}

export function useLotUsage(lotId: number) {
  return useQuery({
    queryKey: KEYS.usage(lotId),
    queryFn: () => inventoryApi.getLotUsage(lotId),
    enabled: lotId > 0,
  });
}

// Alerts
export function useInventoryAlerts() {
  return useQuery({
    queryKey: KEYS.alerts,
    queryFn: inventoryApi.getAlerts,
    refetchInterval: 5 * 60 * 1000,
  });
}
