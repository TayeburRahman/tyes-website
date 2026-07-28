import React from "react";
import Link from "next/link";

export const metadata = {
  title: "tyes | Terms of Service",
  description: "Terms of Service for tyes platform, website, and services.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#EDEDED] font-sans px-4 py-12 md:py-20">
      <div className="max-w-[780px] mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <div className="text-[#2DD4BF] text-xs font-semibold uppercase tracking-[0.3em] mb-3">
            Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Terms of <span className="text-[#2DD4BF] italic">Service.</span>
          </h1>
          <p className="text-xs text-[#888888] uppercase tracking-wider mb-6">
            Last updated: July 2026 · Effective date: July 2026
          </p>
          <p className="text-lg text-[#B8B8B8] leading-relaxed">
            These Terms of Service ("Terms") govern your access to and use of the{" "}
            <span className="font-bold text-white">tyes</span> platform, website, and services (collectively, the "Service"), operated by{" "}
            <strong className="text-white">tyes LLC</strong>, a Wyoming limited liability company.
          </p>
        </div>

        <hr className="border-[#2A2A2A]" />

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">1. Acceptance of Terms.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            By creating an account, accessing, or using the Service, you agree to be bound by these Terms and our{" "}
            <Link href="/privacy" className="text-[#2DD4BF] hover:underline">Privacy Policy</Link>. If you do not agree, do not use the Service.
            You must be at least 18 years old and have the legal authority to enter into these Terms.
            If you are using the Service on behalf of a company, you represent that you are authorized to bind that company.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">2. The Service.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            <span className="font-bold text-white">tyes</span> provides two connected services:
          </p>
          <ul className="list-disc list-inside text-sm text-[#C8C8C8] space-y-2 pl-2">
            <li><strong className="text-white">Campaign Imagery</strong> — AI-generated product and lifestyle imagery, retouched and delivered as usable creative assets.</li>
            <li><strong className="text-white">Brand Strategy &amp; Retail Access</strong> — strategic analysis, positioning consultation, and, where applicable, introductions to our network of retail buyers in the United States and Europe.</li>
          </ul>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            Specific deliverables, timelines, and inclusions depend on the plan you select. We may modify, suspend, or discontinue any part of the Service at any time with reasonable notice.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">3. Accounts &amp; Registration.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            You must provide accurate, complete information when creating an account and keep it current.
            You are responsible for all activity that occurs under your account and for maintaining the confidentiality
            of your credentials. Notify us immediately at <a href="mailto:hello@tyes.com" className="text-[#2DD4BF] hover:underline">hello@tyes.com</a> if you suspect unauthorized access.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">4. Fees &amp; Payment.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            Access to paid features requires payment of the fees shown at checkout. Fees are billed in advance and are non-refundable except as required by law or expressly stated in these Terms. We may change pricing on a going-forward basis; changes will not affect fees you have already paid for a current billing period. Taxes are your responsibility except where we are required by law to collect them.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">5. Your Content &amp; License to Us.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            You retain ownership of all logos, brand assets, product references, and other materials you upload ("Your Content"). By uploading Your Content, you grant <span className="font-bold text-white">tyes</span> a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and process Your Content solely to provide the Service to you (including using it as input to AI models and graphic design polish workflows).
          </p>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            You represent that you own or have all necessary rights to Your Content and that our use of it will not infringe any third-party rights.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">6. Use of Generated Deliverables.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            Subject to your full payment of applicable fees, images and strategic outputs are delivered for your marketing and commercial use. Because the imagery is AI-generated using third-party tools, usage rights follow those tools' terms — tyes does not grant a separate license and cannot transfer ownership of the underlying model outputs.
          </p>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            You acknowledge that AI-generated imagery may not qualify for copyright protection in all jurisdictions, and that you are responsible for confirming your intended use complies with the terms of the underlying AI tools and with third-party rights (trademarks, likenesses, etc.). See our <Link href="/ai-disclaimer" className="text-[#2DD4BF] hover:underline">AI Disclaimer</Link> for details.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">7. Acceptable Use.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">You agree not to use the Service to:</p>
          <ul className="list-disc list-inside text-sm text-[#C8C8C8] space-y-2 pl-2">
            <li>Create imagery that infringes third-party trademarks, copyrights, publicity rights, or privacy rights.</li>
            <li>Generate content depicting real people without their consent, or minors in any context.</li>
            <li>Produce misleading, defamatory, deceptive, or unlawful content.</li>
            <li>Reverse-engineer, scrape, or attempt to extract our underlying models or data.</li>
            <li>Resell or sublicense the Service without our written consent.</li>
            <li>Interfere with the Service's security, availability, or integrity.</li>
          </ul>
        </section>

        {/* Section 8 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">8. Retail Introductions.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            Where we make introductions to retail buyers, we do not guarantee any specific outcome, including purchase orders, meetings, or listings. Retail decisions are made independently by third-party buyers based on their own criteria. We are not a broker, agent, or fiduciary for either party.
          </p>
        </section>

        {/* Section 9 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">9. Third-Party Services.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            The Service may rely on or integrate with third-party services (payment processors, AI providers, hosting). Their terms apply to your use of those services. We are not responsible for third-party outages or actions.
          </p>
        </section>

        {/* Section 10 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">10. Intellectual Property.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            The Service, including all software, models, workflows, and branding, is owned by <span className="font-bold text-white">tyes</span> LLC and protected by intellectual property laws. Except for the licenses expressly granted in these Terms, we retain all rights.
          </p>
        </section>

        {/* Section 11 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">11. Confidentiality.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            Non-public information one party discloses to the other in connection with the Service ("Confidential Information") must be kept confidential and used only to perform under these Terms. Obligations do not apply to information that is or becomes public through no fault of the receiving party, is independently developed, or is required to be disclosed by law.
          </p>
        </section>

        {/* Section 12 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">12. Warranties &amp; Disclaimers.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            The Service is provided <strong className="text-white">"as is" and "as available."</strong> To the maximum extent permitted by law, <span className="font-bold text-white">tyes</span> disclaims all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.
          </p>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            We do not warrant that the Service will be uninterrupted, error-free, or that AI outputs will meet your expectations without human review and revision.
          </p>
        </section>

        {/* Section 13 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">13. Limitation of Liability.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            To the maximum extent permitted by law, <span className="font-bold text-white">tyes</span> LLC and its officers, employees, and affiliates will not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits, revenue, data, or goodwill, arising from your use of the Service.
          </p>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            Our total aggregate liability under these Terms will not exceed the greater of (a) the fees you paid to us in the twelve (12) months preceding the claim or (b) USD 100.
          </p>
        </section>

        {/* Section 14 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">14. Indemnification.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            You agree to defend, indemnify, and hold harmless <span className="font-bold text-white">tyes</span> LLC from any claim, loss, or expense (including reasonable attorneys' fees) arising from Your Content, your breach of these Terms, or your violation of applicable law or third-party rights.
          </p>
        </section>

        {/* Section 15 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">15. Termination.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            You may cancel your account at any time from your account settings. We may suspend or terminate your access if you breach these Terms, fail to pay fees, or use the Service in a way that creates legal or reputational risk. Sections that by their nature should survive termination (ownership, confidentiality, liability, indemnity, dispute resolution) will survive.
          </p>
        </section>

        {/* Section 16 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">16. Governing Law &amp; Dispute Resolution.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            These Terms are governed by the laws of the State of Wyoming, USA, without regard to conflict-of-laws principles. Any dispute arising from these Terms will be resolved exclusively in the state or federal courts located in Wyoming, and you consent to the personal jurisdiction of those courts. You waive any right to a jury trial.
          </p>
        </section>

        {/* Section 17 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">17. Changes to These Terms.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            We may update these Terms from time to time. Material changes will be communicated by email or through the Service at least 14 days before taking effect. Continued use after the effective date constitutes acceptance.
          </p>
        </section>

        {/* Section 18 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">18. Contact.</h2>
          <div className="bg-[#141414] border-l-4 border-[#2DD4BF] p-4 rounded-r-lg space-y-1 text-sm">
            <p className="font-bold text-white">tyes LLC</p>
            <p className="text-[#C8C8C8]">30 N Gould Street, Sheridan, WY 82801, USA</p>
            <p className="text-[#C8C8C8]">Email: <a href="mailto:hello@tyes.com" className="text-[#2DD4BF] hover:underline">hello@tyes.com</a></p>
          </div>
        </section>

        {/* Footer */}
        <div className="pt-8 border-t border-[#2A2A2A] text-xs text-[#777777] flex flex-wrap gap-2 justify-between items-center">
          <div>
            <strong className="text-white">tyes LLC</strong> · 30 N Gould Street, Sheridan, WY 82801, USA
          </div>
          <div>
            <a href="mailto:hello@tyes.com" className="text-[#2DD4BF] hover:underline">hello@tyes.com</a>
          </div>
        </div>

      </div>
    </div>
  );
}
