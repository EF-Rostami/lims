"use client";


import { format } from "date-fns";
import { 
  FileText, 
  Trash2, 
  ShieldAlert, 
  ShieldCheck, 
  MoreHorizontal, 
  ExternalLink 
} from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { DelegationReport } from "./DelegationReport";
import type { Schema } from "@/types/api-types";

type DelegationResponse = Schema["DelegationResponse"];

interface DelegationTableProps {
  data: DelegationResponse[] | undefined;
  isLoading: boolean;
  onRevoke: (id: number) => void;
}

export const DelegationTable = ({ data, isLoading, onRevoke }: DelegationTableProps) => {
  if (isLoading) return <div className="p-8 text-center text-slate-500 font-medium">Loading authorities...</div>;
  if (!data || data.length === 0) return <div className="p-12 text-center text-slate-400 italic">No delegations recorded.</div>;

  return (
    <Table>
      <TableHeader className="bg-slate-50/50">
        <TableRow>
          <TableHead className="w-250px text-[10px] font-black uppercase tracking-widest">Deputy / Acting For</TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-widest">Position Title</TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-widest">Authority Scope</TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-widest">Validity Period</TableHead>
          <TableHead className="text-[10px] font-black uppercase tracking-widest">Status</TableHead>
          <TableHead className="text-right"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((del) => (
          <TableRow key={del.id} className="group hover:bg-slate-50/80 transition-colors">
            {/* NAME COLUMN */}
            <TableCell>
              <div className="flex flex-col">
                <span className="font-bold text-slate-900">{del.deputy_name}</span>
                <span className="text-[10px] text-slate-400 font-medium italic">Acting for {del.primary_name}</span>
              </div>
            </TableCell>

            {/* POSITION COLUMN */}
            <TableCell>
              <Badge variant="outline" className="bg-white text-blue-700 border-blue-100 font-bold px-2 py-0.5 rounded-md uppercase text-[9px]">
                {del.position_title}
              </Badge>
            </TableCell>

            {/* SCOPE COLUMN */}
            <TableCell>
              {del.permission_ids.length === 0 ? (
                <div className="flex items-center gap-1.5 text-amber-600">
                  <ShieldAlert size={14} strokeWidth={3} />
                  <span className="text-[10px] font-black uppercase tracking-tight">Full Authority</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <ShieldCheck size={14} strokeWidth={3} />
                  <span className="text-[10px] font-black uppercase tracking-tight">
                    {del.permission_ids.length} Restrictions
                  </span>
                </div>
              )}
            </TableCell>

            {/* PERIOD COLUMN */}
            <TableCell className="text-[11px] text-slate-600 font-medium">
              {format(new Date(del.start_date), "MMM d")} - {format(new Date(del.end_date), "MMM d, yyyy")}
            </TableCell>

            {/* STATUS COLUMN */}
            <TableCell>
              <Badge 
                className={`capitalize text-[9px] font-bold px-2 py-0 ${
                  del.status === 'active' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 
                  del.status === 'planned' ? 'bg-blue-100 text-blue-700 hover:bg-blue-100' : 
                  'bg-slate-100 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {del.status}
              </Badge>
            </TableCell>

            {/* ACTIONS DROPDOWN */}
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-slate-200">
                  <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400 px-3 py-2">Management</DropdownMenuLabel>
                  
                  {/* GENERATE REPORT OPTION */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="gap-2 cursor-pointer focus:bg-slate-50">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-slate-700">Generate ISO Report</span>
                      </DropdownMenuItem>
                    </SheetTrigger>
                    <SheetContent className="sm:max-w-4xl overflow-y-auto bg-slate-100 p-0">
                      <SheetHeader className="p-6 bg-white border-b sticky top-0 z-10">
                        <SheetTitle className="flex items-center gap-2 text-slate-900">
                          <FileText className="text-blue-600" />
                          Compliance Record DEL-{del.id}
                        </SheetTitle>
                      </SheetHeader>
                      <div className="p-8">
                        <DelegationReport 
                          delegation={del} 
                          primaryName={del.primary_name} 
                          deputyName={del.deputy_name} 
                          positionTitle={del.position_title} 
                        />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <DropdownMenuItem className="gap-2 text-slate-600 font-semibold cursor-pointer focus:bg-slate-50">
                    <ExternalLink className="h-4 w-4" /> View Audit Trail
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    className="gap-2 text-red-600 font-bold focus:bg-red-50 cursor-pointer"
                    onClick={() => onRevoke(del.id)}
                  >
                    <Trash2 className="h-4 w-4" /> Revoke Authority
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};