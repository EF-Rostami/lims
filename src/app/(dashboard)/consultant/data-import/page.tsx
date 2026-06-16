"use client";

import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  Download, Upload, Link2, Plus, Trash2, Copy, CheckCircle2,
  Loader2, AlertTriangle, Clock, FileSpreadsheet, X, ChevronDown,
} from "lucide-react";
import {
  useIntakeSessions,
  useCreateIntakeSession,
  useConfirmIntake,
  useDeleteIntakeSession,
} from "@/features/consultant/intake.queries";
import { intakeApi } from "@/features/consultant/intake.api";
import { useLimsAuthStore } from "@/features/lims-auth/lims-auth.store";
import type {
  IntakeStagedData, DeptRow, PosRow, EmpRow,
  InstrRow, MethodRow, ClientRow, ImportResult, IntakeRead,
} from "@/features/consultant/intake.api";

// ─── Template definition ───────────────────────────────────────────────────

const SHEETS = [
  {
    name: "Departments",
    headers: ["code*", "name*", "parent_code"],
    example: [["QA", "Quality Assurance", ""], ["LAB", "Main Laboratory", "QA"]],
    note: "parent_code must reference another code in this sheet.",
  },
  {
    name: "Positions",
    headers: ["title*", "department_code*", "supervisor_title"],
    example: [["Head of QA", "QA", ""], ["QA Analyst", "QA", "Head of QA"]],
    note: "department_code must match a code in the Departments sheet.",
  },
  {
    name: "Employees",
    headers: ["employee_id_number*", "first_name*", "last_name*", "email*"],
    example: [["EMP-001", "Jane", "Doe", "jane.doe@lab.com"]],
    note: "A shared temporary password will be set at import time. Roles are assigned separately.",
  },
  {
    name: "Instruments",
    headers: ["code*", "name*", "manufacturer", "model_number", "serial_number", "location", "description"],
    example: [["UV-001", "UV Spectrophotometer", "Shimadzu", "UV-2600", "SN-12345", "Room A", ""]],
    note: "code must be unique across all instruments.",
  },
  {
    name: "Test Methods",
    headers: ["code*", "name*", "unit", "description"],
    example: [["TM-PH-01", "pH Measurement", "pH", "Standard pH measurement procedure"]],
    note: "code must be unique across all test methods.",
  },
  {
    name: "Clients",
    headers: ["code*", "name*", "client_type", "contact_name", "contact_email", "contact_phone", "city", "country"],
    example: [["CLT-001", "PharmaCo Ltd", "PRIVATE", "Dr. Smith", "smith@pharma.com", "+49-123-456", "Berlin", "Germany"]],
    note: "client_type: HOSPITAL | CLINIC | PRIVATE | GOVERNMENT | RESEARCH | OTHER",
  },
];

function generateTemplate() {
  const wb = XLSX.utils.book_new();

  // Data sheets
  SHEETS.forEach((sheet) => {
    const rows = [sheet.headers, ...sheet.example];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    // Style header row width
    ws["!cols"] = sheet.headers.map(() => ({ wch: 20 }));
    XLSX.utils.book_append_sheet(wb, ws, sheet.name);
  });

  // README sheet
  const readmeRows = [
    ["BLIMS Lab Data Onboarding Template"],
    [""],
    ["Instructions:"],
    ["1. Fill each sheet with your lab data."],
    ["2. Required fields are marked with *"],
    ["3. Do NOT change sheet names or column headers."],
    ["4. Remove example rows before uploading."],
    ["5. Upload the completed file via the consultant portal."],
    [""],
    ...SHEETS.map((s) => [`${s.name}: ${s.note}`]),
  ];
  const readmeWs = XLSX.utils.aoa_to_sheet(readmeRows);
  readmeWs["!cols"] = [{ wch: 80 }];
  XLSX.utils.book_append_sheet(wb, readmeWs, "README");

  XLSX.writeFile(wb, "lab-data-template.xlsx");
}

