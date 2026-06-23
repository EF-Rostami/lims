import Link from "next/link";
import {
  ClipboardList, FlaskConical, Microscope, Wrench, Users, BarChart3,
  FileText, ShieldCheck, Package, Thermometer, AlertCircle, BookOpen,
  CheckCircle, ArrowRight,
} from "lucide-react";
import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";

const modules = [
  {
    icon: ClipboardList,
    title: "Quality Management System",
    color: "bg-blue-50 text-blue-600",
    items: [
      "Document control with version history and approval workflows",
      "Authorities matrix — who can sign off on what",
      "Role-based permissions across the org chart",
      "Full audit trail on every record change",
      "Document categories: SOP, WI, Form, Policy, and more",
    ],
  },
  {
    icon: FlaskConical,
    title: "Sample & Order Management",
    color: "bg-violet-50 text-violet-600",
    items: [
      "Sample receipt, labelling, and chain of custody",
      "Multi-test orders with sub-sample tracking",
      "Turnaround time tracking and SLA alerting",
      "Status dashboard from receipt to result",
      "Client portal for order submission and result delivery",
    ],
  },
  {
    icon: Microscope,
    title: "Analytical Results & Reporting",
    color: "bg-cyan-50 text-cyan-600",
    items: [
      "Result entry with limit checking and out-of-spec flagging",
      "Multi-level sign-off (analyst → supervisor → manager)",
      "Uncertainty of measurement budgets per test method",
      "Certificates of Analysis with electronic signatures",
      "Configurable report templates with logo branding",
    ],
  },
  {
    icon: Wrench,
    title: "Instrument Management",
    color: "bg-orange-50 text-orange-600",
    items: [
      "Instrument registry with full traceability records",
      "Calibration schedule and due-date alerting",
      "Maintenance logs and corrective action tracking",
      "Qualification status (IQ / OQ / PQ) per instrument",
      "Multi-location instrument inventory",
    ],
  },
  {
    icon: Users,
    title: "HR & Competence Management",
    color: "bg-emerald-50 text-emerald-600",
    items: [
      "Org chart: departments, positions, and reporting lines",
      "Employee competence records and training history",
      "Delegation management for role coverage",
      "Visual role-permission matrix for ISO compliance",
      "Functional roles mapped to ISO 17025 clauses",
    ],
  },
  {
    icon: BarChart3,
    title: "Internal Audit & CAPA",
    color: "bg-rose-50 text-rose-600",
    items: [
      "Audit programme planning with assigned auditors",
      "Clause-level checklist for ISO 17025 / ISO 15189",
      "Finding classification: observation, minor, major",
      "CAPA action tracking with due dates and owners",
      "Corrective action effectiveness reviews",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Quality Control",
    color: "bg-indigo-50 text-indigo-600",
    items: [
      "QC materials registry and lot tracking",
      "Westgard rules engine for control chart evaluation",
      "Automatic out-of-control alerting and run rejection",
      "Reference material traceability to national standards",
      "QC run history with trend visualisation",
    ],
  },
  {
    icon: Package,
    title: "Inventory & Reagents",
    color: "bg-amber-50 text-amber-600",
    items: [
      "Stock tracking for reagents, consumables, and standards",
      "Expiry date monitoring with auto-alerts",
      "Lot/batch traceability linked to QC and results",
      "Minimum stock level alerts and reorder triggers",
      "Supplier and certificate of analysis records",
    ],
  },
  {
    icon: Thermometer,
    title: "Environmental Monitoring",
    color: "bg-teal-50 text-teal-600",
    items: [
      "Temperature, humidity, and pressure logging",
      "Zone-based monitoring with configurable thresholds",
      "Out-of-range event logging and CAPA linkage",
      "Monitoring schedule and calibration records",
      "Historical trend charts per monitoring point",
    ],
  },
  {
    icon: AlertCircle,
    title: "Customer Complaints",
    color: "bg-red-50 text-red-600",
    items: [
      "Complaint intake with severity classification",
      "Root cause analysis and investigation tracking",
      "Resolution timeline monitoring",
      "Complaint trend reporting for management review",
      "Client communication log per complaint",
    ],
  },
  {
    icon: FileText,
    title: "Method Management",
    color: "bg-purple-50 text-purple-600",
    items: [
      "Standard and test method registry",
      "Method validation study records",
      "SOP linkage per test method",
      "Scope of accreditation tracking",
      "Method comparison and uncertainty budgets",
    ],
  },
  {
    icon: BookOpen,
    title: "Consultancy & Go-Live",
    color: "bg-sky-50 text-sky-600",
    items: [
      "Guided setup wizard for initial lab configuration",
      "Project-based onboarding with milestones",
      "Go-live readiness checklist (ISO 17025 mapped)",
      "Assessment and deficiency tracking for consultants",
      "Bulk data import from intake links",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <>
      <MarketingNav />

      {/* Hero */}
      <section className="bg-white border-b border-gray-100 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider mb-3">Complete platform</p>
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-5">
            Every feature your accredited lab needs
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            BLIMS covers the full scope of ISO 17025 and ISO 15189 operations in a single
            cloud platform — from sample intake to signed report.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="flex items-center gap-2 bg-blue-600 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Start free trial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/demo"
              className="flex items-center gap-2 text-gray-700 px-7 py-3.5 rounded-xl font-semibold hover:bg-gray-100 transition-colors border border-gray-200"
            >
              Explore live demo
            </Link>
          </div>
        </div>
      </section>

      {/* Modules grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((m) => (
              <div key={m.title} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl ${m.color} flex items-center justify-center mb-4`}>
                  <m.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3">{m.title}</h3>
                <ul className="space-y-2">
                  {m.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-500">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to see it in action?</h2>
          <p className="text-blue-200 mb-8">
            Explore a fully pre-populated dairy testing lab with no sign-up required.
          </p>
          <Link
            href="/demo"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-3.5 rounded-xl font-bold hover:bg-blue-50 transition-colors"
          >
            Launch live demo
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}
