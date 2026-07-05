const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data, error } = await supabase.rpc('execute_sql', {
    sql: `
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_address TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_city TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_county TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS company_name TEXT;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_business BOOLEAN DEFAULT false;
    `
  });
  console.log('Error:', error);
}

run();