// ─── Excel parser ──────────────────────────────────────────────────────────

type ParsedData = IntakeStagedData & { _raw: Record<string, unknown[][]> };

function parseExcel(file: File): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: "array" });
        const raw: Record<string, unknown[][]> = {};
        SHEETS.forEach((s) => {
          const ws = wb.Sheets[s.name];
          raw[s.name] = ws ? (XLSX.utils.sheet_to_json(ws, { header: 1 }) as unknown[][]) : [];
        });

        const toObj = (rows: unknown[][], keys: string[]) =>
          rows.slice(1).filter((r) => r.some(Boolean)).map((r) =>
            Object.fromEntries(keys.map((k, i) => [k.replace("*", ""), String(r[i] ?? "").trim()]))
          );

        resolve({
          departments: toObj(raw["Departments"], SHEETS[0].headers) as DeptRow[],
          positions: toObj(raw["Positions"], SHEETS[1].headers) as PosRow[],
          employees: toObj(raw["Employees"], SHEETS[2].headers) as EmpRow[],
          instruments: toObj(raw["Instruments"], SHEETS[3].headers) as InstrRow[],
          methods: toObj(raw["Test Methods"], SHEETS[4].headers) as MethodRow[],
          clients: toObj(raw["Clients"], SHEETS[5].headers) as ClientRow[],
          _raw: raw,
        });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// ─── Sub-components ────────────────────────────────────────────────────────

