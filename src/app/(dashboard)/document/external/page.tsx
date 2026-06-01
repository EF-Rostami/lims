//* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Download, ExternalLink, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ExternalRegistryPage() {
  const [search, setSearch] = useState("");
  // Mock data for structure
  const [docs] = useState([
    { 
      id: 1, 
      title: "ISO/IEC 17025:2017", 
      issuer: "ISO", 
      status: "CURRENT", 
      next_review: "2026-12-01" 
    },
    { 
      id: 2, 
      title: "Agilent GC-MS Manual", 
      issuer: "Agilent", 
      status: "REVIEW_DUE", 
      next_review: "2024-01-15" 
    }
  ]);

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">External Registry</h1>
          <p className="text-muted-foreground">Standards and references from third-party issuers.</p>
        </div>
        <Button asChild>
          <Link href="/document/external/register">Register New Document</Link>
        </Button>
      </div>

      <div className="flex items-center gap-4 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by title or issuer..." 
            className="pl-10" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-3">
        {docs.map(doc => (
          <Card key={doc.id} className={doc.status === 'REVIEW_DUE' ? "border-red-200" : ""}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className={`p-2 rounded ${doc.status === 'REVIEW_DUE' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'}`}>
                  {doc.status === 'REVIEW_DUE' ? <AlertTriangle className="h-5 w-5" /> : <ExternalLink className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{doc.title}</h3>
                  <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                    <span>Issuer: <b>{doc.issuer}</b></span>
                    <span>Review Due: <b>{doc.next_review}</b></span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={doc.status === 'REVIEW_DUE' ? 'destructive' : 'outline'}>
                  {doc.status.replace("_", " ")}
                </Badge>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/document/external/${doc.id}`}><Download className="h-4 w-4" /></Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}