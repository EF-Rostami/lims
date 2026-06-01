"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { LimsPageLayout } from "@/features/lims/components/LimsPageLayout";
import { LimsTable } from "@/features/lims/components/LimsTable";
import { useSignatures, useCreateSignature } from "./signatures.queries";
import type { ListSignaturesParams, SignatureCreate, SignatureContext } from "./signatures.api";

const ENTITY_TYPES = ["result", "report", "sample", "order", "finding"];
const CONTEXTS: SignatureContext[] = ["RESULT_VALIDATION", "RESULT_APPROVAL", "REPORT_ISSUE", "SAMPLE_RECEIPT", "FINDING_RESOLUTION"];

const emptySignForm = (): SignatureCreate => ({
  entity_type: "",
  entity_id: 0,
  context: "RESULT_APPROVAL",
  meaning: "",
});

export function SignaturesPage() {
  const [query, setQuery] = useState<ListSignaturesParams | null>(null);
  const [draft, setDraft] = useState({ entity_type: "", entity_id: "" });
  const [signOpen, setSignOpen] = useState(false);
  const [signForm, setSignForm] = useState<SignatureCreate>(emptySignForm());

  const { data: signatures = [], isLoading } = useSignatures(
    query ?? { entity_type: "result", entity_id: 0 }
  );
  const createSig = useCreateSignature();

  const search = () => {
    if (!draft.entity_type || !draft.entity_id) return;
    setQuery({ entity_type: draft.entity_type, entity_id: Number(draft.entity_id) });
  };

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    await createSig.mutateAsync(signForm);
    setSignOpen(false);
    setSignForm(emptySignForm());
    if (query) setQuery({ ...query });
  };

  return (
    <LimsPageLayout
      title="Signatures"
      description="Electronic signatures for results, reports and other records"
      actionLabel="Add Signature"
      onAction={() => { setSignForm(emptySignForm()); setSignOpen(true); }}
    >
      {/* Query bar */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-white p-4 shadow-sm">
        <div className="space-y-1 min-w-40">
          <Label className="text-xs">Entity Type</Label>
          <Select value={draft.entity_type} onValueChange={(v) => setDraft((d) => ({ ...d, entity_type: v }))}>
            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
            <SelectContent>
              {ENTITY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1 min-w-30">
          <Label className="text-xs">Entity ID</Label>
          <Input
            type="number"
            placeholder="e.g. 42"
            value={draft.entity_id}
            onChange={(e) => setDraft((d) => ({ ...d, entity_id: e.target.value }))}
          />
        </div>
        <Button onClick={search} size="sm" disabled={!draft.entity_type || !draft.entity_id}>
          <Search className="h-3.5 w-3.5 mr-1.5" />Search
        </Button>
        {query && <span className="ml-auto text-xs text-slate-400">{signatures.length} signature(s)</span>}
      </div>

      {query ? (
        <LimsTable
          data={signatures}
          isLoading={isLoading}
          emptyMessage="No signatures for this record."
          columns={[
            { header: "Context", render: (s) => <span className="font-medium text-sm">{s.context}</span> },
            { header: "Meaning", render: (s) => <span className="text-slate-600">{s.meaning}</span> },
            { header: "User", render: (s) => <span className="text-slate-500 text-xs">User #{s.user_id}</span> },
            { header: "Signed At", render: (s) => <span className="text-slate-500 text-xs whitespace-nowrap">{new Date(s.signed_at).toLocaleString()}</span> },
            { header: "IP", render: (s) => <span className="font-mono text-xs text-slate-400">{s.ip_address ?? "—"}</span> },
          ]}
        />
      ) : (
        <div className="rounded-lg border border-dashed bg-slate-50 p-12 text-center text-slate-400 text-sm">
          Select an entity type and ID above to view its signatures.
        </div>
      )}

      <Dialog open={signOpen} onOpenChange={setSignOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Add Signature</DialogTitle></DialogHeader>
          <form onSubmit={handleSign} className="space-y-3 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Entity Type *</Label>
                <Select value={signForm.entity_type} onValueChange={(v) => setSignForm((f) => ({ ...f, entity_type: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {ENTITY_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Entity ID *</Label><Input required type="number" value={signForm.entity_id || ""} onChange={(e) => setSignForm((f) => ({ ...f, entity_id: Number(e.target.value) }))} /></div>
            </div>
            <div className="space-y-1">
              <Label>Context *</Label>
              <Select value={signForm.context} onValueChange={(v) => setSignForm((f) => ({ ...f, context: v as SignatureContext }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CONTEXTS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Meaning *</Label><Input required value={signForm.meaning} onChange={(e) => setSignForm((f) => ({ ...f, meaning: e.target.value }))} placeholder="e.g. I approve these results" /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSignOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={!signForm.entity_type || !signForm.entity_id || createSig.isPending}>
                <Plus className="h-3.5 w-3.5 mr-1" />Sign
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </LimsPageLayout>
  );
}
