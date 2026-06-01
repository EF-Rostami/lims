// src/services/equipment/equipment.types.ts
import { components } from "@/types/api";
import { ShieldCheck, Wrench, History } from 'lucide-react';

// 1. Re-export generated types for easy access
export type Equipment = components["schemas"]["Equipment"];
export type EquipmentRequirement = components["schemas"]["EquipmentRequirement"];
export type RequirementType = components["schemas"]["RequirementType"]; 

// 2. Keep your Manual UI Config
export const ACTIVITY_UI_CONFIG = {
  calibration: { color: 'text-blue-600 bg-blue-100', icon: ShieldCheck },
  maintenance: { color: 'text-green-600 bg-green-100', icon: Wrench },
  intermediate_check: { color: 'text-purple-600 bg-purple-100', icon: History },
} as const;

// 3. Keep your Manual Endpoints
export const EQUIPMENT_BASE = "/api/equipment" as const;

export const EQUIPMENT_ENDPOINTS = {
  list: EQUIPMENT_BASE,
  create: EQUIPMENT_BASE,
  detail: (id: number) => `${EQUIPMENT_BASE}/${id}`,
  byCode: (code: string) => `${EQUIPMENT_BASE}/by-code/${code}`,
  update: (id: number) => `${EQUIPMENT_BASE}/${id}`,
  delete: (id: number) => `${EQUIPMENT_BASE}/${id}`,
  // NEW: Specialized endpoints
  timeline: (id: number) => `${EQUIPMENT_BASE}/${id}/timeline`,
  calibrate: (id: number) => `${EQUIPMENT_BASE}/${id}/calibrate`,
  maintenance: (id: number) => `${EQUIPMENT_BASE}/${id}/maintenance`,
  verifyCalibration: (eqId: number, calId: number) => 
    `${EQUIPMENT_BASE}/${eqId}/verify-calibration/${calId}`,
  // NEW: Requirement (Plan) Management
  addRequirement: (eqId: number) => `${EQUIPMENT_BASE}/${eqId}/requirements`,
  updateRequirement: (reqId: number) => `${EQUIPMENT_BASE}/requirements/${reqId}`,
  deleteRequirement: (reqId: number) => `${EQUIPMENT_BASE}/requirements/${reqId}`,
} as const;