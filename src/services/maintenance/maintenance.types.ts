export const MAINTENANCE_BASE = "/api/maintenances" as const;

export const MAINTENANCE_ENDPOINTS = {
  list: MAINTENANCE_BASE,
  create: MAINTENANCE_BASE,
  detail: (id: number) => `${MAINTENANCE_BASE}/${id}`,
  update: (id: number) => `${MAINTENANCE_BASE}/${id}`,
  delete: (id: number) => `${MAINTENANCE_BASE}/${id}`,
  history: (equipmentId: number) => `${MAINTENANCE_BASE}/equipment/${equipmentId}/history`,
} as const;