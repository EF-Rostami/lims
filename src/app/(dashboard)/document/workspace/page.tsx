// @ts-nocheck — legacy QMS/document pages pending backend_v3 migration
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileEdit, CheckSquare, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { internalDocumentService } from "@/services/internalDocument/internalDocument.service";

export default function DocumentWorkspacePage() {
  const [tasks, setTasks] = useState<any>({ drafts: [], pending: [], reading: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkspace = async () => {
      try {
        // Fetching drafts and signature tasks
        const [draftsRes, tasksRes] = await Promise.all([
          internalDocumentService.list({ status: "DRAFT" }),
          internalDocumentService.getMyTasks()
        ]);
        
        setTasks({
          drafts: (draftsRes as any).data || draftsRes,
          pending: (tasksRes as any).data || tasksRes,
          reading: [] // This would connect to your 'confirmRead' logic later
        });
      } catch (err) {
        console.error("Workspace load error", err);
      } finally {
        setLoading(false);
      }
    };
    loadWorkspace();
  }, []);

  const TaskList = ({ items, type }: { items: any[], type: 'draft' | 'sign' | 'read' }) => (
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground py-10 text-center border rounded-lg border-dashed">
          No items found in this category.
        </p>
      ) : (
        items.map(item => (
          <Card key={item.id} className="hover:border-blue-400 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-mono text-blue-600">{item.system_id}</span>
                <span className="font-medium">{item.title}</span>
                <span className="text-xs text-muted-foreground">Version: {item.current_version_tag}</span>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href={`/document/internal/${item.id}${type === 'draft' ? '/edit' : ''}`}>
                  {type === 'draft' ? 'Continue Editing' : 'Review & Sign'} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold">My Workspace</h1>
        <p className="text-muted-foreground">Manage your active laboratory document tasks.</p>
      </header>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList className="bg-slate-100 p-1">
          <TabsTrigger value="drafts" className="gap-2">
            <FileEdit className="h-4 w-4" /> My Drafts
            <Badge variant="secondary" className="ml-1">{tasks.drafts.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="gap-2">
            <CheckSquare className="h-4 w-4" /> Awaiting My Approval
            <Badge className="ml-1 bg-blue-600">{tasks.pending.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="reading" className="gap-2">
            <BookOpen className="h-4 w-4" /> Required Reading
          </TabsTrigger>
        </TabsList>

        <TabsContent value="drafts">
          <TaskList items={tasks.drafts} type="draft" />
        </TabsContent>
        <TabsContent value="pending">
          <TaskList items={tasks.pending} type="sign" />
        </TabsContent>
        <TabsContent value="reading">
          <TaskList items={tasks.reading} type="read" />
        </TabsContent>
      </Tabs>
    </div>
  );
}