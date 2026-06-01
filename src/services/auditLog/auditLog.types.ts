// @ts-nocheck — pending migration to features/lims/ pattern
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ApiResponse } from "@/lib/api-types";

// Extract the base response from your OpenAPI schema

type RawAuditResponse = ApiResponse<"/api/auditLog/summary", "get">;

// Force it to be treated as an array so we can extract the element type
export type AuditLogEntry = RawAuditResponse extends (infer T)[] 
  ? T 
  : RawAuditResponse extends { [key: string]: any } 
    ? any // Fallback if it's an object, though the endpoint returns an array
    : never;

export interface AuditResourceParams {
  tableName: string;
  recordId: number;
}

export enum AuditAction {
  CREATE = "CREATE",
  UPDATE = "UPDATE",
  DELETE = "DELETE",
  VERIFY = "VERIFY"
}