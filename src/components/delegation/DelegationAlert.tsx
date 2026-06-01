/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck, Info } from "lucide-react";
import { format } from "date-fns";
import { useActiveDelegations } from "@/services/delegation/delegation.hooks";

export const DelegationAlert = ({ currentUserId }: { currentUserId: number }) => {
  const { data: delegations } = useActiveDelegations();

  // Filter for delegations where I am the DEPUTY and it is currently active
  const activeAssignments = delegations?.filter(
    (d) => d.deputy_employee_id === currentUserId && d.status === "active"
  );

  if (!activeAssignments || activeAssignments.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {activeAssignments.map((del) => (
        <Alert key={del.id} variant="default" className="border-blue-500 bg-blue-50/50">
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-700 font-bold">
            Acting Authority Active
          </AlertTitle>
          <AlertDescription className="text-blue-600">
            You are currently acting as a Deputy for **{del.position_title}** (Delegated from **{del.primary_name}**). 
            Ends: {format(new Date(del.end_date), "PPP p")}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};