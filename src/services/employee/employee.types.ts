export const EMPLOYEE_BASE = "/api/employees" as const;

export const EMPLOYEE_ENDPOINTS = {
  list: EMPLOYEE_BASE,
  register: `${EMPLOYEE_BASE}/register`,
  update: (id: number) => `${EMPLOYEE_BASE}/${id}`,
} as const;