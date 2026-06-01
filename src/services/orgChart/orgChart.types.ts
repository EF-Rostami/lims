
export const ORGCHART_BASE = "/api/orgchart" as const;

export const ORGCHART_ENDPOINTS = {
  getOrgChart: ORGCHART_BASE,
} as const;

// Types for API responses
export type EmployeeDetail = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  roles: string[];
};

export type PositionNode = {
  id: number;
  title: string;
  department_id: number;
  reports_to_position_id: number | null;
  department_name: string;
  employees: EmployeeDetail[];
  subordinates: PositionNode[];
};

export type OrgChartResponse = PositionNode;