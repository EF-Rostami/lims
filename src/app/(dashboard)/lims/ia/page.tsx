"use client";

import { useState } from "react";
import {
  useIASummary, useIAPrograms, useCreateIAProgram, useDeleteIAProgram,
  useIAAudits, useIAAudit, useCreateIAAudit, useUpdateIAAudit, useDeleteIAAudit,
  useOpenIAAudit, useReportIAAudit, useCloseIAAudit,
  useAddChecklistItem, useUpdateChecklistItem, useDeleteChecklistItem,
  useCreateIAFinding, useUpdateIAFinding, useCloseIAFinding,
  useLinkCapaFinding, useDeleteIAFinding,
  useIAFindings,
} from "@/features/lims/ia/ia.queries";
import type {
  IAAuditRead, IAAuditSummary, IAChecklistItemRead, IAFindingRead,
  AuditStatus, ChecklistResponse, FindingType, FindingStatus,
} from "@/features/lims/ia/ia.api";

// ── Constants & helpers ───────────────────────────────────────────────────────

const STATUS_LABELS: Record<AuditStatus, string> = {
  planned: "Planned", open: "In Progress", reported: "Reported", closed: "Closed",
};

const STATUS_COLORS: Record<AuditStatus, string> = {
  planned: "bg-slate-100 text-slate-600",
  open: "bg-blue-100 text-blue-700",
  reported: "bg-amber-100 text-amber-700",
  closed: "bg-green-100 text-green-700",
};

const FINDING_LABELS: Record<FindingType, string> = {
  conformity: "Conformity", observation: "Observation",
  minor_nc: "Minor NC", major_nc: "Major NC",
};

const FINDING_COLORS: Record<FindingType, string> = {
  conformity: "bg-green-100 text-green-700",
  observation: "bg-blue-100 text-blue-700",
  minor_nc: "bg-amber-100 text-amber-700",
  major_nc: "bg-red-100 text-red-700",
};

const CHECKLIST_LABELS: Record<ChecklistResponse, string> = {
  conforming: "Conforming", nonconforming: "Non-conforming",
  not_applicable: "N/A", not_assessed: "Not Assessed",
};

const CHECKLIST_COLORS: Record<ChecklistResponse, string> = {
  conforming: "bg-green-100 text-green-700",
  nonconforming: "bg-red-100 text-red-700",
  not_applicable: "bg-slate-100 text-slate-500",
  not_assessed: "bg-yellow-50 text-yellow-600",
};

function StatusBadge({ status }: { status: AuditStatus }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}

