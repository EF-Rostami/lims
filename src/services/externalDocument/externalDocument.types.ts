export const EXTERNAL_DOCUMENT_BASE = "/api/documents/external" as const;

export const EXTERNAL_DOCUMENT_ENDPOINTS = {
  list: EXTERNAL_DOCUMENT_BASE,
  create: EXTERNAL_DOCUMENT_BASE,
  overdue: `${EXTERNAL_DOCUMENT_BASE}/overdue`,
  markReviewed: (id: number) =>
    `${EXTERNAL_DOCUMENT_BASE}/${id}/mark-reviewed`,
} as const;