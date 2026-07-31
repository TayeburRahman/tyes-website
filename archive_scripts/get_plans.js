require('dotenv').config({ path: '/home/tayebur/project/tyes-website/.env' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data } = await supabase.from('pricing_plans').select('name, price').order('price', { ascending: true });
  console.log(data);
}
run();