function FindingBadge({ type }: { type: FindingType }) {
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${FINDING_COLORS[type]}`}>
      {FINDING_LABELS[type]}
    </span>
  );
}

function fmtDate(d?: string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString();
}

type Tab = "dashboard" | "audits" | "findings";

// ── Dashboard tab ─────────────────────────────────────────────────────────────

function DashboardTab({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  const { data: summary } = useIASummary();
  const { data: audits = [] } = useIAAudits();
  const { data: programs = [] } = useIAPrograms();
  const createProgram = useCreateIAProgram();
  const deleteProgram = useDeleteIAProgram();

  const [showProgForm, setShowProgForm] = useState(false);
  const [progForm, setProgForm] = useState({ name: "", year: new Date().getFullYear().toString(), description: "" });

  async function handleCreateProgram(e: React.FormEvent) {
    e.preventDefault();
    await createProgram.mutateAsync({ name: progForm.name, year: Number(progForm.year), description: progForm.description || null });
    setShowProgForm(false);
    setProgForm({ name: "", year: new Date().getFullYear().toString(), description: "" });
  }

  const openAudits = audits.filter(a => a.status === "open");
  const overdueFindings = summary?.overdue_findings ?? 0;

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      {summary && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Planned", value: summary.planned_audits, color: "text-slate-700", bg: "bg-slate-50" },
            { label: "In Progress", value: summary.open_audits, color: "text-blue-700", bg: "bg-blue-50" },
            { label: "Awaiting Closure", value: summary.reported_audits, color: "text-amber-700", bg: "bg-amber-50" },
            { label: "Closed", value: summary.closed_audits, color: "text-green-700", bg: "bg-green-50" },
          ].map(k => (
            <div key={k.label} className={`${k.bg} border border-slate-200 rounded-xl p-5 text-center`}>
              <div className={`text-3xl font-bold ${k.color}`}>{k.value}</div>
              <div className="text-sm text-slate-500 mt-1">{k.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Open findings summary */}
      {summary && (
        <div
          className="grid grid-cols-4 gap-3 cursor-pointer"
          onClick={() => onNavigate("findings")}
        >
          {[
            { label: "Major NC (open)", value: summary.open_major_nc, color: "text-red-700 bg-red-50 border-red-200" },
            { label: "Minor NC (open)", value: summary.open_minor_nc, color: "text-amber-700 bg-amber-50 border-amber-200" },
            { label: "Observations (open)", value: summary.open_observations, color: "text-blue-700 bg-blue-50 border-blue-200" },
            { label: "Overdue Findings", value: overdueFindings, color: overdueFindings > 0 ? "text-red-700 bg-red-50 border-red-200" : "text-slate-600 bg-slate-50 border-slate-200" },
          ].map(k => (
            <div key={k.label} className={`border rounded-lg p-4 text-center ${k.color}`}>
              <div className="text-2xl font-bold">{k.value}</div>
              <div className="text-xs mt-1">{k.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Audit programmes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-700">Audit Programmes</h3>
            <button onClick={() => setShowProgForm(v => !v)} className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700">
              + New
            </button>
          </div>
          {showProgForm && (
            <form onSubmit={handleCreateProgram} className="mb-3 p-3 border border-slate-200 rounded-lg bg-slate-50 space-y-2">
              <div className="flex gap-2">
                <input placeholder="Programme name" required value={progForm.name}
                  onChange={e => setProgForm(f => ({ ...f, name: e.target.value }))}
                  className="flex-1 border border-slate-300 rounded px-2 py-1 text-sm bg-white"
                />
                <input placeholder="Year" type="number" value={progForm.year}
                  onChange={e => setProgForm(f => ({ ...f, year: e.target.value }))}
                  className="w-20 border border-slate-300 rounded px-2 py-1 text-sm bg-white"
                />
              </div>
              <input placeholder="Description (optional)" value={progForm.description}
                onChange={e => setProgForm(f => ({ ...f, description: e.target.value }))}
                className="w-full border border-slate-300 rounded px-2 py-1 text-sm bg-white"
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-indigo-600 text-white text-sm py-1 rounded">Create</button>
                <button type="button" onClick={() => setShowProgForm(false)} className="flex-1 text-sm py-1 rounded border border-slate-300">Cancel</button>
              </div>
            </form>
          )}
          <div className="space-y-2">
            {programs.map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                <div>
                  <div className="font-medium text-sm text-slate-800">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.year} · {p.audit_count} audits</div>
                </div>
                <button onClick={() => { if (confirm("Delete this programme?")) deleteProgram.mutate(p.id); }}
                  className="text-red-400 hover:text-red-600 text-xs">
                  Delete
                </button>
              </div>
            ))}
            {programs.length === 0 && <p className="text-sm text-slate-400 text-center py-3">No programmes yet</p>}
          </div>
        </div>

        {/* Active audits */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-700">Active Audits</h3>
            <button onClick={() => onNavigate("audits")} className="text-xs text-indigo-600 hover:underline">View all →</button>
          </div>
          <div className="space-y-2">
            {openAudits.slice(0, 5).map(a => (
              <div key={a.id} className="p-3 bg-white border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-500">{a.reference_number}</span>
                  <StatusBadge status={a.status} />
                </div>
                <div className="font-medium text-sm text-slate-800 mt-1">{a.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {a.open_findings > 0 && <span className="text-red-500 font-semibold">{a.open_findings} open findings · </span>}
                  Started: {fmtDate(a.actual_date)}
                </div>
              </div>
            ))}
            {openAudits.length === 0 && <p className="text-sm text-slate-400 text-center py-3">No active audits</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Audit detail panel ────────────────────────────────────────────────────────

function AuditDetailPanel({
  auditId,
  onClose,
}: {
  auditId: number;
  onClose: () => void;
}) {
  const { data: audit, isLoading } = useIAAudit(auditId);
  const openAudit = useOpenIAAudit();
  const reportAudit = useReportIAAudit();
  const closeAudit = useCloseIAAudit();
  const addItem = useAddChecklistItem();
  const updateItem = useUpdateChecklistItem();
  const deleteItem = useDeleteChecklistItem();
  const createFinding = useCreateIAFinding();
  const closeFinding = useCloseIAFinding();
  const linkCapa = useLinkCapaFinding();
  const deleteFinding = useDeleteIAFinding();

  const [activePanel, setActivePanel] = useState<"checklist" | "findings">("checklist");
  const [itemForm, setItemForm] = useState({ clause_ref: "", requirement: "", order_index: "0" });
  const [findingForm, setFindingForm] = useState({
    finding_type: "minor_nc" as FindingType,
    title: "", description: "", clause_ref: "", due_date: "",
  });
  const [reportText, setReportText] = useState("");
  const [showReport, setShowReport] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [closeNotes, setCloseNotes] = useState("");
  const [closingFindingId, setClosingFindingId] = useState<number | null>(null);
  const [caText, setCaText] = useState("");
  const [linkingFindingId, setLinkingFindingId] = useState<number | null>(null);
  const [capaId, setCapaId] = useState("");

  if (isLoading || !audit) {
    return <div className="text-slate-400 text-sm text-center py-16">Loading audit…</div>;
  }

  const canOpen = audit.status === "planned";
  const canReport = audit.status === "open";
  const canClose = audit.status === "reported";

  async function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    await addItem.mutateAsync({
      auditId,
      data: {
        clause_ref: itemForm.clause_ref || null,
        requirement: itemForm.requirement,
        order_index: Number(itemForm.order_index),
      },
    });
    setItemForm({ clause_ref: "", requirement: "", order_index: "0" });
  }

  async function handleAddFinding(e: React.FormEvent) {
    e.preventDefault();
    await createFinding.mutateAsync({
      auditId,
      data: {
        finding_type: findingForm.finding_type,
        title: findingForm.title,
        description: findingForm.description,
        clause_ref: findingForm.clause_ref || null,
        due_date: findingForm.due_date || null,
      },
    });
    setFindingForm({ finding_type: "minor_nc", title: "", description: "", clause_ref: "", due_date: "" });
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm text-slate-500">{audit.reference_number}</span>
            <StatusBadge status={audit.status} />
            <span className="text-xs text-slate-400 capitalize">{audit.audit_type?.replace("_", " ")}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800">{audit.title}</h2>
          {audit.scope && <p className="text-sm text-slate-500 mt-1">{audit.scope}</p>}
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg font-bold">✕</button>
      </div>

      {/* Lifecycle actions */}
      <div className="flex items-center gap-2 mb-4">
        {canOpen && (
          <button
            onClick={() => openAudit.mutate(auditId)}
            className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-blue-700"
          >
            Start Audit
          </button>
        )}
        {canReport && !showReport && (
          <button
            onClick={() => setShowReport(true)}
            className="bg-amber-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-amber-700"
          >
            Submit Report
          </button>
        )}
        {canClose && !showClose && (
          <button
            onClick={() => setShowClose(true)}
            className="bg-green-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-green-700"
          >
            Close Audit
          </button>
        )}
        {audit.status === "closed" && (
          <span className="text-sm text-green-600 font-semibold">Audit closed {fmtDate(audit.close_date)}</span>
        )}
      </div>

      {showReport && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="text-sm font-semibold text-amber-800 mb-2">Audit Report Summary</div>
          <textarea
            value={reportText} rows={3} placeholder="Summarise audit findings and conclusions…"
            onChange={e => setReportText(e.target.value)}
            className="w-full border border-amber-300 rounded px-2 py-1.5 text-sm bg-white"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={async () => {
                await reportAudit.mutateAsync({ id: auditId, summary: reportText });
                setShowReport(false);
              }}
              disabled={!reportText.trim()}
              className="bg-amber-600 text-white text-sm px-3 py-1 rounded hover:bg-amber-700 disabled:opacity-50"
            >
              Submit
            </button>
            <button onClick={() => setShowReport(false)} className="text-sm px-3 py-1 rounded border border-slate-300">Cancel</button>
          </div>
        </div>
      )}

      {showClose && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm font-semibold text-green-800 mb-2">Close Audit</div>
          <textarea
            value={closeNotes} rows={2} placeholder="Closure notes (optional)"
            onChange={e => setCloseNotes(e.target.value)}
            className="w-full border border-green-300 rounded px-2 py-1.5 text-sm bg-white"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={async () => {
                await closeAudit.mutateAsync({ id: auditId, notes: closeNotes || undefined });
                setShowClose(false);
              }}
              className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700"
            >
              Close
            </button>
            <button onClick={() => setShowClose(false)} className="text-sm px-3 py-1 rounded border border-slate-300">Cancel</button>
          </div>
        </div>
      )}

      {/* Report summary display */}
      {audit.report_summary && (
        <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
          <div className="text-xs font-semibold text-slate-500 mb-1">Report Summary</div>
          {audit.report_summary}
        </div>
      )}

      {/* Panel toggle */}
      <div className="flex gap-1 mb-4 border-b border-slate-200">
        {(["checklist", "findings"] as const).map(p => (
          <button
            key={p}
            onClick={() => setActivePanel(p)}
            className={`px-4 py-1.5 text-sm font-medium rounded-t transition-colors capitalize ${activePanel === p ? "bg-white border border-b-white border-slate-200 -mb-px text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
          >
            {p === "checklist" ? `Checklist (${audit.checklist_items.length})` : `Findings (${audit.findings.length})`}
          </button>
        ))}
      </div>

      {/* Checklist panel */}
      {activePanel === "checklist" && (
        <div className="flex-1 overflow-auto">
          <div className="space-y-2 mb-4">
            {audit.checklist_items.map(item => (
              <div key={item.id} className="flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-lg">
                <div className="flex-1">
                  {item.clause_ref && (
                    <div className="text-xs font-mono text-slate-400 mb-0.5">{item.clause_ref}</div>
                  )}
                  <div className="text-sm text-slate-800">{item.requirement}</div>
                  {item.notes && <div className="text-xs text-slate-500 mt-1 italic">{item.notes}</div>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={item.response}
                    onChange={e => updateItem.mutate({
                      id: item.id, auditId,
                      data: { response: e.target.value as ChecklistResponse },
                    })}
                    className={`text-xs px-2 py-1 rounded border font-semibold ${CHECKLIST_COLORS[item.response]}`}
                    disabled={audit.status === "closed"}
                  >
                    {(["conforming", "nonconforming", "not_applicable", "not_assessed"] as ChecklistResponse[]).map(r => (
                      <option key={r} value={r}>{CHECKLIST_LABELS[r]}</option>
                    ))}
                  </select>
                  {audit.status !== "closed" && (
                    <button onClick={() => deleteItem.mutate({ id: item.id, auditId })}
                      className="text-red-400 hover:text-red-600 text-xs">✕</button>
                  )}
                </div>
              </div>
            ))}
            {audit.checklist_items.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No checklist items yet</p>
            )}
          </div>

          {audit.status !== "closed" && (
            <form onSubmit={handleAddItem} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="text-xs font-semibold text-slate-600 mb-2">Add Checklist Item</div>
              <div className="flex gap-2 mb-2">
                <input placeholder="Clause (e.g. §6.2)" value={itemForm.clause_ref}
                  onChange={e => setItemForm(f => ({ ...f, clause_ref: e.target.value }))}
                  className="w-32 border border-slate-300 rounded px-2 py-1 text-sm bg-white"
                />
                <input placeholder="Requirement text" required value={itemForm.requirement}
                  onChange={e => setItemForm(f => ({ ...f, requirement: e.target.value }))}
                  className="flex-1 border border-slate-300 rounded px-2 py-1 text-sm bg-white"
                />
              </div>
              <button type="submit" className="bg-indigo-600 text-white text-sm px-3 py-1 rounded hover:bg-indigo-700">
                Add Item
              </button>
            </form>
          )}
        </div>
      )}

      {/* Findings panel */}
      {activePanel === "findings" && (
        <div className="flex-1 overflow-auto">
          <div className="space-y-3 mb-4">
            {audit.findings.map(finding => (
              <div key={finding.id} className={`p-3 border rounded-lg ${finding.status === "closed" ? "bg-slate-50 border-slate-200" : "bg-white border-slate-200"}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <FindingBadge type={finding.finding_type} />
                    {finding.status === "closed" && (
                      <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-semibold">Closed</span>
                    )}
                    {finding.capa_finding_id && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-semibold">
                        CAPA #{finding.capa_finding_id}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {finding.status === "open" && (
                      <>
                        <button
                          onClick={() => { setClosingFindingId(finding.id); setCaText(""); }}
                          className="text-xs text-green-600 hover:text-green-700 border border-green-200 rounded px-2 py-0.5"
                        >
                          Close
                        </button>
                        <button
                          onClick={() => { setLinkingFindingId(finding.id); setCapaId(""); }}
                          className="text-xs text-purple-600 hover:text-purple-700 border border-purple-200 rounded px-2 py-0.5"
                        >
                          Link CAPA
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => { if (confirm("Delete this finding?")) deleteFinding.mutate({ id: finding.id, auditId }); }}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="font-medium text-sm text-slate-800 mt-1">{finding.title}</div>
                {finding.clause_ref && <div className="text-xs font-mono text-slate-400 mt-0.5">{finding.clause_ref}</div>}
                <div className="text-sm text-slate-600 mt-1">{finding.description}</div>
                {finding.ca_description && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-100 rounded text-xs text-green-800">
                    <span className="font-semibold">CA: </span>{finding.ca_description}
                  </div>
                )}
                {finding.due_date && finding.status === "open" && (
                  <div className={`text-xs mt-1 ${new Date(finding.due_date) < new Date() ? "text-red-500 font-semibold" : "text-slate-400"}`}>
                    Due: {fmtDate(finding.due_date)}
                  </div>
                )}

                {/* Close inline form */}
                {closingFindingId === finding.id && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                    <textarea
                      value={caText} rows={2} placeholder="Corrective action description (required)"
                      onChange={e => setCaText(e.target.value)}
                      className="w-full border border-green-300 rounded px-2 py-1 text-sm bg-white"
                    />
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={async () => {
                          if (!caText.trim()) return;
                          await closeFinding.mutateAsync({ id: finding.id, ca: caText });
                          setClosingFindingId(null);
                        }}
                        disabled={!caText.trim()}
                        className="bg-green-600 text-white text-sm px-3 py-1 rounded disabled:opacity-50"
                      >
                        Confirm Close
                      </button>
                      <button onClick={() => setClosingFindingId(null)} className="text-sm px-3 py-1 rounded border border-slate-300">Cancel</button>
                    </div>
                  </div>
                )}

                {/* Link CAPA inline form */}
                {linkingFindingId === finding.id && (
                  <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded flex items-center gap-2">
                    <input
                      placeholder="CAPA finding ID" type="number" value={capaId}
                      onChange={e => setCapaId(e.target.value)}
                      className="border border-purple-300 rounded px-2 py-1 text-sm bg-white w-32"
                    />
                    <button
                      onClick={async () => {
                        if (!capaId) return;
                        await linkCapa.mutateAsync({ id: finding.id, capa_finding_id: Number(capaId) });
                        setLinkingFindingId(null);
                      }}
                      className="bg-purple-600 text-white text-sm px-3 py-1 rounded"
                    >
                      Link
                    </button>
                    <button onClick={() => setLinkingFindingId(null)} className="text-sm px-2 py-1 rounded border border-slate-300">Cancel</button>
                  </div>
                )}
              </div>
            ))}
            {audit.findings.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No findings recorded</p>
            )}
          </div>

          {audit.status !== "closed" && (
            <form onSubmit={handleAddFinding} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="text-xs font-semibold text-slate-600">Record Finding</div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={findingForm.finding_type}
                  onChange={e => setFindingForm(f => ({ ...f, finding_type: e.target.value as FindingType }))}
                  className="border border-slate-300 rounded px-2 py-1 text-sm bg-white"
                >
                  {(["conformity", "observation", "minor_nc", "major_nc"] as FindingType[]).map(t => (
                    <option key={t} value={t}>{FINDING_LABELS[t]}</option>
                  ))}
                </select>
                <input placeholder="Clause ref (optional)" value={findingForm.clause_ref}
                  onChange={e => setFindingForm(f => ({ ...f, clause_ref: e.target.value }))}
                  className="border border-slate-300 rounded px-2 py-1 text-sm bg-white"
                />
              </div>
              <input placeholder="Finding title" required value={findingForm.title}
                onChange={e => setFindingForm(f => ({ ...f, title: e.target.value }))}
                className="w-full border border-slate-300 rounded px-2 py-1 text-sm bg-white"
              />
              <textarea placeholder="Description" required rows={2} value={findingForm.description}
                onChange={e => setFindingForm(f => ({ ...f, description: e.target.value }))}
                className="w-full border border-slate-300 rounded px-2 py-1 text-sm bg-white"
              />
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500">Due date</label>
                <input type="date" value={findingForm.due_date}
                  onChange={e => setFindingForm(f => ({ ...f, due_date: e.target.value }))}
                  className="border border-slate-300 rounded px-2 py-1 text-sm bg-white"
                />
                <button type="submit" className="ml-auto bg-indigo-600 text-white text-sm px-4 py-1 rounded hover:bg-indigo-700">
                  Add Finding
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

// ── Audits tab ────────────────────────────────────────────────────────────────

function AuditsTab() {
  const { data: audits = [], isLoading } = useIAAudits();
  const { data: programs = [] } = useIAPrograms();
  const createAudit = useCreateIAAudit();
  const deleteAudit = useDeleteIAAudit();

  const [selectedAuditId, setSelectedAuditId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<AuditStatus | "">("");
  const [form, setForm] = useState({
    title: "", audit_type: "internal" as "internal" | "management_review" | "surveillance",
    program_id: "", scope: "", planned_date: "",
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const created = await createAudit.mutateAsync({
      title: form.title,
      audit_type: form.audit_type,
      program_id: form.program_id ? Number(form.program_id) : null,
      scope: form.scope || null,
      planned_date: form.planned_date || null,
    });
    setShowForm(false);
    setForm({ title: "", audit_type: "internal", program_id: "", scope: "", planned_date: "" });
    setSelectedAuditId(created.id);
  }

  const filtered = filterStatus ? audits.filter(a => a.status === filterStatus) : audits;

  if (isLoading) return <div className="text-slate-400 text-center py-16">Loading…</div>;

  return (
    <div className="flex gap-6 h-[calc(100vh-280px)]">
      {/* Audit list */}
      <div className="w-80 shrink-0 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as AuditStatus | "")}
            className="flex-1 border border-slate-300 rounded px-2 py-1 text-sm bg-white"
          >
            <option value="">All statuses</option>
            {(["planned", "open", "reported", "closed"] as AuditStatus[]).map(s => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          <button onClick={() => setShowForm(v => !v)}
            className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 shrink-0">
            + New
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="mb-3 p-3 border border-slate-200 rounded-lg bg-slate-50 space-y-2">
            <input placeholder="Audit title" required value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full border border-slate-300 rounded px-2 py-1 text-sm bg-white"
            />
            <select value={form.audit_type} onChange={e => setForm(f => ({ ...f, audit_type: e.target.value as typeof form.audit_type }))}
              className="w-full border border-slate-300 rounded px-2 py-1 text-sm bg-white">
              <option value="internal">Internal Audit</option>
              <option value="management_review">Management Review</option>
              <option value="surveillance">Surveillance</option>
            </select>
            <select value={form.program_id} onChange={e => setForm(f => ({ ...f, program_id: e.target.value }))}
              className="w-full border border-slate-300 rounded px-2 py-1 text-sm bg-white">
              <option value="">No programme</option>
              {programs.map(p => <option key={p.id} value={p.id}>{p.name} ({p.year})</option>)}
            </select>
            <input placeholder="Scope" value={form.scope}
              onChange={e => setForm(f => ({ ...f, scope: e.target.value }))}
              className="w-full border border-slate-300 rounded px-2 py-1 text-sm bg-white"
            />
            <input type="date" value={form.planned_date}
              onChange={e => setForm(f => ({ ...f, planned_date: e.target.value }))}
              className="w-full border border-slate-300 rounded px-2 py-1 text-sm bg-white"
            />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-indigo-600 text-white text-sm py-1 rounded">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 text-sm py-1 rounded border border-slate-300">Cancel</button>
            </div>
          </form>
        )}

        <div className="flex-1 overflow-y-auto space-y-1">
          {filtered.map(a => (
            <div
              key={a.id}
              onClick={() => setSelectedAuditId(a.id)}
              className={`p-3 rounded-lg cursor-pointer border transition-colors ${selectedAuditId === a.id ? "border-indigo-400 bg-indigo-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs text-slate-400">{a.reference_number}</span>
                <StatusBadge status={a.status} />
              </div>
              <div className="font-medium text-sm text-slate-800 truncate">{a.title}</div>
              <div className="text-xs text-slate-500 mt-0.5">
                {a.open_findings > 0 && <span className="text-red-500">{a.open_findings} open · </span>}
                {fmtDate(a.planned_date)}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-8">No audits found</p>
          )}
        </div>
      </div>

      {/* Detail panel */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl p-5 overflow-y-auto">
        {selectedAuditId ? (
          <AuditDetailPanel auditId={selectedAuditId} onClose={() => setSelectedAuditId(null)} />
        ) : (
          <div className="text-slate-400 text-sm text-center py-24">Select an audit to view details</div>
        )}
      </div>
    </div>
  );
}

// ── Findings tab ──────────────────────────────────────────────────────────────

function FindingsTab() {
  const [filterStatus, setFilterStatus] = useState<FindingStatus | "">("");
  const [filterType, setFilterType] = useState<FindingType | "">("");
  const { data: findings = [], isLoading } = useIAFindings({
    status: filterStatus || undefined,
    finding_type: filterType || undefined,
  });

  if (isLoading) return <div className="text-slate-400 text-center py-16">Loading…</div>;

  const ncOpen = findings.filter(f => (f.finding_type === "major_nc" || f.finding_type === "minor_nc") && f.status === "open");

  return (
    <div>
      {ncOpen.length > 0 && (
        <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
          <span className="text-red-600 font-bold text-lg">⚠</span>
          <div>
            <div className="font-semibold text-red-700">{ncOpen.length} open nonconformit{ncOpen.length === 1 ? "y" : "ies"} require corrective action</div>
            <div className="text-sm text-red-600">All nonconformities must be closed before the audit can be closed.</div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-4">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as FindingStatus | "")}
          className="border border-slate-300 rounded px-2 py-1.5 text-sm bg-white">
          <option value="">All statuses</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value as FindingType | "")}
          className="border border-slate-300 rounded px-2 py-1.5 text-sm bg-white">
          <option value="">All types</option>
          {(["major_nc", "minor_nc", "observation", "conformity"] as FindingType[]).map(t => (
            <option key={t} value={t}>{FINDING_LABELS[t]}</option>
          ))}
        </select>
        <span className="ml-auto text-sm text-slate-500">{findings.length} findings</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
            <tr>
              <th className="px-4 py-2 text-left">Finding</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-left">Clause</th>
              <th className="px-4 py-2 text-left">Audit</th>
              <th className="px-4 py-2 text-left">Due Date</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">CAPA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {findings.map(f => {
              const overdue = f.status === "open" && f.due_date && new Date(f.due_date) < new Date();
              return (
                <tr key={f.id} className={`bg-white hover:bg-slate-50 ${overdue ? "border-l-2 border-red-400" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{f.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate max-w-64">{f.description}</div>
                  </td>
                  <td className="px-4 py-3"><FindingBadge type={f.finding_type} /></td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{f.clause_ref ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">#{f.audit_id}</td>
                  <td className={`px-4 py-3 text-xs ${overdue ? "text-red-600 font-semibold" : "text-slate-500"}`}>
                    {fmtDate(f.due_date)}{overdue ? " ⚠" : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${f.status === "closed" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                      {f.status === "closed" ? "Closed" : "Open"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {f.capa_finding_id ? (
                      <span className="text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-semibold">#{f.capa_finding_id}</span>
                    ) : "—"}
                  </td>
                </tr>
              );
            })}
            {findings.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">No findings match filters</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InternalAuditsPage() {
  const [tab, setTab] = useState<Tab>("dashboard");

  const tabs: { id: Tab; label: string }[] = [
    { id: "dashboard", label: "Programme Dashboard" },
    { id: "audits", label: "Audits & Checklists" },
    { id: "findings", label: "Findings Register" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Internal Audits</h1>
        <p className="text-sm text-slate-500 mt-1">
          ISO 17025 §8.8 — Audit programme · Checklists · Finding classification · CAPA linkage
        </p>
      </div>

      <div className="flex gap-1 mb-6 border-b border-slate-200">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === t.id ? "bg-white border border-b-white border-slate-200 -mb-px text-indigo-600" : "text-slate-500 hover:text-slate-700"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        {tab === "dashboard" && <DashboardTab onNavigate={setTab} />}
        {tab === "audits" && <AuditsTab />}
        {tab === "findings" && <FindingsTab />}
      </div>
    </div>
  );
}
