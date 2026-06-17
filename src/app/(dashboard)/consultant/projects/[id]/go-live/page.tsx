"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Rocket, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReadiness, useExecuteGoLive, useTemplates, useProvisionTemplate } from "@/features/lims/consultancy/consultancy.queries";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function GoLivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const projectId = Number(id);

  const { data: report, isLoading, refetch } = useReadiness(projectId);
  const executeGoLive = useExecuteGoLive(projectId);
  const { data: templates = [] } = useTemplates();
  const provision = useProvisionTemplate(projectId);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [provisionOpen, setProvisionOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<number>(0);

  const handleGoLive = async () => {
    await executeGoLive.mutateAsync();
    setConfirmOpen(false);
    refetch();
  };

  const handleProvision = async () => {
    if (!selectedTemplate) return;
    await provision.mutateAsync(selectedTemplate);
    setProvisionOpen(false);
    refetch();
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Link href={`/consultant/projects/${projectId}`} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-lg font-semibold">Go-Live Readiness</h1>
        <div className="flex-1" />
        <Button size="sm" variant="outline" onClick={() => refetch()} className="h-7 text-xs">
          <RefreshCw className="h-3 w-3 mr-1" />Refresh
        </Button>
        <Button size="sm" variant="outline" onClick={() => setProvisionOpen(true)} className="h-7 text-xs">
          Provision Template
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground animate-pulse">Running readiness checks…</p>}

      {report && (
        <>
          {/* Overall status */}
          <div className={`border rounded-lg p-4 flex items-center gap-3 ${report.all_passed ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
            {report.all_passed ? (
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
            ) : (
              <XCircle className="h-6 w-6 text-amber-500 flex-shrink-0" />
            )}
            <div>
              <p className={`font-semibold text-sm ${report.all_passed ? "text-green-700" : "text-amber-700"}`}>
                {report.all_passed ? "Ready for Go-Live" : "Not Yet Ready"}
              </p>
              <p className="text-xs text-muted-foreground">
                {report.checks.filter((c) => c.passed).length} / {report.checks.length} checks passed
              </p>
            </div>
            {report.all_passed && (
              <div className="flex-1 flex justify-end">
                <Button size="sm" onClick={() => setConfirmOpen(true)}>
                  <Rocket className="h-3.5 w-3.5 mr-1.5" />Execute Go-Live
                </Button>
              </div>
            )}
          </div>

          {/* Individual checks */}
          <div className="space-y-2">
            {report.checks.map((check) => (
              <div
                key={check.name}
                className={`border rounded-lg px-4 py-3 flex items-start gap-3 ${
                  check.passed ? "border-green-100" : "border-red-100"
                }`}
              >
                {check.passed ? (
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{check.name.replace(/_/g, " ")}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{check.details}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Go-Live confirmation */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Confirm Go-Live</DialogTitle></DialogHeader>
          <div className="space-y-2 py-2">
            <p className="text-sm text-muted-foreground">
              This will mark the project as COMPLETED and record today as the actual go-live date.
            </p>
            <p className="text-sm font-medium text-amber-700">This action cannot be undone through the UI.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleGoLive} disabled={executeGoLive.isPending}>
              {executeGoLive.isPending ? "Executing…" : "Confirm Go-Live"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Provision template */}
      <Dialog open={provisionOpen} onOpenChange={setProvisionOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Provision from Template</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-xs text-muted-foreground">
              This will create tasks, draft documents, link methods, and generate a pre-populated gap assessment
              from the selected framework template. Running twice is safe — it is idempotent.
            </p>
            <select
              className="w-full border rounded px-2 py-1.5 text-sm bg-background"
              value={selectedTemplate || ""}
              onChange={(e) => setSelectedTemplate(Number(e.target.value))}
            >
              <option value="">Select template…</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProvisionOpen(false)}>Cancel</Button>
            <Button onClick={handleProvision} disabled={!selectedTemplate || provision.isPending}>
              {provision.isPending ? "Provisioning…" : "Provision"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
