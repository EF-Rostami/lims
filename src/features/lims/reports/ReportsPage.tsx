"use client";

import { useRef, useState } from "react";
import {
  FileText, MoreHorizontal, Plus, Printer, Send, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { LimsPageLayout } from "@/features/lims/components/LimsPageLayout";
import { LimsStatusBadge } from "@/features/lims/components/LimsStatusBadge";
import { LimsTable } from "@/features/lims/components/LimsTable";
import {
  useCoaData, useCreateReport, useCreateTemplate, useDeleteTemplate,
  useIssueReport, useReports, useTemplates, useUpdateTemplate,
} from "./reports.queries";
import type { CoaData, CoaResultRow, CustomSection, ReportTemplate, TemplateCreate } from "./reports.api";

// ── Result column definitions ─────────────────────────────────────────────────

const ALL_COLUMNS: { key: string; label: string; render: (r: CoaResultRow) => string | null }[] = [
  { key: "test_name", label: "Test Name", render: (r) => r.test_name },
  { key: "test_code", label: "Code", render: (r) => r.test_code },
  { key: "result_value", label: "Result", render: (r) => r.result_value },
  { key: "unit", label: "Unit", render: (r) => r.unit },
  { key: "reference_range", label: "Ref. Range", render: (r) => r.reference_range },
  { key: "result_flag", label: "Flag", render: (r) => r.result_flag },
  { key: "status", label: "Status", render: (r) => r.status },
  { key: "comments", label: "Comments", render: (r) => r.comments },
];

// ── CoA Document ──────────────────────────────────────────────────────────────

function flagStyle(flag: string | null): React.CSSProperties {
  if (!flag) return {};
  if (flag === "CRITICAL_HIGH" || flag === "CRITICAL_LOW") return { color: "#dc2626", fontWeight: 700 };
  if (flag === "HIGH" || flag === "LOW") return { color: "#d97706", fontWeight: 600 };
  if (flag === "ABNORMAL") return { color: "#ea580c" };
  return {};
}

function CoaDocument({ data }: { data: CoaData }) {
  const { template } = data;
  const sectionsBefore = [...template.custom_sections]
    .filter((s) => s.position === "before")
    .sort((a, b) => a.order - b.order);
  const sectionsAfter = [...template.custom_sections]
    .filter((s) => s.position === "after")
    .sort((a, b) => a.order - b.order);

  const activeCols = ALL_COLUMNS.filter((c) => template.results_columns.includes(c.key));

  const reportDate = data.issued_at
    ? `Issued: ${new Date(data.issued_at).toLocaleDateString()}`
    : data.generated_at
    ? `Generated: ${new Date(data.generated_at).toLocaleDateString()}`
    : "";

  return (
    <div
      style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        padding: "48px",
        maxWidth: "800px",
        margin: "0 auto",
        position: "relative",
        color: "#111827",
      }}
    >
      {/* Watermark */}
      {template.watermark_text && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-35deg)",
            fontSize: "72px",
            color: "rgba(0,0,0,0.04)",
            fontWeight: 900,
            pointerEvents: "none",
            whiteSpace: "nowrap",
            userSelect: "none",
            zIndex: 0,
          }}
        >
          {template.watermark_text}
        </div>
      )}

      {/* Header */}
      <div style={{ borderBottom: "2.5px solid #1d4ed8", paddingBottom: "20px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px" }}>
          <div>
            {template.show_logo && (
              <div
                style={{
                  width: "72px", height: "72px", border: "1px dashed #d1d5db",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: "6px", marginBottom: "10px", color: "#9ca3af", fontSize: "10px",
                }}
              >
                LOGO
              </div>
            )}
            {template.show_lab_name && (
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#1d4ed8" }}>
                {data.lab_name ?? "Laboratory Name"}
              </div>
            )}
            {template.show_lab_address && data.lab_address && (
              <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "3px" }}>{data.lab_address}</div>
            )}
            {template.show_accreditation && data.lab_accreditation && (
              <div style={{ fontSize: "10px", color: "#059669", marginTop: "3px" }}>
                Accreditation No: {data.lab_accreditation}
              </div>
            )}
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: "18px", fontWeight: 700, color: "#1d4ed8", letterSpacing: "-0.02em" }}>
              CERTIFICATE OF ANALYSIS
            </div>
            <div style={{ fontFamily: "monospace", fontSize: "14px", marginTop: "6px" }}>
              {data.report_number}
            </div>
            {reportDate && (
              <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "3px" }}>{reportDate}</div>
            )}
            <div
              style={{
                marginTop: "8px",
                display: "inline-block",
                padding: "2px 10px",
                borderRadius: "999px",
                fontSize: "10px",
                fontWeight: 700,
                background: data.report_status === "ISSUED" ? "#dcfce7" : "#fef9c3",
                color: data.report_status === "ISSUED" ? "#166534" : "#92400e",
                letterSpacing: "0.05em",
              }}
            >
              {data.report_status}
            </div>
          </div>
        </div>
        {template.header_custom_text && (
          <div
            style={{
              marginTop: "14px", paddingTop: "10px", borderTop: "1px solid #e5e7eb",
              fontSize: "11px", color: "#374151",
            }}
          >
            {template.header_custom_text}
          </div>
        )}
      </div>

      {/* Client / Order metadata */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "28px" }}>
        <div>
          <div style={{ fontSize: "9px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
            CLIENT
          </div>
          <div style={{ fontSize: "13px", fontWeight: 600 }}>{data.client_name ?? "—"}</div>
          {data.client_address && (
            <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>{data.client_address}</div>
          )}
        </div>
        <div>
          <div style={{ fontSize: "9px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>
            ORDER / SAMPLE
          </div>
          {data.order_number && (
            <div style={{ fontSize: "13px", fontWeight: 600 }}>Order: {data.order_number}</div>
          )}
          {data.requested_by && (
            <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>Requested by: {data.requested_by}</div>
          )}
          {!data.order_number && !data.requested_by && (
            <div style={{ fontSize: "13px", color: "#9ca3af" }}>—</div>
          )}
        </div>
      </div>

      {/* Custom sections BEFORE results */}
      {sectionsBefore.map((sec, i) => (
        <div key={i} style={{ marginBottom: "22px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #e5e7eb", paddingBottom: "4px", marginBottom: "8px" }}>
            {sec.title}
          </div>
          <div style={{ fontSize: "12px", color: "#374151", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{sec.body}</div>
        </div>
      ))}

      {/* Results table */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ fontSize: "10px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
          TEST RESULTS
        </div>
        {data.results.length === 0 ? (
          <div style={{ padding: "24px", textAlign: "center", border: "1px solid #e5e7eb", borderRadius: "6px", fontSize: "12px", color: "#9ca3af" }}>
            No results linked to this report
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
            <thead>
              <tr style={{ background: "#1d4ed8", color: "#ffffff" }}>
                {activeCols.map((c) => (
                  <th key={c.key} style={{ padding: "9px 12px", textAlign: "left", fontWeight: 600, fontSize: "11px" }}>
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.results.map((row, ri) => (
                <tr key={ri} style={{ background: ri % 2 === 0 ? "#f9fafb" : "#ffffff", borderBottom: "1px solid #e5e7eb" }}>
                  {activeCols.map((c) => (
                    <td
                      key={c.key}
                      style={{ padding: "8px 12px", ...(c.key === "result_flag" ? flagStyle(row.result_flag) : {}) }}
                    >
                      {c.render(row) ?? "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Custom sections AFTER results */}
      {sectionsAfter.map((sec, i) => (
        <div key={i} style={{ marginBottom: "22px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #e5e7eb", paddingBottom: "4px", marginBottom: "8px" }}>
            {sec.title}
          </div>
          <div style={{ fontSize: "12px", color: "#374151", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{sec.body}</div>
        </div>
      ))}

      {/* Notes */}
      {data.notes && (
        <div style={{ marginBottom: "22px" }}>
          <div style={{ fontSize: "10px", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: "1px solid #e5e7eb", paddingBottom: "4px", marginBottom: "8px" }}>
            NOTES
          </div>
          <div style={{ fontSize: "12px", color: "#374151", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{data.notes}</div>
        </div>
      )}

      {/* Signature block */}
      {template.show_signature_block && (
        <div style={{ marginTop: "48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px" }}>
          {["Authorized Signatory", "Quality Manager"].map((role) => (
            <div key={role}>
              <div style={{ height: "48px" }} />
              <div style={{ borderTop: "1px solid #374151", paddingTop: "8px" }}>
                <div style={{ fontSize: "10px", color: "#6b7280" }}>{role}</div>
                <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "16px" }}>Date: _______________</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: "40px", paddingTop: "12px", borderTop: "1px solid #e5e7eb", display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#9ca3af" }}>
        <span>{template.footer_custom_text ?? ""}</span>
        <span>Report No: {data.report_number}</span>
        {template.show_page_numbers && <span>Page 1 of 1</span>}
      </div>
    </div>
  );
}

// ── CoA Preview Modal ─────────────────────────────────────────────────────────

function CoaPreviewModal({ reportId, onClose }: { reportId: number; onClose: () => void }) {
  const { data, isLoading } = useCoaData(reportId);
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = contentRef.current?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${data?.report_number ?? "CoA"}</title>
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; background: white; }
            @media print {
              body { margin: 0; }
              @page { margin: 15mm; }
            }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent aria-describedby={undefined} className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base">
              CoA Preview{data ? ` — ${data.report_number}` : ""}
            </DialogTitle>
            <Button onClick={handlePrint} size="sm" variant="outline" disabled={!data}>
              <Printer className="h-4 w-4 mr-1.5" /> Print / Save PDF
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto bg-slate-100 p-4">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
              Building CoA…
            </div>
          ) : data ? (
            <div ref={contentRef} className="bg-white rounded shadow-sm">
              <CoaDocument data={data} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
              Failed to load CoA data
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Template Editor ───────────────────────────────────────────────────────────

const EMPTY_TEMPLATE = (): TemplateCreate => ({
  name: "",
  description: null,
  client_id: null,
  test_category: null,
  is_default: false,
  orientation: "portrait",
  paper_size: "A4",
  show_logo: true,
  show_lab_name: true,
  show_lab_address: true,
  show_accreditation: true,
  header_custom_text: null,
  results_columns: ["test_name", "result_value", "unit", "reference_range", "result_flag", "status"],
  custom_sections: [],
  show_page_numbers: true,
  show_signature_block: true,
  footer_custom_text: null,
  watermark_text: null,
});

function TemplateEditor({
  template,
  onSaved,
  onDeleted,
}: {
  template: ReportTemplate | null;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const isNew = template === null;
  const [form, setForm] = useState<TemplateCreate>(
    isNew
      ? EMPTY_TEMPLATE()
      : {
          name: template.name,
          description: template.description,
          client_id: template.client_id,
          test_category: template.test_category,
          is_default: template.is_default,
          orientation: template.orientation,
          paper_size: template.paper_size,
          show_logo: template.show_logo,
          show_lab_name: template.show_lab_name,
          show_lab_address: template.show_lab_address,
          show_accreditation: template.show_accreditation,
          header_custom_text: template.header_custom_text,
          results_columns: [...template.results_columns],
          custom_sections: [...template.custom_sections],
          show_page_numbers: template.show_page_numbers,
          show_signature_block: template.show_signature_block,
          footer_custom_text: template.footer_custom_text,
          watermark_text: template.watermark_text,
        }
  );

  const [sectionDialog, setSectionDialog] = useState<{
    open: boolean;
    idx: number | null;
    draft: Omit<CustomSection, "order">;
  }>({ open: false, idx: null, draft: { title: "", body: "", position: "after" } });

  const create = useCreateTemplate();
  const update = useUpdateTemplate();
  const del = useDeleteTemplate();

  const set = <K extends keyof TemplateCreate>(k: K, v: TemplateCreate[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleColumn = (col: string) =>
    setForm((f) => ({
      ...f,
      results_columns: f.results_columns.includes(col)
        ? f.results_columns.filter((c) => c !== col)
        : [...f.results_columns, col],
    }));

  const handleSave = async () => {
    if (isNew) {
      await create.mutateAsync(form);
    } else {
      await update.mutateAsync({ id: template.id, data: form });
    }
    onSaved();
  };

  const handleDelete = async () => {
    if (!template) return;
    if (!confirm("Delete this template?")) return;
    await del.mutateAsync(template.id);
    onDeleted();
  };

  const openAddSection = () =>
    setSectionDialog({ open: true, idx: null, draft: { title: "", body: "", position: "after" } });

  const openEditSection = (i: number) =>
    setSectionDialog({ open: true, idx: i, draft: { ...form.custom_sections[i] } });

  const saveSection = () => {
    const s = sectionDialog;
    const sections = [...form.custom_sections];
    if (s.idx === null) {
      sections.push({ ...s.draft, order: sections.length });
    } else {
      sections[s.idx] = { ...s.draft, order: s.idx };
    }
    setForm((f) => ({ ...f, custom_sections: sections }));
    setSectionDialog((p) => ({ ...p, open: false }));
  };

  const removeSection = (i: number) =>
    setForm((f) => ({
      ...f,
      custom_sections: f.custom_sections.filter((_, idx) => idx !== i).map((s, idx) => ({ ...s, order: idx })),
    }));

  const isBusy = create.isPending || update.isPending;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 border-b bg-slate-50">
        <h3 className="text-sm font-semibold">{isNew ? "New Template" : template.name}</h3>
        <div className="flex gap-2">
          {!isNew && (
            <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={handleDelete} disabled={del.isPending}>
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
            </Button>
          )}
          <Button size="sm" onClick={handleSave} disabled={isBusy || !form.name}>
            {isBusy ? "Saving…" : "Save Template"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {/* Identity */}
        <section className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Identity</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Template Name *</Label>
              <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Standard CoA" />
            </div>
            <div className="space-y-1">
              <Label>Test Category</Label>
              <Input value={form.test_category ?? ""} onChange={(e) => set("test_category", e.target.value || null)} placeholder="e.g. chemistry, microbiology" />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Input value={form.description ?? ""} onChange={(e) => set("description", e.target.value || null)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Bind to Client ID (optional)</Label>
              <Input type="number" value={form.client_id ?? ""} onChange={(e) => set("client_id", e.target.value ? Number(e.target.value) : null)} placeholder="Leave blank for all clients" />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <Checkbox id="is_default" checked={form.is_default} onCheckedChange={(v) => set("is_default", !!v)} />
              <Label htmlFor="is_default" className="font-normal cursor-pointer">Default template</Label>
            </div>
          </div>
        </section>

        {/* Page Layout */}
        <section className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Page Layout</h4>
          <div className="flex gap-6">
            <div className="space-y-1">
              <Label>Orientation</Label>
              <div className="flex gap-2 mt-1">
                {(["portrait", "landscape"] as const).map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => set("orientation", o)}
                    className={`px-3 py-1.5 rounded border text-sm capitalize ${form.orientation === o ? "border-blue-600 bg-blue-50 text-blue-700 font-medium" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Paper Size</Label>
              <div className="flex gap-2 mt-1">
                {(["A4", "Letter", "A3"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => set("paper_size", s)}
                    className={`px-3 py-1.5 rounded border text-sm ${form.paper_size === s ? "border-blue-600 bg-blue-50 text-blue-700 font-medium" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Header */}
        <section className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Header</h4>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {([
              ["show_logo", "Logo"],
              ["show_lab_name", "Lab Name"],
              ["show_lab_address", "Lab Address"],
              ["show_accreditation", "Accreditation No"],
            ] as const).map(([k, label]) => (
              <div key={k} className="flex items-center gap-2">
                <Checkbox id={k} checked={form[k] as boolean} onCheckedChange={(v) => set(k, !!v)} />
                <Label htmlFor={k} className="font-normal cursor-pointer">{label}</Label>
              </div>
            ))}
          </div>
          <div className="space-y-1">
            <Label>Header Custom Text</Label>
            <Textarea rows={2} value={form.header_custom_text ?? ""} onChange={(e) => set("header_custom_text", e.target.value || null)} placeholder="Optional disclaimer or lab statement shown below the logo" />
          </div>
        </section>

        {/* Results Columns */}
        <section className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Results Table Columns</h4>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {ALL_COLUMNS.map((c) => (
              <div key={c.key} className="flex items-center gap-2">
                <Checkbox
                  id={`col_${c.key}`}
                  checked={form.results_columns.includes(c.key)}
                  onCheckedChange={() => toggleColumn(c.key)}
                />
                <Label htmlFor={`col_${c.key}`} className="font-normal cursor-pointer">{c.label}</Label>
              </div>
            ))}
          </div>
        </section>

        {/* Custom Sections */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Custom Sections</h4>
            <Button size="sm" variant="outline" onClick={openAddSection}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Section
            </Button>
          </div>
          {form.custom_sections.length === 0 ? (
            <p className="text-sm text-slate-400">No custom sections. Add blocks of text to appear before or after the results table.</p>
          ) : (
            <div className="space-y-2">
              {form.custom_sections.map((sec, i) => (
                <div key={i} className="flex items-center gap-2 p-3 border rounded bg-slate-50">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium">{sec.title}</span>
                    <span className="ml-2 text-xs text-slate-400">({sec.position} results)</span>
                    {sec.body && <p className="text-xs text-slate-500 mt-0.5 truncate">{sec.body}</p>}
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => openEditSection(i)}>Edit</Button>
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => removeSection(i)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Footer */}
        <section className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Footer</h4>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {([
              ["show_page_numbers", "Page Numbers"],
              ["show_signature_block", "Signature Block"],
            ] as const).map(([k, label]) => (
              <div key={k} className="flex items-center gap-2">
                <Checkbox id={k} checked={form[k] as boolean} onCheckedChange={(v) => set(k, !!v)} />
                <Label htmlFor={k} className="font-normal cursor-pointer">{label}</Label>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Footer Custom Text</Label>
              <Input value={form.footer_custom_text ?? ""} onChange={(e) => set("footer_custom_text", e.target.value || null)} placeholder="e.g. Confidential — for intended recipient only" />
            </div>
            <div className="space-y-1">
              <Label>Watermark Text</Label>
              <Input value={form.watermark_text ?? ""} onChange={(e) => set("watermark_text", e.target.value || null)} placeholder="e.g. DRAFT, COPY, CONFIDENTIAL" />
            </div>
          </div>
        </section>
      </div>

      {/* Section dialog */}
      <Dialog open={sectionDialog.open} onOpenChange={(o) => setSectionDialog((p) => ({ ...p, open: o }))}>
        <DialogContent aria-describedby={undefined} className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{sectionDialog.idx === null ? "Add Section" : "Edit Section"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-1">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input
                value={sectionDialog.draft.title}
                onChange={(e) => setSectionDialog((p) => ({ ...p, draft: { ...p.draft, title: e.target.value } }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Position</Label>
              <div className="flex gap-2">
                {(["before", "after"] as const).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setSectionDialog((p) => ({ ...p, draft: { ...p.draft, position: pos } }))}
                    className={`px-3 py-1.5 rounded border text-sm capitalize flex-1 ${sectionDialog.draft.position === pos ? "border-blue-600 bg-blue-50 text-blue-700 font-medium" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                  >
                    {pos} results
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Body</Label>
              <Textarea
                rows={4}
                value={sectionDialog.draft.body}
                onChange={(e) => setSectionDialog((p) => ({ ...p, draft: { ...p.draft, body: e.target.value } }))}
                placeholder="Section content…"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSectionDialog((p) => ({ ...p, open: false }))}>Cancel</Button>
            <Button onClick={saveSection} disabled={!sectionDialog.draft.title}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Templates Tab ─────────────────────────────────────────────────────────────

function TemplatesTab() {
  const [selectedId, setSelectedId] = useState<number | "new" | null>(null);
  const { data: templates = [], isLoading } = useTemplates();

  const selected = typeof selectedId === "number" ? templates.find((t) => t.id === selectedId) ?? null : null;
  const isNew = selectedId === "new";

  return (
    <div className="flex h-[calc(100vh-196px)] border rounded overflow-hidden">
      {/* Left list */}
      <div className="w-64 border-r flex flex-col shrink-0">
        <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
          <span className="text-sm font-semibold">Templates</span>
          <Button size="sm" variant="outline" onClick={() => setSelectedId("new")}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <p className="p-4 text-sm text-slate-400">Loading…</p>
          ) : templates.length === 0 ? (
            <p className="p-4 text-sm text-slate-400">No templates yet.</p>
          ) : (
            templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedId(t.id)}
                className={`w-full text-left px-4 py-3 border-b hover:bg-slate-50 transition-colors ${selectedId === t.id ? "bg-blue-50 border-l-2 border-l-blue-600" : ""}`}
              >
                <div className="text-sm font-medium truncate">{t.name}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {t.is_default && "Default · "}
                  {t.orientation === "portrait" ? "Portrait" : "Landscape"} · {t.paper_size}
                </div>
                {t.client_id && (
                  <div className="text-xs text-blue-500 mt-0.5">Client #{t.client_id}</div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right editor */}
      {(selectedId !== null) ? (
        <TemplateEditor
          key={String(selectedId)}
          template={isNew ? null : selected}
          onSaved={() => setSelectedId(null)}
          onDeleted={() => setSelectedId(null)}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          <div className="text-center">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Select a template to edit</p>
            <p className="text-xs mt-1">or click + to create a new one</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Reports Tab ───────────────────────────────────────────────────────────────

const emptyForm = () => ({
  title: "",
  order_id: null as number | null,
  client_id: null as number | null,
  template_id: null as number | null,
  notes: null as string | null,
});

function ReportsTab() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [previewId, setPreviewId] = useState<number | null>(null);

  const { data: reports = [], isLoading } = useReports();
  const { data: templates = [] } = useTemplates();
  const create = useCreateReport();
  const issue = useIssueReport();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync(form);
    setOpen(false);
    setForm(emptyForm());
  };

  return (
    <>
      <LimsTable
        data={reports}
        isLoading={isLoading}
        emptyMessage="No reports yet."
        columns={[
          {
            header: "Report #",
            render: (r) => <span className="font-mono text-sm font-medium">{r.report_number}</span>,
          },
          {
            header: "Title",
            render: (r) => <span className="font-medium">{r.title}</span>,
          },
          {
            header: "Order",
            render: (r) => <span className="text-slate-500">{r.order_id ? `#${r.order_id}` : "—"}</span>,
          },
          {
            header: "Template",
            render: (r) => {
              const tmpl = templates.find((t) => t.id === (r as typeof r & { template_id?: number }).template_id);
              return <span className="text-slate-500 text-sm">{tmpl ? tmpl.name : "—"}</span>;
            },
          },
          {
            header: "Status",
            render: (r) => <LimsStatusBadge status={r.status} />,
          },
          {
            header: "Date",
            render: (r) => (
              <span className="text-slate-500 text-sm">
                {r.issued_at
                  ? new Date(r.issued_at).toLocaleDateString()
                  : r.generated_at
                  ? new Date(r.generated_at).toLocaleDateString()
                  : "—"}
              </span>
            ),
          },
          {
            header: "",
            className: "w-10",
            render: (r) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setPreviewId(r.id)}>
                    <FileText className="h-3.5 w-3.5 mr-2 text-blue-600" /> Preview CoA
                  </DropdownMenuItem>
                  {r.status === "DRAFT" && (
                    <DropdownMenuItem onClick={() => issue.mutateAsync(r.id)}>
                      <Send className="h-3.5 w-3.5 mr-2 text-emerald-600" /> Issue Report
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
      />

      {/* Create report dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent aria-describedby={undefined} className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Report</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3 mt-2">
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Order ID</Label>
                <Input type="number" value={form.order_id ?? ""} onChange={(e) => setForm((f) => ({ ...f, order_id: e.target.value ? Number(e.target.value) : null }))} />
              </div>
              <div className="space-y-1">
                <Label>Client ID</Label>
                <Input type="number" value={form.client_id ?? ""} onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value ? Number(e.target.value) : null }))} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Template</Label>
              <select
                className="w-full border rounded px-3 py-2 text-sm bg-white"
                value={form.template_id ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, template_id: e.target.value ? Number(e.target.value) : null }))}
              >
                <option value="">Auto-select (default template)</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea rows={2} value={form.notes ?? ""} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value || null }))} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={create.isPending}>Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CoA preview modal */}
      {previewId !== null && (
        <CoaPreviewModal reportId={previewId} onClose={() => setPreviewId(null)} />
      )}

      {/* Expose the "New Report" trigger so parent can call it */}
      <div id="__newReportBtn" data-open={String(open)} onClick={() => { setForm(emptyForm()); setOpen(true); }} />
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function ReportsPage() {
  const [tab, setTab] = useState<"reports" | "templates">("reports");
  const [reportOpen, setReportOpen] = useState(false);

  const { data: reports = [], isLoading } = useReports();
  const { data: templates = [] } = useTemplates();
  const create = useCreateReport();
  const issue = useIssueReport();
  const [form, setForm] = useState(emptyForm());
  const [previewId, setPreviewId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await create.mutateAsync(form);
    setReportOpen(false);
    setForm(emptyForm());
  };

  return (
    <LimsPageLayout
      title="Reports"
      description="Generate and issue Certificates of Analysis"
      actionLabel={tab === "reports" ? "New Report" : undefined}
      onAction={tab === "reports" ? () => { setForm(emptyForm()); setReportOpen(true); } : undefined}
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="mb-4">
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <LimsTable
            data={reports}
            isLoading={isLoading}
            emptyMessage="No reports yet."
            columns={[
              {
                header: "Report #",
                render: (r) => <span className="font-mono text-sm font-medium">{r.report_number}</span>,
              },
              {
                header: "Title",
                render: (r) => <span className="font-medium">{r.title}</span>,
              },
              {
                header: "Order",
                render: (r) => <span className="text-slate-500">{r.order_id ? `#${r.order_id}` : "—"}</span>,
              },
              {
                header: "Template",
                render: (r) => {
                  const tmpl = templates.find((t) => t.id === (r as typeof r & { template_id?: number }).template_id);
                  return <span className="text-slate-500 text-sm">{tmpl?.name ?? "—"}</span>;
                },
              },
              {
                header: "Status",
                render: (r) => <LimsStatusBadge status={r.status} />,
              },
              {
                header: "Date",
                render: (r) => (
                  <span className="text-slate-500 text-sm">
                    {r.issued_at
                      ? new Date(r.issued_at).toLocaleDateString()
                      : r.generated_at
                      ? new Date(r.generated_at).toLocaleDateString()
                      : "—"}
                  </span>
                ),
              },
              {
                header: "",
                className: "w-10",
                render: (r) => (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setPreviewId(r.id)}>
                        <FileText className="h-3.5 w-3.5 mr-2 text-blue-600" /> Preview CoA
                      </DropdownMenuItem>
                      {r.status === "DRAFT" && (
                        <DropdownMenuItem onClick={() => issue.mutateAsync(r.id)}>
                          <Send className="h-3.5 w-3.5 mr-2 text-emerald-600" /> Issue Report
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ),
              },
            ]}
          />

          <Dialog open={reportOpen} onOpenChange={setReportOpen}>
            <DialogContent aria-describedby={undefined} className="max-w-md">
              <DialogHeader>
                <DialogTitle>New Report</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3 mt-2">
                <div className="space-y-1">
                  <Label>Title *</Label>
                  <Input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Order ID</Label>
                    <Input type="number" value={form.order_id ?? ""} onChange={(e) => setForm((f) => ({ ...f, order_id: e.target.value ? Number(e.target.value) : null }))} />
                  </div>
                  <div className="space-y-1">
                    <Label>Client ID</Label>
                    <Input type="number" value={form.client_id ?? ""} onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value ? Number(e.target.value) : null }))} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Template</Label>
                  <select
                    className="w-full border rounded px-3 py-2 text-sm bg-white"
                    value={form.template_id ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, template_id: e.target.value ? Number(e.target.value) : null }))}
                  >
                    <option value="">Auto-select (default template)</option>
                    {templates.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Notes</Label>
                  <Textarea rows={2} value={form.notes ?? ""} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value || null }))} />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setReportOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={create.isPending}>Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {previewId !== null && (
            <CoaPreviewModal reportId={previewId} onClose={() => setPreviewId(null)} />
          )}
        </TabsContent>

        <TabsContent value="templates">
          <TemplatesTab />
        </TabsContent>
      </Tabs>
    </LimsPageLayout>
  );
}
