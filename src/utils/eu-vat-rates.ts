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

// ─── VAT Calculation Engine ───────────────────────────────────────────

export interface VATCalculationResult {
  vatRate: number;
  taxName: string;
  invoiceLanguage: 'RO' | 'EN';
  isReverseCharge: boolean;
  viesValid: boolean;
  viesConsultationId?: string;
  viesDown?: boolean;
  vatMode: "DOMESTIC" | "EU_B2C" | "EU_B2B_RC" | "NON_EU";
  viesStatus: "valid" | "invalid" | "unavailable";
}

/**
 * Calculates VAT based on simplified rules:
 * - RO -> 21%
 * - Non-EU -> 0%
 * - EU + Valid VAT -> 0% Reverse charge
 * - EU + Invalid/No VAT -> 21%
 */
export async function calculateVAT(countryCode: string, isCompany: boolean, vatNumber?: string): Promise<VATCalculationResult> {
  const code = countryCode?.toUpperCase() || 'RO';
  const isEU = !!EU_VAT_RATES[code];

  // Clean VAT number
  let cleanVat = vatNumber ? vatNumber.replace(/[^a-zA-Z0-9]/g, '') : '';
  
  // Edge Case: foreign company holding a Romanian VAT code -> Treat as DOMESTIC
  if (cleanVat.toUpperCase().startsWith('RO')) {
    return {
      vatRate: 21,
      taxName: 'Normala',
      invoiceLanguage: 'RO',
      isReverseCharge: false,
      viesValid: false,
      vatMode: 'DOMESTIC',
      viesStatus: 'invalid' // We don't bother checking VIES if it's domestic RO, or we just consider it domestic.
    };
  }

  // 1. Romania -> always 21%, RO invoice
  if (code === 'RO') {
    return {
      vatRate: 21,
      taxName: 'Normala',
      invoiceLanguage: 'RO',
      isReverseCharge: false,
      viesValid: false,
      vatMode: 'DOMESTIC',
      viesStatus: 'invalid'
    };
  }

  // 2. Non-EU -> 0%, EN invoice
  if (!isEU) {
    return {
      vatRate: 0,
      taxName: 'Taxare inversa', // SmartBill accepts this for 0%
      invoiceLanguage: 'EN',
      isReverseCharge: false, // Export (not strict reverse charge, but we use EN invoice + 0%)
      viesValid: false,
      vatMode: 'NON_EU',
      viesStatus: 'invalid'
    };
  }

  // 3. EU Member States (excluding RO)
  if (isCompany && cleanVat) {
    if (cleanVat.toUpperCase().startsWith(code)) {
      cleanVat = cleanVat.substring(code.length);
    }

    try {
      const requesterCountry = 'RO'; // Default company country
      const requesterVat = process.env.SMARTBILL_COMPANY_VAT_CODE || '32585141';

      const soapBody = `<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:ec.europa.eu:taxud:vies:services:checkVat:types">
        <soap:Body>
          <urn:checkVatApprox>
            <urn:countryCode>${code}</urn:countryCode>
            <urn:vatNumber>${cleanVat}</urn:vatNumber>
            <urn:requesterCountryCode>${requesterCountry}</urn:requesterCountryCode>
            <urn:requesterVatNumber>${requesterVat}</urn:requesterVatNumber>
          </urn:checkVatApprox>
        </soap:Body>
      </soap:Envelope>`;

      const res = await fetch('https://ec.europa.eu/taxation_customs/vies/services/checkVatService', {
        method: 'POST',
        headers: { 'Content-Type': 'text/xml;charset=UTF-8' },
        body: soapBody,
        signal: AbortSignal.timeout(8000)
      });

      if (!res.ok) {
        throw new Error('VIES API returned ' + res.status);
      }

      const xml = await res.text();
      const isValid = xml.includes('<valid>true</valid>') || xml.includes('<ns2:valid>true</ns2:valid>');
      
      const matchId = xml.match(/<(?:ns2:)?requestIdentifier>(.*?)<\/(?:ns2:)?requestIdentifier>/);
      const requestIdentifier = matchId && matchId[1] ? matchId[1] : undefined;

      if (isValid) {
        // EU company with valid VAT -> 0% Reverse charge
        return {
          vatRate: 0,
          taxName: 'Taxare inversa',
          invoiceLanguage: 'EN',
          isReverseCharge: true,
          viesValid: true,
          viesConsultationId: requestIdentifier,
          vatMode: 'EU_B2B_RC',
          viesStatus: 'valid'
        };
      }
    } catch (err) {
      console.error('VIES Validation Error:', err);
      // Fall through to 21% if VIES is down, but set the viesDown flag so we can notify the user
      return {
        vatRate: 21,
        taxName: 'Normala',
        invoiceLanguage: 'EN',
        isReverseCharge: false,
        viesValid: false,
        viesDown: true,
        vatMode: 'EU_B2C',
        viesStatus: 'unavailable'
      };
    }
  }

  // EU individual or invalid VAT or empty VAT -> 21%
  return {
    vatRate: 21,
    taxName: 'Normala',
    invoiceLanguage: 'EN',
    isReverseCharge: false,
    viesValid: false,
    vatMode: 'EU_B2C',
    viesStatus: 'invalid'
  };
}
