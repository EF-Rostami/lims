import Link from "next/link";
import { Mail, MessageSquare, Clock, Globe } from "lucide-react";
import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";

const channels = [
  {
    icon: Mail,
    title: "Sales",
    desc: "Questions about plans, pricing, or custom enterprise deals.",
    contact: "sales@blims.io",
    href: "mailto:sales@blims.io",
  },
  {
    icon: MessageSquare,
    title: "Support",
    desc: "Technical questions, bug reports, and feature requests.",
    contact: "support@blims.io",
    href: "mailto:support@blims.io",
  },
  {
    icon: Globe,
    title: "Partnerships",
    desc: "Lab consultants, integrators, and resellers.",
    contact: "partners@blims.io",
    href: "mailto:partners@blims.io",
  },
];

export default function ContactPage() {
  return (
    <>
      <MarketingNav />

      <section className="bg-white border-b border-gray-100 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider mb-3">Get in touch</p>
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-5">
            We&apos;d love to hear from you
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Whether you&apos;re evaluating BLIMS for your lab, need support, or want to discuss
            a partnership — our team responds within one business day.
          </p>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {channels.map((c) => (
              <a
                key={c.title}
                href={c.href}
                className="bg-white rounded-2xl border border-gray-100 p-7 hover:border-blue-200 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <c.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{c.title}</h3>
                <p className="text-sm text-gray-500 mb-4 leading-relaxed">{c.desc}</p>
                <span className="text-sm text-blue-600 font-medium group-hover:underline">{c.contact}</span>
              </a>
            ))}
          </div>

          {/* Response time note */}
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 max-w-lg mx-auto">
            <Clock className="w-5 h-5 text-blue-500 shrink-0" />
            <p className="text-sm text-blue-700">
              We typically respond within <strong>one business day</strong>. For urgent issues,
              include "URGENT" in your subject line.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Common questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "How long does onboarding take?",
                a: "Most labs are fully operational within 48 hours of signing up. Our consultant tooling and guided wizards eliminate the months-long implementation projects typical of legacy LIMS.",
              },
              {
                q: "Do you offer a free trial?",
                a: "Yes — all plans include a 14-day free trial with full access. No credit card required.",
              },
              {
                q: "Can you migrate our existing data?",
                a: "Yes. We support structured data import for instruments, employees, documents, and test methods. Contact sales for a migration assessment.",
              },
              {
                q: "Is BLIMS compliant with ISO 17025?",
                a: "BLIMS is built specifically around ISO 17025 and ISO 15189 requirements. Our go-live readiness checklist maps directly to accreditation clauses.",
              },
              {
                q: "Where is our data stored?",
                a: "Data is hosted in secure, SOC 2 certified data centres. Each laboratory workspace is isolated in its own database schema. EU hosting is available for GDPR compliance.",
              },
            ].map((faq) => (
              <div key={faq.q} className="border border-gray-100 rounded-xl p-5">
                <p className="font-semibold text-gray-900 mb-2">{faq.q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}
