// @ts-nocheck — QMS module pending backend_v3 migration
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ApiResponse } from "@/lib/api-types";
import type { Schema } from "@/types/api-types";

export const NC_BASE = "/api/non-conformities" as const;

export const NC_ENDPOINTS = {
  list: NC_BASE,
  create: NC_BASE,
  detail: (id: number) => `${NC_BASE}/${id}`,
  update: (id: number) => `${NC_BASE}/${id}`,
} as const;

// Extracted from your generated type.d.ts via openapi-typescript
export type NonConformity = Schema["NonConformityResponse"];
export type NonConformityCreate = Schema["NonConformityCreate"];
export type NonConformityUpdate = Schema["NonConformityUpdate"];

// Helper for the list response
export type NCListResponse = Extract<ApiResponse<"/api/non-conformities", "get">, any[]>;