"use client";

import React, { useState } from "react";
import { useUserStore } from "@/store/useUserStore";
import { useListDelegations, useRevokeDelegation } from "@/services/delegation/delegation.hooks"; // Added revoke hook
import { DelegationTable } from "./DelegationTable";
import { DelegationModal } from "./DelegationModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const DelegationPage = () => {
  const user = useUserStore((state) => state.user);
  const isAdmin = user?.roles.includes ("admin");
  
  const { data: delegations, isLoading } = useListDelegations();
  const revokeMutation = useRevokeDelegation(); // 1. Added the mutation hook

  // 2. State for the controlled modal (Fixes error #1)
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 3. Handle revoke function (Fixes error #2)
  const handleRevoke = (id: number) => {
    if (confirm("Are you sure you want to revoke this authority immediately?")) {
      revokeMutation.mutate(id);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isAdmin ? "Global Authority Oversight" : "My Delegations"}
          </h1>
          <p className="text-slate-500">
            {isAdmin 
              ? "Monitor and manage all acting authorities across the laboratory." 
              : "Manage your acting roles and deputy assignments."}
          </p>
        </div>
        
        {/* Updated trigger method */}
        <Button onClick={() => setIsModalOpen(true)} className="rounded-full shadow-lg">
          <Plus className="mr-2 h-4 w-4" /> New Delegation
        </Button>
      </div>

      <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
        {/* Added onRevoke prop here (Fixes error #2) */}
        <DelegationTable 
          data={delegations} 
          isLoading={isLoading} 
          onRevoke={handleRevoke} 
        />
      </div>

      {/* Moved modal here and passed required props (Fixes error #1) */}
      <DelegationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};