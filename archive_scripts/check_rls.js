require('dotenv').config({ path: '.env' });

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
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text);
  }
  return await res.json();
}

async function run() {
  try {
    const data = await runSQL(`
      select relname, relrowsecurity 
      from pg_class 
      where relname = 'brand_strategy_requests';
    `);
    console.log("RLS Info:", data);
  } catch(e) {
    console.error("Error:", e.message);
  }
}
run();
