const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase
      .from('brand_strategy_requests')
      .select('*, profiles:user_id (email, full_name), orders:order_id (status)')
      .order('created_at', { ascending: false });
  console.log("Error:", JSON.stringify(error, null, 2));
  console.log("Data length:", data ? data.length : 0);
}
test();
