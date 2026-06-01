/* eslint-disable @typescript-eslint/no-explicit-any */
// @/features/saas/billing/components/InvoiceHistory.tsx
"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import saasApi from "@/lib/saas-api";

interface InvoiceHistoryProps {
  ownerId: string;
}

export function InvoiceHistory({ ownerId }: InvoiceHistoryProps) {
  const { data: invoices, isLoading } = useQuery({
    queryKey: ["billing", "invoices", ownerId],
    queryFn: async () => {
      const res = await saasApi.get<any[]>("/global/billing/invoices");
      return res.data;
    },
  });

  if (isLoading) return <div className="h-48 w-full animate-pulse rounded-xl bg-slate-50" />;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-sm font-bold text-slate-900">Invoice History & Statements</h3>
        <p className="text-[11px] text-slate-500 font-medium">Download historically logged operational statements.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <th className="px-6 py-3">Invoice Number</th>
              <th className="px-6 py-3">Issue Date</th>
              <th className="px-6 py-3">Due Date</th>
              <th className="px-6 py-3">Amount</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {invoices && invoices.length > 0 ? (
              invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-slate-50/70 transition">
                  <td className="px-6 py-3 font-mono text-slate-900">{invoice.invoice_number}</td>
                  <td className="px-6 py-3">{new Date(invoice.issue_date).toLocaleDateString()}</td>
                  <td className="px-6 py-3">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : "—"}</td>
                  <td className="px-6 py-3 font-bold text-slate-900">
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: invoice.currency }).format(Number(invoice.total))}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                        invoice.status === "PAID"
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10"
                          : invoice.status === "ISSUED"
                          ? "bg-blue-50 text-blue-700 ring-1 ring-blue-600/10"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {invoice.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center font-normal text-slate-400">
                  No statements linked to this account portfolio context.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}