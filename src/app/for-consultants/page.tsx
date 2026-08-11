import Link from "next/link";
import {
  ArrowRight, CheckCircle, Briefcase, LayoutDashboard,
  GitBranch, CalendarDays, Target, Building2, KeyRound,
  TrendingUp, ClipboardCheck, Users, Play,
} from "lucide-react";
import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";

// ─── Data ─────────────────────────────────────────────────────────────────────

const challenges = [
  {
    pain: "Scattered across spreadsheets and email threads for every client",
    fix: "All projects, tasks, and meeting records in one structured workspace",
  },
  {
    pain: "Manually tracking which ISO clauses each lab still needs to address",
    fix: "Clause-level gap assessments with compliance status, risk level, and linked remediation tasks",
  },
  {
    pain: "Writing meeting minutes in Word, chasing actions over email",
    fix: "Structured meetings with agenda, decisions, and action items — minutes auto-captured",
  },
  {
    pain: "Switching between client systems with different logins and contexts",
    fix: "One BLIMS login, lab switcher in the header — password re-entry keeps access secure per client",
  },
  {
    pain: "No visibility of a lab's real compliance posture before a visit",
    fix: "Live compliance score and critical failure count for every assigned lab, at a glance",
  },
  {
    pain: "Lab admin has to set up your account before you can start work",
    fix: "Auto-provisioned the moment you are assigned — temp password sent directly to your client",
  },
];

const workflow = [
  {
    step: "01",
    icon: KeyRound,
    title: "Get assigned, get access",
    desc: "The SaaS admin assigns you to a client lab. A consultant account is automatically created in that lab's workspace. No back-and-forth with the lab admin needed.",
  },
  {
    step: "02",
    icon: ClipboardCheck,
    title: "Run the gap assessment",
    desc: "Open an ISO 17025 or ISO 15189 accreditation project. Go clause by clause — mark each one Compliant, Partial, or Deficient, add findings and recommendations.",
  },
  {
    step: "03",
    icon: Target,
    title: "Track remediation to completion",
    desc: "Every deficiency becomes a task with an owner, due date, and priority. You and the lab team can update status in real time — no spreadsheets to reconcile.",
  },
  {
    step: "04",
    icon: CalendarDays,
    title: "Run structured governance meetings",
    desc: "Schedule kick-off, review, and pre-audit meetings directly in BLIMS. Record agenda, capture decisions, assign actions, and send minutes — all in one place.",
  },
  {
    step: "05",
    icon: TrendingUp,
    title: "Monitor compliance health",
    desc: "The automated compliance engine runs against the lab's live data. You see the score, critical failures, and trend — before the accreditation body does.",
  },
  {
    step: "06",
    icon: Building2,
    title: "Scale across all your clients",
    desc: "Switch between client labs from the header — a quick password entry keeps each engagement secure. Your dashboard shows all active projects and upcoming meetings.",
  },
];

const features = [
  {
    icon: LayoutDashboard,
    title: "Consultant Workspace",
    items: [
      "Personal home page with active projects and upcoming meetings",
      "Stat cards: active projects, planned meetings, all-up task count",
      "Per-lab context — always see which client lab you are working in",
    ],
  },
  {
    icon: Building2,
    title: "Multi-Lab Management",
    items: [
      "Assigned to multiple labs? Switch with a single click from the header",
      "My Labs view with live compliance score per client",
      "Cross-lab project and meeting overview in one place",
    ],
  },
  {
    icon: GitBranch,
    title: "Accreditation Projects",
    items: [
      "ISO 17025 and ISO 15189 project templates out of the box",
      "Gap assessment with clause-level findings and risk ratings",
      "Task board: open, in progress, completed — with due dates and owners",
    ],
  },
  {
    icon: CalendarDays,
    title: "Governance Meetings",
    items: [
      "Kick-off, review, and pre-audit meeting types",
      "Structured agenda with per-item decisions and action items",
      "Attendance tracking and meeting sequence numbering",
    ],
  },
  {
    icon: Users,
    title: "Lab Team Visibility",
    items: [
      "See the lab's org chart, departments, and key contacts",
      "View instrument status and outstanding calibrations",
      "Read access to QMS documents without edit rights",
    ],
  },
  {
    icon: TrendingUp,
    title: "Compliance Scoring",
    items: [
      "Automated ISO checks run against the lab's live LIMS data",
      "Score, critical failure count, and pass/fail breakdown",
      "Identify gaps before the accreditation body visits",
    ],
  },
];

