const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase
    .from('orders')
    .delete()
    .neq('id', 'non-existent-id'); // Delete all rows
    
  if (error) {
    console.error("Error deleting orders:", error);
  } else {
    console.log("Successfully deleted all orders.");
  }
}
run();
