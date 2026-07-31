const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data: oData } = await supabase.from('orders').select('items, attachments, brief_description').limit(1);
  console.log('Orders data:', JSON.stringify(oData, null, 2));
}

run();