function PreviewTable({ rows, headers }: { rows: Record<string, string>[]; headers: string[] }) {
  if (!rows.length) return <p className="text-slate-400 text-sm italic py-4">No rows in this sheet.</p>;
  const cols = headers.map((h) => h.replace("*", ""));
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-50 border-b">
            <th className="p-2 text-left text-slate-400 font-bold w-8">#</th>
            {cols.map((c) => (
              <th key={c} className="p-2 text-left text-slate-600 font-bold uppercase tracking-wider">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50">
              <td className="p-2 text-slate-400">{i + 1}</td>
              {cols.map((c) => (
                <td key={c} className={`p-2 ${!row[c] && headers.find(h=>h===c+"*") ? "bg-red-50 text-red-500" : "text-slate-700"}`}>
                  {row[c] || <span className="text-slate-300">—</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ResultPanel({ result }: { result: ImportResult }) {
  const entities = Object.entries(result) as [keyof ImportResult, ImportResult[keyof ImportResult]][];
  const totalImported = entities.reduce((s, [, v]) => s + v.imported, 0);
  const totalErrors = entities.reduce((s, [, v]) => s + v.errors.length, 0);

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center gap-3">
        {totalErrors === 0 ? (
          <CheckCircle2 className="text-green-500" size={24} />
        ) : (
          <AlertTriangle className="text-amber-500" size={24} />
        )}
        <span className="font-bold text-slate-800">
          {totalImported} records imported{totalErrors > 0 ? `, ${totalErrors} errors` : ""}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {entities.map(([key, val]) => (
          <div key={key} className={`p-3 rounded-lg border text-sm ${val.errors.length ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}`}>
            <span className="font-bold capitalize text-slate-700">{key}</span>
            <div className="flex gap-3 mt-1">
              <span className="text-green-700">✓ {val.imported}</span>
              {val.errors.length > 0 && <span className="text-red-600">✗ {val.errors.length} errors</span>}
            </div>
            {val.errors.map((e, i) => (
              <p key={i} className="text-red-600 text-[10px] mt-1">Row {e.row}: {e.error}</p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function SessionCard({
  session,
  onDelete,
  onConfirm,
}: {
  session: IntakeRead;
  onDelete: (token: string) => void;
  onConfirm: (token: string) => void;
}) {
  const schema = useLimsAuthStore.getState().tenantSchema || "";
  const intakeUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/intake/${session.token}?schema=${schema}`;
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(intakeUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const expiresDate = new Date(session.expires_at);
  const isExpiredOrConfirmed = session.is_expired || session.is_confirmed;

  return (
    <div className={`p-4 border rounded-xl space-y-3 ${isExpiredOrConfirmed ? "bg-slate-50 border-slate-200 opacity-70" : "bg-white border-blue-100 shadow-sm"}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-slate-800 text-sm">{session.label || "Untitled session"}</p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
            Expires: {expiresDate.toLocaleDateString()} {expiresDate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {session.is_confirmed ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">Imported</span>
          ) : session.is_expired ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">Expired</span>
          ) : session.has_data ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">Data Submitted</span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">Pending</span>
          )}
          <button onClick={() => onDelete(session.token)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-400 transition">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {!isExpiredOrConfirmed && (
        <div className="flex gap-2">
          <div className="flex-1 bg-slate-50 border rounded-lg px-3 py-1.5 text-[10px] font-mono text-slate-500 truncate">
            {intakeUrl}
          </div>
          <button onClick={copy} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition shrink-0">
            {copied ? <CheckCircle2 size={14} className="text-green-500" /> : <Copy size={14} className="text-slate-500" />}
          </button>
        </div>
      )}

      {session.has_data && !session.is_confirmed && !session.is_expired && (
        <button
          onClick={() => onConfirm(session.token)}
          className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition"
        >
          Review & Import
        </button>
      )}

      {session.import_result && (
        <details className="text-xs">
          <summary className="cursor-pointer text-slate-500 hover:text-slate-700 flex items-center gap-1">
            <ChevronDown size={12} /> Import result
          </summary>
          <ResultPanel result={session.import_result as ImportResult} />
        </details>
      )}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────

type Tab = "template" | "links" | "import";

export default function DataImportPage() {
  const [tab, setTab] = useState<Tab>("template");

  // Intake links
  const { data: sessions = [], isLoading: sessionsLoading } = useIntakeSessions();
  const createSession = useCreateIntakeSession();
  const deleteSession = useDeleteIntakeSession();
  const confirmImport = useConfirmIntake();

  const [newLabel, setNewLabel] = useState("");
  const [expiresHours, setExpiresHours] = useState(72);
  const [isCreating, setIsCreating] = useState(false);

  // Upload & import
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsed, setParsed] = useState<ParsedData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [previewSheet, setPreviewSheet] = useState(0);
  const [tempPassword, setTempPassword] = useState("");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Confirm modal
  const [confirmToken, setConfirmToken] = useState<string | null>(null);
  const [confirmPwd, setConfirmPwd] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError(null);
    setParsed(null);
    setImportResult(null);
    try {
      const data = await parseExcel(file);
      setParsed(data);
    } catch {
      setParseError("Could not parse the file. Make sure it is a valid .xlsx template.");
    }
  };

  const handleImport = async () => {
    if (!parsed) return;
    if (!tempPassword || tempPassword.length < 6) {
      setParseError("Please enter a temporary password (minimum 6 characters) before importing.");
      return;
    }
    setIsImporting(true);
    setImportResult(null);
    setParseError(null);
    try {
      const { _raw: _unused, ...stagingData } = parsed;
      void _unused;
      const session = await createSession.mutateAsync({ label: "Direct Upload Import", expiresHours: 1 });
      await intakeApi.submitDataAuthenticated(session.token, stagingData);
      const result = await intakeApi.confirmImport(session.token, tempPassword);
      setImportResult(result);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsImporting(false);
    }
  };

  const handleConfirmSession = async () => {
    if (!confirmToken || !confirmPwd) return;
    try {
      const result = await confirmImport.mutateAsync({ token: confirmToken, tempPassword: confirmPwd });
      setImportResult(result);
      setConfirmToken(null);
      setConfirmPwd("");
    } catch (err) {
      setParseError(String(err));
    }
  };

  const sheetKeys: (keyof IntakeStagedData)[] = ["departments", "positions", "employees", "instruments", "methods", "clients"];
  const sheetCounts = parsed
    ? sheetKeys.map((k) => parsed[k].length)
    : sheetKeys.map(() => 0);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <header className="border-b pb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Consultant Portal</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Lab Data Onboarding</h1>
        <p className="text-slate-500 mt-1 italic">
          Distribute a template to your steering committee, collect data, and bulk-import it into the LIMS.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(["template", "links", "import"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all capitalize ${
              tab === t ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t === "template" ? "1. Template" : t === "links" ? "2. Intake Links" : "3. Upload & Import"}
          </button>
        ))}
      </div>

      {/* ─── Tab 1: Template ─────────────────────────────────────────────── */}
      {tab === "template" && (
        <div className="space-y-6">
          <div className="p-6 bg-blue-50 border border-blue-100 rounded-2xl flex items-start gap-5">
            <FileSpreadsheet className="text-blue-600 shrink-0 mt-1" size={32} />
            <div className="flex-1">
              <h2 className="font-bold text-slate-900 text-lg">Download the Excel Template</h2>
              <p className="text-slate-600 text-sm mt-1">
                A workbook with 6 pre-structured sheets + a README. Share it with your steering committee
                members to fill in their respective sections offline.
              </p>
              <button
                onClick={generateTemplate}
                className="mt-4 flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
              >
                <Download size={18} /> Download Template (.xlsx)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SHEETS.map((s, i) => (
              <div key={s.name} className="p-4 bg-white border rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 text-[10px] font-black flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="font-bold text-slate-800">{s.name}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {s.headers.map((h) => (
                    <span
                      key={h}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                        h.endsWith("*")
                          ? "bg-red-50 text-red-600 border border-red-100"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {h.replace("*", "")}
                      {h.endsWith("*") && <span className="text-red-400 ml-0.5">*</span>}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 mt-2 italic">{s.note}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Tab 2: Intake Links ─────────────────────────────────────────── */}
      {tab === "links" && (
        <div className="space-y-6">
          <div className="p-5 bg-white border rounded-2xl space-y-4">
            <h2 className="font-bold text-slate-900">Create a Shareable Intake Link</h2>
            <p className="text-sm text-slate-500">
              Generate a unique URL your committee members can visit (without a LIMS account) to
              submit the filled data directly. You review and confirm the import.
            </p>

            {isCreating ? (
              <div className="flex gap-3">
                <input
                  className="flex-1 border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                  placeholder="Label (e.g. Q3 2024 Lab Setup)"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                />
                <select
                  className="border rounded-lg p-2.5 text-sm bg-white outline-none focus:ring-2 focus:ring-blue-500/30"
                  value={expiresHours}
                  onChange={(e) => setExpiresHours(Number(e.target.value))}
                >
                  <option value={24}>Expires in 24h</option>
                  <option value={72}>Expires in 3 days</option>
                  <option value={168}>Expires in 7 days</option>
                </select>
                <button
                  onClick={() => {
                    createSession.mutate({ label: newLabel || null, expiresHours });
                    setNewLabel("");
                    setIsCreating(false);
                  }}
                  disabled={createSession.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition disabled:opacity-60 flex items-center gap-1.5"
                >
                  {createSession.isPending ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />}
                  Generate
                </button>
                <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-slate-100 rounded-lg transition">
                  <X size={16} className="text-slate-400" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition"
              >
                <Plus size={16} /> New Intake Link
              </button>
            )}
          </div>

          {sessionsLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-slate-400" size={28} /></div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Clock className="mx-auto mb-2 text-slate-200" size={36} />
              <p className="text-sm">No intake links created yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => (
                <SessionCard
                  key={s.token}
                  session={s}
                  onDelete={(token) => deleteSession.mutate(token)}
                  onConfirm={(token) => { setConfirmToken(token); setTab("import"); }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Tab 3: Upload & Import ──────────────────────────────────────── */}
      {tab === "import" && (
        <div className="space-y-6">
          {/* File upload */}
          <div
            className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center hover:border-blue-300 hover:bg-blue-50/30 transition cursor-pointer"
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="mx-auto text-slate-300 mb-3" size={36} />
            <p className="text-slate-600 font-semibold">Click to upload your filled template</p>
            <p className="text-slate-400 text-sm mt-1">Accepts .xlsx files matching the template structure</p>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
          </div>

          {parseError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-sm text-red-700">
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              {parseError}
            </div>
          )}

          {/* Preview */}
          {parsed && (
            <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
              <div className="flex border-b overflow-x-auto">
                {SHEETS.map((s, i) => (
                  <button
                    key={s.name}
                    onClick={() => setPreviewSheet(i)}
                    className={`px-4 py-3 text-xs font-bold whitespace-nowrap border-r transition ${
                      previewSheet === i ? "bg-blue-50 text-blue-700 border-b-2 border-b-blue-600" : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {s.name}
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] ${sheetCounts[i] > 0 ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-400"}`}>
                      {sheetCounts[i]}
                    </span>
                  </button>
                ))}
              </div>
              <div className="p-4">
                <PreviewTable
                  rows={parsed[sheetKeys[previewSheet]] as Record<string, string>[]}
                  headers={SHEETS[previewSheet].headers}
                />
              </div>
            </div>
          )}

          {/* Import settings + run */}
          {parsed && !importResult && (
            <div className="p-6 bg-white border rounded-2xl space-y-4">
              <h3 className="font-bold text-slate-900">Import Settings</h3>
              <div>
                <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">
                  Temporary Password for Employees <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:border-blue-500 max-w-xs ${
                    tempPassword.length > 0 && tempPassword.length < 6
                      ? "border-red-400 focus:ring-red-300"
                      : "border-slate-300 focus:ring-blue-500/30"
                  }`}
                  placeholder="Enter at least 6 characters"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                />
                {tempPassword.length > 0 && tempPassword.length < 6 && (
                  <p className="text-red-500 text-xs mt-1 font-medium">Password must be at least 6 characters</p>
                )}
                {tempPassword.length === 0 && (
                  <p className="text-amber-600 text-xs mt-1 font-medium">⚠ Required — all imported employees will use this to log in for the first time</p>
                )}
                {tempPassword.length >= 6 && (
                  <p className="text-green-600 text-xs mt-1">✓ Password set</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="text-sm text-slate-500">
                  Ready to import{" "}
                  <strong className="text-slate-700">
                    {sheetCounts.reduce((a, b) => a + b, 0)} records
                  </strong>{" "}
                  across {sheetKeys.filter((_, i) => sheetCounts[i] > 0).length} sheets
                </div>
                <button
                  onClick={handleImport}
                  disabled={isImporting}
                  className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-60 shadow-lg shadow-blue-100"
                >
                  {isImporting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                  {isImporting ? "Importing..." : "Run Import"}
                </button>
              </div>
            </div>
          )}

          {importResult && <ResultPanel result={importResult} />}
        </div>
      )}

      {/* ─── Confirm session modal ────────────────────────────────────────── */}
      {confirmToken && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 space-y-5">
            <h3 className="font-black text-slate-900 text-lg">Confirm & Import</h3>
            <p className="text-sm text-slate-500">
              Set a temporary password for all employees in this intake batch.
            </p>
            <div>
              <label className="text-[11px] font-bold uppercase text-slate-500 block mb-1">Temp Password</label>
              <input
                type="password"
                minLength={6}
                className="w-full border rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="Min. 6 characters"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setConfirmToken(null)} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-lg">
                Cancel
              </button>
              <button
                onClick={handleConfirmSession}
                disabled={confirmImport.isPending || confirmPwd.length < 6}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition disabled:opacity-60 flex items-center gap-2"
              >
                {confirmImport.isPending && <Loader2 size={14} className="animate-spin" />}
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
