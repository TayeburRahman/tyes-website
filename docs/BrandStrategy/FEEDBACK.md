TYES — QA FINDINGS · Client & Admin Dashboards vs. Spec v2 (tested July 25, 2026)
CLIETN DASHBOARD
CRITICAL — strategy pipeline broken end-to-end
    1. Paid standalone Brand Strategy order does not create a Strategy Request. Order ORD-E277 (Raluca Manea, $25, PAID in admin Orders and "Paid: $25" in client My Orders) never appears in admin → Strategy Requests. Without the request record there is nothing to deliver, and the client's Brand Strategy hub stays on the empty state. The auto-INSERT (assignee auto-set to Raluca) on paid strategy orders is missing/broken.
    2. "Send to client" always fails ("Failed to send PDF") — even after uploading a file. The uploaded file goes to Cloudinary but never shows as attached in the request detail, and the send endpoint errors. Delivery is impossible right now.
    3. "Includes Brand Strategy Positioning by Default" is OFF on Campaign 5 (Edit Plan modal) — per spec, Campaign 5/10/Custom must have strategy included ON. Likely why campaign orders don't generate strategy requests either.
NEW ORDER FLOW (client)
    4. Remove the "Deep Dive Brand Strategy $0" tier from the plan grid — Deep Dive is the paid, per-scope upsell in the Brand Strategy hub (banner with Contact Us + Book a Call, shown only after first snapshot), not a checkout tier. It's also polluting Strategy Requests and the Pricing page ("Free · Active").
    5. Add the missing "Custom (Get in Touch)" tier — 5th plan, custom volume, Strategy + 30-min call, inline Calendly widget at the bottom of Brand Info.
    6. Remove the "Include Brand Info (Free) — uncheck to skip" checkbox on Campaign 5/10 — Brand Info is mandatory for these tiers (it feeds the free snapshot). Right now unchecking it lets the user complete checkout without brand data. The only opt-in toggle belongs on Free Image ("+ Add Brand Strategy $25").
    7. Category chips include "Other" — spec: exactly 4 (Beauty · Personal Care · Fragrance · Fashion), no Other.
    8. Free Image card says "From 24H" — spec: "From 3H".
    9. Review & Submit shows "Revisions: 3 included" for Campaign 5 — plan config says 1/image (Edit Plan modal is correct, the summary ignores it). Same wrong "3": client My Orders shows "Rev 0/3", even on the Brand Strategy order (0 images — revisions shouldn't display there at all).
ADMIN DASHBOARS
    10. Strategy page title literally reads "Section 3 · Strategy Requests · List + Detail" — spec document artifact copied into the UI. Should be "Strategy Requests".
    11. Remove the "Assign" button — spec: auto-assign to Raluca on creation, no manual assign step; column shows "Raluca (auto)".
    12. Dashboard is missing the 5th KPI: "Strategy Requests" with pending count, clickable to the filtered list.
    13. Sidebar item should be "Strategy Requests" placed between Orders and Clients (currently "Strategy", between Analytics and Pricing).
    14. Strategy KPIs look hardcoded: "Free → Paid 21%" is the spec mockup's sample value; Strategy Revenue shows $0 despite rows marked Paid. Wire them to real data.
    15. Source column shows raw enums ("free image_addon_25", "campaign 5_addon_25", "deep dive brand strategy_addon_25") — use friendly labels.
    16. "Upload PDF" accepts non-PDF files (a JPG uploaded fine) — restrict to application/pdf; and after upload, show the attached file (name + link) in the request detail.
    17. Pricing page: no "Strategy Pricing Config" box ($25 shared by Free Image add-on + standalone tier, with ON/OFF toggle); "Brand Strategy $25" card sub-line says "Custom pricing" (wrong); "Revenue by Plan (March)" chart uses the old plans (Single/Starter/Growth/Social/Enterprise) — hardcoded demo data.
    18. Orders modal Quick Status includes "Quote Sent" — legacy status, confirm it's still needed in the new model.
    19. Campaign 5 order (5 images) shows only 1 order item in the delivery section — items seem tied to the client's uploaded product photos, not the 5 deliverable images. Where do the other 4 get delivered?
REVISIONS FLOW — SPEC
Rules
    • Revision allowance comes from the plan config: max_revisions_per_image (already in Edit Plan modal). Campaign 5/10 = 1 per image, Free Image = 0, Custom = per scope. The counter is per image, not per order. All displays use this value (fixes the hardcoded "3": checkout summary "Revisions: X included" and My Orders "Rev used/X").
    • Revisions can be requested only on delivered items, within 7 days of delivery, and only while the order is not Approved/Completed. Strategy-only orders (0 images): revisions UI hidden entirely.
Client side (My Orders → order detail)
    • Each delivered image shows a "Request revision" button + counter ("Revision 0/1 used").
    • Clicking opens a modal: "What should we change?" (textarea, required, min 20 chars) + optional reference image upload.
    • On submit: item status → "Revision requested", counter increments, button disables when the limit is reached; order status → Revision; in-app + email notification to admin.
    • Free Image: button not shown (0 revisions). After the limit: button replaced by "Revision limit reached — contact us" link.
Admin side (Orders → order detail → ORDER ITEMS)
    • Item in "Revision requested" state shows the client's note + reference image.
    • Admin uploads the revised image to the same item (kept as v2 alongside v1, both downloadable) and clicks Deliver → item returns to "Delivered", order status recalculates (back to In Progress/Completed when no open revisions remain); client gets in-app + email "Your revised image is ready".
    • The existing "Revision" tab in Orders lists all orders with ≥1 open revision request.
Data
    • order_items.revisions_used (int, default 0)
    • revision_requests: id, order_item_id, note, reference_url, status (open/resolved), created_at, resolved_at
    • Validation server-side: reject requests beyond max_revisions_per_image or outside the 7-day window.

