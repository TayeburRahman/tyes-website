const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase
    .from('brand_strategy_requests')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
    
  if (error) {
    console.error("Error deleting:", error);
  } else {
    console.log("Successfully deleted all backfilled strategy requests.");
  }
}
run();
