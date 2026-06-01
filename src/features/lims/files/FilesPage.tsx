"use client";

import { useRef, useState } from "react";
import { Trash2, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { LimsPageLayout } from "@/features/lims/components/LimsPageLayout";
import { LimsTable } from "@/features/lims/components/LimsTable";
import { LimsStatusBadge } from "@/features/lims/components/LimsStatusBadge";
import { useFiles, useUploadFile, useDeleteFile } from "./files.queries";
import type { LabFileListItem, FileCategory, UploadFileParams } from "./files.api";

const CATEGORIES: FileCategory[] = [
  "RESULT_ATTACHMENT",
  "METHOD_DOCUMENT",
  "INSTRUMENT_DOCUMENT",
  "SAMPLE_ATTACHMENT",
  "REPORT",
  "OTHER",
];

export function FilesPage() {
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<FileCategory>("OTHER");
  const [deleteTarget, setDeleteTarget] = useState<LabFileListItem | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: files = [], isLoading } = useFiles();
  const upload = useUploadFile();
  const remove = useDeleteFile();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    const params: UploadFileParams = { file: selectedFile, category };
    await upload.mutateAsync(params);
    setOpen(false);
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <LimsPageLayout
      title="Files"
      description="Documents, attachments, and reports"
      actionLabel="Upload File"
      onAction={() => setOpen(true)}
    >
      <LimsTable
        data={files}
        isLoading={isLoading}
        emptyMessage="No files uploaded yet."
        columns={[
          { header: "Filename", render: (f) => <span className="font-medium">{f.original_filename}</span> },
          { header: "Category", render: (f) => <LimsStatusBadge status={f.category} /> },
          { header: "Size", render: (f) => <span className="text-slate-500 text-xs">{formatSize(f.file_size)}</span> },
          { header: "Entity", render: (f) => <span className="text-slate-500 text-xs">{f.related_entity_type ?? "—"} {f.related_entity_id ? `#${f.related_entity_id}` : ""}</span> },
          {
            header: "",
            className: "w-20 text-right",
            render: (f) => (
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  asChild
                >
                  <a href={`${process.env.NEXT_PUBLIC_API_URL_LIMS ?? "http://127.0.0.1:8000/api/v1/lims"}/files/${f.id}/download`} download={f.original_filename}>
                    <Download className="h-3.5 w-3.5" />
                  </a>
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700" onClick={() => setDeleteTarget(f)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      {/* Upload dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Upload File</DialogTitle></DialogHeader>
          <form onSubmit={handleUpload} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label>File *</Label>
              <input
                ref={fileRef}
                type="file"
                required
                className="block w-full text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:text-sm file:font-medium file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="space-y-1">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as FileCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c.replace(/_/g, " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!selectedFile || upload.isPending}>
                <Upload className="h-3.5 w-3.5 mr-1.5" /> Upload
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete File</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600">Delete <strong>{deleteTarget?.original_filename}</strong>? This cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" disabled={remove.isPending} onClick={() => { remove.mutateAsync(deleteTarget!.id); setDeleteTarget(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LimsPageLayout>
  );
}
