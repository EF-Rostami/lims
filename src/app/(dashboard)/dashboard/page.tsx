"use client";

import { useState } from "react";
import {
  useOverview,
  useThroughput,
  useTAT,
  useEquipment,
  useQCAnalytics,
} from "@/features/lims/analytics/analytics.queries";
import { analyticsApi } from "@/features/lims/analytics/analytics.api";
import type {
  DailyCount,
  DailyAvg,
  StatusCount,
  TATByTest,
  TATBucket,
  TATByPriority,
  QCDailyStats,
} from "@/features/lims/analytics/analytics.api";

// ── SVG Chart Primitives ──────────────────────────────────────────────────────

function LineChart({
  data,
  color = "#3b82f6",
  height = 80,
}: {
  data: { date: string; value: number }[];
  color?: string;
  height?: number;
}) {
  if (!data.length) return <div style={{ height }} className="flex items-center justify-center text-xs text-muted-foreground">No data</div>;
  const vals = data.map((d) => d.value);
  const max = Math.max(...vals, 1);
  const min = Math.min(...vals);
  const range = max - min || 1;
  const w = 400;
  const pad = 4;
  const pts = data.map((d, i) => {
    const x = pad + (i / Math.max(data.length - 1, 1)) * (w - pad * 2);
    const y = height - pad - ((d.value - min) / range) * (height - pad * 2);
    return `${x},${y}`;
  });
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }}>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {data.map((d, i) => {
        const [x, y] = pts[i].split(",").map(Number);
        return (
          <g key={i}>
            <title>{`${d.date}: ${d.value}`}</title>
            <circle cx={x} cy={y} r={2.5} fill={color} />
          </g>
        );
      })}
    </svg>
  );
}

function DualLineChart({
  a,
  b,
  labelA,
  labelB,
  colorA = "#3b82f6",
  colorB = "#10b981",
  height = 120,
}: {
  a: DailyCount[];
  b: DailyCount[];
  labelA: string;
  labelB: string;
  colorA?: string;
  colorB?: string;
  height?: number;
}) {
  const all = [...a.map((d) => d.count), ...b.map((d) => d.count)];
  if (!all.length) return <div style={{ height }} className="flex items-center justify-center text-xs text-muted-foreground">No data</div>;
  const max = Math.max(...all, 1);
  const w = 400;
  const pad = 8;
  const mkPts = (arr: DailyCount[]) =>
    arr.map((d, i) => {
      const x = pad + (i / Math.max(arr.length - 1, 1)) * (w - pad * 2);
      const y = pad + (1 - d.count / max) * (height - pad * 2);
      return `${x},${y}`;
    });
  const ptsA = mkPts(a);
  const ptsB = mkPts(b);
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }}>
        {ptsA.length > 1 && (
          <polyline points={ptsA.join(" ")} fill="none" stroke={colorA} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        )}
        {ptsB.length > 1 && (
          <polyline points={ptsB.join(" ")} fill="none" stroke={colorB} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        )}
      </svg>
      <div className="flex gap-4 justify-end text-xs mt-1">
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5" style={{ background: colorA }} />{labelA}</span>
        <span className="flex items-center gap-1"><span className="inline-block w-3 h-0.5" style={{ background: colorB }} />{labelB}</span>
      </div>
    </div>
  );
}

