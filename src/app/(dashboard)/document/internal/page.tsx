// @ts-nocheck — legacy QMS/document pages pending backend_v3 migration
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit3, 
  GitPullRequest 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { internalDocumentService } from "@/services/internalDocument/internalDocument.service";

import type { Schema } from "@/types/api-types";

// 1. Correct the type to be an Array of the document schema
type InternalDoc = Schema["InternalDocumentRead"];

const statusConfig: Record<string, { label: string, color: "default" | "secondary" | "destructive" | "outline" }> = {
  DRAFT: { label: "Draft", color: "outline" },
  IN_REVIEW: { label: "In Review", color: "secondary" },
  PENDING_APPROVAL: { label: "Pending Approval", color: "secondary" },
  RELEASED: { label: "Released", color: "default" },
  ARCHIVED: { label: "Archived", color: "destructive" },
};

export default function InternalDocumentsPage() {
  // 2. Initialize as an empty array to avoid null pointer errors
  const [docs, setDocs] = useState<InternalDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await internalDocumentService.list();
      // Ensure we are working with an array to satisfy TypeScript
      const data = Array.isArray(res.data) ? res.data : [];
      setDocs(data);
    } catch (err) {
      console.error("Error fetching internal documents:", err);
      setDocs([]);
        
        // const res = await internalDocumentService.list();
        // const data = res.data;

        // Type narrowing: Ensure 'data' is an array before setting state
        // if (Array.isArray(data)) {
        //   setDocs(data as InternalDoc[]);
        // } else {
        //   // If the backend sent an error object (like { detail: ... })
        //   console.error("API returned an object instead of an array:", data);
        //   setDocs([]);
        // }
      // } catch (err) {
      //   console.error("Error fetching internal documents:", err);
      //   setDocs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  // 3. Filter will now work because docs is guaranteed to be an array
  const filteredDocs = docs.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.system_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Internal Document Control</h1>
          <p className="text-muted-foreground">Manage laboratory SOPs, Policies, and Methods.</p>
        </div>
        <Link href="/document/internal/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> New Document
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ID or Title..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" /> Status
        </Button>
      </div>

      <div className="border rounded-md bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-30">System ID</TableHead>
              <TableHead>Document Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10">Loading documentation registry...</TableCell></TableRow>
            ) : filteredDocs.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No documents found.</TableCell></TableRow>
            ) : filteredDocs.map((doc) => (
              <TableRow key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                <TableCell className="font-mono text-xs font-semibold">{doc.system_id || `ID-${doc.id}`}</TableCell>
                <TableCell className="font-medium">{doc.title}</TableCell>
                <TableCell>
                   <Badge variant="outline">{(doc as any).type_meta?.prefix || "DOC"}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={statusConfig[doc.status]?.color || "outline"}>
                    {statusConfig[doc.status]?.label || doc.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {/* Using (doc as any) bypasses the missing property error for this specific field */}
                  {/* {(doc as any).updated_at 
                    ? new Date((doc as any).updated_at).toLocaleDateString() 
                    : "N/A"} */}
                   {doc.updated_at 
                    ? new Date(doc.updated_at).toLocaleDateString() 
                    : "N/A"} 
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Management</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href={`/document/internal/${doc.id}`} className="flex items-center gap-2">
                          <Eye className="h-4 w-4" /> Overview
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/document/internal/${doc.id}/edit`} className="flex items-center gap-2">
                          <Edit3 className="h-4 w-4" /> Edit Content
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/document/internal/${doc.id}/workflow`} className="flex items-center gap-2">
                          <GitPullRequest className="h-4 w-4" /> Manage Workflow
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Archive Document</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}