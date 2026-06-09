import { SecurityTab } from "@/features/lims/account/SecurityTab";
import { LimsPageLayout } from "@/features/lims/components/LimsPageLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AccountPage() {
  return (
    <LimsPageLayout title="Account Settings" description="Manage your profile and security preferences">
      <Tabs defaultValue="security">
        <TabsList className="mb-6">
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
      </Tabs>
    </LimsPageLayout>
  );
}
