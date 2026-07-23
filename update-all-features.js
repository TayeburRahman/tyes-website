const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env', 'utf-8');
const supabaseUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const supabaseServiceKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const defaultFeatures = [
  {"text": "3 revisions / image", "icon": "check"},
  {"text": "Commercial license", "icon": "check"},
  {"text": "Delivery: 24 hours", "icon": "clock"},
  {"text": "AI generated + retouched", "icon": "check"}
];

async function run() {
  const { data: plans } = await supabase.from('pricing_plans').select('*');
  
  for (const plan of plans) {
    // Fix name if it has leading space
    const cleanName = plan.name.trim();
    
    let updates = {};
    if (plan.name !== cleanName) {
      updates.name = cleanName;
    }
    
    // Add default features if missing or empty
    if (!plan.features || plan.features.length === 0) {
      updates.features = defaultFeatures;
    }
    
    // Add default description if missing
    if (!plan.description || plan.description === '') {
      updates.description = `Great choice for ${cleanName}`;
    }
    
    if (Object.keys(updates).length > 0) {
      await supabase.from('pricing_plans').update(updates).eq('id', plan.id);
      console.log(`Updated ${cleanName}`);
    }
  }
  console.log('Done');
}
run();
