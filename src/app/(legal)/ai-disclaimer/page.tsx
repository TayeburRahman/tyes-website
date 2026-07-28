import React from "react";
import Link from "next/link";

export const metadata = {
  title: "tyes | AI Disclaimer",
  description: "AI Disclaimer for tyes platform, website, and services.",
};

export default function AIDisclaimerPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#EDEDED] font-sans px-4 py-12 md:py-20">
      <div className="max-w-[780px] mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <div className="text-[#2DD4BF] text-xs font-semibold uppercase tracking-[0.3em] mb-3">
            Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            AI <span className="text-[#2DD4BF] italic">Disclaimer.</span>
          </h1>
          <p className="text-xs text-[#888888] uppercase tracking-wider mb-6">
            Last updated: July 2026
          </p>
          <p className="text-lg text-[#B8B8B8] leading-relaxed">
            <strong className="text-white font-bold">tyes</strong> combines generative AI with graphic design polish and strategic expertise to deliver
            campaign imagery and brand strategy at speed. This page explains what that means in practice, and what it
            does not mean.
          </p>
        </div>

        <hr className="border-[#2A2A2A]" />

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">1. What "AI-Generated" Means at tyes.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            Our imagery pipeline uses machine-learning models to produce initial visual outputs based on your brief,
            brand assets, and prompts. Every deliverable is then reviewed and refined by our graphic designers before delivery.
            "AI-generated" describes the origin of the raw output; the delivered work is a hybrid of AI and human production.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">2. Accuracy &amp; Fidelity.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            AI models produce plausible visuals, not photographs of real events. We take extensive steps to preserve
            brand accuracy — colors, logos, product forms, and text — but AI outputs can still contain subtle errors,
            inaccuracies, or artifacts. You are responsible for reviewing every delivered asset before publication.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">3. Copyright &amp; Ownership of AI Outputs.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            Copyright treatment of AI-generated imagery varies by jurisdiction and continues to evolve.
          </p>
          <ul className="list-disc list-inside text-sm text-[#C8C8C8] space-y-2 pl-2">
            <li>In the <strong className="text-white">United States</strong>, the U.S. Copyright Office has stated that purely AI-generated works without meaningful human authorship are generally not eligible for copyright registration.</li>
            <li>In the <strong className="text-white">European Union</strong> and other jurisdictions, similar questions are still being resolved.</li>
            <li>The graphic design polish and creative direction we apply may qualify parts of the final work for protection, but we make no guarantees about the copyrightability of any specific deliverable.</li>
          </ul>
          <p className="text-sm text-[#C8C8C8] leading-relaxed mt-2">
            Images are delivered for your marketing and commercial use. Because they are AI-generated
            using third-party tools, usage rights follow those tools' terms — we do not grant a separate license.
            See our <Link href="/terms" className="text-[#2DD4BF] hover:underline">Terms of Service</Link> for details. You may not, in every jurisdiction, be able to register the delivered work under copyright.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">4. Third-Party Rights.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            You are responsible for making sure the briefs and reference materials you send us do not infringe third-party
            rights. We will not knowingly generate imagery that infringes trademarks, includes recognizable real people
            without consent, or copies protected creative work.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">5. Bias, Fairness &amp; Representation.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            Generative models are trained on large datasets that reflect the biases present in those datasets. We work
            to mitigate this through prompt engineering, model selection, and human review, but AI outputs may still
            underrepresent or misrepresent certain groups. Please flag any output that raises fairness or representation
            concerns and we will address it.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">6. Transparency &amp; Disclosure.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            Some jurisdictions require public disclosure that content is AI-generated (for example, upcoming EU AI Act
            provisions). You are responsible for complying with any disclosure obligations that apply to how you publish
            or distribute our deliverables. We can support you with metadata, watermarks, or content credentials on request.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">7. No Guarantees.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            While we invest heavily in quality control, we do not warrant that AI outputs will be free of errors, meet
            specific creative expectations without revision, or be usable in every context without further review.
            Our <Link href="/terms" className="text-[#2DD4BF] hover:underline">Terms of Service</Link> contain the full warranty disclaimer.
          </p>
        </section>

        {/* Section 8 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">8. Human in the Loop.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            Every image delivered under a paid plan passes through graphic design polish. Every strategy output is reviewed
            by a strategist before delivery. AI accelerates our work; it does not replace judgment.
          </p>
        </section>

        {/* Section 9 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">9. Contact.</h2>
          <div className="bg-[#141414] border-l-4 border-[#2DD4BF] p-4 rounded-r-lg space-y-1 text-sm">
            <p className="text-[#C8C8C8]">Questions about how we use AI, model providers, or specific deliverables:</p>
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
