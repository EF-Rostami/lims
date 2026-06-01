export const INTERMEDIATE_CHECK_BASE = "/api/intermediate-checks" as const;

export const INTERMEDIATE_CHECK_ENDPOINTS = {
  list: INTERMEDIATE_CHECK_BASE,
  create: INTERMEDIATE_CHECK_BASE,
  detail: (id: number) => `${INTERMEDIATE_CHECK_BASE}/${id}`,
  update: (id: number) => `${INTERMEDIATE_CHECK_BASE}/${id}`,
  delete: (id: number) => `${INTERMEDIATE_CHECK_BASE}/${id}`,
  history: (equipmentId: number) => `${INTERMEDIATE_CHECK_BASE}/equipment/${equipmentId}/history`,
} as const;