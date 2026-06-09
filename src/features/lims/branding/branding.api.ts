import { limsApi } from "@/lib/lims-api";

export interface BrandingConfig {
  company_name: string | null;
  logo_data_url: string | null;
  primary_hex: string | null;
  sidebar_bg_hex: string | null;
  accent_hex: string | null;
}

export interface BrandingRead extends BrandingConfig {
  logo_url: string | null;
}

export type BrandingUpdate = Partial<
  Pick<BrandingConfig, "company_name" | "logo_data_url" | "primary_hex" | "sidebar_bg_hex" | "accent_hex">
>;

export const brandingApi = {
  get: async (): Promise<BrandingRead> => {
    const res = await limsApi.get<BrandingRead>("/settings/branding");
    return res.data;
  },

  update: async (data: BrandingUpdate): Promise<BrandingRead> => {
    const res = await limsApi.put<BrandingRead>("/settings/branding", data);
    return res.data;
  },
};
