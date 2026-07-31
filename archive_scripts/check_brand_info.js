require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase.from('brand_strategy_requests').select('*');
  if (error) console.log(error);
  if (data) {
    console.log("data:", JSON.stringify(data.slice(0, 2), null, 2));
  }
}
test();
