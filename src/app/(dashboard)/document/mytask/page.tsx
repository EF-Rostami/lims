/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ClipboardCheck, 
  ArrowRight, 
  Clock, 
  FileText, 
  AlertCircle,
  CheckCircle2
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { internalDocumentService } from "@/services/internalDocument/internalDocument.service";

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await internalDocumentService.getMyTasks();
        // Handle response data wrapper
        setTasks((res as any).data || res);
      } catch (err) {
        console.error("Failed to load tasks", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-62.5" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">My Action Items</h1>
        <p className="text-muted-foreground">
          Documents requiring your technical verification or approval.
        </p>
      </div>

      {tasks.length === 0 ? (
        <Card className="bg-slate-50/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-4 opacity-20" />
            <h3 className="text-lg font-medium">All caught up!</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              There are no documents currently awaiting your signature.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {tasks.map((task) => (
            <Card key={task.id} className="hover:border-blue-300 transition-colors">
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  {/* Status Indicator Bar */}
                  <div className={`w-1.5 ${
                    task.status === 'PENDING_APPROVAL' ? 'bg-purple-500' : 'bg-blue-500'
                  }`} />
                  
                  <div className="flex-1 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono text-[10px]">
                          {task.system_id}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> 
                          Created {new Date(task.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg">{task.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" /> 
                          {task.type_meta?.name || "Internal Document"}
                        </span>
                        <span className="flex items-center gap-1">
                          <ClipboardCheck className="h-4 w-4" />
                          Role: <span className="font-medium text-foreground">
                            {task.user_role_in_task || "Reviewer"}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <div className="text-right hidden md:block mr-4">
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Current Status</p>
                        <p className="text-sm font-medium">{task.status.replace("_", " ")}</p>
                      </div>
                      <Button asChild className="w-full md:w-auto gap-2">
                        <Link href={`/document/internal/${task.id}`}>
                          Review & Sign
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Alert className="bg-blue-50 border-blue-100 mt-8">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <CardDescription className="text-blue-800 text-xs">
          <b>Note:</b> Electronic signatures performed in this system are legally binding and 
          traceable per ISO 17025 audit trail requirements.
        </CardDescription>
      </Alert>
    </div>
  );
}

// Simple Alert replacement if you don't have the component
function Alert({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={`p-4 rounded-lg flex gap-3 items-start ${className}`}>{children}</div>
}