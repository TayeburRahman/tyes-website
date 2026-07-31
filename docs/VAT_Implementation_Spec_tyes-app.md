# VAT Logic — Implementation Spec for tyes.app

**For:** development team · **From:** Raluca · **Date:** 2026-07-03

---

## 1. The complete VAT logic

| Customer | VAT | Invoice |
|----------|-----|---------|
| Romania — individual or company | 21% | Romanian, via e-Factura |
| EU company with **valid VIES VAT number** | 0% | English, mention: "Reverse charge — Art. 196 Directive 2006/112/EC" |
| EU individual (or company with invalid/missing VAT number) | **21%** — always, no threshold | English |
| Non-EU (UK, US, etc.) — individual or company | 0% (outside EU VAT scope) | English |

That's the whole table. No country rate list, no mode switch, no sales counter.

```ts
// vat/decide.ts — single source of truth.
// Used by: checkout display, payment amount, SmartBill invoice. Never duplicate.
const EU = new Set(["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU",
  "IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SE","SI","SK","ES"]);

export type VatDecision = {
  rate: number;
  reverseCharge: boolean;
  invoiceNote?: string;
  mode: "DOMESTIC" | "EU_B2C" | "EU_B2B_RC" | "NON_EU";
};

export function decideVat(country: string, viesValid: boolean): VatDecision {
  if (country === "RO")
    return { rate: 21, reverseCharge: false, mode: "DOMESTIC" };

  if (EU.has(country) && viesValid)
    return { rate: 0, reverseCharge: true, mode: "EU_B2B_RC",
             invoiceNote: "Reverse charge — Art. 196 Directive 2006/112/EC" };

  if (EU.has(country))
    return { rate: 21, reverseCharge: false, mode: "EU_B2C" };

  return { rate: 0, reverseCharge: false, mode: "NON_EU" };
}
```

---

## 2. VIES validation (unchanged from v1)

Checkout has an optional "Company VAT number" field. Validate in real time via the official VIES REST API, passing our RO VAT number as requester so the response includes a **consultation ID** — store it on the order as legal proof.

```ts
export type ViesResult =
  | { status: "valid"; consultationId: string; name?: string }
  | { status: "invalid" }
  | { status: "unavailable" };

export async function checkVies(country: string, vatNumber: string): Promise<ViesResult> {
  try {
    const res = await fetch(
      "https://ec.europa.eu/taxation_customs/vies/rest-api/check-vat-number",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode: country,
          vatNumber: vatNumber.replace(/^[A-Z]{2}/, "").replace(/\s/g, ""),
          requesterMemberStateCode: "RO",
          requesterNumber: process.env.COMPANY_VAT_NUMBER,
        }),
        signal: AbortSignal.timeout(8000),
      }
    );
    if (!res.ok) return { status: "unavailable" };
    const data = await res.json();
    return data.valid
      ? { status: "valid", consultationId: data.requestIdentifier, name: data.name }
      : { status: "invalid" };
  } catch {
    return { status: "unavailable" };
  }
}
```

**Fallback when VIES is down:** treat as B2C (charge 21% if EU) and tell the customer: *"We couldn't verify your VAT number right now — VAT has been charged. Contact us for a corrected invoice once verification succeeds."* Optionally queue a re-check.

> Verify the exact REST endpoint/field names against current VIES docs; SOAP `checkVatApprox` is the fallback.

---

## 3. Checkout (React — display only)

All VAT decisions are server-side. React fetches and renders:

```tsx
// GET /api/vat?country=DE&vat=DE123456789 → VatDecision + viesStatus
function useVat(country?: string, vatNumber?: string) {
  return useQuery({
    queryKey: ["vat", country, vatNumber],
    queryFn: () =>
      fetch(`/api/vat?country=${country}&vat=${encodeURIComponent(vatNumber ?? "")}`)
        .then(r => r.json()),
    enabled: !!country,
  });
}
// - optional, debounced "Buying as a business? VAT number" field
// - if reverseCharge: show 0% + the note text
// - price line: net + `VAT ${rate}%` + total
```

---

## 4. Order record — fields to add

```sql
ALTER TABLE orders ADD COLUMN vat_rate    NUMERIC(4,1) NOT NULL;
ALTER TABLE orders ADD COLUMN vat_mode    TEXT NOT NULL;      -- DOMESTIC | EU_B2C | EU_B2B_RC | NON_EU
ALTER TABLE orders ADD COLUMN vat_country CHAR(2) NOT NULL;   -- billing country used
ALTER TABLE orders ADD COLUMN vat_number  TEXT;               -- as entered, if any
ALTER TABLE orders ADD COLUMN vies_status TEXT;               -- valid | invalid | unavailable
ALTER TABLE orders ADD COLUMN vies_consultation_id TEXT;      -- audit proof for 0% invoices
```

---

## 5. SmartBill invoice call

Only two rates are used:

| Case | taxName | taxPercentage |
|------|---------|---------------|
| 21% (RO + EU B2C) | `Normala` | 21 |
| 0% (reverse charge + non-EU) | `Taxare inversa` | 0 |

```ts
const invoice = {
  // ...client, products...
  language: order.vat_country === "RO" ? "RO" : "EN",  // or SmartBill "Automatic"
  // per line: taxName + taxPercentage exactly as configured in the SmartBill account,
  // otherwise PDF generation fails.
  // if reverseCharge: add the invoiceNote to the invoice observations/mentions field.
};
```

> Check exact field names against https://api.smartbill.ro docs.

- Romanian-customer invoices flow to ANAF e-Factura automatically (SmartBill handles it).
- Foreign-customer invoices don't go to e-Factura — exception: a foreign company holding a **Romanian** VAT code (from 2026 these must go through e-Factura; if the VAT number entered starts with "RO" but the company is foreign, route it like a domestic invoice).

---

## 6. Test checklist

- [ ] RO individual → 21%, RO invoice, appears in e-Factura
- [ ] RO company → 21%, RO invoice
- [ ] DE individual → **21%**, EN invoice
- [ ] HU individual → **21%** (not 27%!) — destination rates must NOT be applied
- [ ] DE company, valid VAT → 0%, reverse-charge note, consultation ID stored
- [ ] DE company, invalid VAT → 21% (B2C treatment)
- [ ] Any company, VIES timeout (mock) → 21% + message shown
- [ ] GB individual → 0%; GB company → 0% (no VAT number needed for non-EU 0%)
- [ ] US individual → 0%
- [ ] Same rate in checkout UI, charged amount, and SmartBill PDF (one source of truth)
