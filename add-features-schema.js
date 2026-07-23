const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      ALTER TABLE pricing_plans ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;
    `
  });
  console.log('Result:', data);
  console.log('Error:', error);
}
run();
