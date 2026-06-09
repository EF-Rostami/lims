import { limsApi, extractPage } from "@/lib/lims-api";
import type { components } from "@/generated/lims/api";

export type ReportRead = components["schemas"]["ReportRead"];
export type ReportCreate = components["schemas"]["ReportCreate"];
export type ReportStatus = components["schemas"]["ReportStatus"];

export type TemplateOrientation = "portrait" | "landscape";
export type PaperSize = "A4" | "Letter" | "A3";

export interface CustomSection {
  title: string;
  body: string;
  position: "before" | "after";
  order: number;
}

export interface ReportTemplate {
  id: number;
  name: string;
  description: string | null;
  client_id: number | null;
  test_category: string | null;
  is_default: boolean;
  orientation: TemplateOrientation;
  paper_size: PaperSize;
  show_logo: boolean;
  show_lab_name: boolean;
  show_lab_address: boolean;
  show_accreditation: boolean;
  header_custom_text: string | null;
  results_columns: string[];
  custom_sections: CustomSection[];
  show_page_numbers: boolean;
  show_signature_block: boolean;
  footer_custom_text: string | null;
  watermark_text: string | null;
  created_by_user_id: number | null;
  created_at: string;
  updated_at: string;
}

export type TemplateCreate = Omit<ReportTemplate, "id" | "created_by_user_id" | "created_at" | "updated_at">;
export type TemplateUpdate = Partial<TemplateCreate>;

export interface CoaResultRow {
  test_name: string;
  test_code: string;
  result_value: string | null;
  unit: string | null;
  reference_range: string | null;
  result_flag: string | null;
  status: string;
  comments: string | null;
}

export interface CoaData {
  report_id: number;
  report_number: string;
  title: string;
  report_status: string;
  generated_at: string | null;
  issued_at: string | null;
  notes: string | null;
  order_number: string | null;
  requested_by: string | null;
  client_name: string | null;
  client_address: string | null;
  lab_name: string | null;
  lab_address: string | null;
  lab_accreditation: string | null;
  results: CoaResultRow[];
  template: ReportTemplate;
}

export interface ListReportsParams {
  status?: ReportStatus;
  order_id?: number;
}

export const reportsApi = {
  list: async (params?: ListReportsParams): Promise<ReportRead[]> => {
    const res = await limsApi.get("/reports", { params });
    return extractPage<ReportRead>(res.data);
  },
  get: async (id: number): Promise<ReportRead> => {
    const res = await limsApi.get<ReportRead>(`/reports/${id}`);
    return res.data;
  },
  create: async (data: Omit<ReportCreate, "template_id"> & { template_id?: number | null }): Promise<ReportRead> => {
    const res = await limsApi.post<ReportRead>("/reports", data);
    return res.data;
  },
  issue: async (id: number): Promise<ReportRead> => {
    const res = await limsApi.post<ReportRead>(`/reports/${id}/issue`);
    return res.data;
  },
  getCoa: async (id: number): Promise<CoaData> => {
    const res = await limsApi.get<CoaData>(`/reports/${id}/coa`);
    return res.data;
  },

  listTemplates: async (): Promise<ReportTemplate[]> => {
    const res = await limsApi.get<ReportTemplate[]>("/reports/templates");
    return res.data;
  },
  getTemplate: async (id: number): Promise<ReportTemplate> => {
    const res = await limsApi.get<ReportTemplate>(`/reports/templates/${id}`);
    return res.data;
  },
  createTemplate: async (data: TemplateCreate): Promise<ReportTemplate> => {
    const res = await limsApi.post<ReportTemplate>("/reports/templates", data);
    return res.data;
  },
  updateTemplate: async (id: number, data: TemplateUpdate): Promise<ReportTemplate> => {
    const res = await limsApi.patch<ReportTemplate>(`/reports/templates/${id}`, data);
    return res.data;
  },
  deleteTemplate: async (id: number): Promise<void> => {
    await limsApi.delete(`/reports/templates/${id}`);
  },
};
