import { limsApi } from "@/lib/lims-api";
import type { components } from "@/generated/lims/api";

export type SignatureRead = components["schemas"]["SignatureRead"];
export type SignatureCreate = components["schemas"]["SignatureCreate"];
export type SignatureContext = components["schemas"]["SignatureContext"];

export interface ListSignaturesParams {
  entity_type: string;
  entity_id: number;
  context?: SignatureContext;
}

export const signaturesApi = {
  list: async (params: ListSignaturesParams): Promise<SignatureRead[]> => {
    const res = await limsApi.get<SignatureRead[]>("/signatures", { params });
    return res.data;
  },

  create: async (data: SignatureCreate): Promise<SignatureRead> => {
    const res = await limsApi.post<SignatureRead>("/signatures", data);
    return res.data;
  },
};
