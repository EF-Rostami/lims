// @ts-nocheck — legacy QMS/document pages pending backend_v3 migration
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, FileUp, FileText, CheckCircle2, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input"; // Fixes: 'Input' is not defined
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { internalDocumentService } from "@/services/internalDocument/internalDocument.service";

export default function EditDocumentContentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        const res: any = await internalDocumentService.getById(parseInt(params.id));
        
        // Fixes: Property 'versions' does not exist error
        // We cast 'res' to any or access the nested data safely
        const docData = res.data || res;
        const latestVersion = docData.versions?.[0];
        
        setContent(latestVersion?.content || "");
      } catch (err) {
        console.error("Failed to load document content", err);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, [params.id]);

  const handleSaveText = async () => {
    setSaving(true);
    try {
      await internalDocumentService.updateContent(parseInt(params.id), content);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert("Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;
    setSaving(true);
    try {
      await internalDocumentService.uploadFile(parseInt(params.id), file);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert("Upload failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading editor...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Document Content Editor</h2>
          <p className="text-sm text-muted-foreground">Prepare the technical content for verification.</p>
        </div>
        {success && (
          <div className="flex items-center gap-2 text-green-600 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">Changes saved successfully</span>
          </div>
        )}
      </div>

      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="editor">Text Editor</TabsTrigger>
          <TabsTrigger value="upload">File Attachment</TabsTrigger>
        </TabsList>

        <TabsContent value="editor">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" /> Internal Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea 
                placeholder="Type the SOP content..."
                className="min-h-100 font-mono text-sm"
                value={content}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
              />
              <div className="flex justify-end">
                <Button onClick={handleSaveText} disabled={saving}>
                  {saving ? "Saving..." : "Save Content"}
                  <Save className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileUp className="h-4 w-4" /> External Document Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-10 text-center space-y-4">
                {/* Fixes: Parameter 'e' implicitly has an 'any' type */}
                <Input 
                  type="file" 
                  className="max-w-xs mx-auto" 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)}
                />
                <p className="text-xs text-muted-foreground">Accepted formats: PDF, DOCX, XLSX</p>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={handleFileUpload} disabled={saving || !file}>
                  {saving ? "Uploading..." : "Upload & Update Version"}
                  <FileUp className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Alert className="bg-amber-50 border-amber-200">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 text-xs">
          Once finished, return to the **Overview** to &quot;Submit for Verification.&quot;
        </AlertDescription>
      </Alert>
    </div>
  );
}