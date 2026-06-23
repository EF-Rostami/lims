"use client";

import { ExternalLink, BarChart2, AlertCircle } from "lucide-react";

const SHARE_URL = process.env.NEXT_PUBLIC_PLAUSIBLE_SHARE_URL;

// Plausible embed URL: append embed params to the shared dashboard URL
function buildEmbedUrl(shareUrl: string): string {
  const url = new URL(shareUrl);
  url.searchParams.set("embed", "true");
  url.searchParams.set("theme", "light");
  url.searchParams.set("background", "transparent");
  return url.toString();
}

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Marketing Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">
            Visitor traffic and engagement for the public marketing site — cookie-free, GDPR compliant.
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

      {SHARE_URL ? (
        /* ── Embedded Plausible dashboard ──────────────────────────────── */
        <div className="flex-1 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <iframe
            src={buildEmbedUrl(SHARE_URL)}
            loading="lazy"
            className="w-full"
            style={{ height: "calc(100vh - 220px)", border: 0 }}
            scrolling="auto"
            title="Plausible Analytics"
          />
        </div>
      ) : (
        /* ── Setup guide (shown when env var is not configured) ─────────── */
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 space-y-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                Analytics not configured
              </p>
              <p className="mt-1 text-sm text-amber-700">
                Set <code className="bg-amber-100 px-1 rounded text-xs font-mono">NEXT_PUBLIC_PLAUSIBLE_SHARE_URL</code> to
                embed your Plausible shared dashboard here.
              </p>
            </div>
          </div>

          <ol className="space-y-3 text-sm text-slate-700 list-decimal list-inside">
            <li>
              Sign in to{" "}
              <span className="font-medium">plausible.io</span> and open your site settings.
            </li>
            <li>
              Go to <span className="font-medium">Visibility</span> → enable{" "}
              <span className="font-medium">Public dashboard</span> or create a{" "}
              <span className="font-medium">Shared link</span> (private, password-optional).
            </li>
            <li>
              Copy the shared link URL (looks like{" "}
              <code className="bg-slate-100 px-1 rounded text-xs font-mono">
                https://plausible.io/share/yourdomain.com?auth=XXXX
              </code>
              ).
            </li>
            <li>
              Add it to your frontend environment:
              <pre className="mt-2 rounded-md bg-slate-900 text-green-400 text-xs px-4 py-3 overflow-x-auto">
                {`NEXT_PUBLIC_PLAUSIBLE_SHARE_URL=https://plausible.io/share/yourdomain.com?auth=XXXX`}
              </pre>
            </li>
            <li>Redeploy the frontend — the dashboard will appear here automatically.</li>
          </ol>

          <div className="flex items-center gap-2 pt-1">
            <BarChart2 className="h-4 w-4 text-slate-400" />
            <p className="text-xs text-slate-500">
              Plausible is cookie-free and does not collect personal data — no consent banner required under GDPR.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
