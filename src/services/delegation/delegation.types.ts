export const DELEGATION_BASE = "/api/delegations" as const;

export const DELEGATION_ENDPOINTS = {
  list: DELEGATION_BASE,
  active: `${DELEGATION_BASE}/active`,
  create: DELEGATION_BASE,
  update: (id: number) => `${DELEGATION_BASE}/${id}`,
  delete: (id: number) => `${DELEGATION_BASE}/${id}`,
} as const;