function BarChart({
  data,
  color = "#6366f1",
  height = 120,
}: {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}) {
  if (!data.length) return <div style={{ height }} className="flex items-center justify-center text-xs text-muted-foreground">No data</div>;
  const max = Math.max(...data.map((d) => d.value), 1);
  const bw = 100 / data.length;
  return (
    <svg viewBox={`0 0 100 ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      {data.map((d, i) => {
        const barH = (d.value / max) * (height - 16);
        const x = i * bw + bw * 0.1;
        const bwInner = bw * 0.8;
        return (
          <g key={i}>
            <rect x={x} y={height - 16 - barH} width={bwInner} height={barH} fill={color} rx={1} />
            <title>{`${d.label}: ${d.value}`}</title>
          </g>
        );
      })}
    </svg>
  );
}

function HBarChart({
  data,
  color = "#8b5cf6",
  maxLabel = 200,
}: {
  data: { label: string; value: number; sub?: string }[];
  color?: string;
  maxLabel?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-right truncate" style={{ width: maxLabel }}>{d.label}</span>
          <div className="flex-1 bg-muted rounded h-4 overflow-hidden">
            <div
              className="h-full rounded transition-all"
              style={{ width: `${(d.value / max) * 100}%`, background: color }}
            />
          </div>
          <span className="text-xs text-muted-foreground w-12 text-right">{d.sub ?? d.value}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({
  data,
  colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"],
  size = 120,
}: {
  data: StatusCount[];
  colors?: string[];
  size?: number;
}) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  const r = 40;
  const cx = 50;
  const cy = 50;
  let startAngle = -Math.PI / 2;
  const slices = data.map((d, i) => {
    const angle = (d.count / total) * 2 * Math.PI;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    startAngle += angle;
    const x2 = cx + r * Math.cos(startAngle);
    const y2 = cy + r * Math.sin(startAngle);
    const large = angle > Math.PI ? 1 : 0;
    return {
      d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`,
      color: colors[i % colors.length],
      label: d.status,
      count: d.count,
    };
  });
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
        {slices.map((s, i) => (
          <path key={i} d={s.d} fill={s.color}>
            <title>{`${s.label}: ${s.count}`}</title>
          </path>
        ))}
        <circle cx={cx} cy={cy} r={24} fill="var(--background)" />
        <text x={cx} y={cy + 4} textAnchor="middle" fontSize={10} fill="currentColor">{total}</text>
      </svg>
      <div className="space-y-1">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs">
            <span className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: s.color }} />
            <span className="capitalize">{s.label.replace(/_/g, " ")}</span>
            <span className="text-muted-foreground ml-1">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function QCStackedChart({ data, height = 140 }: { data: QCDailyStats[]; height?: number }) {
  if (!data.length) return <div style={{ height }} className="flex items-center justify-center text-xs text-muted-foreground">No data</div>;
  const maxTotal = Math.max(...data.map((d) => d.total), 1);
  const w = 400;
  const pad = 8;
  const bw = (w - pad * 2) / data.length;
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }}>
      {data.map((d, i) => {
        const x = pad + i * bw + bw * 0.1;
        const bwInner = bw * 0.8;
        const totalH = (d.total / maxTotal) * (height - 16);
        let y = height - 16 - totalH;
        const segments = [
          { count: d.accepted, color: "#10b981" },
          { count: d.warning, color: "#f59e0b" },
          { count: d.overridden, color: "#8b5cf6" },
          { count: d.rejected, color: "#ef4444" },
        ];
        return (
          <g key={i}>
            {segments.map((seg, j) => {
              if (!seg.count) return null;
              const segH = (seg.count / maxTotal) * (height - 16);
              const rect = <rect key={j} x={x} y={y} width={bwInner} height={segH} fill={seg.color} />;
              y += segH;
              return rect;
            })}
            <title>{`${d.date}: ${d.total} runs, pass ${d.pass_rate.toFixed(1)}%`}</title>
          </g>
        );
      })}
    </svg>
  );
}

// ── Shared UI ─────────────────────────────────────────────────────────────────

function KPICard({ label, value, sub, color = "text-foreground" }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="p-4 border rounded-xl bg-card shadow-sm">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border rounded-xl bg-card shadow-sm p-4">
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}

function LoadingBox() {
  return <div className="h-32 flex items-center justify-center text-muted-foreground text-sm animate-pulse">Loading…</div>;
}

function ErrorBox({ msg }: { msg: string }) {
  return <div className="h-32 flex items-center justify-center text-destructive text-sm">{msg}</div>;
}

// ── Tabs ──────────────────────────────────────────────────────────────────────

