require('dotenv').config({ path: '/home/tayebur/project/tyes-website/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  // Update Campaign 5
  await supabase.from('pricing_plans').update({ strategy_included: true }).eq('name', 'Campaign 5');
  
  // Update Campaign 10
  await supabase.from('pricing_plans').update({ strategy_included: true }).eq('name', 'Campaign 10');
  
  // Update Deep Dive Brand Strategy to active = false
  await supabase.from('pricing_plans').update({ active: false }).eq('name', 'Deep Dive Brand Strategy');
  
  // Update "Brand Strategy" name to avoid confusion with addons
  // Actually the feedback says "Add Custom tier" 
  
  const customPlan = {
    name: "Custom (Get in Touch)",
    images: 0,
    price: 0,
    active: true,
    badge: "Enterprise",
    max_revisions: 0,
    strategy_included: true,
    strategy_call_included: true,
    strategy_addon_allowed: false,
    strategy_addon_price: 0,
    description: "",
    features: [
      { "icon": "check", "text": "Custom AI image volume" },
      { "icon": "check", "text": "Brand Strategy Snapshot" },
      { "icon": "check", "text": "30-min discovery call" }
    ]
  };
  
  const { data: existing } = await supabase.from('pricing_plans').select('id').eq('name', 'Custom (Get in Touch)').single();
  if (existing) {
     await supabase.from('pricing_plans').update(customPlan).eq('id', existing.id);
  } else {
     await supabase.from('pricing_plans').insert([customPlan]);
  }
  
  // Also check if Campaign 5 / 10 need max_revisions
  // It is already 1 for Campaign 5 and 10 in the DB.
  console.log("Plans updated!");
}

run();
