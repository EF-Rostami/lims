export const POSITION_BASE = "/api/positions" as const;

export const POSITION_ENDPOINTS = {
  list: POSITION_BASE,
  get: (id: number) => `${POSITION_BASE}/${id}`,
  create: POSITION_BASE,
  update: (id: number) => `${POSITION_BASE}/${id}`,
  delete: (id: number) => `${POSITION_BASE}/${id}`,
} as const;