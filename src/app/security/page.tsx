import { Shield, Lock, Eye, Server, Key, AlertCircle, CheckCircle } from "lucide-react";
import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";

const pillars = [
  {
    icon: Server,
    title: "Tenant isolation",
    color: "bg-blue-50 text-blue-600",
    items: [
      "Each laboratory workspace lives in a dedicated PostgreSQL schema",
      "No shared tables between tenants — structural isolation at the database level",
      "Tenant resolution validated on every API request",
      "Cross-tenant data access is architecturally impossible",
    ],
  },
  {
    icon: Lock,
    title: "Encryption",
    color: "bg-violet-50 text-violet-600",
    items: [
      "AES-256 encryption at rest for all stored data",
      "TLS 1.3 for all data in transit",
      "Encrypted backups with separate key management",
      "Passwords hashed with bcrypt (never stored in plain text)",
    ],
  },
  {
    icon: Key,
    title: "Authentication",
    color: "bg-emerald-50 text-emerald-600",
    items: [
      "TOTP-based two-factor authentication (2FA) for all users",
      "One-time backup codes for 2FA recovery",
      "Short-lived JWT access tokens with refresh token rotation",
      "Session invalidation on password change or logout",
    ],
  },
  {
    icon: Eye,
    title: "Audit trails",
    color: "bg-amber-50 text-amber-600",
    items: [
      "Every record creation, modification, and deletion is logged",
      "Logs are immutable — they cannot be edited or deleted through the UI",
      "Full who-did-what-when traceability for ISO 17025 requirements",
      "Electronic signatures captured with timestamp and identity proof",
    ],
  },
  {
    icon: Shield,
    title: "Access control",
    color: "bg-rose-50 text-rose-600",
    items: [
      "Role-based permissions enforced at every API endpoint",
      "Authorities matrix controls approval workflows",
      "Principle of least privilege: users only see what they need",
      "Admin actions require elevated confirmation",
    ],
  },
  {
    icon: AlertCircle,
    title: "Infrastructure",
    color: "bg-cyan-50 text-cyan-600",
    items: [
      "Hosted in SOC 2 Type II certified data centres",
      "Automated daily backups with point-in-time recovery",
      "DDoS protection and Web Application Firewall (WAF)",
      "Security patches applied within 24 hours of release",
    ],
  },
];

export default function SecurityPage() {
  return (
    <>
      <MarketingNav />

      {/* Hero */}
      <section className="bg-white border-b border-gray-100 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider mb-3">Security</p>
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight mb-5">
            Your laboratory data is protected at every layer
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Security is not an add-on at BLIMS — it is the foundation. From tenant-level database
            isolation to end-to-end encryption and immutable audit logs, we take data security
            as seriously as your accreditation body does.
          </p>
        </div>
      </section>

      {/* Trust badges */}
      <section className="bg-gray-50 border-y border-gray-100 py-5">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {[
            "SOC 2 Type II",
            "GDPR Compliant",
            "ISO 27001 Aligned",
            "End-to-End Encryption",
            "2FA on All Accounts",
          ].map((b) => (
            <div key={b} className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
              {b}
            </div>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((p) => (
              <div key={p.title} className="rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl ${p.color} flex items-center justify-center mb-4`}>
                  <p.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-gray-900 mb-3">{p.title}</h3>
                <ul className="space-y-2">
                  {p.items.map((item) => (
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

      {/* Responsible disclosure */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Responsible disclosure</h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            If you discover a security vulnerability in BLIMS, please report it to us privately
            before public disclosure. We will acknowledge your report within 24 hours and work
            with you to verify and resolve the issue. We do not take legal action against
            researchers acting in good faith.
          </p>
          <a
            href="mailto:security@blims.io"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm"
          >
            Report a vulnerability — security@blims.io
          </a>
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}
