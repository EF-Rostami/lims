/* eslint-disable @typescript-eslint/no-unused-vars */
// src/features/audit/components/resource-audit-history.tsx
"use client";

import { useResourceAuditHistory } from "../api/audit.hooks"; // Using your shared hook
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, User, FileText, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function ResourceAuditHistory({ resourceId, resourceType }: { resourceId: number; resourceType: string }) {
  // Mapping 'resourceType' to 'tableName' as expected by your hook
  const { data: logs, isLoading } = useResourceAuditHistory(resourceType, resourceId);

  if (isLoading) return (
    <div className="space-y-3">
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-10 border-2 border-dashed rounded-lg">
        <p className="text-sm text-muted-foreground">No audit trail records found for this resource.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-6 pl-6 before:absolute before:left-2.75 before:top-2 before:h-[calc(100%-12px)] before:w-0.5 before:bg-muted">
      {logs.map((log) => (
        <div key={log.id} className="relative">
          <div className="absolute -left-5.75 top-1 flex h-6 w-6 items-center justify-center rounded-full border bg-background shadow-sm">
            <Clock className="h-3 w-3 text-muted-foreground" />
          </div>
          <Card className="overflow-hidden border-l-4 border-l-amber-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-3 w-3 text-primary" />
                  </div>
                  <span className="text-sm font-semibold">User #{log.user_id}</span>
                </div>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                  {log.action.replace("_", " ")}
                </Badge>
              </div>

              {/* The "Reason" is the most important part for ISO compliance */}
              <div className="bg-amber-50/50 dark:bg-amber-950/20 p-3 rounded-md text-sm border border-amber-100 dark:border-amber-900 flex items-start gap-3">
                <FileText className="h-4 w-4 mt-0.5 text-amber-600 shrink-0" />
                <p className="italic text-muted-foreground">
                  &quot;{log.change_reason || "No reason provided."}&quot;
                </p>
              </div>

              {/* Optional: Show value diffs if your log schema includes them */}
              {log.new_values && (
                <div className="mt-3 pt-3 border-t text-[11px] flex flex-wrap gap-2">
                   <span className="text-muted-foreground font-medium uppercase">Change detected in:</span>
                   {Object.keys(log.new_values).map(key => (
                     <Badge key={key} variant="outline" className="text-[10px]">{key}</Badge>
                   ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}