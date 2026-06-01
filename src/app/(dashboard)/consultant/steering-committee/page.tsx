"use client";

import React, { useState, useMemo } from "react";
import { 
  ShieldCheck, UserPlus, Loader2, Settings2, 
  X, Search, CheckCircle, ChevronRight, Info,
  UserCheck, Clock, AlertCircle 
} from "lucide-react";
import { useEmployees } from "@/services/employee/employee.hooks";
import EmployeeRegistrationForm from "@/components/employee/EmployeeRegistrationForm";

import type { Schema } from "@/types/api-types";
import EmployeeDetailView from "@/components/employee/EmployeeDetailView";

type Employee = Schema["EmployeeResponse"];

const STEER_CO_ROLE = "steering_committee";

export default function SteeringCommitteePage() {
  const { data: employees = [], isLoading } = useEmployees();
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [viewingDetailId, setViewingDetailId] = useState<number | null>(null);

  // --- Logic: Search & Filtering ---
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => 
      `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const committeeMembers = useMemo(() => 
    employees.filter((emp) => emp.roles_list?.some(role => role.name.toLowerCase() === STEER_CO_ROLE.toLowerCase())),
  [employees]);

  // --- Action Handlers ---
  const openRegisterModal = () => {
    setSelectedEmployee(null); // Key for "Create Mode"
    setIsModalOpen(true);
  };

  const openEditModal = (e: React.MouseEvent, emp: Employee) => {
    e.stopPropagation(); // Prevents opening Detail View
    setSelectedEmployee(emp);
    setIsModalOpen(true);
  };

  // --- Helper: Status Badge Renderer ---
  const renderStatus = (emp: Employee) => {
    // Logic: If they have roles/permissions, they are 'Active', else 'Pending'
    const isActive = (emp.roles_list?.length ?? 0) > 0;
    return isActive ? (
      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100">
        <UserCheck size={12} /> ACTIVE
      </span>
    ) : (
      <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-lg border border-amber-100">
        <Clock size={12} /> PENDING AUTH
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-slate-500 font-bold tracking-tight">Accessing Personnel Registry...</p>
      </div>
    );
  }

  // --- View Switcher: Show Detail Page ---
  if (viewingDetailId) {
    return <EmployeeDetailView id={viewingDetailId} onEditClick={() => setViewingDetailId(null)} />;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 border-b border-slate-100 pb-10">
        <div className="space-y-6">
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Steering Committee</h1>
            <p className="text-slate-500 text-lg font-medium">Designate laboratory leadership and manage system-wide authorizations.</p>
          </div>
          
          <button 
            onClick={openRegisterModal}
            className="group flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95"
          >
            <UserPlus size={20} className="group-hover:rotate-12 transition-transform" />
            <span>Register New Personnel</span>
          </button>
        </div>

        <div className="relative group w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            placeholder="Search by name or department..." 
            className="pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-4xl text-sm w-full focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT: PERSONNEL LIST */}
        <section className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="font-extrabold text-xl text-slate-800 tracking-tight">Personnel Directory</h2>
            <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"/> Authorized</span>
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"/> Pending</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm divide-y divide-slate-100 overflow-hidden">
            {filteredEmployees.length > 0 ? filteredEmployees.map((emp) => {
              const isCommittee = emp.roles_list?.some (role => role.name.toLowerCase() === STEER_CO_ROLE.toLowerCase());
              
              return (
                <div 
                  key={emp.id} 
                  onClick={() => setViewingDetailId(emp.id)}
                  className="p-6 flex justify-between items-center hover:bg-slate-50/80 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm transition-transform group-hover:scale-110 ${
                      isCommittee ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {emp.first_name[0]}{emp.last_name[0]}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{emp.full_name}</p>
                        {renderStatus(emp)}
                      </div>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
                        {emp.primary_department_name || "Unassigned"} •{" "}
                        {emp.positions_list?.[0]?.title || "Staff"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={(e) => openEditModal(e, emp)}
                      className="opacity-0 group-hover:opacity-100 flex items-center gap-2 px-4 py-2 bg-white text-slate-600 hover:text-blue-600 rounded-xl transition-all border border-slate-200 hover:border-blue-200 shadow-sm"
                    >
                      <Settings2 size={16} />
                      <span className="text-[10px] font-black uppercase">Authorize</span>
                    </button>
                    <ChevronRight size={20} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            }) : (
              <div className="p-20 text-center space-y-4">
                <AlertCircle className="mx-auto text-slate-200" size={48} />
                <p className="text-slate-400 font-medium">No personnel found matching your search.</p>
              </div>
            )}
          </div>
        </section>

        {/* RIGHT: COMMITTEE BOARD */}
        <section className="lg:col-span-5">
           <div className="sticky top-8 bg-slate-900 rounded-[3rem] p-10 shadow-2xl overflow-hidden min-h-125">
             {/* Gradient Overlay */}
             <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/20 blur-[100px] -mr-40 -mt-40 rounded-full" />
             
             <div className="relative z-10 space-y-10">
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-white flex items-center gap-4">
                    <ShieldCheck className="text-blue-400" size={32} /> The Board
                  </h2>
                  <p className="text-slate-400 text-sm">Active members with voting and oversight privileges.</p>
                </div>

                <div className="space-y-4">
                  {committeeMembers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-slate-500 border border-dashed border-slate-800 rounded-[2rem]">
                      <Info size={32} className="mb-4 text-slate-700" />
                      <p className="italic text-sm">No voting members designated.</p>
                    </div>
                  ) : (
                    committeeMembers.map((m) => (
                      <div key={m.id} className="flex items-center gap-5 bg-slate-800/30 p-5 rounded-[1.5rem] border border-slate-700/50 hover:border-blue-500/50 transition-colors">
                        <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center font-black text-white shadow-lg">
                          {m.first_name[0]}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-white leading-tight">{m.full_name}</p>
                          <p className="text-[10px] text-blue-400 font-black uppercase tracking-tighter mt-0.5">Primary Voting Delegate</p>
                        </div>
                        <CheckCircle size={20} className="text-blue-500" />
                      </div>
                    ))
                  )}
                </div>
             </div>
           </div>
        </section>
      </div>

      {/* MODAL: REGISTER / EDIT */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-white/20">
            <div className="px-12 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  {selectedEmployee ? <Settings2 size={28} /> : <UserPlus size={28} />}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    {selectedEmployee ? "Update Authorization" : "New Personnel Registration"}
                  </h3>
                  <p className="text-sm text-slate-500 font-semibold">
                    {selectedEmployee ? `Modifying access for ${selectedEmployee.full_name}` : "Provision a new laboratory user account"}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-4 hover:bg-white hover:shadow-md rounded-2xl transition-all group"
              >
                <X size={24} className="text-slate-400 group-hover:text-red-500" />
              </button>
            </div>
            
            <div className="p-12 overflow-y-auto">
              <EmployeeRegistrationForm 
                key={selectedEmployee?.id || "create-new"} 
                employeeToEdit={selectedEmployee ?? undefined} 
                onComplete={() => {
                  setSelectedEmployee(null);
                  setIsModalOpen(false);
                }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}