export const DEPARTMENT_BASE = "/api/departments" as const;

export const DEPARTMENT_ENDPOINTS = {
  list: DEPARTMENT_BASE,
  create: DEPARTMENT_BASE,
  update: (id: number) => `${DEPARTMENT_BASE}/${id}`,
  delete: (id: number) => `${DEPARTMENT_BASE}/${id}`,
} as const;