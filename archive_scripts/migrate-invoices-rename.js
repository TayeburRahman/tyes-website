const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Extract project ref from the Supabase URL
// e.g. https://vwtuztxdflcupqrmhzij.supabase.co → vwtuztxdflcupqrmhzij
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function runSQL(sql) {
  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ query: sql }),
    }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || JSON.stringify(data));
  return data;
}

async function run() {
  console.log(`Project ref: ${projectRef}\n`);
  console.log('Running invoices table migration: removing SmartBill columns...\n');

  const steps = [
    {
      label: 'Rename smartbill_number → stripe_invoice_id',
      sql: `ALTER TABLE invoices RENAME COLUMN smartbill_number TO stripe_invoice_id;`,
    },
    {
      label: 'Drop smartbill_series',
      sql: `ALTER TABLE invoices DROP COLUMN IF EXISTS smartbill_series;`,
    },
  ];

  for (const step of steps) {
    console.log(`→ ${step.label}`);
    try {
      await runSQL(step.sql);
      console.log(`  ✓ Done`);
    } catch (err) {
      console.error(`  ✗ Failed: ${err.message}`);
    }
  }

  console.log('\nMigration complete.');
}

run();
