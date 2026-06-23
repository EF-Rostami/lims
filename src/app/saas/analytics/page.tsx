"use client";

import { ExternalLink, BarChart2, AlertCircle, Building2, Server, ClipboardList, Clock } from "lucide-react";
import { useTrialRequests, useUpdateTrialRequestStatus } from "@/features/saas/trial-requests/trial-requests.queries";
import { useQuery } from "@tanstack/react-query";
import { organizationsApi } from "@/features/saas/organizations/organizations.api";
import { tenantsApi } from "@/features/saas/tenants/tenants.api";
import type { TrialRequestStatus } from "@/features/saas/trial-requests/trial-requests.api";

const SHARE_URL = process.env.NEXT_PUBLIC_PLAUSIBLE_SHARE_URL;

function buildEmbedUrl(shareUrl: string): string {
  const url = new URL(shareUrl);
  url.searchParams.set("embed", "true");
  url.searchParams.set("theme", "light");
  url.searchParams.set("background", "transparent");
  return url.toString();
}

const STATUS_STYLES: Record<TrialRequestStatus, string> = {
  PENDING:     "bg-amber-100 text-amber-700",
  CONTACTED:   "bg-blue-100 text-blue-700",
  PROVISIONED: "bg-green-100 text-green-700",
  REJECTED:    "bg-red-100 text-red-700",
};

const STATUS_OPTIONS: TrialRequestStatus[] = ["PENDING", "CONTACTED", "PROVISIONED", "REJECTED"];

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm flex items-center gap-4">
      <div className="rounded-lg bg-slate-100 p-2.5">
        <Icon className="h-5 w-5 text-slate-600" />
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-900 leading-tight">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: trialRequests = [], isLoading: trLoading } = useTrialRequests();
  const { data: organizations = [] } = useQuery({
    queryKey: ["saas", "organizations"],
    queryFn: organizationsApi.list,
  });
  const { data: tenants = [] } = useQuery({
    queryKey: ["saas", "tenants"],
    queryFn: tenantsApi.list,
  });
  const updateStatus = useUpdateTrialRequestStatus();

  const now = new Date();
  const thisMonth = trialRequests.filter((r) => {
    const d = new Date(r.created_at);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const pendingCount = trialRequests.filter((r) => r.status === "PENDING").length;
  const activeTenants = tenants.filter((t) => t.status === "ACTIVE").length;

  return (
    <div className="flex flex-col gap-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">
            Platform metrics and potential clients from trial requests.
          </p>
        </div>
        {SHARE_URL && (
          <a
            href={SHARE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
          >
            Open in Plausible <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      {/* ── Summary Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Building2} label="Organisations" value={organizations.length} />
        <StatCard
          icon={Server}
          label="Active Tenants"
          value={activeTenants}
          sub={`${tenants.length} total`}
        />
        <StatCard
          icon={ClipboardList}
          label="Trial Requests"
          value={trialRequests.length}
          sub={`${thisMonth.length} this month`}
        />
        <StatCard
          icon={Clock}
          label="Pending Review"
          value={pendingCount}
          sub="awaiting contact"
        />
      </div>

      {/* ── Plausible embed ───────────────────────────────────────────── */}
      {SHARE_URL ? (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <BarChart2 className="h-4 w-4 text-slate-400" />
              Marketing Site Traffic
            </h2>
          </div>
          <iframe
            src={buildEmbedUrl(SHARE_URL)}
            loading="lazy"
            className="w-full"
            style={{ height: "520px", border: 0 }}
            scrolling="auto"
            title="Plausible Analytics"
          />
        </div>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Marketing analytics not configured</p>
              <p className="mt-1 text-sm text-amber-700">
                Set{" "}
                <code className="bg-amber-100 px-1 rounded text-xs font-mono">
                  NEXT_PUBLIC_PLAUSIBLE_SHARE_URL
                </code>{" "}
                to embed your Plausible shared dashboard here.
              </p>
            </div>
          </div>
          <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
            <li>Sign in to <span className="font-medium">plausible.io</span> → site settings → <span className="font-medium">Visibility</span>.</li>
            <li>Enable <span className="font-medium">Public dashboard</span> or create a <span className="font-medium">Shared link</span>.</li>
            <li>Copy the URL and add it to your Vercel environment variables, then redeploy.</li>
          </ol>
        </div>
      )}

      {/* ── Trial Requests Table ──────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Potential Clients — Trial Requests</h2>
          <span className="text-xs text-slate-400">{trialRequests.length} total</span>
        </div>

        {trLoading ? (
          <div className="px-5 py-8 text-center text-sm text-slate-400 animate-pulse">
            Loading trial requests…
          </div>
        ) : trialRequests.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-slate-400">
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