const stats = [
  { value: "1", label: "login", sub: "for all your client labs" },
  { value: "100%", label: "structured", sub: "meetings, tasks, gaps" },
  { value: "Live", label: "compliance", sub: "score per lab" },
  { value: "Zero", label: "setup friction", sub: "auto-provisioned on assignment" },
];

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ForConsultantsPage() {
  return (
    <>
      <MarketingNav />

      {/* Hero */}
      <section className="relative overflow-hidden bg-white pt-20 pb-24 border-b border-gray-100">
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(#1e40af 1px, transparent 1px), linear-gradient(90deg, #1e40af 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="absolute -top-32 right-0 w-96 h-96 bg-sky-100 rounded-full blur-3xl opacity-50" />

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-sky-50 text-sky-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-sky-100">
            <Briefcase className="w-3 h-3" />
            Built for ISO accreditation consultants
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
            Manage every client lab<br />
            <span className="text-sky-600">from one workspace</span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed mb-10">
            BLIMS gives accreditation consultants a dedicated platform to run gap assessments,
            track remediation tasks, conduct governance meetings, and monitor compliance health —
            across all their client laboratories.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="flex items-center gap-2 bg-sky-600 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-sky-700 transition-colors shadow-lg shadow-sky-200"
            >
              Start free trial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/demo/consultant"
              className="flex items-center gap-2 text-gray-700 px-7 py-3.5 rounded-xl font-semibold hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <Play className="w-4 h-4 text-sky-600 fill-sky-600" /> See it live
            </Link>
          </div>
          <p className="mt-4 text-xs text-gray-400">No credit card required · Explore the live demo instantly</p>
        </div>
      </section>

      {/* Pain vs. fix */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sky-600 text-sm font-semibold uppercase tracking-wider mb-3">Why consultants choose BLIMS</p>
            <h2 className="text-3xl font-bold text-gray-900">From scattered tools to a single platform</h2>
          </div>
          <div className="space-y-4">
            {challenges.map((c) => (
              <div key={c.pain} className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-5 py-4">
                  <span className="text-red-400 font-bold text-lg leading-none mt-0.5">✕</span>
                  <p className="text-sm text-red-700">{c.pain}</p>
                </div>
                <div className="flex items-start gap-3 bg-green-50 border border-green-100 rounded-xl px-5 py-4">
                  <CheckCircle className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-green-800">{c.fix}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-sky-600 py-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-4xl font-extrabold text-white mb-1">{s.value}</p>
              <p className="text-sm font-semibold text-sky-200">{s.label}</p>
              <p className="text-xs text-sky-300 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-sky-600 text-sm font-semibold uppercase tracking-wider mb-3">Consultant workflow</p>
            <h2 className="text-3xl font-bold text-gray-900">From assignment to accreditation — in BLIMS</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {workflow.map((w) => (
              <div key={w.step} className="flex gap-4 p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:border-sky-100 hover:bg-sky-50/40 transition-colors">
                <div className="shrink-0 w-10 h-10 rounded-full bg-sky-600 text-white font-bold text-sm flex items-center justify-center shadow-md shadow-sky-200">
                  {w.step}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <w.icon className="w-4 h-4 text-sky-600" />
                    <h3 className="font-semibold text-gray-900 text-sm">{w.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-sky-600 text-sm font-semibold uppercase tracking-wider mb-3">Everything you need</p>
            <h2 className="text-3xl font-bold text-gray-900">Purpose-built for the way consultants work</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-sky-100 transition-all">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3">{f.title}</h3>
                <ul className="space-y-2">
                  {f.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lab side pitch */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sky-600 text-sm font-semibold uppercase tracking-wider mb-3">For your client labs too</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your clients get the full LIMS — not just a consultant portal
            </h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              When you work in BLIMS, your client is working in the same platform. Their sample
              orders, QMS documents, instruments, and QC records are all there. You see their
              real data — not a report they prepared for you.
            </p>
            <ul className="space-y-3">
              {[
                "Gap assessment findings linked directly to live QMS records",
                "Compliance score reflects the lab's actual instrument and document state",
                "Remediation tasks assigned to real lab staff members",
                "Meeting action items tracked alongside their daily LIMS work",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-50 rounded-2xl border border-gray-100 p-6 space-y-3">
            {/* Mock consultant home widget */}
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Consultant Home · Alpine Foods GmbH</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Active projects", value: "2", color: "text-sky-600 bg-sky-50" },
                { label: "Upcoming meetings", value: "1", color: "text-amber-600 bg-amber-50" },
                { label: "Open tasks", value: "7", color: "text-rose-600 bg-rose-50" },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl p-3 ${s.color.split(" ")[1]}`}>
                  <p className={`text-2xl font-bold ${s.color.split(" ")[0]}`}>{s.value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-4">
              <p className="text-xs font-semibold text-gray-400 mb-2">ACTIVE PROJECTS</p>
              <div className="space-y-2">
                {[
                  { name: "ISO 17025 Accreditation", status: "Active", score: 74 },
                  { name: "QMS Documentation Review", status: "Active", score: 91 },
                ].map((p) => (
                  <div key={p.name} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-700 font-medium">{p.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-500 rounded-full" style={{ width: `${p.score}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-sky-600">{p.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-white p-4">
              <p className="text-xs font-semibold text-gray-400 mb-2">UPCOMING MEETING</p>
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">Pre-Audit Readiness Review</p>
                  <p className="text-xs text-gray-400 mt-0.5">In 14 days · Online (Microsoft Teams)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-sky-600 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to run your practice more efficiently?
          </h2>
          <p className="text-sky-200 mb-8 max-w-xl mx-auto">
            Start with a free trial and explore the live demo — pre-populated with a full ISO 17025
            accreditation project so you can see exactly how the consultant workflow feels.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="bg-white text-sky-600 px-8 py-3.5 rounded-xl font-bold hover:bg-sky-50 transition-colors shadow-lg"
            >
              Start free trial
            </Link>
            <Link
              href="/demo/consultant"
              className="flex items-center gap-2 text-white border border-sky-400 px-8 py-3.5 rounded-xl font-semibold hover:border-white transition-colors"
            >
              <Play className="w-4 h-4 fill-white" /> Explore live demo
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}
