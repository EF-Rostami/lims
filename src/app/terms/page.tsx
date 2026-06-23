import { MarketingNav } from "@/components/marketing/nav";
import { MarketingFooter } from "@/components/marketing/footer";

export const metadata = {
  title: "Terms of Service — BLIMS",
};

export default function TermsPage() {
  return (
    <>
      <MarketingNav />

      <section className="bg-white border-b border-gray-100 py-16">
        <div className="max-w-3xl mx-auto px-6">
          <p className="text-blue-600 text-sm font-semibold uppercase tracking-wider mb-3">Legal</p>
          <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Terms of Service</h1>
          <p className="text-gray-400 text-sm">Last updated: 1 June 2025</p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6 space-y-10 text-gray-600 leading-relaxed text-sm">

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance</h2>
            <p>
              By accessing or using BLIMS you agree to be bound by these Terms of Service and our
              Privacy Policy. If you are using BLIMS on behalf of an organisation, you represent that
              you have authority to bind that organisation to these terms.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Subscription and payment</h2>
            <p className="mb-3">
              BLIMS is offered on a subscription basis. Fees are billed in advance for each subscription
              period (monthly or annually). All fees are non-refundable except as required by law or
              as stated in a signed order form.
            </p>
            <p>
              We may change our pricing with 30 days&apos; written notice. Continued use of the service
              after the notice period constitutes acceptance of the new pricing.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Acceptable use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="space-y-1 list-disc pl-5">
              <li>Use BLIMS for any unlawful purpose</li>
              <li>Attempt to reverse engineer, decompile, or extract source code</li>
              <li>Use automated tools to scrape or bulk-extract data without written permission</li>
              <li>Attempt to gain unauthorised access to other tenant workspaces</li>
              <li>Upload content that infringes intellectual property rights</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Data ownership</h2>
            <p>
              You retain full ownership of all data you enter into BLIMS. We process your laboratory
              data only as a data processor on your behalf. We will never use your operational data
              for purposes beyond providing the BLIMS service to you.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Uptime and availability</h2>
            <p>
              We target 99.9% monthly uptime for the BLIMS platform. Scheduled maintenance windows
              are announced at least 48 hours in advance. Downtime credits may apply for breaches
              of the uptime SLA — see your order form for details.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Intellectual property</h2>
            <p>
              BLIMS and all associated software, designs, and documentation are the intellectual
              property of BLIMS Technologies. Your subscription grants you a limited, non-exclusive,
              non-transferable licence to use the service during the subscription term.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Termination</h2>
            <p>
              Either party may terminate the subscription at any time. Upon termination, your access
              will cease at the end of the current billing period. We will retain your data for 30 days
              after termination to allow export, then permanently delete it.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Limitation of liability</h2>
            <p>
              To the extent permitted by law, BLIMS Technologies shall not be liable for indirect,
              incidental, or consequential damages arising from use of the service. Our total aggregate
              liability shall not exceed the fees paid by you in the 12 months preceding the claim.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Governing law</h2>
            <p>
              These terms are governed by the laws of the applicable jurisdiction as stated in your
              order form. Any disputes shall be subject to the exclusive jurisdiction of the courts
              of that jurisdiction.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Contact</h2>
            <p>
              Questions about these terms:{" "}
              <a href="mailto:legal@blims.io" className="text-blue-600 hover:underline">legal@blims.io</a>
            </p>
          </div>

        </div>
      </section>

      <MarketingFooter />
    </>
  );
}
