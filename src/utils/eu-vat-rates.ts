/**
 * VAT Rates 2026 (Standard Rates)
 * Sources: Tax Foundation / European Commission — verified 2026-01
 *
 * Used for:
 *  - Country dropdown UI (EU_COUNTRIES_LIST)
 *  - SmartBilling invoice tax calculation (getVatInfo)
 *  - Account Settings display
 */

export interface VATCountry {
  /** ISO 3166-1 alpha-2 country code */
  code: string;
  /** Display name */
  name: string;
  /** Numeric VAT rate (e.g. 21 for 21%) */
  rate: number;
  /** Formatted VAT rate string shown in UI */
  vatRate: string;
  /** True = EU member → reverse-charge rules may apply */
  isEU: boolean;
  /** SmartBilling taxName label */
  taxName: string;
}

// ─── EU Member States ────────────────────────────────────────────────────────

export const EU_VAT_RATES: Record<string, VATCountry> = {
  AT: { code: "AT", name: "Austria",        rate: 20,   vatRate: "20%",   isEU: true,  taxName: "Normala" },
  BE: { code: "BE", name: "Belgium",         rate: 21,   vatRate: "21%",   isEU: true,  taxName: "Normala" },
  BG: { code: "BG", name: "Bulgaria",        rate: 20,   vatRate: "20%",   isEU: true,  taxName: "Normala" },
  HR: { code: "HR", name: "Croatia",         rate: 25,   vatRate: "25%",   isEU: true,  taxName: "Normala" },
  CY: { code: "CY", name: "Cyprus",          rate: 19,   vatRate: "19%",   isEU: true,  taxName: "Normala" },
  CZ: { code: "CZ", name: "Czech Rep.",      rate: 21,   vatRate: "21%",   isEU: true,  taxName: "Normala" },
  DK: { code: "DK", name: "Denmark",         rate: 25,   vatRate: "25%",   isEU: true,  taxName: "Normala" },
  EE: { code: "EE", name: "Estonia",         rate: 22,   vatRate: "22%",   isEU: true,  taxName: "Normala" },
  FI: { code: "FI", name: "Finland",         rate: 25.5, vatRate: "25.5%", isEU: true,  taxName: "Normala" },
  FR: { code: "FR", name: "France",          rate: 20,   vatRate: "20%",   isEU: true,  taxName: "Normala" },
  DE: { code: "DE", name: "Germany",         rate: 19,   vatRate: "19%",   isEU: true,  taxName: "Normala" },
  GR: { code: "GR", name: "Greece",          rate: 24,   vatRate: "24%",   isEU: true,  taxName: "Normala" },
  HU: { code: "HU", name: "Hungary",         rate: 27,   vatRate: "27%",   isEU: true,  taxName: "Normala" },
  IE: { code: "IE", name: "Ireland",         rate: 23,   vatRate: "23%",   isEU: true,  taxName: "Normala" },
  IT: { code: "IT", name: "Italy",           rate: 22,   vatRate: "22%",   isEU: true,  taxName: "Normala" },
  LV: { code: "LV", name: "Latvia",          rate: 21,   vatRate: "21%",   isEU: true,  taxName: "Normala" },
  LT: { code: "LT", name: "Lithuania",       rate: 21,   vatRate: "21%",   isEU: true,  taxName: "Normala" },
  LU: { code: "LU", name: "Luxembourg",      rate: 17,   vatRate: "17%",   isEU: true,  taxName: "Normala" },
  MT: { code: "MT", name: "Malta",           rate: 18,   vatRate: "18%",   isEU: true,  taxName: "Normala" },
  NL: { code: "NL", name: "Netherlands",     rate: 21,   vatRate: "21%",   isEU: true,  taxName: "Normala" },
  PL: { code: "PL", name: "Poland",          rate: 23,   vatRate: "23%",   isEU: true,  taxName: "Normala" },
  PT: { code: "PT", name: "Portugal",        rate: 23,   vatRate: "23%",   isEU: true,  taxName: "Normala" },
  RO: { code: "RO", name: "Romania",         rate: 21,   vatRate: "21%",   isEU: true,  taxName: "Normala" },
  SK: { code: "SK", name: "Slovakia",        rate: 20,   vatRate: "20%",   isEU: true,  taxName: "Normala" },
  SI: { code: "SI", name: "Slovenia",        rate: 22,   vatRate: "22%",   isEU: true,  taxName: "Normala" },
  ES: { code: "ES", name: "Spain",           rate: 21,   vatRate: "21%",   isEU: true,  taxName: "Normala" },
  SE: { code: "SE", name: "Sweden",          rate: 25,   vatRate: "25%",   isEU: true,  taxName: "Normala" },
};

// ─── Non-EU Countries (apply only if threshold is crossed) ───────────────────
// UK: £85,000 threshold | Norway: NOK 50,000 | Switzerland: CHF 100,000 | Iceland: ISK 2,000,000

export const NON_EU_VAT_RATES: Record<string, VATCountry> = {
  GB: { code: "GB", name: "United Kingdom", rate: 20,  vatRate: "20%",  isEU: false, taxName: "UK VAT" },
  NO: { code: "NO", name: "Norway",          rate: 25,  vatRate: "25%",  isEU: false, taxName: "MVA" },
  CH: { code: "CH", name: "Switzerland",     rate: 8.1, vatRate: "8.1%", isEU: false, taxName: "MWST" },
  IS: { code: "IS", name: "Iceland",         rate: 24,  vatRate: "24%",  isEU: false, taxName: "VSK" },
};

// ─── Combined lookup (EU + Non-EU) ───────────────────────────────────────────

export const ALL_VAT_RATES: Record<string, VATCountry> = {
  ...EU_VAT_RATES,
  ...NON_EU_VAT_RATES,
};

/**
 * Lookup VAT info for a country code.
 * Returns Romania's rate as default (seller's country) if not found.
 */
export function getVatInfo(countryCode: string): VATCountry {
  return ALL_VAT_RATES[countryCode?.toUpperCase()] ?? EU_VAT_RATES["RO"];
}

/**
 * Sorted list of EU countries for dropdown UI.
 */
export const EU_COUNTRIES_LIST = Object.values(EU_VAT_RATES).sort((a, b) =>
  a.name.localeCompare(b.name)
);

/**
 * Sorted list of all countries (EU + non-EU) for extended dropdown.
 */
export const ALL_COUNTRIES_LIST = Object.values(ALL_VAT_RATES).sort((a, b) =>
  a.name.localeCompare(b.name)
);
