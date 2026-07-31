import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const supabaseUrl = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
const supabaseKey = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();

async function checkData() {
  const res = await fetch(`${supabaseUrl}/rest/v1/invoices?select=*`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  const data = await res.json();
  console.log("Invoices table:");
  console.log(data);

  const res2 = await fetch(`${supabaseUrl}/rest/v1/orders?select=id,title,created_at&order=created_at.desc&limit=2`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  const data2 = await res2.json();
  console.log("Recent Orders:");
  console.log(data2);
}
checkData();
