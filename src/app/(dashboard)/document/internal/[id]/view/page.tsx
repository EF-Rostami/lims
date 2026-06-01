// @ts-nocheck — legacy QMS/document pages pending backend_v3 migration
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { FileText, Download, Eye, Calendar, Tag, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Separator } from "@/components/ui/separator";
import { internalDocumentService } from "@/services/internalDocument/internalDocument.service";

export default function DocumentViewPage({ params }: { params: { id: string } }) {
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDoc = async () => {
      try {
        const res: any = await internalDocumentService.getById(parseInt(params.id));
        setDoc(res.data || res);
      } catch (err) {
        console.error("View error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDoc();
  }, [params.id]);

  const handleDownload = async () => {
    try {
      const response = await internalDocumentService.downloadFile(doc.id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${doc.system_id}_${doc.current_version_tag}.pdf`);
      document.body.appendChild(link);
      link.click();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      alert("Download failed. Ensure a file exists for this version.");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading document...</div>;
  if (!doc) return <div className="p-10 text-center">Document not found.</div>;

  const latestVersion = doc.versions?.[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header Info */}
      <div className="flex justify-between items-start border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{doc.title}</h1>
          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Tag className="h-3 w-3" /> {doc.system_id}</span>
            <span className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Version {doc.current_version_tag}</span>
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Released: {doc.release_date ? new Date(doc.release_date).toLocaleDateString() : 'Draft'}</span>
          </div>
        </div>
        <Button onClick={handleDownload} variant="outline" className="gap-2">
          <Download className="h-4 w-4" /> Download Official PDF
        </Button>
      </div>

      {/* Content Area */}
      {latestVersion?.file_path ? (
        <Card className="bg-slate-100 border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <FileText className="h-16 w-16 text-slate-400 mb-4" />
            <p className="text-slate-600 font-medium">Document is an uploaded file.</p>
            <Button variant="link" onClick={handleDownload}>Click here to download and view</Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" /> Document Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-slate max-w-none whitespace-pre-wrap font-sans text-slate-800 leading-relaxed">
              {latestVersion?.content || "No content available for this version."}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer / Read Confirmation Placeholder */}
      <Card className="bg-blue-50 border-blue-100">
        <CardContent className="p-4 flex items-center justify-between">
          <p className="text-xs text-blue-800">
            This is a controlled document. Uncontrolled when printed.
          </p>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => internalDocumentService.confirmRead(doc.id)}>
            Confirm I have read this
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}