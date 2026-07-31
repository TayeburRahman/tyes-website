tyes — Fixes Needed
Feedback 3 (updated) · based on live retest of client + admin dashboards · 30 July 2026
PRIORITY 1
1. Notifications & delivery emails are not wired to real events. The client notification bell shows hardcoded/demo entries (ORD-3011, ORD-2988, INV-0087 — none of these exist on my account), and no email or in-app notification is sent when images are delivered. Wire both channels to real per-user events:
    • Images delivered — email + in-app notification on every delivery event, including partial deliveries (“2 of 5 images delivered for ORD-0883”), not only when the full order completes. Reuse the working strategy-email pipeline and the #4ECDC4 template.
    • Revision V2 re-delivered — email + notification.
    • Strategy snapshot sent — in-app notification to match the existing email.
    • Invoice generated — notification linking to the Invoices page.
Remove the demo notifications entirely — non-existent orders in the bell read as broken and, in production, as a data leak.
2. Standalone Brand Strategy orders collect no Brand Info. Both standalone strategy orders placed through New Order → Brand Strategy (ORD-EBCA, ORD-2F7B) arrived in admin with Category N/A and Positioning N/A, while the Campaign 5 order correctly carries “furniture / Mass market” from the wizard's Brand Info step. The strategy-plan path skips (or doesn't save) Brand Info — it must collect and pass the same fields; it's the single most important input for a strategy deliverable.
3. Hub mapping reads stale Brand Info. Latest valid Brand Info is “furniture (Other) · Mass market” (ORD-0883), which per the matrix should yield 3 channels (Mass Market Retail, Hyperstores, Marketplaces). The client hub still renders the old Fashion mapping (4 channels incl. Premium Retail), Coverage stays “Not specified” and no “Already present” badges appear. The Retail Network section must read the most recent Brand Info submission — this also covers points 8 and 9 below.
4. “Book a Call” buttons in the Brand Strategy hub open the 30-min link. Hub + “full playbook” placements currently open calendly.com/raluca-tyes/30min?utm_source=strategy_hub — these must use the 60-min Deep Dive event: calendly.com/raluca-tyes/60-minute-tyes-deep-dive-strategy-session. The 30-min link is only for the Custom (Get in Touch) flow. Re-check every Calendly placement against the mapping.
5. “Current Retail Presence” field is mixed up with the recommendation layer. The ✓ / ✗ / ★ marks from the channel-fit matrix are rendered inside the selection chips, so they look pre-selected (while the field is actually empty — hence the “Please fill out this field” error), and channels get crossed out as “not typical” in a question about the brand's CURRENT reality. Remove the recommendation marks and legend from this input — plain selectable chips, as before. The matrix belongs only to the output layer (Retail Network access in the hub + the strategist PDF brief).
6. Admin order modal shows image deliverables for Brand Strategy orders. ORD-EBCA (standalone Brand Strategy, 0 images) displays “ORDER ITEMS / Deliverable 1” with image upload slots, as if it were an image order. For strategy-plan orders, hide the image deliverables section and show a direct link to the linked Strategy Request instead (Update PDF / Send to client) — otherwise strategy orders can be “delivered” as images and the client's hub never receives the snapshot.
PRIORITY 2
7. “Already present” badge not applied in the Retail Network mapping. Category rules work, but channels selected under “Current retail presence” still show “OPPORTUNITY” instead of “ALREADY PRESENT”. (Depends on fix #3.)
8. Coverage line shows “Not specified” although Brand Info contains countries in “Countries you sell in” — the coverage line isn't reading the saved data. (Depends on fix #3.)
9. Order ID duplicated in the Active Order widget — it renders “ORD–ORD–0883”; the ID already contains the “ORD-” prefix, don't prepend it again.
10. Client “Total Spent” doesn't match invoice amounts. Tax at checkout is correct (VAT per customer country — $25 + 21% RO VAT = $30.25 invoiced), but the Overview sums net ($125) while invoices show gross. Show the charged (gross) amount in the client UI — that's what the client recognizes from their bank statement — or label the total “excl. VAT”.
11. Raw status string in the client snapshot list. One snapshot shows “Converted_to_deep_dive” as plain text with underscores — render it as a formatted status badge (“Converted to Deep Dive”), consistent with New / Sent.
PRIORITY 3
12. Strategy PDFs are served from a public storage bucket. Delivered PDFs are public Supabase URLs — anyone with the link opens a paid deliverable without login. Switch to signed URLs with expiry, or authenticated download through the app.
13. Invoice list shows raw Stripe IDs (in_1Tyt7a09...) — display a friendly invoice number (INV-0001 style), keep the Stripe ID as secondary metadata.
14. No URL routing — the address never changes. Both dashboards render everything under a single URL (/dashboard/client, /dashboard/admin) with JS-only navigation: refresh loses the current page, browser back/forward doesn't work, and orders/requests/invoices can't be deep-linked. Add proper routes (e.g. /dashboard/client/orders/ORD-0883) — support and email links depend on this.


<!-- =============== -->
CONFIRMED WORKING (30 July retest — no action needed)
Snapshot Submit + payment flow · “Other” category with free text flowing to admin (via Campaign wizard) · Price positioning (form + admin column) · rules-based retail mapping by category (logic itself) · Free Image one-per-account (UI + toast) · Overview↔hub sync · full revision cycle (request → V2 re-delivery → limit reached state) · strategy email colour + “Book a Deep Dive call” CTA · admin stat cards · admin search clearing · per-country VAT at checkout · invoices generating correctly since Stripe was connected · Deep Dive conversion status flow (display formatting aside, see #11).

<!-- ================================================================= -->
<!-- IMPLEMENTATION PROMPTS & EXECUTION PLAN                           -->
<!-- ================================================================= -->

# Implementation Prompts (Step-by-Step Guide)

> **CRITICAL RULE**: Maintain strict backward compatibility. Do NOT alter or break any existing features listed under the `CONFIRMED WORKING` section above. Before and after applying each prompt phase, perform regression testing.

---

## 🔒 Safety Rules & Invariant Constraints (DO NOT CHANGE)
1. **Preserve Confirmed Working Features**:
   - Snapshot Submit + payment flow logic.
   - "Other" category free text flow (Campaign wizard).
   - Price positioning logic and admin column.
   - Category-based retail mapping rule logic.
   - Free Image one-per-account restriction & UI toasts.
   - Overview ↔ Hub state synchronization.
   - Full Revision cycle state machine (request -> V2 re-delivery -> limit reached).
   - Per-country VAT checkout calculation & Stripe invoice generation.
   - Deep Dive conversion workflow logic.
2. **Verification Protocol Before Execution**:
   - Inspect database schemas (`orders`, `brand_strategy_requests`, `notifications`, `invoices`).
   - Run local build checks (`npm run build` or `next lint`) before declaring any phase complete.

---

## 🚀 Prompt Phase 1: Brand Info Capture, Input Form & Admin Order View
**Scope:** Fixes #2, #5, #6, #9

### Task Instructions:
1. **Standalone Brand Strategy Brand Info Capture (#2)**:
   - Audit the standalone strategy order flow (New Order → Brand Strategy).
   - Ensure the `BrandInfoForm` (or identical data structure containing Category, Price Positioning, Countries, Current Presence) is collected and persisted to Supabase when placing standalone Brand Strategy orders (`ORD-EBCA`, `ORD-2F7B`).
2. **Clean Up `Current Retail Presence` Input Chips (#5)**:
   - In `src/components/dashboard/BrandInfoForm.jsx`, remove all recommendation icons (`✓`, `✗`, `★`) and recommendation legend from the selection chips in the "Current Retail Presence" field.
   - Render plain, clean selectable chips for user input. The recommendation matrix icons belong ONLY to the output hub view and PDF brief.
3. **Admin Order Modal Strategy Deliverables (#6)**:
   - In `src/app/dashboard/admin/page.jsx`, check order type in the order details modal.
   - For Brand Strategy plan orders (e.g. standalone strategy), hide the image deliverable upload slots.
   - Render a direct link to the linked Strategy Request (with "Update PDF / Send to Client" actions).
4. **Order ID Duplicate Prefix Fix (#9)**:
   - In the Active Order widget and client overview, check string formatting for Order IDs.
   - If an ID already starts with `ORD-`, do NOT prepend `ORD-` again (prevents `ORD–ORD–0883`).

---

## 🚀 Prompt Phase 2: Hub Strategy Sync, Mapping Badges & Deep Dive Link
**Scope:** Fixes #3, #4, #7, #8, #11

### Task Instructions:
1. **Latest Brand Info Hydration for Hub & Retail Network (#3, #7, #8)**:
   - Update `src/components/dashboard/BrandStrategyHub.jsx` to query the *most recent valid Brand Info submission* for the user account (e.g., from the latest completed order or strategy request like `ORD-0883`).
   - Fix **Coverage Line (#8)**: Populate "Countries you sell in" from the latest Brand Info instead of displaying "Not specified".
   - Fix **"Already Present" Badges (#7)**: Cross-reference user's "Current retail presence" selections with the channel-fit matrix. Mark channels matching current presence as **"ALREADY PRESENT"** badges (override default "OPPORTUNITY" badge).
2. **Calendly 60-Min Link Update (#4)**:
   - Audit all "Book a Call" / "Book a Deep Dive call" / "Full Playbook" CTA buttons in the Brand Strategy Hub and strategy emails.
   - Update URL to `https://calendly.com/raluca-tyes/60-minute-tyes-deep-dive-strategy-session`.
   - Preserve the 30-min link (`calendly.com/raluca-tyes/30min...`) ONLY for the Custom / "Get in Touch" flow.
3. **Format Snapshot Status Badges (#11)**:
   - In client snapshot lists, transform raw status strings like `Converted_to_deep_dive` into human-readable formatted badges (`Converted to Deep Dive`), keeping styling consistent with `New` and `Sent`.

---

## 🚀 Prompt Phase 3: Real Event Notifications, Client Total Spent & Invoice Formatting
**Scope:** Fixes #1, #10, #13

### Task Instructions:
1. **Real-Event Notifications & Email Wiring (#1)**:
   - Completely remove hardcoded demo notifications (`ORD-3011`, `ORD-2988`, `INV-0087`) from the client notification bell.
   - Connect real in-app notifications and email triggers for:
     - **Images Delivered**: Send email + in-app notification on every delivery event (including partials like "2 of 5 images delivered for ORD-0883"), using the `#4ECDC4` template and existing strategy email pipeline.
     - **Revision V2 Re-delivered**: Trigger both email and in-app notification.
     - **Strategy Snapshot Sent**: Trigger in-app notification matching the email.
     - **Invoice Generated**: Trigger in-app notification linking to `/dashboard/client?tab=invoices` (or proper invoice route).
2. **Client Total Spent Calculation (#10)**:
   - In the Client Overview panel, calculate "Total Spent" using the gross amount charged (including VAT from Stripe invoices) so it matches client bank statements, or clearly display gross/tax breakdown.
3. **Invoice List Display Numbers (#13)**:
   - In the Invoice table, format raw Stripe IDs (`in_1Tyt7a09...`) into clean user-facing invoice numbers (e.g. `INV-0001`, `INV-0002`). Store or show Stripe IDs as secondary metadata.

---

## 🚀 Prompt Phase 4: Secured PDF Storage & Dynamic Dashboard Routing
**Scope:** Fixes #12, #14

### Task Instructions:
1. **Supabase PDF Security (#12)**:
   - Replace direct public Supabase URLs for delivered Strategy PDFs with short-lived **Signed URLs** (`supabase.storage.from('strategy-pdfs').createSignedUrl(path, 3600)`) or an authenticated API proxy route (`/api/strategy-pdf/[id]`) to prevent unauthorized public access.
2. **Dashboard URL Routing & Deep Linking (#14)**:
   - Implement proper URL routing or query string URL sync for client and admin dashboards (e.g., `/dashboard/client/orders/[id]` or `/dashboard/client?tab=orders&id=ORD-0883`).
   - Ensure browser refresh maintains active tab/view and back/forward navigation functions correctly.

---

## ✅ Final Verification Checklist
- [ ] Test creating a standalone Brand Strategy order: verify Brand Info form appears and data arrives in Admin.
- [ ] Test Brand Info form chips: confirm no `✓ / ✗ / ★` recommendation icons show during input selection.
- [ ] Test Admin Order modal on strategy order: confirm image upload slots are hidden and PDF link is shown.
- [ ] Verify Client Hub Retail Network displays latest submission data, correct coverage countries, and "ALREADY PRESENT" badges.
- [ ] Check Calendly links: verify 60-min link is used for Deep Dive strategy session CTAs.
- [ ] Notification Bell: verify 0 demo notifications exist and real notifications trigger on image delivery, V2 redelivery, strategy snapshot, and invoices.
- [ ] Check Total Spent: verify amount includes gross / VAT matching invoices.
- [ ] Check Strategy PDF downloads: verify links use secure signed URLs or authenticated proxy.
- [ ] Run `npm run build` to verify no build errors or broken types.