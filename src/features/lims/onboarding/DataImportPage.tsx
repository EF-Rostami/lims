"use client";

import { useCallback, useRef, useState } from "react";
import {
  AlertCircle, CheckCircle2, ChevronDown, ChevronRight,
  Copy, Download, FileSpreadsheet, Link2, Loader2,
  RefreshCw, Trash2, Upload, X,
} from "lucide-react";
import { useLimsAuthStore } from "@/features/lims-auth/lims-auth.store";
import { onboardingApi, type InviteRead, type SheetResult, type UploadResult } from "./onboarding.api";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// ── sheet status icons ───────────────────────────────────────────────────────

function SheetRow({ s }: { s: SheetResult }) {
  const [open, setOpen] = useState(false);
  const hasErrors = s.errors.length > 0;
  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <button
        onClick={() => hasErrors && setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        {hasErrors ? (
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
        )}
        <span className="flex-1 text-sm font-medium text-gray-800">{s.sheet}</span>
        <span className="text-xs text-gray-500">
          {s.imported} imported{s.errors.length > 0 ? `, ${s.errors.length} errors` : ""}
        </span>
        {hasErrors && (
          open ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
        )}
      </button>
      {open && hasErrors && (
        <div className="border-t border-gray-100 bg-amber-50 px-4 py-3 space-y-1">
          {s.errors.map((e, i) => (
            <p key={i} className="text-xs text-amber-800">
              <span className="font-semibold">Row {e.row}:</span> {e.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

// ── upload zone ───────────────────────────────────────────────────────────────

function UploadZone({
  onUpload,
  loading,
}: {
  onUpload: (file: File) => void;
  loading: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onUpload(file);
    },
    [onUpload]
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !loading && inputRef.current?.click()}
      className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
        dragging ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
      } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xlsm"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }}
      />
      {loading ? (
        <div className="flex flex-col items-center gap-3 text-blue-600">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-medium">Importing data…</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <FileSpreadsheet className="w-10 h-10" />
          <div>
            <p className="text-sm font-medium text-gray-600">Drop your Excel file here</p>
            <p className="text-xs mt-1">or click to browse — .xlsx files only</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── invite panel ──────────────────────────────────────────────────────────────

function InvitePanel({ schema, authToken }: { schema: string; authToken: string }) {
  const [invites, setInvites] = useState<InviteRead[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [labName, setLabName] = useState("");
  const [note, setNote] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadInvites() {
    setLoading(true);
    try {
      const data = await onboardingApi.listInvites(authToken, schema);
      setInvites(data);
      setLoaded(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load invites");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    setCreating(true);
    setError(null);
    try {
      const inv = await onboardingApi.createInvite(authToken, schema, {
        lab_name: labName || undefined,
        note: note || undefined,
      });
      setInvites((prev) => [inv, ...prev]);
      setLabName("");
      setNote("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create invite");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: number) {
    await onboardingApi.revokeInvite(id, authToken, schema);
    setInvites((prev) => prev.filter((i) => i.id !== id));
  }

  function copyLink(inv: InviteRead) {
    navigator.clipboard.writeText(`${SITE_URL}/lab-setup/${inv.token}?schema=${schema}`);
    setCopied(inv.id);
    setTimeout(() => setCopied(null), 2000);
  }

  if (!loaded) {
    return (
      <button
        onClick={loadInvites}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
        Manage shareable links
      </button>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <input
          value={labName}
          onChange={(e) => setLabName(e.target.value)}
          placeholder="Lab name (optional)"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note for the lab admin (optional)"
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={handleCreate}
        disabled={creating}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
        Generate invite link
      </button>

      {invites.length > 0 && (
        <div className="space-y-2">
          {invites.map((inv) => {
            const link = `${SITE_URL}/lab-setup/${inv.token}?schema=${schema}`;
            const expired = new Date(inv.expires_at) < new Date();
            return (
              <div key={inv.id} className="flex items-center gap-3 border border-gray-100 rounded-lg px-4 py-3 bg-gray-50">
                <div className="flex-1 min-w-0">
                  {inv.lab_name && <p className="text-xs font-medium text-gray-700">{inv.lab_name}</p>}
                  <p className="text-xs text-gray-400 truncate font-mono">{link}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Expires {new Date(inv.expires_at).toLocaleDateString()}
                    {inv.used_at && " · Used"}
                    {expired && " · Expired"}
                  </p>
                </div>
                <button
                  onClick={() => copyLink(inv)}
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                  title="Copy link"
                >
                  {copied === inv.id ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleRevoke(inv.id)}
                  className="text-gray-300 hover:text-red-500 transition-colors"
                  title="Revoke"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

export function DataImportPage() {
  const { accessToken, tenantSchema } = useLimsAuthStore();
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!accessToken || !tenantSchema) return null;

  async function handleUpload(file: File) {
    setUploading(true);
    setResult(null);
    setUploadError(null);
    try {
      const data = await onboardingApi.upload(file, accessToken!, tenantSchema!);
      setResult(data);
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  const templateBase = `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000"}/api/v1/lims/onboarding/template`;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lab Data Import</h1>
        <p className="text-sm text-gray-500 mt-1">
          Import baseline laboratory data in one step — departments, staff, equipment, methods, and more.
        </p>
      </div>

      {/* Template download */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <Download className="w-4 h-4 text-blue-500" />
          Step 1 — Download template
        </h2>
        <p className="text-sm text-gray-500">
          The workbook has 8 sheets in import order. Fill in your lab&apos;s data, then upload below.
        </p>
        <div className="flex gap-3">
          <a
            href={`${templateBase}?token=${accessToken}&x-tenant-schema=${tenantSchema}`}
            download
            onClick={(e) => {
              e.preventDefault();
              fetch(`${templateBase}`, {
                headers: { Authorization: `Bearer ${accessToken}`, "x-tenant-schema": tenantSchema },
              }).then((r) => r.blob()).then((b) => {
                const a = document.createElement("a");
                a.href = URL.createObjectURL(b);
                a.download = "blims_onboarding_template.xlsx";
                a.click();
              });
            }}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-gray-400" />
            Blank template
          </a>
          <button
            onClick={() => {
              fetch(`${templateBase}?sample=true`, {
                headers: { Authorization: `Bearer ${accessToken}`, "x-tenant-schema": tenantSchema },
              }).then((r) => r.blob()).then((b) => {
                const a = document.createElement("a");
                a.href = URL.createObjectURL(b);
                a.download = "blims_onboarding_sample.xlsx";
                a.click();
              });
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Sample with dairy lab data
          </button>
        </div>
      </div>

      {/* Upload */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <Upload className="w-4 h-4 text-blue-500" />
          Step 2 — Upload filled workbook
        </h2>

        <UploadZone onUpload={handleUpload} loading={uploading} />

        {uploadError && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
            <X className="w-4 h-4 shrink-0" />
            {uploadError}
          </div>
        )}

        {result && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-800">
                Import complete —{" "}
                <span className="text-green-600">{result.total_imported} records added</span>
                {result.total_errors > 0 && (
                  <span className="text-amber-600">, {result.total_errors} errors</span>
                )}
              </p>
              <button
                onClick={() => setResult(null)}
                className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Import again
              </button>
            </div>
            <div className="space-y-2">
              {result.sheets.map((s) => (
                <SheetRow key={s.sheet} s={s} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Shareable invite */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
          <Link2 className="w-4 h-4 text-blue-500" />
          Step 3 — Share with lab admin (optional)
        </h2>
        <p className="text-sm text-gray-500">
          Generate a secure link so the lab admin can upload data directly — no login required.
        </p>
        <InvitePanel schema={tenantSchema} authToken={accessToken} />
      </div>

    </div>
  );
}
