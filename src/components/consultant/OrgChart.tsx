/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { useOrgChart } from "@/services/orgChart/orgChart.hooks";
import { User, ChevronRight, Briefcase, Mail } from "lucide-react";
import { EmployeeDetail, OrgChartResponse } from "@/services/orgChart/orgChart.types";

// --- Recursive Node Component ---
function OrgNode({ node }: { node: any }) {
  return (
    <div className="flex flex-col items-center">
      {/* The Box */}
      <div className="bg-white border-2 border-blue-100 p-4 rounded-xl shadow-sm w-64 transition hover:border-blue-500 hover:shadow-md">
        <div className="flex items-center gap-2 mb-2 text-blue-600">
          <Briefcase size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">{node.department_name}</span>
        </div>
        
        <h3 className="font-bold text-gray-900 text-sm mb-3">{node.title}</h3>

        {/* List Employees in this Position */}
        <div className="space-y-2 border-t pt-2">
          {node.employees.map((emp: EmployeeDetail) => (
            <div key={emp.id} className="flex items-center gap-2">
              <div className="bg-gray-100 p-1 rounded-full">
                <User size={12} className="text-gray-500" />
              </div>
              <div>
                <p className="text-xs font-semibold">{emp.first_name} {emp.last_name}</p>
                <div className="flex gap-1">
                   {emp.roles.map((role: string) => (
                     <span key={role} className="text-[10px] text-blue-500 bg-blue-50 px-1 rounded">
                       {role}
                     </span>
                   ))}
                </div>
              </div>
            </div>
          ))}
          {node.employees.length === 0 && (
            <p className="text-[10px] text-gray-400 italic">Position Vacant</p>
          )}
        </div>
      </div>

      {/* Render Subordinates */}
      {node.subordinates && node.subordinates.length > 0 && (
        <div className="flex gap-8 mt-12 relative">
          {/* Vertical Connector Line */}
          <div className="absolute -top-12 left-1/2 w-0.5 h-12 bg-gray-200"></div>
          
          {node.subordinates.map((sub: any) => (
            <OrgNode key={sub.id} node={sub} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgChartPage() {
  const { data: rootNode, isLoading, error } = useOrgChart();

  if (isLoading) return <div className="p-20 text-center">Loading Hierarchy...</div>;
  if (error) return <div className="p-20 text-red-500 text-center">Failed to load chart.</div>;
  

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <header className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Laboratory Organization Chart</h1>
        <p className="text-gray-500 mt-2">ISO 17025 Authorized Reporting Structure</p>
      </header>

      {/* Scrollable Container for large charts */}
      <div className="overflow-x-auto pb-20">
        <div className="inline-block min-w-full align-middle">
          {rootNode && <OrgNode node={rootNode} />}
        </div>
      </div>
    </div>
  );
}