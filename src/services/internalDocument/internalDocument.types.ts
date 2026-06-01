export const INTERNAL_DOCUMENT_BASE = "/api/documents/internal" as const;

export const INTERNAL_DOCUMENT_ENDPOINTS = {
  list: INTERNAL_DOCUMENT_BASE,
  myTasks: `${INTERNAL_DOCUMENT_BASE}/my-tasks`,
  get: (id: number) => `${INTERNAL_DOCUMENT_BASE}/${id}`,
  create: INTERNAL_DOCUMENT_BASE,
  submit: (id: number) => `${INTERNAL_DOCUMENT_BASE}/${id}/submit`,
  verify: (id: number) => `${INTERNAL_DOCUMENT_BASE}/${id}/verify`,
  approve: (id: number) => `${INTERNAL_DOCUMENT_BASE}/${id}/approve`,
  reject: (id: number) => `${INTERNAL_DOCUMENT_BASE}/${id}/reject`,
  revise: (id: number) => `${INTERNAL_DOCUMENT_BASE}/${id}/revise`,
  upload: (id: number) => `${INTERNAL_DOCUMENT_BASE}/${id}/upload`,
  download: (id: number) => `${INTERNAL_DOCUMENT_BASE}/${id}/download`,
  content: (id: number) => `${INTERNAL_DOCUMENT_BASE}/${id}/content`,
  view: (id: number) => `${INTERNAL_DOCUMENT_BASE}/${id}/view`,
  confirmRead: (id: number) => `${INTERNAL_DOCUMENT_BASE}/${id}/confirm-read`,
  assignments: (id: number) => `${INTERNAL_DOCUMENT_BASE}/${id}/assignments`,
  assignWorkflow: (id: number) => `${INTERNAL_DOCUMENT_BASE}/${id}/assign-workflow`,
  configTypes: `${INTERNAL_DOCUMENT_BASE}/config/types`,
  configTypeUpdate: (id: number) => `${INTERNAL_DOCUMENT_BASE}/config/types/${id}`, // Add this
  configTypeDetail: (id: number) => `${INTERNAL_DOCUMENT_BASE}/config/types/${id}`, // Add this
} as const;