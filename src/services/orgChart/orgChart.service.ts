// @ts-nocheck — pending migration to features/lims/ pattern

import apiClient from "@/lib/api-client";
import { handleApi } from "@/lib/handle-api";
import type { ApiResponse } from "@/lib/api-types";
import { ORGCHART_ENDPOINTS, OrgChartResponse } from "./orgChart.types";

export const orgChartService = {
  /**
   * GET /api/orgchart
   */
  getOrgChart() {
    return handleApi(
      apiClient.get<ApiResponse<"/api/orgchart", "get">>(
        ORGCHART_ENDPOINTS.getOrgChart
      )
    ) as Promise<OrgChartResponse>;
  },
};