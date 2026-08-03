import React from "react";
import Link from "next/link";

export const metadata = {
  title: "tyes | Cookie Policy",
  description: "Cookie Policy for tyes platform, website, and services.",
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#EDEDED] font-sans px-4 py-12 md:py-20">
      <div className="max-w-[780px] mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <div className="text-[#2DD4BF] text-xs font-semibold uppercase tracking-[0.3em] mb-3">
            Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Cookie <span className="text-[#2DD4BF] italic">Policy.</span>
          </h1>
          <p className="text-xs text-[#888888] uppercase tracking-wider mb-6">
            Last updated: July 2026
          </p>
          <p className="text-lg text-[#B8B8B8] leading-relaxed">
            This Cookie Policy explains how <strong className="text-white">tyes LLC</strong> ("<span className="font-bold text-white">tyes</span>") uses cookies and similar
            tracking technologies on our website and platform. This policy is part of our{" "}
            <Link href="/privacy" className="text-[#2DD4BF] hover:underline">Privacy Policy</Link>.
          </p>
        </div>

        <hr className="border-[#2A2A2A]" />

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">1. What Are Cookies?</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            Cookies are small text files stored on your device when you visit a website. They help websites remember your
            preferences, keep you signed in, and understand how you use the service. Similar technologies include local
            storage, pixels, and web beacons.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">2. Types of Cookies We Use.</h2>
          
          <div className="space-y-3">
            <div>
              <h3 className="text-base font-bold text-white">Strictly Necessary</h3>
              <p className="text-sm text-[#C8C8C8] leading-relaxed">
                Required for the Service to function. These include authentication, security, session management, and load balancing. You cannot opt out of these without breaking core functionality.
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Functional</h3>
              <p className="text-sm text-[#C8C8C8] leading-relaxed">
                Remember your preferences (language, theme, saved settings). These improve your experience but are not strictly required.
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Analytics &amp; Performance</h3>
              <p className="text-sm text-[#C8C8C8] leading-relaxed">
                Help us understand which features are used, where users encounter issues, and how to improve the Service. We may use tools like Google Analytics, PostHog, or similar. Data is aggregated where possible.
              </p>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Marketing &amp; Advertising</h3>
              <p className="text-sm text-[#C8C8C8] leading-relaxed">
                Track your interactions with our marketing content, measure campaign effectiveness, and (where permitted) show relevant ads on other platforms. We may use pixels from Meta, Google Ads, LinkedIn, or similar.
              </p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">3. Third-Party Cookies.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            Some cookies are set by third parties we work with, including payment processors (Stripe), analytics providers, authentication providers (Google, Apple), embedded content platforms (YouTube, Vimeo), and marketing platforms. Their use of cookies is governed by their own privacy policies.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">4. Managing Cookies.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            When you first visit our website, you will see a cookie banner allowing you to accept or decline non-essential cookies. You can change your preferences at any time via the "Cookie Preferences" link in our footer or by adjusting your browser settings.
          </p>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">Most browsers allow you to:</p>
          <ul className="list-disc list-inside text-sm text-[#C8C8C8] space-y-1 pl-2">
            <li>Block all cookies</li>
            <li>Block third-party cookies only</li>
            <li>Delete cookies when you close the browser</li>
            <li>Get notified before a cookie is set</li>
          </ul>
          <p className="text-sm text-[#C8C8C8] leading-relaxed mt-2">
            Blocking strictly necessary cookies may prevent parts of the Service from working correctly.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">5. Do Not Track.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            Our website currently does not respond to "Do Not Track" browser signals, as there is no consistent industry standard. We honor cookie preferences set via our cookie banner.
          </p>
        </section>

        {/* Section 6 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">6. Changes to This Policy.</h2>
          <p className="text-sm text-[#C8C8C8] leading-relaxed">
            We may update this Cookie Policy to reflect changes in our practices or in the technology we use. The "Last updated" date shows when this policy was last revised.
          </p>
        </section>

        {/* Section 7 */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold text-white">7. Contact.</h2>
          <div className="bg-[#141414] border-l-4 border-[#2DD4BF] p-4 rounded-r-lg space-y-1 text-sm">
            <p className="font-bold text-white">tyes LLC</p>
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
