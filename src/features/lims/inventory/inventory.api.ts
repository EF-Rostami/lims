import { limsApi } from "@/lib/lims-api";

export type ItemCategory = "chemical" | "reagent" | "kit" | "consumable" | "equipment";
export type LotStatus = "active" | "expired" | "depleted" | "quarantine";

export interface SupplierRead {
  id: number;
  name: string;
  code: string;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  is_active: boolean;
}

export interface SupplierCreate {
  name: string;
  code: string;
  contact_person?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  is_active?: boolean;
}

export interface SupplierUpdate extends Partial<SupplierCreate> {}

export interface InventoryItemRead {
  id: number;
  name: string;
  code: string;
  category: ItemCategory;
  unit: string;
  description?: string | null;
  cas_number?: string | null;
  min_stock_level?: number | null;
  supplier_id?: number | null;
  is_active: boolean;
  current_stock: number;
  supplier?: SupplierRead | null;
}

export interface InventoryItemCreate {
  name: string;
  code: string;
  category: ItemCategory;
  unit: string;
  description?: string | null;
  cas_number?: string | null;
  min_stock_level?: number | null;
  supplier_id?: number | null;
  is_active?: boolean;
}

export interface InventoryItemUpdate extends Partial<InventoryItemCreate> {}

export interface InventoryLotRead {
  id: number;
  item_id: number;
  lot_number: string;
  supplier_lot_number?: string | null;
  quantity_received: number;
  quantity_remaining: number;
  received_date: string;
  expiry_date?: string | null;
  status: LotStatus;
  notes?: string | null;
  days_until_expiry?: number | null;
  item?: { name: string; code: string; unit: string; category: ItemCategory } | null;
}

export interface InventoryLotCreate {
  item_id: number;
  lot_number: string;
  supplier_lot_number?: string | null;
  quantity_received: number;
  quantity_remaining: number;
  received_date: string;
  expiry_date?: string | null;
  notes?: string | null;
}

export interface InventoryLotUpdate {
  lot_number?: string | null;
  supplier_lot_number?: string | null;
  quantity_remaining?: number | null;
  expiry_date?: string | null;
  status?: LotStatus | null;
  notes?: string | null;
}

export interface UsageCreate {
  lot_id: number;
  quantity_used: number;
  test_reference?: string | null;
  notes?: string | null;
}

export interface UsageRead {
  id: number;
  lot_id: number;
  quantity_used: number;
  used_at: string;
  test_reference?: string | null;
  notes?: string | null;
}

export interface ExpiryAlert {
  lot_id: number;
  lot_number: string;
  item_id: number;
  item_name: string;
  item_code: string;
  unit: string;
  quantity_remaining: number;
  expiry_date: string;
  days_until_expiry: number;
}

export interface StockAlert {
  item_id: number;
  item_name: string;
  item_code: string;
  unit: string;
  category: ItemCategory;
  current_stock: number;
  min_stock_level: number;
}

export interface AlertSummary {
  expiry_alerts: ExpiryAlert[];
  stock_alerts: StockAlert[];
}

export const inventoryApi = {
  // Suppliers
  listSuppliers: () => limsApi.get<SupplierRead[]>("/inventory/suppliers").then(r => r.data),
  createSupplier: (data: SupplierCreate) => limsApi.post<SupplierRead>("/inventory/suppliers", data).then(r => r.data),
  updateSupplier: (id: number, data: SupplierUpdate) => limsApi.patch<SupplierRead>(`/inventory/suppliers/${id}`, data).then(r => r.data),
  deleteSupplier: (id: number) => limsApi.delete(`/inventory/suppliers/${id}`),

  // Items
  listItems: (params?: { category?: ItemCategory; active_only?: boolean }) =>
    limsApi.get<InventoryItemRead[]>("/inventory/items", { params }).then(r => r.data),
  createItem: (data: InventoryItemCreate) => limsApi.post<InventoryItemRead>("/inventory/items", data).then(r => r.data),
  updateItem: (id: number, data: InventoryItemUpdate) => limsApi.patch<InventoryItemRead>(`/inventory/items/${id}`, data).then(r => r.data),
  deleteItem: (id: number) => limsApi.delete(`/inventory/items/${id}`),

  // Lots
  listLots: (params?: { item_id?: number; status?: LotStatus }) =>
    limsApi.get<InventoryLotRead[]>("/inventory/lots", { params }).then(r => r.data),
  createLot: (data: InventoryLotCreate) => limsApi.post<InventoryLotRead>("/inventory/lots", data).then(r => r.data),
  updateLot: (id: number, data: InventoryLotUpdate) => limsApi.patch<InventoryLotRead>(`/inventory/lots/${id}`, data).then(r => r.data),

  // Usage
  recordUsage: (lotId: number, data: UsageCreate) => limsApi.post<UsageRead>(`/inventory/lots/${lotId}/usage`, data).then(r => r.data),
  getLotUsage: (lotId: number) => limsApi.get<UsageRead[]>(`/inventory/lots/${lotId}/usage`).then(r => r.data),

  // Alerts
  getAlerts: () => limsApi.get<AlertSummary>("/inventory/alerts").then(r => r.data),
};
