// @ts-nocheck — legacy QMS/document pages pending backend_v3 migration
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Library, FileText, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // <--- Add this line to fix the error
import { internalDocumentService } from "@/services/internalDocument/internalDocument.service";

export default function DocumentLibraryPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchReleased = async () => {
      try {
        const res: any = await internalDocumentService.list({ status: "RELEASED" });
        setDocs(res.data || res);
      } catch (err) {
        console.error("Library fetch failed:", err);
      }
    };
    fetchReleased();
  }, []);

  const filteredDocs = Array.isArray(docs) ? docs.filter(d => 
    d.title?.toLowerCase().includes(search.toLowerCase()) || 
    d.system_id?.toLowerCase().includes(search.toLowerCase())
  ) : [];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Library className="h-6 w-6" /> Controlled Document Library
        </h1>
        <p className="text-muted-foreground">Access approved laboratory procedures and policies.</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          className="pl-10" 
          placeholder="Search Title or System ID..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {filteredDocs.length === 0 ? (
          <p className="text-sm text-muted-foreground italic py-10 text-center border rounded-lg border-dashed">
            No released documents found.
          </p>
        ) : (
          filteredDocs.map(doc => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-2 rounded">
                    <FileText className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{doc.title}</h3>
                    <p className="text-xs text-muted-foreground">{doc.system_id} • v{doc.current_version_tag}</p>
                  </div>
                </div>
                <Button asChild variant="ghost" className="gap-2">
                  <Link href={`/document/library/${doc.id}`}>
                    Open Document <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}