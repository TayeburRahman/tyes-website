# tyes.app — Brand Strategy Integration

**Flow overview of the three specification documents: Home Page, Client Dashboard, and Admin Dashboard**

## What This Document Is

A plain-language guide to the three design/spec PDFs prepared for the Brand Strategy feature. It explains what each document covers, how the flows work, and how the three fit together into one end-to-end journey.

**Core idea:** tyes.app is repositioned from "just an AI image generator" to a platform offering studio-grade visuals plus a free brand strategy snapshot. The free snapshot diagnoses a brand's gaps (LLM visibility, missing viral SKUs, weak distribution) and creates the upsell path to a paid Deep Dive and a 1-hour strategy call.

---

## The Big Picture — One Journey Across Three Documents

1. **Homepage (Document 1):** a visitor sees the new dual offer (free image + free strategy) and clicks any CTA.
2. **Signup:** a forced account-creation modal appears. After signup the user is routed by intent — image CTAs land on New Order, strategy CTAs land on the Brand Strategy tab.
3. **Client Dashboard (Document 2):** the user places an order and/or fills in the Brand Info form that feeds the strategy snapshot.
4. **Admin Dashboard (Document 3):** every submission appears as a Strategy Request. The team assigns a strategist, prepares the snapshot PDF, and sends it to the brand.
5. **Upsell:** after delivery, the client is nudged toward the paid Deep Dive / 1-hour strategy call. Conversion is tracked in admin analytics.

---

## Document 1 — Home Page (`HOME PAGE.pdf`)

A full homepage rewrite so that every section signals "images + strategy." Each section has before/after mockups and final copy in the PDF.

### Key Changes, Section by Section

| Section | Change |
|---|---|
| Hero | New headline "Get Seen. Go Viral. Be In Shops." with two equal CTAs — "Get Your Free Image" and "Get Your Free Strategy" |
| $0/Image block | Becomes a two-line dual offer — "$0 / Image. $0 / Strategy." |
| Share Your Brief | Sub-copy becomes "You share it · We build it · We strategize it," now with 3 CTAs |
| Categories | Simplified to the 4 categories actively served — Beauty, Personal Care, Fashion, Fragrances |
| How It Works | A highlighted 5th step "+ Free Brand Strategy" and a 4th badge ("Free Strategy") |
| Pricing | Plans renamed to Free Image / Campaign 5 / Campaign 10 / Custom, each paid tier showing "+ Brand strategy snapshot" (Custom also gets a strategy call). Commercial license mentions removed for now |
| FAQ | Reordered — strategy questions move near the top; FAQ #1 rewritten around the dual offer |
| New Brand Strategy section | Inserted between Pricing and FAQ, explaining the three snapshot deliverables (LLM Visibility Audit, SKU Gap Analysis, Retail Shortlist) |

### Critical Behavior — Forced Signup on Every CTA

Any free-offer CTA opens an account-creation modal if the visitor is not signed in. The modal remembers which CTA was clicked and, after signup, redirects to the matching dashboard destination (image → New Order, strategy → Brand Strategy tab).

- Signed-in users skip the modal.
- The modal is dismissible, and becomes a full-screen bottom sheet on mobile.
- **Purpose:** every CTA click becomes a captured account, even if the user doesn't finish the flow.

---

## Document 2 — Client Dashboard (`CLIENT DASHBOARD.pdf`)

What the user sees after signup, and how brand information is collected for the strategy snapshot.

### Overview Page Changes

- New sidebar item **"Brand Strategy"** between New Order and Invoices (highlighted for the first 30 days).
- 4th KPI card swapped: "Your Tier" → "Strategy Snapshots" (count delivered).
- Active Order card notes "Strategy snapshot will be delivered with this order" for Campaign 5/10/Custom orders.
- New Brand Strategy status card below the Active Order (being prepared / delivered / available to request) with a view/upgrade CTA.

### New Order Flow — Brand Info Inside Upload Brief

The existing 3-step flow (Choose Plan → Upload Brief → Review & Submit) is kept, and the current Upload Brief fields stay untouched. A new collapsible "Brand Info" section is appended to the bottom of the Upload Brief form, shown conditionally by plan:

| Plan | Brand Info Behavior |
|---|---|
| Free Image | Hidden by default. A toggle offers "Add a brand strategy snapshot (+$10)"; toggling it ON reveals the section |
| Campaign 5 / 10 | Always visible and required — the snapshot is bundled with the plan |
| Custom | Same as Campaign 5/10, plus an inline Calendly widget to book the strategy call |

### The Brand Info Form Itself

Split into two groups:

