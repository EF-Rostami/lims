"use client";

import { useActionItems, useVerifyAction } from "@/features/action-items/api/action-items.hooks";
import { ActionItem } from "@/features/action-items/api/action-items.types"; // Import the type
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function NCActionItems({ ncId }: { ncId: number }) {
  const { data: actions, isLoading } = useActionItems({ nc_id: ncId });
  const verifyMutation = useVerifyAction();

  if (isLoading) return <div className="p-4 text-center">Loading actions...</div>;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Target Date</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {actions?.map((action: ActionItem) => {
            // Fix: Standardize status check to uppercase to match backend
            const isClosed = action.status === "closed";
            const isPendingVerif = action.status === "verification_due";

            return (
              <TableRow key={action.id}>
                <TableCell className="font-medium">{action.description}</TableCell>
                <TableCell className="capitalize">{action.action_type.toLowerCase()}</TableCell>
                <TableCell>
                  <Badge 
                    // Fix: Strictly use "outline" or "secondary" to satisfy TS
                    variant={isClosed ? "outline" : "secondary"}
                    className={isClosed ? "border-green-600 text-green-600" : ""}
                  >
                    {action.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(action.target_date).toLocaleDateString()}</TableCell>
                <TableCell>
                  {isPendingVerif && (
                    <Button 
                      size="sm" 
                      onClick={() => verifyMutation.mutate({ 
                        id: action.id, 
                        data: { verification_notes: "Effectiveness confirmed during review." } 
                      })}
                    >
                      Verify & Close
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}