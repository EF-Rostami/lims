"use client";

import React, { useState, useMemo } from "react";
import { DelegationTable } from "@/components/delegation/DelegationTable";
import { DelegationModal } from "@/components/delegation/DelegationModal";
import { useListDelegations, useRevokeDelegation } from "@/services/delegation/delegation.hooks";
// Removed 'Printer' from this import to fix ESLint error
import { ShieldCheck, RefreshCcw, Search, Plus } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DelegationAdminPage() {
  const { data: delegations, isLoading, refetch } = useListDelegations();
  const revokeMutation = useRevokeDelegation();
  
  const [searchQuery, setSearchQuery] = useState("");
  
  // 1. ADD STATE FOR MODAL (Fixes the TS Error)
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter Logic
  const filteredDelegations = useMemo(() => {
    if (!delegations) return [];
    if (!searchQuery) return delegations;

    const query = searchQuery.toLowerCase();
    return delegations.filter((d) => 
      d.deputy_name.toLowerCase().includes(query) || 
      d.position_title.toLowerCase().includes(query) ||
      d.primary_name.toLowerCase().includes(query)
    );
  }, [delegations, searchQuery]);

  const handleRevoke = (id: number) => {
    if (confirm("Are you sure you want to revoke this authority immediately?")) {
      revokeMutation.mutate(id);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-blue-600" size={32} />
            Authority Oversight
          </h1>
          <p className="text-slate-500 font-medium">
            ISO 17025 Compliance: Monitoring Laboratory Personnel Authorizations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => refetch()} className="bg-white">
            <RefreshCcw size={16} className={isLoading ? "animate-spin" : ""} />
          </Button>
          
          {/* 2. TRIGGER BUTTON TO OPEN MODAL */}
          <Button onClick={() => setIsModalOpen(true)} className="rounded-xl shadow-lg gap-2">
            <Plus size={16} /> New Delegation
          </Button>
        </div>
      </div>

      {/* ... (Stats cards remain exactly the exact same) ... */}

      {/* SEARCH BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-4 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Search by Deputy, Position, or Primary User..." 
            className="pl-10 border-none bg-slate-50 rounded-xl focus-visible:ring-blue-500 h-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden min-h-100">
        <DelegationTable 
          data={filteredDelegations} 
          isLoading={isLoading} 
          onRevoke={handleRevoke} 
        />
      </div>

      {/* 3. PASS PROPS TO THE MODAL (Fixes TS Error) */}
      <DelegationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}