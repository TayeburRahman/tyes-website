import fs from 'fs';
const env = fs.readFileSync('.env', 'utf-8');
const supabaseUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const supabaseAnonKey = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/)[1].trim();
async function checkData() {
  const res = await fetch(`${supabaseUrl}/rest/v1/pricing_plans?select=*`, {
    headers: { 'apikey': supabaseAnonKey, 'Authorization': `Bearer ${supabaseAnonKey}` }
  });
  const json = await res.json();
  console.log("Anon request result:");
  console.log(json);
}
checkData();
