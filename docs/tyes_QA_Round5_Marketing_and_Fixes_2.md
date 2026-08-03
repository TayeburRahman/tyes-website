tyes.app — QA Round 5: Marketing Pages + Remaining Items
Date: 3 August 2026 · Tested on www.tyes.app (dashboards verified fixed; marketing pages NOT matching the approved specs)
A. MARKETING PAGES — main issues this round
1. Pricing page is still the old generic template
Where: https://www.tyes.app/pricing.html
What happens: The page shows placeholder content: "Plans for Every Business", an empty "/month" price block, "No items found", and a generic AI-consulting FAQ ("How can AI benefit my business?"). None of the approved pricing spec is there.
Expected (per approved spec pricing.html): Free Image $0 (+$25 strategy add-on) · Brand Strategy $25 standalone · Campaign 5 $25 (Popular, free Snapshot) · Campaign 10 $45 (free Snapshot) · Custom/Enterprise (Get in Touch + Calendly discovery link) · Deep Dive section (priced per scope, Contact + Book a Call with Calendly deep-dive link) · full FAQ block.
WHAT TO DO: Replace the current /pricing.html entirely with the approved pricing.html file already provided. Do not rewrite the copy — use the file as the source of truth and only adapt it to the site components. Wire the CTAs: signup intents for Free Image / Brand Strategy / Campaign 5 / Campaign 10, contact intents for Custom and Deep Dive, and the two Calendly links (discovery-call 30 min for Custom, deep-dive-call 60 min for Deep Dive).
2. About page is the old version
Where: https://www.tyes.app/about.html
What happens: Live page is the old "AI Tied With A Pulse" story (The Spark / The Problem / The Turning Point), imagery-only positioning.
Expected (per approved spec aboutus.html): "From Brief to Shelf" — Built for brands that move fast; the two engines (Campaign Imagery + Strategy & Retail Access); retail buyer network US + EU; Who we build for (Beauty, Personal Care, Fragrance, Fashion); CTAs to pricing and how-it-works.
WHAT TO DO: Replace /about.html with the approved aboutus.html content, verbatim. The old "AI Tied With A Pulse" story page is retired — the new positioning includes strategy and retail access, not imagery only. Point the two bottom CTAs to /pricing and /how-it-works.
3. How It Works page does not exist
What happens: /howitworks.html and /how-it-works return 404, and the page is not linked anywhere in the navigation.
Expected: The approved howitworks.html spec — Engine 01 (Brief / Generate / Polish & Deliver), Engine 02 (Snapshot / Deep Dive / Introduction & Journey with pricing box), the Retail Network 5 categories, geographic coverage, Who is in the loop.
WHAT TO DO: Create the page at /how-it-works (or /howitworks.html with a redirect) from the approved howitworks.html file, publish it, and add it to the main navigation.
4. Dead navigation links on the landing page
What happens: In the landing navigation, "Pricing" and "About" have href="#" (they lead nowhere). "How it Works" is missing from the nav entirely.
WHAT TO DO: Set the landing nav hrefs: Pricing -> /pricing page, About -> /about.html (new version), and add How It Works -> /how-it-works. Remove or repurpose "Use Cases" if it has no destination. Check the footer links too.
5. Wrong contact email on legal pages
What happens: Terms of Service (live) uses hello@tyes.com in section 3, section 18 and the footer. The approved specs use office@tyes.app everywhere. hello@tyes.com is a different domain and likely not a real mailbox.
WHAT TO DO: Find & replace hello@tyes.com -> office@tyes.app across ALL marketing and legal pages (Terms has it in section 3, section 18 and the footer). Then verify Privacy, Cookie Policy and AI Disclaimer at publish.
6. Legal pages to publish per spec
Approved and final: terms.html, privacy.html, cookiepolicy.html, aidisclaimer.html (all with office@tyes.app). Terms is live (fix email).
WHAT TO DO: Publish privacy.html, cookiepolicy.html and aidisclaimer.html from the approved files; link all four legal pages in the site footer; make sure the internal cross-links resolve (/privacy.html, /terms.html, /cookie-policy.html, /ai-disclaimer.html — keep URLs consistent with the hrefs used inside the documents); add a working "Cookie Preferences" control in the footer as referenced by the Cookie Policy.
B. DASHBOARDS — verified fixed in Round 5 (no action)
    • Clients + Analytics aggregation: orders and revenue per client correct and synchronized (15 orders / $410, totals matching across tabs, client count consistent 18/18).
    • Standalone Brand Strategy orders auto-complete to 100% when the snapshot is delivered (verified on new test orders).
    • "Strategy Snapshot ready" notification now opens the Brand Strategy Hub (verified on client).
    • "Open Strategy Hub →" button in the admin order modal switches to Strategy Requests.
    • Country normalization: "Coverage: Romania" (was "romania"/"ro").
    • "Images Delivered" widget tracks individual deliveries.
C. SMALL LEFTOVERS
    • ORD-70DF (old standalone Brand Strategy order, delivered before the fix) is still Pending / 0% — the auto-complete fix is not retroactive. WHAT TO DO: run a one-time backfill that sets Delivered/100% on strategy orders whose snapshot is already delivered (or update ORD-70DF manually).
    • Strategy Requests: one request from a Campaign 5 Add-on (ORD-E07E) shows Category N/A / Positioning N/A. WHAT TO DO: confirm the Brand Info step cannot be skipped on the campaign flow (required validation), and that N/A can only come from legacy/test data.
    • Strategy Requests header stats sometimes render 0 / $0 on first load before populating. WHAT TO DO: show a loading skeleton instead of zeros (cosmetic, low priority).