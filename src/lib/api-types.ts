/* eslint-disable @typescript-eslint/no-explicit-any */
import type { paths as LimsPaths, components as LimsComponents } from "@/generated/lims/api";
import type { paths as SaasPaths, components as SaasComponents } from "@/generated/saas/api";

// ---------------------------------------------------------------------------
// Schema shorthand — use these to reference model types directly
// ---------------------------------------------------------------------------
export type LimsSchema = LimsComponents["schemas"];
export type SaasSchema = SaasComponents["schemas"];

// ---------------------------------------------------------------------------
// Generic extractors (schema-agnostic, used by the pre-bound helpers below)
// ---------------------------------------------------------------------------

type JsonBody<T> = T extends { content: { "application/json": infer R } } ? R : never;

type RawResponse<
  TPaths extends Record<string, any>,
  TPath extends keyof TPaths,
  TMethod extends keyof TPaths[TPath]
> = TPaths[TPath][TMethod] extends { responses: infer R } ? JsonBody<R[keyof R]> : never;

type RawRequest<
  TPaths extends Record<string, any>,
  TPath extends keyof TPaths,
  TMethod extends keyof TPaths[TPath]
> = TPaths[TPath][TMethod] extends { requestBody: { content: { "application/json": infer B } } }
  ? B
  : never;

type RawMultipartRequest<
  TPaths extends Record<string, any>,
  TPath extends keyof TPaths,
  TMethod extends keyof TPaths[TPath]
> = TPaths[TPath][TMethod] extends {
  requestBody: { content: { "multipart/form-data": infer B } };
}
  ? B
  : never;

// ---------------------------------------------------------------------------
// LIMS pre-bound helpers — import these in lims feature services
// ---------------------------------------------------------------------------
export type LimsResponse<
  TPath extends keyof LimsPaths,
  TMethod extends keyof LimsPaths[TPath]
> = RawResponse<LimsPaths, TPath, TMethod>;

export type LimsRequest<
  TPath extends keyof LimsPaths,
  TMethod extends keyof LimsPaths[TPath]
> = RawRequest<LimsPaths, TPath, TMethod>;

export type LimsMultipartRequest<
  TPath extends keyof LimsPaths,
  TMethod extends keyof LimsPaths[TPath]
> = RawMultipartRequest<LimsPaths, TPath, TMethod>;

// ---------------------------------------------------------------------------
// SaaS pre-bound helpers — import these in saas feature services
// ---------------------------------------------------------------------------
export type SaasResponse<
  TPath extends keyof SaasPaths,
  TMethod extends keyof SaasPaths[TPath]
> = RawResponse<SaasPaths, TPath, TMethod>;

export type SaasRequest<
  TPath extends keyof SaasPaths,
  TMethod extends keyof SaasPaths[TPath]
> = RawRequest<SaasPaths, TPath, TMethod>;

export type SaasMultipartRequest<
  TPath extends keyof SaasPaths,
  TMethod extends keyof SaasPaths[TPath]
> = RawMultipartRequest<SaasPaths, TPath, TMethod>;

// ---------------------------------------------------------------------------
// Legacy generic aliases — kept for backward compat while old services migrate
// ---------------------------------------------------------------------------
export type ApiResponse<
  TPaths extends Record<string, any>,
  TPath extends keyof TPaths,
  TMethod extends keyof TPaths[TPath]
> = RawResponse<TPaths, TPath, TMethod>;

export type ApiRequest<
  TPaths extends Record<string, any>,
  TPath extends keyof TPaths,
  TMethod extends keyof TPaths[TPath]
> = RawRequest<TPaths, TPath, TMethod>;

export type ApiMultipartRequest<
  TPaths extends Record<string, any>,
  TPath extends keyof TPaths,
  TMethod extends keyof TPaths[TPath]
> = RawMultipartRequest<TPaths, TPath, TMethod>;
