export const ADMIN_BASE = "/api/admin" as const;

export const ADMIN_ENDPOINTS = {
  readiness: `${ADMIN_BASE}/readiness`,
  permissions: `${ADMIN_BASE}/permissions`,
  rolesMatrix: `${ADMIN_BASE}/roles-matrix`,
  togglePermission: `${ADMIN_BASE}/matrix/toggle`,
} as const;