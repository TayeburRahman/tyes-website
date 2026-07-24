require('dotenv').config({ path: '/home/tayebur/project/tyes-website/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase.from('pricing_plans').select('*').eq('active', true).order('price', { ascending: true });
  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
}

run();
