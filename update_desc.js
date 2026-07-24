require('dotenv').config({ path: '/home/tayebur/project/tyes-website/.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { error } = await supabase
    .from('pricing_plans')
    .update({ description: "" })
    .eq('name', 'Deep Dive Brand Strategy');
  if (error) console.error(error);
  else console.log("Description cleared.");
}

run();
