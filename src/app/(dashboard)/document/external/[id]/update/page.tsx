//* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function UpdateExternalDocPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Logic: externalDocumentService.update(params.id, data)
    toast.success("External registry updated.");
    router.push(`/document/external/${params.id}`);
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Update Document Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid gap-2">
              <Label>Current Version/Year</Label>
              <Input defaultValue="2017" />
            </div>
            <div className="grid gap-2">
              <Label>Source URL (For Verification)</Label>
              <Input placeholder="https://..." />
            </div>
            <div className="grid gap-2">
              <Label>Upload New Local PDF (Optional)</Label>
              <Input type="file" />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" type="button" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={loading}>Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}