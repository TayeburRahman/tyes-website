const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('orders').select('*').ilike('plan', '%Strategy%');
  console.log("Error:", error);
  console.log("Strategy orders:", data ? data.length : 0);
  if (data && data.length > 0) {
    console.log("Sample:", data[0]);
  }
}
run();
