require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

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
    DO $$ 
    BEGIN 
      BEGIN
        ALTER TABLE pricing_plans ADD COLUMN strategy_included BOOLEAN DEFAULT false;
      EXCEPTION WHEN duplicate_column THEN null; END;
      BEGIN
        ALTER TABLE pricing_plans ADD COLUMN strategy_call_included BOOLEAN DEFAULT false;
      EXCEPTION WHEN duplicate_column THEN null; END;
      BEGIN
        ALTER TABLE pricing_plans ADD COLUMN strategy_addon_allowed BOOLEAN DEFAULT false;
      EXCEPTION WHEN duplicate_column THEN null; END;
      BEGIN
        ALTER TABLE pricing_plans ADD COLUMN strategy_addon_price NUMERIC DEFAULT 0;
      EXCEPTION WHEN duplicate_column THEN null; END;
    END $$;
  `;

  try {
    console.log('Running schema update on pricing_plans...');
    await runSQL(sql);
    console.log('Schema updated successfully');
  } catch(e) {
    console.error('Error creating schema via API:', e.message);
    return;
  }

  const plans = [
    { name: 'Free Image', price: 0, images: 1, max_revisions: 0, active: true, badge: '', strategy_included: false, strategy_call_included: false, strategy_addon_allowed: true, strategy_addon_price: 25 },
    { name: 'Brand Strategy', price: 25, images: 0, max_revisions: 0, active: true, badge: '', strategy_included: true, strategy_call_included: false, strategy_addon_allowed: false, strategy_addon_price: 0 },
    { name: 'Campaign 5', price: 25, images: 5, max_revisions: 1, active: true, badge: 'Popular', strategy_included: true, strategy_call_included: false, strategy_addon_allowed: false, strategy_addon_price: 0 },
    { name: 'Campaign 10', price: 45, images: 10, max_revisions: 1, active: true, badge: 'Go Big', strategy_included: true, strategy_call_included: false, strategy_addon_allowed: false, strategy_addon_price: 0 },
    { name: 'Custom', price: 0, images: 0, max_revisions: 0, active: true, badge: 'Enterprise', strategy_included: true, strategy_call_included: true, strategy_addon_allowed: false, strategy_addon_price: 0 }
  ];

  try {
    // Soft delete / deactivate all existing plans
    await runSQL(`UPDATE pricing_plans SET active = false;`);
    
    // Upsert the new plans
    for (const plan of plans) {
      const { data: existing } = await supabase.from('pricing_plans').select('id').eq('name', plan.name).maybeSingle();
      if (existing) {
          await supabase.from('pricing_plans').update(plan).eq('id', existing.id);
      } else {
          await supabase.from('pricing_plans').insert(plan);
      }
    }
    console.log("Plans updated successfully.");
  } catch(e) {
    console.error('Error updating plans data:', e);
  }
}

run();
