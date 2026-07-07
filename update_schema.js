const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
// Just verifying connection now that I use the right keys
async function check() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  if (error) console.error("Error:", error);
  else console.log("Success, data found.");
}
check();
