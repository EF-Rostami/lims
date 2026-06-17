"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { LimsPageLayout } from "@/features/lims/components/LimsPageLayout";
import { LimsTable } from "@/features/lims/components/LimsTable";
import { useAuditLogs } from "./audit-logs.queries";
import type { AuditLogEntry, ListAuditLogsParams } from "./audit-logs.api";

export function AuditLogsPage() {
  const [filters, setFilters] = useState<ListAuditLogsParams>({ page: 1, page_size: 50 });
  const [draft, setDraft] = useState({ entity_type: "", action: "" });

  const { data, isLoading } = useAuditLogs(filters);
  const logs: AuditLogEntry[] = data?.data ?? [];

  const applyFilters = () =>
    setFilters((f) => ({
      ...f,
      entity_type: draft.entity_type || undefined,
      action: draft.action || undefined,
      page: 1,
    }));

  return (
    <LimsPageLayout title="Audit Log" description="Immutable record of all system actions">
      {/* Filter bar */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4 shadow-sm">
        <div className="space-y-1 min-w-40">
          <Label className="text-xs">Entity Type</Label>
          <Input
            placeholder="e.g. sample"
            value={draft.entity_type}
            onChange={(e) => setDraft((d) => ({ ...d, entity_type: e.target.value }))}
          />
        </div>
        <div className="space-y-1 min-w-40">
          <Label className="text-xs">Action</Label>
          <Input
            placeholder="e.g. create"
            value={draft.action}
            onChange={(e) => setDraft((d) => ({ ...d, action: e.target.value }))}
          />
        </div>
        <Button onClick={applyFilters} size="sm">
          <Search className="h-3.5 w-3.5 mr-1.5" /> Search
        </Button>
        {data && (
          <span className="ml-auto text-xs text-slate-400">{data.total} total entries</span>
        )}
      </div>

      <LimsTable
        data={logs}
        isLoading={isLoading}
        emptyMessage="No audit log entries match your filters."
        columns={[
          { header: "Time", render: (l) => <span className="text-slate-500 text-xs whitespace-nowrap">{new Date(l.performed_at).toLocaleString()}</span> },
          { header: "Entity", render: (l) => <span className="font-mono text-xs">{l.entity_type ?? "—"} {l.entity_id ? `#${l.entity_id}` : ""}</span> },
          { header: "Action", render: (l) => <span className="font-medium text-sm">{l.action}</span> },
          {
            header: "User",
            render: (l) => l.user_email ? (
              <span className="text-xs text-slate-600">{l.user_email}</span>
            ) : (
              <span className="text-slate-400 text-xs">system</span>
            ),
          },
          {
            header: "Description",
            className: "max-w-xs",
            render: (l) => l.description ? (
              <span className="text-xs text-slate-500 truncate block max-w-xs">{l.description}</span>
            ) : <span className="text-slate-400">—</span>,
          },
        ]}
      />

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={!filters.page || filters.page <= 1}
            onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
          >
            Previous
          </Button>
          <span className="text-sm text-slate-500">
            Page {filters.page ?? 1} of {data.total_pages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={(filters.page ?? 1) >= data.total_pages}
            onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
          >
            Next
          </Button>
        </div>
      )}
    </LimsPageLayout>
  );
}
