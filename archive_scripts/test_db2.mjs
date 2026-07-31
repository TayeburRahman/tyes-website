import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const supabaseUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const supabaseKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();

async function checkData() {
  const res = await fetch(`${supabaseUrl}/rest/v1/invoices?select=*,orders(title)`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  const text = await res.text();
  console.log("Invoices table with relation:");
  console.log(text);
}
checkData();
