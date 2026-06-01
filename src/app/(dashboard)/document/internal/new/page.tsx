// @ts-nocheck — legacy QMS/document pages pending backend_v3 migration
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, Users, FileText, AlertCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { internalDocumentService } from "@/services/internalDocument/internalDocument.service";
import { usersApi } from "@/features/lims/users/users.api";

export default function NewInternalDocumentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docTypes, setDocTypes] = useState<any[]>([]);
  const [staff, setStaff] = useState<{ label: string; value: string }[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    doc_type_id: "",
    initial_version_tag: "1.0",
    drafter_ids: [] as string[],
    verifier_ids: [] as string[],
    approver_id: "",
  });

  useEffect(() => {
    const loadInitData = async () => {
      try {
        const typesRes = await internalDocumentService.getTypes();
        const staffRes = await usersApi.list({ is_active: true });
        
        // Handle potential different response shapes
        const typesData = (typesRes as any).data || typesRes;
        const staffData = (staffRes as any).data || staffRes;

        setDocTypes(Array.isArray(typesData) ? typesData : []);
        setStaff(Array.isArray(staffData) ? staffData.map((u: any) => ({ 
          label: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.email, 
          value: u.id.toString() 
        })) : []);
      } catch (err) {
        console.error("Failed to load data", err);
      }
    };
    loadInitData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        title: formData.title,
        doc_type_id: parseInt(formData.doc_type_id),
        initial_version_tag: formData.initial_version_tag,
        drafter_ids: formData.drafter_ids.map(id => parseInt(id)),
        verifier_ids: formData.verifier_ids.map(id => parseInt(id)),
        approver_id: formData.approver_id ? parseInt(formData.approver_id) : null,
      };

      const res: any = await internalDocumentService.createDraft(payload as any);
      
      // Fix: Check multiple places for ID based on API response structure
      const newId = res?.id || res?.data?.id;

      if (newId) {
        router.push(`/document/internal/${newId}`);
      } else {
        throw new Error("API did not return a document ID");
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "Check your workflow assignments.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild><Link href="/document/internal"><ChevronLeft /></Link></Button>
        <h1 className="text-2xl font-bold">Register Document & Workflow</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Submission Failed</AlertTitle>
          <AlertDescription>{typeof error === 'string' ? error : JSON.stringify(error)}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Document Metadata</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Document Type</Label>
                <Select required onValueChange={v => setFormData({...formData, doc_type_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {docTypes.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Initial Version</Label>
                <Input value={formData.initial_version_tag} onChange={e => setFormData({...formData, initial_version_tag: e.target.value})} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100 bg-blue-50/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700"><Users className="h-5 w-5" /> Approval Workflow</CardTitle>
            <CardDescription>Assign technical verifiers and final approval authority.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <Label>Verifiers (Consensus Required)</Label>
              <MultiSelect
                options={staff}
                onValueChange={(vals: string[]) => {// Schedule the update for the next tick to avoid the render-phase error
                  setTimeout(() => {
                    setFormData(prev => ({ ...prev, verifier_ids: vals }));
                  }, 0);
                }}
                placeholder="Select one or more verifiers..."
              />
            </div>
            <div className="grid gap-2">
              <Label>Final Approver (Authority)</Label>
              <Select required onValueChange={v => setFormData({...formData, approver_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select final authority" /></SelectTrigger>
                <SelectContent>
                  {staff.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pb-10">
          <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? "Processing..." : "Create Document Entry"}
            <Save className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}