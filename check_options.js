require('dotenv').config({ path: '.env' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function run() {
  const res = await fetch(`${supabaseUrl}/rest/v1/brand_strategy_requests`, {
    method: 'OPTIONS',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  const data = await res.json();
  console.log("Columns:", Object.keys(data.components.schemas.brand_strategy_requests.properties));
}
run();
