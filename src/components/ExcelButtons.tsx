"use client";

import { useRef, useState } from "react";
import { Download, Upload, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { exportToExcel, parseExcelFile } from "@/lib/excel";

export interface ImportError {
  row: number;
  message: string;
}

export interface ImportResult {
  imported: number;
  errors: ImportError[];
}

interface ExcelButtonsProps {
  /** Called to fetch rows for export. Returns the array to write to Excel. */
  onExport: () => Promise<Record<string, unknown>[]>;
  /** Export filename (without .xlsx extension) */
  exportFilename: string;
  /** Called with parsed rows from the uploaded file. Must return ImportResult. */
  onImport: (rows: Record<string, unknown>[]) => Promise<ImportResult>;
}

export function ExcelButtons({ onExport, exportFilename, onImport }: ExcelButtonsProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const rows = await onExport();
      exportToExcel(rows, exportFilename);
    } finally {
      setExporting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    setImporting(true);
    try {
      const rows = await parseExcelFile(file);
      const res = await onImport(rows);
      setResult(res);
    } catch (err: unknown) {
      setResult({
        imported: 0,
        errors: [{ row: 0, message: String((err as Error)?.message ?? err) }],
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs gap-1"
        onClick={handleExport}
        disabled={exporting}
      >
        <Download className="h-3 w-3" />
        {exporting ? "Exporting…" : "Export"}
      </Button>

      <Button
        size="sm"
        variant="outline"
        className="h-7 text-xs gap-1"
        onClick={() => fileRef.current?.click()}
        disabled={importing}
      >
        <Upload className="h-3 w-3" />
        {importing ? "Importing…" : "Import"}
      </Button>
      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleFileChange}
      />

      <Dialog open={!!result} onOpenChange={(o) => !o && setResult(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Import Result</DialogTitle>
          </DialogHeader>
          {result && (
            <div className="space-y-3 py-1">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">{result.imported} record(s) imported successfully</span>
              </div>
              {result.errors.length > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium">{result.errors.length} error(s)</span>
                  </div>
                  <div className="max-h-40 overflow-y-auto rounded border px-3 py-2 space-y-1">
                    {result.errors.map((e, i) => (
                      <p key={i} className="text-xs text-muted-foreground">
                        Row {e.row}: {e.message}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setResult(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
