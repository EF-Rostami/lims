// src/features/non-conformities/components/nc-details-header.tsx
"use client";

import { Badge } from "@/components/ui/badge";

interface NCDetailsHeaderProps {
  nc: {
    nc_number: string; // Changed from control_number to nc_number
    status: string;
    severity?: "minor" | "major" | "critical" | string; // Updated to match your actual schema
  };
}

export function NCDetailsHeader({ nc }: NCDetailsHeaderProps) {
  const statusColors: Record<string, string> = {
    open: "bg-blue-100 text-blue-800 border-blue-200",
    in_progress: "bg-amber-100 text-amber-800 border-amber-200",
    closed: "bg-green-100 text-green-800 border-green-200",
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          {/* Use nc_number here */}
          <h2 className="text-3xl font-bold tracking-tight">{nc.nc_number}</h2>
          <p className="text-sm text-muted-foreground">
            Non-Conformity Management System
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={statusColors[nc.status] || ""}>
            {nc.status.replace("_", " ").toUpperCase()}
          </Badge>
        </div>
      </div>
    </div>
  );
}