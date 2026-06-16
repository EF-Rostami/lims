"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, GitFork } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LimsPageLayout } from "@/features/lims/components/LimsPageLayout";
import { LimsTable } from "@/features/lims/components/LimsTable";
import { LimsStatusBadge } from "@/features/lims/components/LimsStatusBadge";
import {
  useDocumentTypes,
  useQmsDocuments,
  useCreateQmsDocument,
  useUpdateQmsDocument,
  useReviseQmsDocument,
} from "./qms-documents.queries";
import type {
  InternalDocumentRead,
  InternalDocumentCreate,
  InternalDocumentRevise,
} from "./qms-documents.api";

const emptyCreate = (): InternalDocumentCreate => ({
  title: "",
  document_type_id: 0,
  version: "1.0",
  effective_date: null,
  review_due_date: null,
  change_summary: null,
  assignments: [],
});

const emptyRevise = (): InternalDocumentRevise => ({
  version: "",
  change_summary: "",
  title: null,
  effective_date: null,
  review_due_date: null,
  assignments: [],
});

export function QmsDocumentsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [reviseOpen, setReviseOpen] = useState(false);

  const [createForm, setCreateForm] = useState<InternalDocumentCreate>(emptyCreate());
  const [editTarget, setEditTarget] = useState<InternalDocumentRead | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editEffective, setEditEffective] = useState("");
  const [editReviewDue, setEditReviewDue] = useState("");

  const [reviseTarget, setReviseTarget] = useState<InternalDocumentRead | null>(null);
  const [reviseForm, setReviseForm] = useState<InternalDocumentRevise>(emptyRevise());

  const { data: documents = [], isLoading } = useQmsDocuments();
  const { data: docTypes = [] } = useDocumentTypes();
  const createDoc = useCreateQmsDocument();
  const updateDoc = useUpdateQmsDocument();
  const reviseDoc = useReviseQmsDocument();

  const openCreate = () => {
    setCreateForm(emptyCreate());
    setCreateOpen(true);
  };

  const openEdit = (doc: InternalDocumentRead) => {
    setEditTarget(doc);
    setEditTitle(doc.title);
    setEditEffective(doc.effective_date ?? "");
    setEditReviewDue(doc.review_due_date ?? "");
    setEditOpen(true);
  };

  const openRevise = (doc: InternalDocumentRead) => {
    setReviseTarget(doc);
    const nextMinor = bumpVersion(doc.version);
    setReviseForm({ ...emptyRevise(), version: nextMinor });
    setReviseOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createDoc.mutateAsync(createForm);
    setCreateOpen(false);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTarget) return;
    await updateDoc.mutateAsync({
      id: editTarget.id,
      data: {
        title: editTitle || null,
        effective_date: editEffective || null,
        review_due_date: editReviewDue || null,
      },
    });
    setEditOpen(false);
  };

  const handleRevise = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviseTarget) return;
    await reviseDoc.mutateAsync({ id: reviseTarget.id, data: reviseForm });
    setReviseOpen(false);
  };

  return (
    <LimsPageLayout
      title="Document Control"
      description="Controlled documents with version history per ISO 17025 §8.3"
      actionLabel="New Document"
      onAction={openCreate}
    >
      <LimsTable
        data={documents}
        isLoading={isLoading}
        emptyMessage="No controlled documents. Create your first document."
        columns={[
          {
            header: "System ID",
            render: (d) => <span className="font-mono text-xs font-semibold">{d.system_id}</span>,
          },
          {
            header: "Title",
            render: (d) => (
              <div>
                <p className="font-medium">{d.title}</p>
                {d.supersedes_document_id && (
                  <p className="text-xs text-slate-400">Supersedes #{d.supersedes_document_id}</p>
                )}
              </div>
            ),
          },
          {
            header: "Version",
            render: (d) => (
              <span className="font-mono text-sm">
                v{d.version} <span className="text-slate-400">(rev {d.revision_number})</span>
              </span>
            ),
          },
          {
            header: "Status",
            render: (d) => <LimsStatusBadge status={d.status.toUpperCase()} />,
          },
          {
            header: "Review Due",
            render: (d) => (
              <span className="text-slate-500 text-sm">{d.review_due_date ?? "—"}</span>
            ),
          },
          {
            header: "",
            className: "w-10",
            render: (d) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openEdit(d)}>
                    <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => openRevise(d)}>
                    <GitFork className="h-3.5 w-3.5 mr-2" /> Create Revision
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
      />

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input
                required
                value={createForm.title}
                onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Document Type *</Label>
                <Select
                  value={createForm.document_type_id ? String(createForm.document_type_id) : ""}
                  onValueChange={(v) =>
                    setCreateForm((f) => ({ ...f, document_type_id: Number(v) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {docTypes.map((t) => (
                      <SelectItem key={t.id} value={String(t.id)}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Version</Label>
                <Input
                  value={createForm.version}
                  onChange={(e) => setCreateForm((f) => ({ ...f, version: e.target.value }))}
                  placeholder="1.0"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Effective Date</Label>
                <Input
                  type="date"
                  value={createForm.effective_date ?? ""}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, effective_date: e.target.value || null }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label>Review Due</Label>
                <Input
                  type="date"
                  value={createForm.review_due_date ?? ""}
                  onChange={(e) =>
                    setCreateForm((f) => ({ ...f, review_due_date: e.target.value || null }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Change Summary</Label>
              <Textarea
                rows={2}
                value={createForm.change_summary ?? ""}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, change_summary: e.target.value || null }))
                }
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createDoc.isPending || !createForm.document_type_id}
              >
                Create Document
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 mt-2">
            <div className="space-y-1">
              <Label>Title</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Effective Date</Label>
                <Input
                  type="date"
                  value={editEffective}
                  onChange={(e) => setEditEffective(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Review Due</Label>
                <Input
                  type="date"
                  value={editReviewDue}
                  onChange={(e) => setEditReviewDue(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateDoc.isPending}>
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Revise dialog */}
      <Dialog open={reviseOpen} onOpenChange={setReviseOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Revision — {reviseTarget?.system_id}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500 -mt-1">
            Creates a new controlled version. The current document will be marked as{" "}
            <strong>Superseded</strong>.
          </p>
          <form onSubmit={handleRevise} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>New Version *</Label>
                <Input
                  required
                  value={reviseForm.version}
                  onChange={(e) => setReviseForm((f) => ({ ...f, version: e.target.value }))}
                  placeholder="e.g. 2.0"
                />
              </div>
              <div className="space-y-1">
                <Label>Effective Date</Label>
                <Input
                  type="date"
                  value={reviseForm.effective_date ?? ""}
                  onChange={(e) =>
                    setReviseForm((f) => ({ ...f, effective_date: e.target.value || null }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Change Summary *</Label>
              <Textarea
                required
                rows={3}
                value={reviseForm.change_summary}
                onChange={(e) => setReviseForm((f) => ({ ...f, change_summary: e.target.value }))}
                placeholder="Describe what changed in this revision..."
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setReviseOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={reviseDoc.isPending}>
                Create Revision
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </LimsPageLayout>
  );
}

function bumpVersion(v: string): string {
  const parts = v.split(".");
  const last = parseInt(parts[parts.length - 1] ?? "0", 10);
  parts[parts.length - 1] = String(last + 1);
  return parts.join(".");
}