- **Essential fields (required):** brand name, website, category, number of SKUs, annual revenue, marketing budget, retail presence (multi-select chips), countries selling in, existing distributors.
- **Bonus fields (all optional, collapsed by default):** brand age, expansion countries, target customer, competitors, social media, USP/story, and 6–12 month goals.

Each field's purpose is explained in the PDF (e.g., revenue calibrates which retailers we recommend). Form data auto-saves so collapsing or reloading doesn't lose progress.

### Brand Strategy Hub Page

Clicking the sidebar item opens a hub with 4 sections:

- **(A)** Status hero (snapshots delivered / in progress)
- **(B)** A standalone request form — same Brand Info form, for requesting strategy without ordering images
- **(C)** An archive of delivered snapshot PDFs with download buttons
- **(D)** A "Book a 1-hour strategy call" upsell banner that appears only after the first snapshot is delivered

A dedicated empty state invites first-time users to start a free snapshot.

---

## Document 3 — Admin Dashboard (`ADMIN.pdf`)

How the team receives, manages, and delivers strategy requests. Existing Orders / Clients / Analytics flows stay intact.

### What's Added

- Sidebar: new **"Strategy Requests"** item between Orders and Clients.
- Dashboard: a 5th KPI card — total strategy requests with a clickable "pending" sub-label that opens the list filtered to pending.
- **Strategy Requests page (new):** a list view matching the Orders page pattern, with status tabs and columns for brand, client, source (order / +$10 add-on / standalone), category, status, tier, assigned strategist, and date. Clicking a row opens a detail view showing all submitted brand data plus admin actions: change status, assign a strategist, add internal notes, upload the snapshot PDF, send to brand, or mark as lost.
- Analytics: a new row of 4 strategy KPIs — total requests, average time to deliver, free-to-paid conversion rate, and revenue from strategy upsells.
- Pricing page: plans renamed to match the new structure, a $10 strategy add-on config, and an edit modal with 3 new toggles per plan (strategy snapshot included, 1H call included, allow strategy add-on). These toggles drive what the client sees in Upload Brief.

### Status Lifecycle of a Strategy Request

| Status | Meaning | Next Admin Action |
|---|---|---|
| New | Just submitted, untouched | Review and assign a strategist |
| In Progress | Strategist working on the snapshot | Upload PDF when done |
| Ready to Send | PDF uploaded | Click "Send to brand" (triggers email, status → Sent) |
| Sent | Delivered, awaiting response | Follow up after 7 days if silent |
| Converted | Brand booked the paid Deep Dive call | Track revenue, log call notes |
| Lost | Brand didn't engage | None — counted in conversion rate |

---

## How the Three Documents Connect — Worked Example

1. A fragrance brand owner lands on the homepage, clicks "Get Your Free Strategy," and signs up via the modal (Document 1).
2. She's redirected to the Brand Strategy tab, or orders a Campaign 5 where the Brand Info form is required inside Upload Brief (Document 2).
3. On submit, her request appears as "New" in the admin Strategy Requests list, showing its source and tier (Document 3).
4. An admin assigns a strategist, the snapshot PDF is uploaded and sent; the client sees it in her snapshots archive and can download it.
5. The upsell banner invites her to book the 1-hour Deep Dive call; if she books, the request is marked Converted and shows up in strategy analytics.

> **Note:** A strategy request can enter from three sources: bundled with a paid order (Campaign 5/10/Custom), as the +$10 add-on on a Free Image order, or standalone via the Brand Strategy tab. All three land in the same admin queue.

---

## Build Footprint at a Glance

- **Homepage:** 8 sections updated plus 1 new section and the auth modal with intent-based routing.
- **Client Dashboard:** 1 new sidebar item, 1 new hub page, 1 KPI swap, conditional Brand Info section in the order flow, 1 new form component, 1 new DB table, 4 new endpoints.
- **Admin Dashboard:** 1 new sidebar item, 1 new route (list + detail), 1 dashboard KPI, 4 analytics KPIs, extended pricing page; 6 new components, 7 new endpoints, 1 new DB table plus 4 new columns on the plans table.

*Full component names, endpoint paths, and DB schemas are in the implementation sections at the end of each PDF — this document is the map; the PDFs are the spec.*

---

## Open Decisions — Answered

| Decision | Answer |
|---|---|
| Campaign 5 / 10 prices | **TBD** — not decided yet. Build with placeholder values; prices are editable by admin on the Pricing page, so they can be set at launch without a code change. |
| Custom plan strategy call | **1 hour (confirmed).** The homepage pricing section says "30-min strategy call" in two places — update that copy to 1 hour so everything matches. |
| Strategy add-on price | **$10**, available only on the Free Image plan, controlled by the admin add-on config toggle. |
| Commercial license | Keep all mentions off the homepage for now (per the homepage PDF). Can be re-added as a footnote once rights are confirmed. |