function OverviewTab() {
  const { data, isLoading, isError } = useOverview();
  if (isLoading) return <LoadingBox />;
  if (isError || !data) return <ErrorBox msg="Failed to load overview" />;

  const kpis = data.kpis;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label="Samples Today" value={kpis.samples_today} color="text-blue-600" />
        <KPICard label="Samples Pending" value={kpis.samples_pending} color="text-amber-600" />
        <KPICard label="Orders In Progress" value={kpis.orders_in_progress} color="text-violet-600" />
        <KPICard label="Results Pending Approval" value={kpis.results_pending_approval} color="text-orange-600" />
        <KPICard label="Open QC Alerts" value={kpis.open_qc_alerts} color={kpis.open_qc_alerts > 0 ? "text-red-600" : "text-green-600"} />
        <KPICard label="Instruments Active" value={kpis.instruments_active} color="text-green-600" />
        <KPICard label="Instruments in Maintenance" value={kpis.instruments_maintenance} color="text-amber-600" />
        <KPICard label="Open NC Findings" value={kpis.open_nc_findings} color={kpis.open_nc_findings > 0 ? "text-red-600" : "text-green-600"} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section title="Samples by Status">
          {data.samples_by_status.length ? <DonutChart data={data.samples_by_status} /> : <p className="text-xs text-muted-foreground">No data</p>}
        </Section>
        <Section title="Orders by Status">
          {data.orders_by_status.length ? <DonutChart data={data.orders_by_status} colors={["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#ec4899"]} /> : <p className="text-xs text-muted-foreground">No data</p>}
        </Section>
      </div>
    </div>
  );
}

