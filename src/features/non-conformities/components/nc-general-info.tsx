/* eslint-disable @typescript-eslint/no-explicit-any */
// src/features/non-conformities/components/nc-general-info.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function NCGeneralInfo({ nc }: { nc: any }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Description of Non-Conformity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
            {nc.description}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Department:</span>
            <span className="font-medium">{nc.department || "Quality Control"}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Reported By:</span>
            <span className="font-medium">User ID: {nc.created_by_id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Detected Date:</span>
            <span className="font-medium">{nc.detected_date}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}