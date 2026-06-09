import Link from "next/link";
import {
  FlaskConical, ShieldCheck, ClipboardList, Users, BarChart3,
  Wrench, FileText, ArrowRight, CheckCircle, Star, Microscope,
  Building2, Zap, Lock, Globe, ChevronRight,
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const features = [
  {
    icon: ClipboardList,
    title: "Quality Management System",
    desc: "Document control, authorities matrix, role-based permissions, and full audit trails — built specifically for ISO-compliant laboratories.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: FlaskConical,
    title: "Sample & Order Tracking",
    desc: "Manage the full sample lifecycle from receipt to result. Chain of custody, turnaround tracking, and status dashboards in one place.",
    color: "bg-violet-50 text-violet-600",
  },
  {
    icon: Microscope,
    title: "Analytical Results",
    desc: "Enter, verify, and approve results with multi-level sign-off. Flag out-of-spec values automatically and generate validated reports.",
    color: "bg-cyan-50 text-cyan-600",
  },
  {
    icon: Wrench,
    title: "Instrument Management",
    desc: "Track every instrument, its calibration schedule, maintenance records, and qualification status across all lab locations.",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: Users,
    title: "HR & Org Structure",
    desc: "Define departments, positions, and competency records. Manage who can do what through a visual role-permission matrix.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: BarChart3,
    title: "Reports & Findings",
    desc: "Auto-generate professional test reports with electronic signatures. Log findings, CAPAs, and track resolution timelines.",
    color: "bg-rose-50 text-rose-600",
  },
];

const steps = [
  {
    n: "01",
    title: "Set Up Your Lab",
    desc: "A consultant configures your QMS structure — org chart, roles, document types, and permissions — using the guided onboarding wizard.",
  },
  {
    n: "02",
    title: "Onboard Your Team",
    desc: "Share a secure intake link with your steering committee. They fill in departments, positions, employees, and instruments — no account needed.",
  },
  {
    n: "03",
    title: "Go Live",
    desc: "Import data with one click, assign accreditation roles, and start accepting orders. Full ISO 17025 workflow from day one.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "$149",
    period: "/mo",
    desc: "For small independent labs getting started with digital QMS.",
    features: ["Up to 10 users", "Sample & order tracking", "Basic document control", "Email support"],
    cta: "Start free trial",
    highlight: false,
  },
  {
    name: "Professional",
    price: "$349",
    period: "/mo",
    desc: "For accredited labs that need full ISO 17025 workflow coverage.",
    features: [
      "Up to 50 users",
      "Full QMS + authorities matrix",
      "Instrument & method management",
      "Electronic signatures",
      "Audit trail & findings",
      "Priority support",
    ],
    cta: "Start free trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    desc: "Multi-site labs and national networks with custom integration needs.",
    features: [
      "Unlimited users",
      "Multi-tenant / multi-site",
      "Custom integrations & API",
      "Dedicated onboarding consultant",
      "SLA + 24/7 support",
    ],
    cta: "Contact us",
    highlight: false,
  },
];

const testimonials = [
  {
    quote: "BLIMS cut our audit preparation time from three days to a single afternoon. The authorities matrix alone was worth the switch.",
    name: "Dr. Maryam Karimi",
    role: "Quality Manager, TehranChem Analytics",
    initials: "MK",
    color: "bg-blue-600",
  },
  {
    quote: "We onboarded 80 employees and all instrument records in under two hours using the intake link feature. Remarkable.",
    name: "Eng. Reza Mohammadi",
    role: "Lab Director, AryaTest Institute",
    initials: "RM",
    color: "bg-violet-600",
  },
  {
    quote: "Our ISO 17025 surveillance audit passed with zero findings. Auditors specifically praised the traceability of our electronic records.",
    name: "Sara Hosseini",
    role: "Technical Director, BioQual Labs",
    initials: "SH",
    color: "bg-emerald-600",
  },
];

const trustBadges = [
  "ISO 17025 Ready",
  "SOC 2 Type II",
  "GDPR Compliant",
  "99.9% Uptime SLA",
  "End-to-End Encryption",
];

// ─── Components ───────────────────────────────────────────────────────────────

function Nav() {
  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="font-bold text-gray-900 text-lg">BLIMS</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
          <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-gray-900 transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Sign in
          </Link>
          <Link
            href="/register"
            className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Start free trial
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-20 pb-28">
      {/* subtle grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#1e40af 1px, transparent 1px), linear-gradient(90deg, #1e40af 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-100 rounded-full blur-3xl opacity-40" />

      <div className="relative max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-blue-100">
          <Zap className="w-3 h-3" />
          ISO 17025 &amp; ISO 15189 Ready
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight max-w-4xl mx-auto">
          The modern LIMS built for{" "}
          <span className="text-blue-600">accredited laboratories</span>
        </h1>

        <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          BLIMS brings together quality management, sample tracking, instrument records, and
          team management in one platform — so your lab spends less time on paperwork and
          more time on science.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="flex items-center gap-2 bg-blue-600 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            Start free 14-day trial <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#how-it-works"
            className="flex items-center gap-2 text-gray-700 px-7 py-3.5 rounded-xl font-semibold hover:bg-gray-100 transition-colors border border-gray-200"
          >
            See how it works <ChevronRight className="w-4 h-4" />
          </a>
        </div>

        <p className="mt-4 text-xs text-gray-400">No credit card required · Setup in under 2 hours · Cancel anytime</p>

        {/* Dashboard preview */}
        <div className="mt-16 relative max-w-5xl mx-auto">
          <div className="rounded-2xl border border-gray-200 shadow-2xl shadow-gray-200 overflow-hidden bg-gray-50">
            {/* mock browser chrome */}
            <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-4 bg-white rounded-md px-3 py-1 text-xs text-gray-400 border border-gray-200">
                app.blims.io/dashboard
              </div>
            </div>
            {/* mock dashboard content */}
            <div className="p-6 grid grid-cols-4 gap-4">
              {[
                { label: "Open Orders", value: "48", color: "text-blue-600", bg: "bg-blue-50" },
                { label: "Pending Results", value: "17", color: "text-amber-600", bg: "bg-amber-50" },
                { label: "Overdue Calibrations", value: "3", color: "text-red-600", bg: "bg-red-50" },
                { label: "Open Findings", value: "5", color: "text-violet-600", bg: "bg-violet-50" },
              ].map((stat) => (
                <div key={stat.label} className={`${stat.bg} rounded-xl p-4`}>
                  <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
              <div className="col-span-3 bg-white rounded-xl p-4 border border-gray-100">
                <p className="text-xs font-semibold text-gray-500 mb-3">RECENT ORDERS</p>
                <div className="space-y-2">
                  {[
                    { id: "ORD-2401", client: "Arya Petrochemical", status: "In Progress", statusColor: "bg-blue-100 text-blue-700" },
                    { id: "ORD-2400", client: "National Water Authority", status: "Pending Review", statusColor: "bg-amber-100 text-amber-700" },
                    { id: "ORD-2399", client: "BioPharm Holdings", status: "Completed", statusColor: "bg-green-100 text-green-700" },
                  ].map((o) => (
                    <div key={o.id} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                      <div>
                        <span className="text-xs font-mono text-gray-700">{o.id}</span>
                        <span className="text-xs text-gray-400 ml-2">{o.client}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.statusColor}`}>{o.status}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-100 flex flex-col">
                <p className="text-xs font-semibold text-gray-500 mb-3">COMPLIANCE</p>
                <div className="flex-1 flex flex-col justify-around gap-2">
                  {[
                    { label: "Documents Current", pct: 94 },
                    { label: "Instruments Calibrated", pct: 87 },
                    { label: "Staff Trained", pct: 100 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>{item.label}</span>
                        <span className="font-semibold text-gray-700">{item.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${item.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* floating badges */}
          <div className="absolute -right-6 top-12 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 hidden lg:block">
            <p className="text-xs text-gray-500">Result Approved</p>
            <p className="text-sm font-semibold text-green-600 flex items-center gap-1.5 mt-0.5">
              <CheckCircle className="w-4 h-4" /> pH 7.24 ✓
            </p>
          </div>
          <div className="absolute -left-6 bottom-12 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 hidden lg:block">
            <p className="text-xs text-gray-500">Instrument Alert</p>
            <p className="text-sm font-semibold text-amber-600 mt-0.5">Calibration due in 3 days</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  return (
    <section className="bg-gray-50 border-y border-gray-100 py-5">
      <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 md:gap-10">
        {trustBadges.map((b) => (
          <div key={b} className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            {b}
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider mb-3">Everything your lab needs</p>
          <h2 className="text-4xl font-bold text-gray-900">One platform. Complete coverage.</h2>
          <p className="mt-4 text-gray-500 text-lg max-w-2xl mx-auto">
            From first sample receipt to final audit, BLIMS covers every workflow a modern accredited laboratory demands.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="group p-6 rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-50 transition-all">
              <div className={`w-10 h-10 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider mb-3">Onboarding made simple</p>
          <h2 className="text-4xl font-bold text-gray-900">Live in days, not months</h2>
          <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">
            Most labs are fully operational within 48 hours of signing up.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* connector line */}
          <div className="hidden md:block absolute top-10 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-blue-100 via-blue-300 to-blue-100" />
          {steps.map((s) => (
            <div key={s.n} className="relative bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
              <div className="w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-200">
                {s.n}
              </div>
              <h3 className="font-bold text-gray-900 text-lg mb-3">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider mb-3">Trusted by lab professionals</p>
          <h2 className="text-4xl font-bold text-gray-900">What our customers say</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="p-7 rounded-2xl border border-gray-100 bg-gray-50 flex flex-col gap-4">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed flex-1">"{t.quote}"</p>
              <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider mb-3">Simple, transparent pricing</p>
          <h2 className="text-4xl font-bold text-gray-900">Choose your plan</h2>
          <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl p-8 border ${
                p.highlight
                  ? "bg-blue-600 border-blue-600 shadow-2xl shadow-blue-200 relative"
                  : "bg-white border-gray-100"
              }`}
            >
              {p.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className={`font-bold text-lg mb-1 ${p.highlight ? "text-white" : "text-gray-900"}`}>{p.name}</h3>
              <p className={`text-sm mb-5 ${p.highlight ? "text-blue-200" : "text-gray-500"}`}>{p.desc}</p>
              <div className={`flex items-end gap-1 mb-6 ${p.highlight ? "text-white" : "text-gray-900"}`}>
                <span className="text-4xl font-extrabold">{p.price}</span>
                <span className={`text-sm mb-1.5 ${p.highlight ? "text-blue-200" : "text-gray-400"}`}>{p.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${p.highlight ? "text-blue-200" : "text-green-500"}`} />
                    <span className={`text-sm ${p.highlight ? "text-blue-100" : "text-gray-600"}`}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={p.name === "Enterprise" ? "mailto:sales@blims.io" : "/register"}
                className={`block w-full text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                  p.highlight
                    ? "bg-white text-blue-600 hover:bg-blue-50"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBanner() {
  return (
    <section className="bg-blue-600 py-20">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-extrabold text-white mb-4">
          Ready to modernize your laboratory?
        </h2>
        <p className="text-blue-200 text-lg mb-10 max-w-xl mx-auto">
          Join hundreds of accredited labs that have replaced spreadsheets and paper binders with BLIMS.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="bg-white text-blue-600 px-8 py-3.5 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg"
          >
            Start your free trial
          </Link>
          <a
            href="mailto:sales@blims.io"
            className="text-white border border-blue-400 px-8 py-3.5 rounded-xl font-semibold hover:border-white transition-colors"
          >
            Talk to sales
          </a>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">B</span>
              </div>
              <span className="font-bold text-white">BLIMS</span>
            </div>
            <p className="text-sm leading-relaxed">
              Laboratory Information Management System for accredited testing and calibration labs.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How it works</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="mailto:sales@blims.io" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© {new Date().getFullYear()} BLIMS. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> SSL Secured</div>
            <div className="flex items-center gap-1.5"><Globe className="w-3 h-3" /> Global CDN</div>
            <div className="flex items-center gap-1.5"><Building2 className="w-3 h-3" /> Multi-tenant</div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function MarketingPage() {
  return (
    <>
      <Nav />
      <Hero />
      <TrustBar />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <CtaBanner />
      <Footer />
    </>
  );
}
