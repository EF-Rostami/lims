"use client";

import React, { useState, useMemo } from "react";
import { ShieldCheck, UserPlus, Loader2, Settings2, X, Search, CheckCircle } from "lucide-react";
import { useEmployees } from "@/services/employee/employee.hooks";
import EmployeeRegistrationForm from "@/components/employee/EmployeeRegistrationForm";

// 1. Define a local interface to help TypeScript understand the 'emp' object
interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  roles?: string[];
  department?: { name: string } | string | null; // Handles both object and string
  // ... add other fields as needed
}

const STEER_CO_ROLE = "steering_committee";

export default function SteeringCommitteePage() {
  const { data: employees = [] as Employee[], isLoading } = useEmployees();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const filteredEmployees = useMemo(() => {
    return (employees as Employee[]).filter(emp => 
      `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const committeeMembers = useMemo(() => 
    (employees as Employee[]).filter((emp) => emp.roles?.includes(STEER_CO_ROLE)),
  [employees]);

  const openEditModal = (emp: Employee) => {
    setSelectedEmployee(emp);
    setIsModalOpen(true);
  };

  if (isLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <header className="border-b pb-6 flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Steering Committee</h1>
           <p className="text-gray-500 text-sm">Designate leadership and manage granular authorizations.</p>
        </div>
        <div className="relative">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
           <input 
            placeholder="Search personnel..." 
            className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm w-64 focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setSearchTerm(e.target.value)}
           />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* --- LEFT: SELECTION LIST --- */}
        <section className="lg:col-span-7 space-y-4">
          <h2 className="font-bold text-lg flex items-center gap-2 text-slate-700">
            <UserPlus size={20} className="text-blue-500" /> Laboratory Personnel
          </h2>
          <div className="bg-white border rounded-2xl divide-y overflow-hidden shadow-sm">
            {filteredEmployees.map((emp) => {
              const isCommittee = emp.roles?.includes(STEER_CO_ROLE);
              
              // FIX for "Property name does not exist on type never"
              // We check if department is an object safely
              const deptDisplay = typeof emp.department === 'object' && emp.department !== null 
                ? (emp.department as { name: string }).name 
                : (emp.department || "General");

              return (
                <div key={emp.id} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      isCommittee ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {emp.first_name[0]}{emp.last_name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{emp.first_name} {emp.last_name}</p>
                      <p className="text-[10px] text-slate-400 font-mono uppercase">
                        {emp.email} • {deptDisplay}
                      </p>
                    </div>
                  </div>

                  {/* THE EDIT BUTTON - Now clearly visible */}
                  <button 
                    onClick={() => openEditModal(emp)}
                    className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100"
                  >
                    <Settings2 size={18} />
                    <span className="text-xs font-bold">Edit Auth</span>
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* --- RIGHT: THE BOARD --- */}
        <section className="lg:col-span-5 bg-slate-900 text-white p-8 rounded-3xl shadow-2xl relative overflow-hidden h-fit">
           <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 border-b border-slate-800 pb-4">
              <ShieldCheck className="text-blue-400" /> Active Committee
            </h2>
            <div className="space-y-3">
              {committeeMembers.length === 0 ? (
                <p className="text-slate-500 italic text-center py-10">No voting members assigned.</p>
              ) : (
                committeeMembers.map((m) => (
                  <div key={m.id} className="flex items-center gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/50">
                    <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-blue-400 rounded-full flex items-center justify-center font-bold">
                      {m.first_name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold">{m.first_name} {m.last_name}</p>
                      <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest">Voting Member</p>
                    </div>
                    <CheckCircle size={16} className="text-blue-500" />
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      {/* --- EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <div className="sticky top-0 bg-white/95 px-8 py-4 border-b flex justify-between items-center z-10">
              <h3 className="text-xl font-bold">Manage Authorization: {selectedEmployee?.first_name}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={24} /></button>
            </div>
            <div className="p-8">
              <EmployeeRegistrationForm 
                key={selectedEmployee?.id} 
                employeeToEdit={selectedEmployee} 
                onComplete={() => setIsModalOpen(false)} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}