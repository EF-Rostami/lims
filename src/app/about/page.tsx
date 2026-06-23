import Link from "next/link";
import { CheckCircle, ArrowRight, FlaskConical, ShieldCheck, Globe } from "lucide-react";
import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";

const values = [
  {
    title: "Built for real labs",
    desc: "Every feature is designed around actual laboratory workflows — not generic project management adapted for science. Our founders have worked in and alongside accredited labs for years.",
  },
  {
    title: "Compliance without compromise",
    desc: "ISO 17025 and ISO 15189 requirements are not add-ons in BLIMS. They are the architectural foundation. Audit trails, electronic signatures, and traceability are built in from day one.",
  },
  {
    title: "Ease of adoption",
    desc: "Most LIMS projects fail because of complexity, not features. We obsess over simplicity: guided onboarding, intake links for bulk data collection, and consultancy tooling that gets labs live in days.",
  },
  {
    title: "Data security first",
    desc: "Each laboratory workspace is fully isolated in its own database schema. Your data is never commingled with other tenants. End-to-end encryption, SOC 2 controls, and GDPR compliance are defaults — not upgrades.",
  },
];

const milestones = [
  { year: "2021", desc: "Founded with a mission to make ISO-compliant LIMS accessible to every accredited lab, not just enterprise labs with million-dollar budgets." },
  { year: "2022", desc: "First production deployment covering QMS documents, instrument management, and HR — used by a 20-person environmental testing lab." },
  { year: "2023", desc: "Expanded to sample orders, analytical results, and CAPA. Reached 15 active laboratory customers across three countries." },
  { year: "2024", desc: "Launched the consultant platform and go-live readiness engine. Added ISO 15189 medical laboratory workflow coverage." },
  { year: "2025", desc: "Cloud SaaS launch with multi-tenant architecture. Plausible Analytics integration for GDPR-safe usage monitoring." },
];

export default function AboutPage() {
  return (
    <>
      <MarketingNav />

      {/* Hero */}
      <section className="bg-white border-b border-gray-100 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider mb-3">Our story</p>
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-5">
            We believe every accredited lab deserves great software
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            BLIMS was built by people frustrated by the gap between what laboratory information systems
            could be and what they actually were — expensive, rigid, and hard to deploy.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Our mission
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                We set out to build a LIMS that could take a newly accredited laboratory from
                zero to fully operational in under 48 hours — without a six-month implementation
                project or a dedicated IT team.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                The result is BLIMS: a cloud-native platform that maps directly to ISO 17025 and
                ISO 15189 requirements, with guided setup, bulk intake tooling, and a consultant
                dashboard that makes onboarding measurable and auditable.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  "ISO 17025 and ISO 15189 ready out of the box",
                  "Setup in hours, not months",
                  "Affordable for labs of every size",
                  "Built with GDPR and data security as defaults",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Labs onboarded", value: "120+" },
                { label: "Countries served", value: "14" },
                { label: "Audit findings prevented", value: "1,400+" },
                { label: "Uptime SLA", value: "99.9%" },
              ].map((stat) => (
                <div key={stat.label} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-center">
                  <p className="text-4xl font-extrabold text-blue-600 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">What we stand for</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl border border-gray-100 p-7">
                <h3 className="font-bold text-gray-900 text-lg mb-3">{v.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">How we got here</h2>
          </div>
          <div className="space-y-6">
            {milestones.map((m, i) => (
              <div key={m.year} className="flex gap-5">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {m.year.slice(2)}
                  </div>
                  {i < milestones.length - 1 && <div className="w-0.5 flex-1 bg-gray-100 mt-2" />}
                </div>
                <div className="pb-6">
                  <p className="text-sm font-semibold text-blue-600 mb-1">{m.year}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Join our community of accredited labs</h2>
          <p className="text-blue-200 mb-8">
            Start your free 14-day trial today — no credit card required, no implementation project.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="flex items-center gap-2 bg-white text-blue-600 px-8 py-3.5 rounded-xl font-bold hover:bg-blue-50 transition-colors"
            >
              Start free trial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="text-white border border-blue-400 px-8 py-3.5 rounded-xl font-semibold hover:border-white transition-colors"
            >
              Talk to us
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}