function ThroughputTab({ days, setDays }: { days: number; setDays: (d: number) => void }) {
  const { data, isLoading, isError } = useThroughput(days);
  if (isLoading) return <LoadingBox />;
  if (isError || !data) return <ErrorBox msg="Failed to load throughput data" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Period:</span>
        {[7, 30, 90, 180].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${days === d ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
          >
            {d}d
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <KPICard label={`Total Samples (${days}d)`} value={data.total_samples_30d} color="text-blue-600" />
        <KPICard label={`Total Results (${days}d)`} value={data.total_results_30d} color="text-green-600" />
      </div>

      <Section title="Samples & Results per Day">
        <DualLineChart
          a={data.samples_by_day}
          b={data.results_by_day}
          labelA="Samples"
          labelB="Results"
        />
      </Section>

      <Section title="Top Tests by Volume">
        <HBarChart
          data={data.top_tests.map((t) => ({
            label: t.test_name || t.test_code,
            value: t.count,
          }))}
          color="#6366f1"
          maxLabel={160}
        />
      </Section>
    </div>
  );
}

function TATTab({ days, setDays }: { days: number; setDays: (d: number) => void }) {
  const { data, isLoading, isError } = useTAT(days);
  if (isLoading) return <LoadingBox />;
  if (isError || !data) return <ErrorBox msg="Failed to load TAT data" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Period:</span>
        {[7, 30, 90, 180].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${days === d ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
          >
            {d}d
          </button>
        ))}
      </div>

      {data.overall_avg_hours != null && (
        <KPICard label="Overall Average TAT" value={`${data.overall_avg_hours.toFixed(1)} h`} color="text-blue-600" />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section title="Daily Average TAT (hours)">
          <LineChart
            data={data.daily_avg.map((d) => ({ date: d.date, value: d.avg_hours }))}
            color="#6366f1"
            height={100}
          />
        </Section>

        <Section title="TAT Distribution">
          <BarChart
            data={data.distribution.map((b) => ({ label: b.label, value: b.count }))}
            color="#10b981"
            height={100}
          />
          <div className="flex flex-wrap gap-x-3 mt-1">
            {data.distribution.map((b, i) => (
              <span key={i} className="text-xs text-muted-foreground">{b.label}: {b.count}</span>
            ))}
          </div>
        </Section>
      </div>

      <Section title="TAT by Priority">
        <HBarChart
          data={data.by_priority.map((p) => ({
            label: p.priority,
            value: p.avg_tat_hours,
            sub: `${p.avg_tat_hours.toFixed(1)}h (n=${p.count})`,
          }))}
          color="#f59e0b"
          maxLabel={100}
        />
      </Section>

      <Section title="TAT by Test">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-1 pr-2">Test</th>
                <th className="text-right py-1 px-2">Avg (h)</th>
                <th className="text-right py-1 px-2">Min (h)</th>
                <th className="text-right py-1 px-2">Max (h)</th>
                <th className="text-right py-1 px-2">Count</th>
              </tr>
            </thead>
            <tbody>
              {data.by_test.map((t, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-1 pr-2 font-medium">{t.test_name || t.test_code}</td>
                  <td className="text-right py-1 px-2">{t.avg_tat_hours.toFixed(1)}</td>
                  <td className="text-right py-1 px-2 text-green-600">{t.min_tat_hours.toFixed(1)}</td>
                  <td className="text-right py-1 px-2 text-red-500">{t.max_tat_hours.toFixed(1)}</td>
                  <td className="text-right py-1 px-2 text-muted-foreground">{t.count}</td>
                </tr>
              ))}
              {!data.by_test.length && (
                <tr><td colSpan={5} className="text-center py-4 text-muted-foreground">No TAT data in period</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

function EquipmentTab() {
  const { data, isLoading, isError } = useEquipment();
  if (isLoading) return <LoadingBox />;
  if (isError || !data) return <ErrorBox msg="Failed to load equipment data" />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <KPICard
          label="Calibration Overdue"
          value={data.calibration_overdue}
          color={data.calibration_overdue > 0 ? "text-red-600" : "text-green-600"}
        />
        <KPICard
          label="Maintenance Due"
          value={data.maintenance_due}
          color={data.maintenance_due > 0 ? "text-amber-600" : "text-green-600"}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Section title="Instruments by Status">
          {data.by_status.length ? <DonutChart data={data.by_status} colors={["#10b981", "#f59e0b", "#ef4444", "#6b7280"]} /> : <p className="text-xs text-muted-foreground">No data</p>}
        </Section>
        <Section title="Instruments by Calibration">
          {data.by_calibration.length ? <DonutChart data={data.by_calibration} colors={["#10b981", "#f59e0b", "#ef4444"]} /> : <p className="text-xs text-muted-foreground">No data</p>}
        </Section>
      </div>

      <Section title="Instrument List">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-1 pr-2">Code</th>
                <th className="text-left py-1 px-2">Name</th>
                <th className="text-left py-1 px-2">Status</th>
                <th className="text-left py-1 px-2">Calibration</th>
                <th className="text-left py-1 px-2">Next Cal.</th>
                <th className="text-left py-1 px-2">Next Maint.</th>
              </tr>
            </thead>
            <tbody>
              {data.instruments.map((inst) => (
                <tr key={inst.id} className="border-b last:border-0">
                  <td className="py-1 pr-2 font-mono font-medium">{inst.code}</td>
                  <td className="py-1 px-2">{inst.name}</td>
                  <td className="py-1 px-2">
                    <span className={`capitalize px-1.5 py-0.5 rounded text-xs font-medium ${inst.status === "active" ? "bg-green-100 text-green-700" : inst.status === "maintenance" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                      {inst.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-1 px-2">
                    <span className={`capitalize px-1.5 py-0.5 rounded text-xs font-medium ${inst.calibration_status === "valid" ? "bg-green-100 text-green-700" : inst.calibration_status === "due_soon" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                      {inst.calibration_status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-1 px-2 text-muted-foreground">{inst.next_calibration_due ?? "—"}</td>
                  <td className="py-1 px-2 text-muted-foreground">{inst.next_maintenance_due ?? "—"}</td>
                </tr>
              ))}
              {!data.instruments.length && (
                <tr><td colSpan={6} className="text-center py-4 text-muted-foreground">No instruments registered</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}

function QCTab({ days, setDays }: { days: number; setDays: (d: number) => void }) {
  const { data, isLoading, isError } = useQCAnalytics(days);
  if (isLoading) return <LoadingBox />;
  if (isError || !data) return <ErrorBox msg="Failed to load QC data" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Period:</span>
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${days === d ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
          >
            {d}d
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KPICard label={`Total QC Runs (${days}d)`} value={data.total_runs_30d} />
        <KPICard
          label="Overall Pass Rate"
          value={`${data.overall_pass_rate.toFixed(1)}%`}
          color={data.overall_pass_rate >= 95 ? "text-green-600" : data.overall_pass_rate >= 85 ? "text-amber-600" : "text-red-600"}
        />
        <KPICard label="Open Rejects" value={data.open_rejects} color={data.open_rejects > 0 ? "text-red-600" : "text-green-600"} />
        <KPICard label="Open Warnings" value={data.open_warnings} color={data.open_warnings > 0 ? "text-amber-600" : "text-green-600"} />
      </div>

      <Section title="Daily QC Runs by Status">
        <QCStackedChart data={data.daily_stats} height={140} />
        <div className="flex gap-4 justify-end text-xs mt-2">
          {[
            { label: "Accepted", color: "#10b981" },
            { label: "Warning", color: "#f59e0b" },
            { label: "Overridden", color: "#8b5cf6" },
            { label: "Rejected", color: "#ef4444" },
          ].map((l) => (
            <span key={l.label} className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      </Section>

      <Section title="Daily Pass Rate Trend">
        <LineChart
          data={data.daily_stats.map((d) => ({ date: d.date, value: d.pass_rate }))}
          color="#10b981"
          height={100}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{data.daily_stats[0]?.date}</span>
          <span>{data.daily_stats[data.daily_stats.length - 1]?.date}</span>
        </div>
      </Section>
    </div>
  );
}

function ExportTab() {
  const [entity, setEntity] = useState<"samples" | "results" | "tat">("samples");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true);
    setError(null);
    try {
      await analyticsApi.exportCSV(entity, dateFrom || undefined, dateTo || undefined);
    } catch {
      setError("Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-lg">
      <Section title="Export Data to CSV">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1">Dataset</label>
            <div className="flex gap-2">
              {(["samples", "results", "tat"] as const).map((e) => (
                <button
                  key={e}
                  onClick={() => setEntity(e)}
                  className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors capitalize ${entity === e ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
                >
                  {e === "tat" ? "Turnaround Time" : e.charAt(0).toUpperCase() + e.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Date From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full border rounded px-2 py-1.5 text-sm bg-background"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Date To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full border rounded px-2 py-1.5 text-sm bg-background"
              />
            </div>
          </div>

          {error && <p className="text-xs text-destructive">{error}</p>}

          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full py-2 rounded bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {exporting ? "Exporting…" : `Export ${entity === "tat" ? "Turnaround Time" : entity.charAt(0).toUpperCase() + entity.slice(1)} CSV`}
          </button>
        </div>
      </Section>

      <Section title="Available Exports">
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1.5 border-b">
            <span className="font-medium">Samples Export</span>
            <span className="text-muted-foreground">ID, received date, status, client, tests</span>
          </div>
          <div className="flex justify-between py-1.5 border-b">
            <span className="font-medium">Results Export</span>
            <span className="text-muted-foreground">Sample ID, test code, value, unit, status, approved by</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="font-medium">Turnaround Time Export</span>
            <span className="text-muted-foreground">Sample ID, received, approved, TAT hours, test code</span>
          </div>
        </div>
      </Section>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

const TABS = ["Overview", "Throughput", "Turnaround Time", "Equipment", "QC Trends", "Export"] as const;
type Tab = (typeof TABS)[number];

export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>("Overview");
  const [throughputDays, setThroughputDays] = useState(30);
  const [tatDays, setTatDays] = useState(30);
  const [qcDays, setQcDays] = useState(30);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>

      <div className="flex gap-1 border-b overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div>
        {tab === "Overview" && <OverviewTab />}
        {tab === "Throughput" && <ThroughputTab days={throughputDays} setDays={setThroughputDays} />}
        {tab === "Turnaround Time" && <TATTab days={tatDays} setDays={setTatDays} />}
        {tab === "Equipment" && <EquipmentTab />}
        {tab === "QC Trends" && <QCTab days={qcDays} setDays={setQcDays} />}
        {tab === "Export" && <ExportTab />}
      </div>
    </div>
  );
}
