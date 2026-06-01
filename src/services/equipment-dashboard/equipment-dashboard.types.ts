// equipment-dashboard.types.ts
export const DASHBOARD_BASE = "/api/equipment_dashboard" as const;

export const DASHBOARD_ENDPOINTS = {
  stats: `${DASHBOARD_BASE}/stats`,
  // Unified endpoint to match the refactored FastAPI router
  activities: (days: number = 30, overdueOnly: boolean = false) => 
    `${DASHBOARD_BASE}/activities?days=${days}&overdue_only=${overdueOnly}`,
} as const;