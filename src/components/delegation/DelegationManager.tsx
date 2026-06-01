import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, ShieldAlert, ShieldCheck } from "lucide-react";
import { format } from "date-fns";
import { DelegationModal } from "./DelegationModal";
import { useListDelegations, useRevokeDelegation } from "@/services/delegation/delegation.hooks";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import type { Schema } from "@/types/api-types";
import { useUserStore } from "@/store/useUserStore";

type DelegationResponse = Schema["DelegationResponse"];

// --- Sub-component: DelegationTable ---
interface DelegationTableProps {
  data: DelegationResponse[] | undefined;
  readOnly?: boolean;
  onRevoke: (id: number) => void;
}

const DelegationTable = ({ data, readOnly, onRevoke }: DelegationTableProps) => {
  // 2. THIS LINE MUST BE HERE - Defining the state inside the component
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      planned: "secondary",
      revoked: "destructive",
      expired: "outline",
    };
    return <Badge variant={variants[status] || "outline"}>{status.toUpperCase()}</Badge>;
  };

  return (
    <>
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Deputy </TableHead>
            <TableHead>Position </TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>Period</TableHead>
            <TableHead>Status</TableHead>
            {!readOnly && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                No delegations found.
              </TableCell>
            </TableRow>
          )}
          {data?.map((d) => (
            <TableRow key={d.id}>
              <TableCell>{d.deputy_name}</TableCell>
              <TableCell>{d.position_title}</TableCell>
              <TableCell>
                {d.permission_ids.length === 0 ? (
                  <div className="flex items-center gap-2 text-amber-600">
                    <ShieldAlert size={14} />
                    <span className="text-xs font-bold uppercase tracking-tight">Full Authority</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-emerald-600">
                    <ShieldCheck size={14} />
                    <span className="text-xs font-bold uppercase tracking-tight">
                      {d.permission_ids.length} Restrictions
                    </span>
                  </div>
                )}
              </TableCell>
              <TableCell className="text-sm">
                {format(new Date(d.start_date), "MMM d")} - {format(new Date(d.end_date), "MMM d, yyyy")}
              </TableCell>
              <TableCell>{getStatusBadge(d.status)}</TableCell>
              {!readOnly && (
                <TableCell className="text-right">
                  {d.status !== "revoked" && d.status !== "expired" && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive"
                      onClick={() => onRevoke(d.id)}
                    >
                      Revoke
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
    {/* Confirmation Dialog */}
      <AlertDialog open={confirmId !== null} onOpenChange={() => setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke Authority?</AlertDialogTitle>
            <AlertDialogDescription>
              This will immediately cancel the delegated authority. The deputy will no longer 
              be able to sign off on technical documents for this position. This action is 
              logged for audit purposes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmId) onRevoke(confirmId);
                setConfirmId(null);
              }}
            >
              Confirm Revocation
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// --- Main Component ---
export const DelegationManager = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
//   const { user } = useAuth(); // Get current logged in user
  const user = useUserStore((state) => state.user);
  const { data: delegations, isLoading } = useListDelegations();
  const revokeMutation = useRevokeDelegation();

  // Get the ID of the logged in employee profile
  const currentEmployeeId = user?.id;

  if (isLoading) return <div className="p-6">Loading delegations...</div>;

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Authority Delegations</h2>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> New Delegation
        </Button>
      </div>

      <Tabs defaultValue="outgoing" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="outgoing">My Deputies (Who covers me)</TabsTrigger>
          <TabsTrigger value="incoming">My Assignments (Who I cover)</TabsTrigger>
        </TabsList>

        <TabsContent value="outgoing">
          <div className="pt-4">
            <DelegationTable 
              data={delegations?.filter(d => d.primary_employee_id === currentEmployeeId)} 
              onRevoke={(id) => revokeMutation.mutate(id)}
            />
          </div>
        </TabsContent>

        <TabsContent value="incoming">
          <div className="pt-4">
            <DelegationTable 
              data={delegations?.filter(d => d.deputy_employee_id === currentEmployeeId)} 
              readOnly 
              onRevoke={() => {}}
            />
          </div>
        </TabsContent>
      </Tabs>

      <DelegationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};