const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  console.log("Profiles exist:", !!data, "Error:", JSON.stringify(error));
  const { data: d2, error: e2 } = await supabase.from('users').select('*').limit(1);
  console.log("Users exist:", !!d2, "Error:", JSON.stringify(e2));
}
test();
