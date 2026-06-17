"use client";

import { useState } from "react";
import { BookOpen, ChevronDown, ChevronRight } from "lucide-react";
import { useFrameworks, useFramework } from "@/features/lims/consultancy/consultancy.queries";
import type { ComplianceClause } from "@/features/lims/consultancy/consultancy.api";

function ClauseTree({
  clauses,
  parentId = null,
  depth = 0,
}: {
  clauses: ComplianceClause[];
  parentId?: number | null;
  depth?: number;
}) {
  const children = clauses.filter((c) => c.parent_clause_id === parentId);

  return (
    <>
      {children.map((clause) => (
        <ClauseNode key={clause.id} clause={clause} allClauses={clauses} depth={depth} />
      ))}
    </>
  );
}

function ClauseNode({
  clause,
  allClauses,
  depth,
}: {
  clause: ComplianceClause;
  allClauses: ComplianceClause[];
  depth: number;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const children = allClauses.filter((c) => c.parent_clause_id === clause.id);
  const hasChildren = children.length > 0;

  return (
    <div>
      <div
        className={`flex items-start gap-2 py-2 px-3 rounded hover:bg-muted/50 transition-colors cursor-pointer ${depth === 0 ? "font-semibold" : ""}`}
        style={{ paddingLeft: `${12 + depth * 20}px` }}
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-shrink-0 mt-0.5 w-4">
          {hasChildren ? (
            expanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          ) : null}
        </div>
        <span className="text-xs font-mono text-muted-foreground w-10 flex-shrink-0">{clause.clause_number}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm leading-snug ${depth === 0 ? "font-semibold" : ""}`}>{clause.title}</p>
          {clause.description && expanded && (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{clause.description}</p>
          )}
        </div>
      </div>
      {expanded && hasChildren && (
        <ClauseTree clauses={allClauses} parentId={clause.id} depth={depth + 1} />
      )}
    </div>
  );
}

export default function FrameworksPage() {
  const { data: frameworks = [], isLoading } = useFrameworks();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const { data: detail, isLoading: loadingDetail } = useFramework(selectedId ?? 0);

  const selected = selectedId ? detail : null;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Compliance Frameworks</h1>
        <p className="text-sm text-muted-foreground">View available accreditation standards and their clause structures</p>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground animate-pulse">Loading frameworks…</p>}

      <div className="flex gap-4">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 border rounded-lg overflow-hidden">
          {frameworks.map((fw) => (
            <button
              key={fw.id}
              onClick={() => setSelectedId(fw.id)}
              className={`w-full text-left px-4 py-3 border-b hover:bg-muted transition-colors ${
                selectedId === fw.id ? "bg-muted border-l-2 border-l-primary" : ""
              }`}
            >
              <p className="text-xs font-mono font-semibold text-primary">{fw.code}</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{fw.name}</p>
              {fw.version && <p className="text-xs text-muted-foreground opacity-70">v{fw.version}</p>}
            </button>
          ))}
        </div>

        {/* Detail */}
        <div className="flex-1 min-w-0">
          {!selectedId && (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
              <BookOpen className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-sm">Select a framework to view its clauses</p>
            </div>
          )}
          {selectedId && loadingDetail && (
            <p className="text-sm text-muted-foreground animate-pulse">Loading clauses…</p>
          )}
          {selected && (
            <div className="border rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/30">
                <p className="font-semibold text-sm">{selected.name}</p>
                {selected.version && <p className="text-xs text-muted-foreground">Version {selected.version}</p>}
                {selected.description && (
                  <p className="text-xs text-muted-foreground mt-1">{selected.description}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">{selected.clauses.length} clauses</p>
              </div>
              <div className="max-h-[calc(100vh-16rem)] overflow-y-auto">
                <ClauseTree clauses={selected.clauses} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
