const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.from('brand_strategy_requests').select('id, delivered_pdf_url').eq('id', '6a9fa01d-37aa-4299-8b3a-54514e13c55c');
  console.log(JSON.stringify(data));
}
run();
