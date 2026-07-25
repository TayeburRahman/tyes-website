const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
async function run() {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${supabaseKey}` },
    body: JSON.stringify({ query: `
      SELECT
          tc.table_name, kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
      FROM
          information_schema.table_constraints AS tc
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
      WHERE constraint_type = 'FOREIGN KEY' AND tc.table_name='brand_strategy_requests';
    ` })
  });
  const data = await res.json();
  console.log("Foreign keys:", data);
}
run();
