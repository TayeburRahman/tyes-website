require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function run() {
  const plans = [
    // Standard Packages (Default - Without Brand Info)
    { name: 'Free Image', price: 0, images: 1, max_revisions: 3, active: true, badge: '', strategy_included: false, strategy_call_included: false, strategy_addon_allowed: true, strategy_addon_price: 25 },
    { name: 'Campaign 5', price: 250, images: 5, max_revisions: 3, active: true, badge: 'Popular', strategy_included: false, strategy_call_included: false, strategy_addon_allowed: true, strategy_addon_price: 25 },
    { name: 'Campaign 10', price: 450, images: 10, max_revisions: 3, active: true, badge: 'Go Big', strategy_included: false, strategy_call_included: false, strategy_addon_allowed: true, strategy_addon_price: 25 },
    { name: 'Custom', price: 0, images: 0, max_revisions: 0, active: true, badge: 'Enterprise', strategy_included: false, strategy_call_included: false, strategy_addon_allowed: true, strategy_addon_price: 25 },

    // Brand Strategy Packages (With Brand Info / Strategy Included)
    { name: 'Brand Strategy', price: 25, images: 0, max_revisions: 0, active: true, badge: 'Strategy Only', strategy_included: true, strategy_call_included: false, strategy_addon_allowed: false, strategy_addon_price: 0 },
    { name: 'Campaign 5 (Strategy)', price: 25, images: 5, max_revisions: 1, active: true, badge: 'Popular', strategy_included: true, strategy_call_included: false, strategy_addon_allowed: false, strategy_addon_price: 0 },
    { name: 'Campaign 10 (Strategy)', price: 45, images: 10, max_revisions: 1, active: true, badge: 'Go Big', strategy_included: true, strategy_call_included: false, strategy_addon_allowed: false, strategy_addon_price: 0 },
    { name: 'Custom (Strategy)', price: 0, images: 0, max_revisions: 0, active: true, badge: 'Enterprise', strategy_included: true, strategy_call_included: true, strategy_addon_allowed: false, strategy_addon_price: 0 }
  ];

  try {
    // Upsert the new plans
    for (const plan of plans) {
      const { data: existing, error: err2 } = await supabase
        .from('pricing_plans')
        .select('id')
        .eq('name', plan.name)
        .eq('strategy_included', plan.strategy_included)
        .maybeSingle();

      if (err2) console.error("Error fetching plan", plan.name, err2);
      
      if (existing) {
          const { error: err3 } = await supabase.from('pricing_plans').update({ ...plan, active: true }).eq('id', existing.id);
          if (err3) console.error("Error updating plan", plan.name, err3);
      } else {
          const { error: err4 } = await supabase.from('pricing_plans').insert(plan);
          if (err4) console.error("Error inserting plan", plan.name, err4);
      }
    }
    console.log("Plans updated successfully.");
    
    const { data } = await supabase.from('pricing_plans').select('*');
    console.log(data);
  } catch(e) {
    console.error('Error updating plans data:', e);
  }
}

run();
