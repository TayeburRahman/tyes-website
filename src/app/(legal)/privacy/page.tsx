import React from "react";
import Link from "next/link";

export const metadata = {
  title: "tyes | Privacy Policy",
  description: "Privacy Policy for tyes platform, website, and services.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#EDEDED] font-sans px-4 py-12 md:py-20">
      <div className="max-w-[780px] mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <div className="text-[#2DD4BF] text-xs font-semibold uppercase tracking-[0.3em] mb-3">
            Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Privacy <span className="text-[#2DD4BF] italic">Policy.</span>
          </h1>
          <p className="text-xs text-[#888888] uppercase tracking-wider mb-6">
            Last updated: July 2026 · Applies to all users worldwide
          </p>
          <p className="text-lg text-[#B8B8B8] leading-relaxed">
            This Privacy Policy explains how <strong className="text-white">tyes LLC</strong> ("<span className="font-bold text-white">tyes</span>", "we", "us") collects,
            uses, and shares personal information when you use our platform, website, and services (the "Service").
            This policy covers users in the United States, the European Economic Area (EEA), the United Kingdom, and worldwide.
          </p>
        </div>

        <hr className="border-[#2A2A2A]" />

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">1. Who We Are.</h2>
          <div className="bg-[#141414] border-l-4 border-[#2DD4BF] p-4 rounded-r-lg space-y-1 text-sm">
            <p><strong className="text-white">Data Controller:</strong> tyes LLC, a Wyoming limited liability company.</p>
            <p className="text-[#C8C8C8]">30 N Gould Street, Sheridan, WY 82801, USA</p>
            <p className="text-[#C8C8C8]">Contact: <a href="mailto:office@tyes.app" className="text-[#2DD4BF] hover:underline">office@tyes.app</a></p>
          </div>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">2. Information We Collect.</h2>
          <h3 className="text-lg font-bold text-white mt-4">Information You Provide</h3>
          <ul className="list-disc list-inside text-sm text-[#C8C8C8] space-y-1 pl-2">
            <li><strong className="text-white">Account data:</strong> name, email, company name, VAT/EIN (if applicable), password.</li>
            <li><strong className="text-white">Billing data:</strong> payment method details (processed by our payment provider, not stored by us).</li>
            <li><strong className="text-white">Content:</strong> logos, brand assets, product photos, briefs, prompts, and other materials you upload.</li>
            <li><strong className="text-white">Communications:</strong> messages you send to support or to our team.</li>
          </ul>

          <h3 className="text-lg font-bold text-white mt-4">Information Collected Automatically</h3>
          <ul className="list-disc list-inside text-sm text-[#C8C8C8] space-y-1 pl-2">
            <li><strong className="text-white">Usage data:</strong> pages visited, features used, actions taken, timestamps.</li>
            <li><strong className="text-white">Device &amp; log data:</strong> IP address, browser type, operating system, referrer, device identifiers.</li>
            <li><strong className="text-white">Cookies &amp; similar technologies:</strong> see our <Link href="/cookie-policy" className="text-[#2DD4BF] hover:underline">Cookie Policy</Link>.</li>
          </ul>

          <h3 className="text-lg font-bold text-white mt-4">Information from Third Parties</h3>
          <ul className="list-disc list-inside text-sm text-[#C8C8C8] space-y-1 pl-2">
            <li>Authentication providers if you sign in via Google, Apple, or similar.</li>
            <li>Payment processors (transaction status, but not full card data).</li>
            <li>Analytics and marketing platforms.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">3. How We Use Your Information.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">We use your personal information to:</p>
          <ul className="list-disc list-inside text-sm text-[#C8C8C8] space-y-1 pl-2">
            <li>Provide and operate the Service (generate imagery, deliver strategy outputs, process payments).</li>
            <li>Communicate with you about your account, updates, and support requests.</li>
            <li>Improve and develop new features, including training internal quality models.</li>
            <li>Prevent fraud, abuse, and violations of our Terms.</li>
            <li>Comply with legal obligations.</li>
            <li>Send marketing communications (only where permitted by law and subject to opt-out).</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">4. Legal Bases (EEA / UK Users).</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">If you are in the EEA or UK, we process your personal data under the following legal bases:</p>
          <ul className="list-disc list-inside text-sm text-[#C8C8C8] space-y-1 pl-2">
            <li><strong className="text-white">Contract:</strong> to provide the Service you requested.</li>
            <li><strong className="text-white">Legitimate interests:</strong> to improve the Service, prevent fraud, and secure our systems.</li>
            <li><strong className="text-white">Consent:</strong> for optional marketing communications and non-essential cookies.</li>
            <li><strong className="text-white">Legal obligation:</strong> to comply with tax, accounting, and other legal requirements.</li>
          </ul>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">5. Sharing Your Information.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">We share personal information with:</p>
          <ul className="list-disc list-inside text-sm text-[#C8C8C8] space-y-1 pl-2">
            <li><strong className="text-white">Service providers:</strong> hosting (AWS, Vercel or similar), AI infrastructure providers, payment processors, email delivery, analytics, customer support tools.</li>
            <li><strong className="text-white">Retail buyer partners:</strong> only with your explicit consent, and only the specific product/brand information required to make an introduction.</li>
            <li><strong className="text-white">Legal &amp; compliance:</strong> when required by law, court order, or to protect our rights.</li>
            <li><strong className="text-white">Business transfers:</strong> in connection with a merger, acquisition, or sale of assets, with appropriate protections.</li>
          </ul>
          <p className="text-sm text-[#C8C8C8] leading-relaxed mt-2">We do not sell your personal information.</p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">6. International Transfers.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            We are based in the United States. If you access the Service from the EEA, UK, or another jurisdiction,
            your data will be transferred to and processed in the U.S. and other countries where our service providers operate. We use Standard Contractual Clauses (SCCs) and equivalent safeguards for transfers from the EEA/UK to the U.S.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">7. Data Retention.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            We retain personal information for as long as your account is active and as needed to provide the Service.
            When your account is closed, we delete or anonymize personal information within 90 days, except where we are required to retain it longer for legal, tax, or accounting purposes (typically up to 7 years for financial records).
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">8. Your Rights.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">Depending on your location, you may have the following rights:</p>
          <ul className="list-disc list-inside text-sm text-[#C8C8C8] space-y-1 pl-2">
            <li><strong className="text-white">Access</strong> a copy of the personal information we hold about you.</li>
            <li><strong className="text-white">Rectification</strong> of inaccurate or incomplete data.</li>
            <li><strong className="text-white">Erasure</strong> ("right to be forgotten") in certain circumstances.</li>
            <li><strong className="text-white">Restriction</strong> or objection to certain processing.</li>
            <li><strong className="text-white">Data portability</strong> — receive your data in a structured, machine-readable format.</li>
            <li><strong className="text-white">Withdraw consent</strong> where processing is based on consent.</li>
            <li><strong className="text-white">Lodge a complaint</strong> with your local data protection authority.</li>
          </ul>
          <p className="text-sm text-[#C8C8C8] leading-relaxed mt-2">
            To exercise your rights, contact us at <a href="mailto:office@tyes.app" className="text-[#2DD4BF] hover:underline">office@tyes.app</a>. We will respond within 30 days.
          </p>
        </section>

        {/* Section 9 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">9. California Privacy Rights (CCPA / CPRA).</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">If you are a California resident, you have specific rights, including:</p>
          <ul className="list-disc list-inside text-sm text-[#C8C8C8] space-y-1 pl-2">
            <li>To know what personal information we collect, use, disclose, and sell (we do not sell personal information).</li>
            <li>To request deletion of your personal information.</li>
            <li>To correct inaccurate personal information.</li>
            <li>To limit the use of sensitive personal information.</li>
            <li>To not be discriminated against for exercising these rights.</li>
          </ul>
          <p className="text-sm text-[#C8C8C8] leading-relaxed mt-2">
            To exercise these rights, email us at <a href="mailto:office@tyes.app" className="text-[#2DD4BF] hover:underline">office@tyes.app</a>.
          </p>
        </section>

        {/* Section 10 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">10. Security.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            We use administrative, technical, and physical safeguards designed to protect your personal information, including encryption in transit and at rest, access controls, and regular security reviews. No system is 100% secure, so we cannot guarantee absolute security.
          </p>
        </section>

        {/* Section 11 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">11. Children.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            The Service is not directed to individuals under 18, and we do not knowingly collect personal information from children. If you believe a child has provided us with personal information, contact us and we will delete it.
          </p>
        </section>

        {/* Section 12 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">12. Changes to This Policy.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            We may update this Privacy Policy from time to time. Material changes will be notified by email or through the Service. The "Last updated" date at the top of this page shows when the policy was last revised.
          </p>
        </section>

        {/* Section 13 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">13. Contact Us.</h2>
          <div className="bg-[#141414] border-l-4 border-[#2DD4BF] p-4 rounded-r-lg space-y-1 text-sm">
            <p className="font-bold text-white">tyes LLC — Privacy</p>
            <p className="text-[#C8C8C8]">30 N Gould Street, Sheridan, WY 82801, USA</p>
            <p className="text-[#C8C8C8]">Email: <a href="mailto:office@tyes.app" className="text-[#2DD4BF] hover:underline">office@tyes.app</a></p>
          </div>
        </section>

        {/* Footer */}
        <div className="pt-8 border-t border-[#2A2A2A] text-xs text-[#777777] flex flex-wrap gap-2 justify-between items-center">
          <div>
            <strong className="text-white">tyes LLC</strong> · 30 N Gould Street, Sheridan, WY 82801, USA
          </div>
          <div>
            <a href="mailto:office@tyes.app" className="text-[#2DD4BF] hover:underline">office@tyes.app</a>
          </div>
        </div>

      </div>
    </div>
  );
}
