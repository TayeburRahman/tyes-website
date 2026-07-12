import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Hardcode ALL_VAT_RATES here for the script to avoid TS transpilation issues
const EU_VAT_RATES = {
  AT: { code: "AT", name: "Austria", rate: 20 },
  BE: { code: "BE", name: "Belgium", rate: 21 },
  BG: { code: "BG", name: "Bulgaria", rate: 20 },
  HR: { code: "HR", name: "Croatia", rate: 25 },
  CY: { code: "CY", name: "Cyprus", rate: 19 },
  CZ: { code: "CZ", name: "Czech Rep.", rate: 21 },
  DK: { code: "DK", name: "Denmark", rate: 25 },
  EE: { code: "EE", name: "Estonia", rate: 22 },
  FI: { code: "FI", name: "Finland", rate: 25.5 },
  FR: { code: "FR", name: "France", rate: 20 },
  DE: { code: "DE", name: "Germany", rate: 19 },
  GR: { code: "GR", name: "Greece", rate: 24 },
  HU: { code: "HU", name: "Hungary", rate: 27 },
  IE: { code: "IE", name: "Ireland", rate: 23 },
  IT: { code: "IT", name: "Italy", rate: 22 },
  LV: { code: "LV", name: "Latvia", rate: 21 },
  LT: { code: "LT", name: "Lithuania", rate: 21 },
  LU: { code: "LU", name: "Luxembourg", rate: 17 },
  MT: { code: "MT", name: "Malta", rate: 18 },
  NL: { code: "NL", name: "Netherlands", rate: 21 },
  PL: { code: "PL", name: "Poland", rate: 23 },
  PT: { code: "PT", name: "Portugal", rate: 23 },
  RO: { code: "RO", name: "Romania", rate: 19 }, // Using real 19%
  SK: { code: "SK", name: "Slovakia", rate: 20 },
  SI: { code: "SI", name: "Slovenia", rate: 22 },
  ES: { code: "ES", name: "Spain", rate: 21 },
  SE: { code: "SE", name: "Sweden", rate: 25 },
};

const NON_EU_VAT_RATES = {
  GB: { code: "GB", name: "United Kingdom", rate: 20 },
  NO: { code: "NO", name: "Norway", rate: 25 },
  CH: { code: "CH", name: "Switzerland", rate: 8.1 },
  IS: { code: "IS", name: "Iceland", rate: 24 },
  BD: { code: "BD", name: "Bangladesh", rate: 9 },
  US: { code: "US", name: "United States", rate: 0 },
  CA: { code: "CA", name: "Canada", rate: 5 },
  AU: { code: "AU", name: "Australia", rate: 10 },
};

const ALL_VAT_RATES = { ...EU_VAT_RATES, ...NON_EU_VAT_RATES };

async function sync() {
  console.log("Fetching existing tax rates...");
  const existingRates = await stripe.taxRates.list({ active: true, limit: 100 });
  
  for (const [code, info] of Object.entries(ALL_VAT_RATES)) {
    if (info.rate === 0) continue; // Stripe dynamic_tax_rates might not need 0% or we can just ignore 0%
    
    // Check if we already have an active tax rate for this country and percentage
    const exists = existingRates.data.find(r => 
      r.country === code && 
      r.percentage === info.rate && 
      r.inclusive === false &&
      r.metadata.source === 'tyes_vat_engine'
    );
    
    if (!exists) {
      console.log(`Creating Tax Rate for ${code} (${info.rate}%)...`);
      await stripe.taxRates.create({
        display_name: 'VAT',
        description: `${info.name} VAT`,
        country: code,
        percentage: info.rate,
        inclusive: false,
        metadata: { source: 'tyes_vat_engine' }
      });
    } else {
      console.log(`Tax Rate for ${code} already exists.`);
    }
  }
  console.log("Done syncing tax rates!");
}

sync().catch(console.error);
