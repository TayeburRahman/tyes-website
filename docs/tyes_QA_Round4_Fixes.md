# tyes.app — QA Round 4: Remaining Fixes & Implementation Guide

**Date:** 31 July 2026 · **Tested on:** www.tyes.app (Client + Admin Dashboards)

---

## 📌 Summary of Reported Issues

### P1 — Functional Bugs
1. **Brand Strategy order stays "Pending / 0%" after snapshot delivery**
   - **Where:** Client My Orders + Admin Orders (e.g. `ORD-70DF`).
   - **What Happens:** Strategy snapshots are sent to the client, but the parent Brand Strategy order remains in `Pending` status with `0%` progress and stays stuck as "Active Order" on client Overview.
   - **Expected:** When admin sends snapshot to client ("Send to client"), the linked parent Brand Strategy order automatically updates status to `completed`/`delivered` with `100%` progress.

2. **Clients tab + Analytics do not aggregate orders per client**
   - **Where:** Admin > Clients and Admin > Analytics.
   - **What Happens:** Every client shows `Orders = 0` and `Total Spent = $0` (e.g., `tayebrayhan101@gmail.com` had 6 paid orders / $165 total).
   - **Expected:** Match orders to client profiles dynamically using both `user_id` AND `customer_email` to accurately display total orders and revenue per client.

### P2 — Smaller Issues
3. **Strategy notification opens Orders instead of Brand Strategy Hub**
   - **What Happens:** Clicking "Strategy Snapshot ready" notification in client dashboard navigates to My Orders.
   - **Expected:** Navigate to the Brand Strategy Hub (`?tab=brand-strategy`) where the delivered PDF actually lives.

4. **Admin order modal: "Open Strategy Hub" button does nothing**
   - **What Happens:** In admin order modal for a Brand Strategy order, clicking "Open Strategy Hub" closes the modal and remains on Orders.
   - **Expected:** Switch active tab to `brand-strategy` (Strategy Requests) and highlight/expand the corresponding request.

5. **Coverage shows raw user input ("romania", "ro")**
   - **What Happens:** Retail Network card and admin strategy view render country strings exactly as typed by users.
   - **Expected:** Normalize country display by expanding ISO codes (e.g., `ro` → `Romania`, `us` → `United States`) and title-casing names.

6. **Client count mismatch: Dashboard 19 vs Clients tab 17**
   - **What Happens:** Admin Dashboard shows "Total Clients: 19", while Clients tab shows "17".
   - **Expected:** Use a single consistent source of truth and filtering logic across both dashboard components.

7. **"Images Delivered" counter only counts fully delivered orders**
   - **What Happens:** Client Overview displays "0 Images Delivered" when 4 of 5 images in `ORD-0861` are already delivered.
   - **Expected:** Calculate total delivered images per individual item (`finishImage` / `v2Image`) rather than per completed order.

---

## 🔒 Safety Rules & Invariant Constraints (DO NOT CHANGE)

1. **Preserve Confirmed Working Features**:
   - Maintain working payment pipelines, Stripe webhook handlers, and PDF download proxy routes.
   - Preserve existing snapshot creation, order placement, and email delivery workflows.
   - Do NOT break existing URL query parameter synchronization (`?tab=...`).

2. **Verification Protocol**:
   - Perform regression checks before and after applying code changes.
   - Always run `npm run build` to verify clean compilation with zero TypeScript or bundler errors.

---

## 🚀 Prompt Phase 1: Brand Strategy Order Completion & Client Aggregation Fixes
**Scope:** Fixes #1, #2, #6

