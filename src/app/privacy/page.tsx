import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";

export const metadata = {
  title: "Privacy Policy — BLIMS",
};

export default function PrivacyPage() {
  return (
    <>
      <MarketingNav />

      <section className="bg-white border-b border-gray-100 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider mb-3">Legal</p>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Privacy Policy</h1>
          <p className="text-gray-400 text-sm">Last updated: 1 June 2025</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6 prose prose-gray prose-sm max-w-none">
          <div className="space-y-10 text-gray-600 leading-relaxed">

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">1. Who we are</h2>
              <p>
                BLIMS is a cloud-based Laboratory Information Management System operated by BLIMS Technologies.
                We provide software services to accredited testing and calibration laboratories worldwide.
                This policy explains what personal data we collect, how we use it, and your rights under applicable
                data protection law including the EU General Data Protection Regulation (GDPR).
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">2. Data we collect</h2>
              <p className="mb-3">We collect two categories of data:</p>
              <p className="font-medium text-gray-800 mb-1">Account data</p>
              <p className="mb-4">
                When you or your laboratory registers, we collect name, email address, organisation name,
                and billing details (processed by our payment provider — we never store card numbers).
              </p>
              <p className="font-medium text-gray-800 mb-1">Laboratory operational data</p>
              <p>
                Data you enter into BLIMS — employee records, sample data, instrument logs, documents, results —
                belongs to your laboratory. We process it only as your data processor, under your instruction,
                and do not use it for any other purpose.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">3. How we use your data</h2>
              <ul className="space-y-2 list-disc pl-5">
                <li>To provide, operate, and maintain the BLIMS platform</li>
                <li>To send transactional emails (account confirmation, password reset, invoices)</li>
                <li>To monitor service health and diagnose technical issues</li>
                <li>To comply with legal obligations</li>
              </ul>
              <p className="mt-4">
                We do not sell, rent, or share your personal data with third parties for marketing purposes.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data isolation and security</h2>
              <p>
                Each laboratory workspace is stored in a dedicated database schema, physically isolated from
                all other tenants. Data is encrypted at rest and in transit using AES-256 and TLS 1.3.
                Access controls are enforced at every layer of the application stack.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">5. Analytics</h2>
              <p>
                We use Plausible Analytics for website visitor monitoring. Plausible is a privacy-first,
                cookie-free analytics tool that does not collect personal data and is fully GDPR compliant.
                No tracking cookies are set and no data is shared with advertising networks.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">6. Data retention</h2>
              <p>
                Account data is retained for the duration of your subscription plus 30 days after cancellation
                (to allow recovery). Laboratory operational data is retained as long as your subscription is
                active. Upon account deletion we purge all data within 14 days.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">7. Your rights (GDPR)</h2>
              <p className="mb-3">If you are in the EEA or UK you have the right to:</p>
              <ul className="space-y-1 list-disc pl-5">
                <li>Access the personal data we hold about you</li>
                <li>Rectify inaccurate data</li>
                <li>Request erasure (&quot;right to be forgotten&quot;)</li>
                <li>Object to or restrict processing</li>
                <li>Data portability</li>
                <li>Lodge a complaint with your national supervisory authority</li>
              </ul>
              <p className="mt-4">
                To exercise any of these rights, email <a href="mailto:privacy@blims.io" className="text-blue-600 hover:underline">privacy@blims.io</a>.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">8. Cookies</h2>
              <p>
                The BLIMS application uses only essential session cookies required for authentication.
                No advertising or analytics cookies are set. The marketing website uses no cookies at all.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">9. Contact</h2>
              <p>
                For privacy questions, contact our Data Protection team at{" "}
                <a href="mailto:privacy@blims.io" className="text-blue-600 hover:underline">privacy@blims.io</a>.
              </p>
            </div>

          </div>
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}
