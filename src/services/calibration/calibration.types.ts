// calibration.types.ts
export const CALIBRATION_BASE = "/api/calibrations" as const;

export const CALIBRATION_ENDPOINTS = {
  list: CALIBRATION_BASE,
  create: CALIBRATION_BASE,
  detail: (id: number) => `${CALIBRATION_BASE}/${id}`,
  update: (id: number) => `${CALIBRATION_BASE}/${id}`,
  delete: (id: number) => `${CALIBRATION_BASE}/${id}`,
  history: (equipmentId: number) => `${CALIBRATION_BASE}/equipment/${equipmentId}/history`,
  // NEW: Compliance verification
  verify: (id: number) => `${CALIBRATION_BASE}/${id}/verify`,
} as const;