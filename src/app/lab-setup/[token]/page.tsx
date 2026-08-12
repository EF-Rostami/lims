"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import {
  AlertCircle, CheckCircle2, ChevronDown, ChevronRight,
  FileSpreadsheet, Loader2, Upload, X,
} from "lucide-react";
import { onboardingApi, type SheetResult, type UploadResult } from "@/features/lims/onboarding/onboarding.api";

// ── sheet result row ───────────────────────────────────────────────────────

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
          open
            ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
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

// ── upload zone ───────────────────────────────────────────────────────────

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

// ── main page ─────────────────────────────────────────────────────────────

export default function LabSetupPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const token = params.token as string;
  const schema = searchParams.get("schema") ?? "";

  const [inviteInfo, setInviteInfo] = useState<{ lab_name: string | null; note: string | null; expires_at: string } | null>(null);
  const [infoError, setInfoError] = useState<string | null>(null);
  const [infoLoading, setInfoLoading] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!token || !schema) {
      setInfoError("Invalid link — missing token or schema.");
      setInfoLoading(false);
      return;
    }
    onboardingApi.getInviteInfo(token, schema)
      .then(setInviteInfo)
      .catch((e: unknown) => setInfoError(e instanceof Error ? e.message : "Invalid or expired link"))
      .finally(() => setInfoLoading(false));
  }, [token, schema]);

  async function handleUpload(file: File) {
    setUploading(true);
    setResult(null);
    setUploadError(null);
    try {
      const data = await onboardingApi.uploadViaInvite(token, file, schema);
      setResult(data);
    } catch (e: unknown) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  // ── loading ──────────────────────────────────────────────────────────────

  if (infoLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // ── invalid / expired ────────────────────────────────────────────────────

  if (infoError || !inviteInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-sm w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
          <h1 className="text-lg font-semibold text-gray-900">Link not valid</h1>
          <p className="text-sm text-gray-500">{infoError ?? "This link is invalid or has expired."}</p>
        </div>
      </div>
    );
  }

  const expired = new Date(inviteInfo.expires_at) < new Date();

  // ── main ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white mb-2">
            <Upload className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {inviteInfo.lab_name ? `${inviteInfo.lab_name} — Data Upload` : "Lab Data Upload"}
          </h1>
          {inviteInfo.note && (
            <p className="text-sm text-gray-500 max-w-md mx-auto">{inviteInfo.note}</p>
          )}
          <p className="text-xs text-gray-400">
            Link expires {new Date(inviteInfo.expires_at).toLocaleDateString()}
          </p>
        </div>

        {/* Expired banner */}
        {expired && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            This link has expired. Please ask your consultant to generate a new one.
          </div>
        )}

        {/* Upload card */}
        {!expired && !result && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-500" />
              Upload your filled workbook
            </h2>
            <p className="text-sm text-gray-500">
              Upload the Excel file your consultant shared with you. All sheets will be imported automatically.
            </p>

            <UploadZone onUpload={handleUpload} loading={uploading} />

            {uploadError && (
              <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">
                <X className="w-4 h-4 shrink-0" />
                {uploadError}
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              <div>
                <p className="text-base font-semibold text-gray-900">Import complete</p>
                <p className="text-sm text-gray-500">
                  <span className="text-green-600 font-medium">{result.total_imported} records added</span>
                  {result.total_errors > 0 && (
                    <span className="text-amber-600 font-medium">, {result.total_errors} errors</span>
                  )}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {result.sheets.map((s) => (
                <SheetRow key={s.sheet} s={s} />
              ))}
            </div>
            <p className="text-xs text-gray-400 pt-2 border-t border-gray-100">
              Your data has been imported. You can close this page.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
