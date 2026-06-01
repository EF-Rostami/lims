"use client";

import { NCActionItems } from "@/features/non-conformities/components/nc-action-items";
import { ResourceAuditHistory } from "@/features/audit/components/resource-audit-history";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NCDetailsHeader } from "@/features/non-conformities/components/nc-details-header";
import { useNonConformity } from "@/features/non-conformities/api/non-conformities.hooks";
import { NCGeneralInfo } from "@/features/non-conformities/components/nc-general-info";

export default function NCDetailPage({ params }: { params: { id: string } }) {
  const ncId = parseInt(params.id);
  const { data: nc, isLoading } = useNonConformity(ncId);

  if (isLoading) return <div className="p-8">Loading Non-Conformity...</div>;
  if (!nc) return <div className="p-8">Non-Conformity not found.</div>;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Pass the WHOLE nc object */}
      <NCDetailsHeader nc={nc} />
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General Info</TabsTrigger>
          <TabsTrigger value="actions">Action Items</TabsTrigger>
          <TabsTrigger value="history">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          {/* Pass the WHOLE nc object */}
          <NCGeneralInfo nc={nc} />
        </TabsContent>

        <TabsContent value="actions">
          <NCActionItems ncId={ncId} />
        </TabsContent>

        <TabsContent value="history">
          {/* Update props to match what the component expects */}
          <ResourceAuditHistory 
            resourceId={ncId} 
            resourceType="non_conformities" 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}