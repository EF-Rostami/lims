// @ts-nocheck — legacy QMS/document pages pending backend_v3 migration
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { 
  FileCheck, 
  AlertTriangle, 
  Clock, 
  FileWarning, 
  ArrowUpRight,
  ShieldAlert
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { internalDocumentService } from "@/services/internalDocument/internalDocument.service";
import { externalDocumentService } from "@/services/externalDocument/externalDocument.service";

export default function DocumentAnalyticsPage() {
  const [stats, setStats] = useState<any>({
    internalTotal: 0,
    internalPending: 0,
    externalOverdue: 0,
    tasksCount: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [internal, tasks, overdue] = await Promise.all([
          internalDocumentService.list(),
          internalDocumentService.getMyTasks(),
          externalDocumentService.getOverdue()
        ]);

        setStats({
          internalTotal: (internal as any).data?.length || 0,
          internalPending: (internal as any).data?.filter((d: any) => d.status.includes('PENDING')).length || 0,
          tasksCount: (tasks as any).data?.length || 0,
          externalOverdue: (overdue as any).data?.length || 0
        });
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Document Control Center</h1>
        <p className="text-muted-foreground">Compliance overview for internal SOPs and external standards.</p>
      </div>

      {/* Primary KPI Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="My Action Items" 
          value={stats.tasksCount} 
          subtitle="Pending signatures" 
          icon={<FileCheck className="h-4 w-4 text-blue-600" />}
          link="/document/workspace"
        />
        <StatsCard 
          title="In Review" 
          value={stats.internalPending} 
          subtitle="Internal documents" 
          icon={<Clock className="h-4 w-4 text-amber-600" />}
          link="/document/internal"
        />
        <StatsCard 
          title="Overdue Standards" 
          value={stats.externalOverdue} 
          subtitle="External registry" 
          icon={<AlertTriangle className="h-4 w-4 text-red-600" />}
          link="/document/external"
          critical={stats.externalOverdue > 0}
        />
        <StatsCard 
          title="Total Controlled" 
          value={stats.internalTotal} 
          subtitle="Active library items" 
          icon={<ShieldAlert className="h-4 w-4 text-slate-600" />}
          link="/document/library"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Quick Actions */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Compliance Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Internal Review Completion</span>
                <span className="font-bold">75%</span>
              </div>
              <Progress value={75} className="bg-slate-100" />
            </div>
            <div className="pt-4 grid grid-cols-2 gap-4">
               <Button asChild variant="outline" className="justify-start gap-2 h-12">
                  <Link href="/document/internal/new">
                    <ArrowUpRight className="h-4 w-4 text-blue-500" /> Draft New SOP
                  </Link>
               </Button>
               <Button asChild variant="outline" className="justify-start gap-2 h-12">
                  <Link href="/document/external/register">
                    <ArrowUpRight className="h-4 w-4 text-green-500" /> Register Standard
                  </Link>
               </Button>
            </div>
          </CardContent>
        </Card>

        {/* Warning Panel */}
        <Card className="lg:col-span-3 border-red-100 bg-red-50/20">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <FileWarning className="h-5 w-5" /> Urgent Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.externalOverdue > 0 ? (
              <p className="text-sm text-red-700">
                There are <b>{stats.externalOverdue}</b> external documents that have passed their review date. 
                These must be verified to ensure lab compliance with ISO 17025 Section 8.3.
              </p>
            ) : (
              <p className="text-sm text-slate-500 italic">No critical compliance issues detected.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, subtitle, icon, link, critical }: any) {
  return (
    <Card className={critical ? "border-red-200 animate-pulse" : ""}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mb-4">{subtitle}</p>
        <Button variant="link" size="sm" className="px-0 text-blue-600 h-auto" asChild>
          <Link href={link}>View items →</Link>
        </Button>
      </CardContent>
    </Card>
  );
}