---

## Technical Reference (Pulled from the PDFs)

### Homepage

- **New components:** `BrandStrategySection`, `AuthModal`, `useAuthModal` hook (Zustand-based global state for the signup modal + intent).
- **Updated components:** `Hero`, `Pricing`, `Categories`, `HowItWorks` (5th step + 4th badge), `BriefUploadCTA` (3 CTAs), `faqItems` data array (reorder + 3 new entries).
- **Wiring:** every free-offer CTA calls `openAuthModal(intent)`; `AuthModal` mounted once globally; after signup redirect by intent (image → `/dashboard/new-order`, strategy → `/dashboard/brand-strategy`).

### Client Dashboard

- **Components:** sidebar item added to sidebar data, `OverviewKpis` (KPI swap), `NewOrderWizard` (keeps 3 steps, computes `includeStrategy` from plan or add-on toggle), `UploadBrief` extended to render `BrandInfoSection`, `BrandInfoForm` (9 essential + 8 bonus fields, Calendly widget for Custom).
- **Endpoints:**
  - `POST /api/brand-strategy-requests` (create, linked to order or standalone)
  - `GET /api/brand-strategy-requests` (list user's)
  - `GET /api/brand-strategy-requests/:id` (detail + PDF URL)
  - `POST /api/orders/:id/add-strategy-addon` ($10 toggle on Free Image orders)
- **DB:** new table `brand_strategy_requests` — `id`, `user_id`, `order_id` (nullable), `brand_data` (JSON of all form fields), `status`, `assigned_to`, `delivered_pdf_url`, timestamps.

### Admin Dashboard

- **Components:** `AdminSidebar` (new item), `StrategyRequestsList` (table + status tabs), `StrategyRequestDetail` (admin actions), `StrategyKpis` (4 analytics cards), `PricingPlanCard` + `EditPlanModal` (3 new strategy toggles).
- **Endpoints:**
  - `GET /api/admin/strategy-requests` (list + status filter)
  - `GET /:id` (detail)
  - `PATCH /:id` (status, assignee, notes)
  - `POST /:id/upload-pdf`
  - `POST /:id/send` (delivery email, status → Sent)
  - `GET /api/admin/strategy-analytics`
  - `PATCH /api/admin/plans/:id` (extended for strategy fields)
- **DB:** same `brand_strategy_requests` table, plus 4 new columns on `plans`: `strategy_included`, `strategy_call_included`, `strategy_addon_allowed`, `strategy_addon_price`.

> ⚠️ **One inconsistency to reconcile:** the two PDFs define different status enums for `brand_strategy_requests`. The client doc uses `new / in_progress / delivered / upgraded_to_deep_dive`; the admin doc uses `new / in_progress / ready / sent / converted / lost`. **Use the admin version** — it's the fuller lifecycle (`sent` replaces `delivered`, `converted` replaces `upgraded_to_deep_dive`). The admin doc also adds `source` and `tier` enum columns; include those.

---

## Questions the Dev Will Likely Ask

**Is the New Order flow 3 steps or 4?**
3. The client PDF shows an early 4-step concept, but the final decision (and the sample code) keeps the existing 3-step flow with Brand Info appended inside Upload Brief. Build the 3-step version.

**What order should I build in?**
Suggested:
1. DB table + client endpoints
2. Brand Info form in the order flow — starts capturing data immediately
3. Admin Strategy Requests page — team can manage what comes in
4. Brand Strategy hub + Overview changes
5. Homepage rewrite last, since it drives traffic into flows that must already work

**What sets a request to Converted?**
Manual admin status change when a brand books the Deep Dive call. No Calendly webhook automation is specified — keep it manual for v1.

**What does "Send to brand" actually do?**
Sends a delivery email with the snapshot PDF and flips status to Sent. An email template/service is needed — not specified in the PDFs, dev's choice.

**Where is the $10 add-on charged?**
At checkout on a Free Image order, via the toggle above the Upload Brief form (`POST /api/orders/:id/add-strategy-addon`).

**Does Free Image still include revisions?**
No — the new spec is 1 image, no revisions, from 3H delivery. Campaign 5/10 get 1 revision per image (down from 3).

**Should form progress survive a reload?**
Yes — the Brand Info form persists to localStorage as the user types, so collapsing sections or reloading doesn't lose data.