### Task Instructions:
1. **Automatic Order Completion on Strategy Delivery (#1)**:
   - In `src/app/api/admin/strategy-requests/[id]/send/route.ts`:
     - When a snapshot status updates to `sent`, check if `request.order_id` is present.
     - Update the linked parent order in the `orders` table setting `status: 'completed'` (or `'delivered'`) and `progress: 100`.
     - Ensure client Overview `activeOrder` calculation ignores completed strategy orders so it no longer stays stuck on Overview.

2. **Dynamic Client Orders & Revenue Aggregation (#2)**:
   - In `src/app/dashboard/admin/page.jsx` (Clients tab and Analytics view):
     - Remove reliance on un-updated static `profiles` columns (`total_spent`, `orders_count`).
     - Calculate each client's total orders and total revenue dynamically by filtering `orders` where `o.user_id === profile.id || o.customer_email?.toLowerCase() === profile.email?.toLowerCase()`.
     - Ensure "Top Clients by Revenue" in Analytics and "Total Revenue" card in Clients tab use this dynamic aggregation.

3. **Standardize Total Clients Count (#6)**:
   - Synchronize client list filtering between Admin Dashboard overview cards and the Clients tab.
   - Use the same user dataset filtering (e.g. excluding admin/team members or counting valid client profiles) so both counters match consistently.

---

## 🚀 Prompt Phase 2: Navigation & Modal Link Actions
**Scope:** Fixes #3, #4

### Task Instructions:
1. **Strategy Notification Target Tab (#3)**:
   - In `src/app/dashboard/client/page.jsx`:
     - Update notification click handler for strategy snapshot notifications (`notif-strat-*`).
     - Set active tab to `brand-strategy` (`?tab=brand-strategy`) instead of `orders`.
     - Preserve `orders` tab navigation for image delivery notifications (`notif-del-*` / `notif-part-*`).

2. **Admin Order Modal "Open Strategy Hub" Navigation (#4)**:
   - In `src/app/dashboard/admin/page.jsx`:
     - Update the click handler for "Open Strategy Hub" in the order details modal.
     - Close the modal and set active tab to `brand-strategy`.
     - Set search or filter state so the corresponding Strategy Request is selected/expanded.

---

## 🚀 Prompt Phase 3: Data Display Normalization & Image Delivery Counter
**Scope:** Fixes #5, #7

### Task Instructions:
1. **Country Name & ISO Code Normalization (#5)**:
   - Create a utility function `formatCountryName(countryStr)` in helper utilities:
     - Map common 2-letter and 3-letter ISO codes to full country names (`ro` → `Romania`, `us` → `United States`, `uk`/`gb` → `United Kingdom`, `ca` → `Canada`, `de` → `Germany`, `fr` → `France`, etc.).
     - Capitalize individual words for non-ISO inputs (e.g. `romania` → `Romania`).
   - Use `formatCountryName` in `BrandStrategyHub.jsx` (Retail Network card) and Admin Strategy view for displaying selling/expansion coverage countries.

2. **Individual Delivered Images Counter (#7)**:
   - In `src/app/dashboard/client/page.jsx`:
     - Update "Images Delivered" stat calculation in Client Overview.
     - Sum the total number of delivered image items (`item.finishImage || item.v2Image`) across all client orders, including partial deliveries and orders in revision.

---

## ✅ Final Verification Checklist

- [ ] **Test Strategy Order Completion (#1)**: Upload PDF and click "Send to client" on a strategy request. Verify parent order status changes to Completed / 100% and active order widget clears.
- [ ] **Test Client Revenue & Orders (#2, #6)**: Check Admin > Clients and Analytics. Verify client order counts and total spent match actual orders, and client count is consistent across cards.
- [ ] **Test Notification Navigation (#3)**: Click a "Strategy Snapshot ready" notification in client dashboard. Verify it navigates to Brand Strategy Hub.
- [ ] **Test Admin Order Modal Link (#4)**: Open a Strategy order modal in admin dashboard and click "Open Strategy Hub". Verify it switches to Strategy Requests tab.
- [ ] **Test Country Normalization (#5)**: Check Retail Network card with inputs like `ro`, `romania`. Confirm it displays as `Romania`.
- [ ] **Test Images Delivered Counter (#7)**: Verify Client Overview "Images Delivered" counter counts partial delivered images correctly.
- [ ] **Run Build Check**: Run `npm run build` to confirm zero TypeScript or bundler errors.
