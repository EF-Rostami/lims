import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";

const posts = [
  {
    slug: "iso-17025-2017-key-changes",
    title: "ISO 17025:2017 — the key changes every lab manager needs to know",
    excerpt:
      "The 2017 revision of ISO 17025 introduced risk-based thinking, updated impartiality requirements, and new flexibility in how labs document their QMS. We break down what changed and what it means for your daily operations.",
    date: "12 May 2025",
    readTime: "8 min",
    tag: "Quality",
    tagColor: "bg-blue-100 text-blue-700",
  },
  {
    slug: "westgard-rules-lims",
    title: "Westgard rules in your LIMS: how automated QC evaluation prevents reporting errors",
    excerpt:
      "Manual QC chart review is time-consuming and error-prone. We look at how a LIMS with built-in Westgard rule evaluation catches out-of-control situations before results leave the lab.",
    date: "28 April 2025",
    readTime: "6 min",
    tag: "Quality Control",
    tagColor: "bg-violet-100 text-violet-700",
  },
  {
    slug: "lims-onboarding-48-hours",
    title: "From zero to accreditation-ready in 48 hours: our onboarding playbook",
    excerpt:
      "Most LIMS implementations take months. We explain the architectural decisions — intake links, guided wizards, bulk import, and the go-live readiness checklist — that let labs go live in days.",
    date: "10 April 2025",
    readTime: "10 min",
    tag: "Onboarding",
    tagColor: "bg-emerald-100 text-emerald-700",
  },
  {
    slug: "audit-trail-electronic-signatures",
    title: "Audit trails and electronic signatures: meeting ISO 17025 clause 7.11",
    excerpt:
      "Clause 7.11 requires labs to keep records of who reviewed, approved, and modified test results. We explain what an audit-trail-compliant LIMS must record and how electronic signatures satisfy accreditation body expectations.",
    date: "2 March 2025",
    readTime: "7 min",
    tag: "Compliance",
    tagColor: "bg-amber-100 text-amber-700",
  },
  {
    slug: "measurement-uncertainty-budgets",
    title: "Measurement uncertainty budgets: why your LIMS should calculate them automatically",
    excerpt:
      "Uncertainty of measurement is one of the most misunderstood requirements in ISO 17025. We explain the GUM framework and why connecting uncertainty budgets directly to test methods in your LIMS saves hours of manual calculation.",
    date: "14 February 2025",
    readTime: "9 min",
    tag: "Technical",
    tagColor: "bg-cyan-100 text-cyan-700",
  },
  {
    slug: "multi-tenant-lims-security",
    title: "How schema-per-tenant architecture keeps laboratory data isolated",
    excerpt:
      "When your LIMS is in the cloud, how do you know your data is truly isolated from other labs? We explain the schema-per-tenant model BLIMS uses and why it provides stronger guarantees than row-level security alone.",
    date: "20 January 2025",
    readTime: "5 min",
    tag: "Security",
    tagColor: "bg-rose-100 text-rose-700",
  },
];

export default function BlogPage() {
  return (
    <>
      <MarketingNav />

      <section className="bg-white border-b border-gray-100 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider mb-3">Blog</p>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
            Insights for laboratory professionals
          </h1>
          <p className="text-xl text-gray-500 max-w-xl mx-auto leading-relaxed">
            Practical guidance on ISO compliance, LIMS best practices, and laboratory quality management.
          </p>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="space-y-6">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="bg-white rounded-2xl border border-gray-100 p-7 hover:border-blue-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${post.tagColor}`}>
                    {post.tag}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {post.readTime} read
                  </div>
                  <span className="text-xs text-gray-400">{post.date}</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-2 leading-snug">{post.title}</h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{post.excerpt}</p>
                <Link
                  href={`/blog/${post.slug}`}
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:underline"
                >
                  Read article <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Stay up to date</h2>
          <p className="text-gray-500 text-sm mb-6">
            New articles on ISO compliance, QC best practices, and LIMS strategy — delivered to your inbox once a month.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="name@lab.com"
              className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
            />
            <button className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
              Subscribe
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-3">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}
