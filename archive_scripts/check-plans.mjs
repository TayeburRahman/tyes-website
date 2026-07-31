import fs from 'fs';
const env = fs.readFileSync('.env', 'utf-8');
const supabaseUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const supabaseKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();
async function checkData() {
  const res = await fetch(`${supabaseUrl}/rest/v1/pricing_plans?select=*`, {
    headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
  });
  const json = await res.json();
  console.log("All pricing plans:", json);
}
checkData();
