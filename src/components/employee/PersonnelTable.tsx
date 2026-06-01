/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { useEmployees } from "@/services/employee/employee.hooks";
import { 
  Search, 
  ChevronRight, 
  ShieldCheck, 
  ShieldAlert,
  Star,
  UserPlus,
  Key
} from "lucide-react";

interface PersonnelTableProps {
  onSelect: (id: number) => void;
}

export default function PersonnelTable({ onSelect }: PersonnelTableProps) {
  const { data: employees = [], isLoading } = useEmployees();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "committee">("all");

  const filteredData = useMemo(() => {
      return employees.filter((emp) => {
        // MATCHING BACKEND ALIASES: positions_list and roles_list (or effective_roles)
        const positions = (emp as any).positions_list || [];
        const roles = (emp as any).roles_list || []; // Based on our EmployeeResponse schema
        
        // const dept = (emp as any).primary_department_name || "";
        const positionsStr = positions.map((p: any) => p.title).join(" ") || "";
        const rolesStr = roles.map((r: any) => r.name).join(" ") || "";
        
        const searchStr = `${emp.full_name} ${emp.primary_department_name} ${rolesStr} ${positionsStr}`.toLowerCase();
        const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
        
        const hasRoles = roles.length > 0;
        const isCommittee = roles.some((r: any) => r.name.toLowerCase().includes("committee"));

        if (activeFilter === "pending") return matchesSearch && !hasRoles;
        if (activeFilter === "committee") return matchesSearch && isCommittee;
        
        return matchesSearch;
      });
    }, [employees, searchTerm, activeFilter]);

  if (isLoading) return <TableSkeleton />;

  return (
    <div className="flex flex-col">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/30">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
          <input 
            placeholder="Search name, position, or roles..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none shadow-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
          <FilterButton active={activeFilter === "all"} onClick={() => setActiveFilter("all")} label="All" />
          <FilterButton active={activeFilter === "pending"} onClick={() => setActiveFilter("pending")} label="Pending" />
          <FilterButton active={activeFilter === "committee"} onClick={() => setActiveFilter("committee")} label="Committee" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Personnel</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Organization & Positions</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Auth Status</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">System Roles</th>
              <th className="px-8 py-5 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredData.map((emp: any) => {
              const empPositions = emp.positions_list || [];
              const empRoles = emp.roles_list || [];

              return (
                <tr 
                  key={emp.id} 
                  onClick={() => onSelect(emp.id)}
                  className="group hover:bg-blue-50/30 transition-colors cursor-pointer"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {emp.first_name?.[0]}{emp.last_name?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-blue-700">{emp.full_name}</p>
                        <p className="text-xs text-slate-400 font-medium">{emp.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[11px] font-bold text-slate-800 bg-slate-100/50 w-fit px-2 py-0.5 rounded capitalize">
                        {(emp.primary_department_name || "Unassigned").replace(/_/g, ' ')}
                      </span>

                      <div className="flex flex-wrap gap-1">
                        {empPositions.length > 0 ? (
                          empPositions.map((pos: any, idx: number) => {
                            const isPrimary = pos.type === "primary";
                            const isDelegated = pos.type === "delegated";

                            return (
                              <span 
                                key={`${emp.id}-pos-${idx}`} 
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase transition-all
                                  ${isPrimary 
                                    ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-100" 
                                    : isDelegated
                                    ? "bg-amber-100 text-amber-700 border border-amber-200"
                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                  }`}
                                title={isDelegated ? `Delegated from ${pos.delegated_from}` : ""}
                              >
                                {isPrimary && <Star size={10} fill="currentColor" />}
                                {isDelegated && <UserPlus size={10} />}
                                {pos.title.replace(/_/g, ' ')}
                                {isDelegated && (
                                  <span className="lowercase font-medium opacity-80 ml-1">
                                    (from {pos.delegated_from})
                                  </span>
                                )}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No positions assigned</span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-5">
                    {emp.primary_role_id ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-lg border border-emerald-100">
                        <ShieldCheck size={12} /> AUTHORIZED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black rounded-lg border border-amber-100 shadow-sm shadow-amber-100/50">
                        <ShieldAlert size={12} /> PENDING
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-2">
                        {empRoles.length > 0 ? (
                          empRoles.map((role: any, idx: number) => (
                            <span 
                              key={`${emp.id}-role-${idx}`} 
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase transition-all
                                ${role.is_primary 
                                  ? "bg-blue-600 text-white shadow-sm ring-2 ring-blue-100" 
                                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                }`}
                            >
                              {role.is_primary && <Star size={10} fill="currentColor" />}
                              {role.name.replace(/_/g, ' ')}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No roles assigned</span>
                        )}
                      </div>

                      {emp.permission_ids && emp.permission_ids.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span 
                            title={emp.permission_names?.join(", ")}
                            className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 text-slate-400 text-[9px] font-bold rounded border border-slate-100 hover:bg-white hover:text-blue-500 hover:border-blue-200 transition-colors cursor-help"
                          >
                            <Key size={10} />
                            {emp.permission_ids.length} ACCESS RIGHTS
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-8 py-5 text-right">
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-full group-hover:bg-blue-100 transition-all">
                      <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Sub-Components (Keep these at bottom) ---

function FilterButton({ active, onClick, label }: any) {
  return (
    <button 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`px-4 py-1.5 text-[11px] font-black rounded-lg transition-all 
        ${active 
          ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-200/50' 
          : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
        }`}
    >
      {label}
    </button>
  );
}

function TableSkeleton() {
  return (
    <div className="p-8 space-y-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex gap-4 items-center animate-pulse">
          <div className="w-10 h-10 bg-slate-100 rounded-xl" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-100 rounded w-1/4" />
            <div className="h-3 bg-slate-50 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}