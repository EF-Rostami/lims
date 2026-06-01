import { limsApi, extractPage } from "@/lib/lims-api";
import type { components } from "@/generated/lims/api";

export type OrderRead = components["schemas"]["OrderRead"];
export type OrderListItem = Omit<OrderRead, "items"> & { item_count: number };
export type OrderCreate = components["schemas"]["OrderCreate"];
export type OrderUpdate = components["schemas"]["OrderUpdate"];
export type OrderStatus = components["schemas"]["OrderStatus"];
export type OrderPriority = components["schemas"]["OrderPriority"];
export type OrderItemRead = components["schemas"]["OrderItemRead"];
export type OrderItemCreate = components["schemas"]["OrderItemCreate"];
export type OrderItemUpdate = components["schemas"]["OrderItemUpdate"];
export type OrderItemStatus = components["schemas"]["OrderItemStatus"];

export interface ListOrdersParams {
  status?: OrderStatus;
  priority?: OrderPriority;
  client_id?: number;
  sample_id?: number;
}

export const ordersApi = {
  list: async (params?: ListOrdersParams): Promise<OrderListItem[]> => {
    const res = await limsApi.get("/orders", { params });
    return extractPage<OrderListItem>(res.data);
  },

  get: async (id: number): Promise<OrderRead> => {
    const res = await limsApi.get<OrderRead>(`/orders/${id}`);
    return res.data;
  },

  create: async (data: OrderCreate): Promise<OrderRead> => {
    const res = await limsApi.post<OrderRead>("/orders", data);
    return res.data;
  },

  update: async (id: number, data: OrderUpdate): Promise<OrderRead> => {
    const res = await limsApi.patch<OrderRead>(`/orders/${id}`, data);
    return res.data;
  },

  submit: async (id: number): Promise<OrderRead> => {
    const res = await limsApi.post<OrderRead>(`/orders/${id}/submit`);
    return res.data;
  },

  cancel: async (id: number): Promise<OrderRead> => {
    const res = await limsApi.post<OrderRead>(`/orders/${id}/cancel`);
    return res.data;
  },

  addItem: async (orderId: number, data: OrderItemCreate): Promise<OrderItemRead> => {
    const res = await limsApi.post<OrderItemRead>(`/orders/${orderId}/items`, data);
    return res.data;
  },

  updateItem: async (orderId: number, itemId: number, data: OrderItemUpdate): Promise<OrderItemRead> => {
    const res = await limsApi.patch<OrderItemRead>(`/orders/${orderId}/items/${itemId}`, data);
    return res.data;
  },
};
