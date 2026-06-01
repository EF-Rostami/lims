import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ordersApi,
  type OrderCreate, type OrderUpdate, type OrderItemCreate, type OrderItemUpdate,
  type ListOrdersParams,
} from "./orders.api";

export const orderKeys = {
  all: ["lims", "orders"] as const,
  list: (params?: ListOrdersParams) => [...orderKeys.all, "list", params] as const,
  detail: (id: number) => [...orderKeys.all, "detail", id] as const,
};

export function useOrders(params?: ListOrdersParams) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => ordersApi.list(params),
  });
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersApi.get(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: OrderCreate) => ordersApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: orderKeys.all }),
  });
}

export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: OrderUpdate }) => ordersApi.update(id, data),
    onSuccess: (_, { id }) => qc.invalidateQueries({ queryKey: orderKeys.detail(id) }),
  });
}

export function useSubmitOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ordersApi.submit(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: orderKeys.all }),
  });
}

export function useCancelOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ordersApi.cancel(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: orderKeys.all }),
  });
}

export function useAddOrderItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: number; data: OrderItemCreate }) =>
      ordersApi.addItem(orderId, data),
    onSuccess: (_, { orderId }) => qc.invalidateQueries({ queryKey: orderKeys.detail(orderId) }),
  });
}

export function useUpdateOrderItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, itemId, data }: { orderId: number; itemId: number; data: OrderItemUpdate }) =>
      ordersApi.updateItem(orderId, itemId, data),
    onSuccess: (_, { orderId }) => qc.invalidateQueries({ queryKey: orderKeys.detail(orderId) }),
  });
}
