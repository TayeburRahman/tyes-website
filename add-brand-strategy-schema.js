const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

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

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  console.log(`Project ref: ${projectRef}\n`);
  const sql = `
    CREATE TABLE IF NOT EXISTS brand_strategy_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES auth.users(id) NOT NULL,
      order_id UUID REFERENCES orders(id),
      brand_data JSONB NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      assigned_to TEXT NOT NULL DEFAULT 'Raluca',
      delivered_pdf_url TEXT,
      source TEXT NOT NULL,
      tier TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    ALTER TABLE plans ADD COLUMN IF NOT EXISTS strategy_included BOOLEAN DEFAULT false;
    ALTER TABLE plans ADD COLUMN IF NOT EXISTS strategy_call_included BOOLEAN DEFAULT false;
    ALTER TABLE plans ADD COLUMN IF NOT EXISTS strategy_addon_allowed BOOLEAN DEFAULT false;
    ALTER TABLE plans ADD COLUMN IF NOT EXISTS strategy_addon_price NUMERIC DEFAULT 0;
  `;

  try {
    console.log('Running schema update...');
    await runSQL(sql);
    console.log('Schema created successfully');
  } catch(e) {
    console.error('Error creating schema via API:', e.message);
    return;
  }

  const plans = [
    { name: 'Free Image', price: 0, images_included: 1, delivery_time: 'From 3H', revisions: 0, is_active: true, strategy_included: false, strategy_call_included: false, strategy_addon_allowed: true, strategy_addon_price: 25, is_custom: false },
    { name: 'Brand Strategy', price: 25, images_included: 0, delivery_time: '3 business days', revisions: 0, is_active: true, strategy_included: true, strategy_call_included: false, strategy_addon_allowed: false, strategy_addon_price: 0, is_custom: false },
    { name: 'Campaign 5', price: 25, images_included: 5, delivery_time: 'From 24H', revisions: 1, is_active: true, strategy_included: true, strategy_call_included: false, strategy_addon_allowed: false, strategy_addon_price: 0, is_custom: false, is_popular: true },
    { name: 'Campaign 10', price: 45, images_included: 10, delivery_time: 'From 24H', revisions: 1, is_active: true, strategy_included: true, strategy_call_included: false, strategy_addon_allowed: false, strategy_addon_price: 0, is_custom: false },
    { name: 'Custom', price: 0, images_included: 0, delivery_time: 'Per-scope', revisions: 0, is_active: true, strategy_included: true, strategy_call_included: true, strategy_addon_allowed: false, strategy_addon_price: 0, is_custom: true }
  ];

  try {
    await runSQL(`UPDATE plans SET is_active = false;`);
    for (const plan of plans) {
      const { data: existing } = await supabase.from('plans').select('id').eq('name', plan.name).maybeSingle();
      if (existing) {
          await supabase.from('plans').update(plan).eq('id', existing.id);
      } else {
          await supabase.from('plans').insert(plan);
      }
    }
    console.log("Plans updated.");
  } catch(e) {
    console.error('Error updating plans data:', e);
  }
}

run();
