"use client";

import { ClipboardList } from "lucide-react";
import { useTrialRequests, useUpdateTrialRequestStatus } from "@/features/saas/trial-requests/trial-requests.queries";
import type { TrialRequestStatus } from "@/features/saas/trial-requests/trial-requests.api";

const STATUS_STYLES: Record<TrialRequestStatus, string> = {
  PENDING:     "bg-amber-100 text-amber-700",
  CONTACTED:   "bg-blue-100 text-blue-700",
  PROVISIONED: "bg-green-100 text-green-700",
  REJECTED:    "bg-red-100 text-red-700",
};

const STATUS_OPTIONS: TrialRequestStatus[] = ["PENDING", "CONTACTED", "PROVISIONED", "REJECTED"];

export default function TrialRequestsPage() {
  const { data: trialRequests = [], isLoading } = useTrialRequests();
  const updateStatus = useUpdateTrialRequestStatus();

  const pendingCount = trialRequests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Trial Requests</h1>
          <p className="mt-1 text-sm text-slate-500">
            Potential clients who submitted the register form.{" "}
            {pendingCount > 0 && (
              <span className="font-medium text-amber-600">{pendingCount} awaiting contact.</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
          <ClipboardList className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-700">{trialRequests.length} total</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="px-5 py-12 text-center text-sm text-slate-400 animate-pulse">
            Loading trial requests…
          </div>
        ) : trialRequests.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-slate-400">
            No trial requests yet. They will appear here once someone submits the register form.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Laboratory</th>
                  <th className="px-4 py-3 text-left">Plan</th>
                  <th className="px-4 py-3 text-left">Submitted</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trialRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{req.full_name}</td>
                    <td className="px-4 py-3 text-slate-600">
                      <a href={`mailto:${req.email}`} className="hover:underline">
                        {req.email}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{req.lab_name}</td>
                    <td className="px-4 py-3">
                      <span className="capitalize text-slate-600">{req.plan}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(req.created_at).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={req.status}
                        onChange={(e) =>
                          updateStatus.mutate({
                            id: req.id,
                            status: e.target.value as TrialRequestStatus,
                          })
                        }
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border-0 cursor-pointer ${STATUS_STYLES[req.status]}`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
