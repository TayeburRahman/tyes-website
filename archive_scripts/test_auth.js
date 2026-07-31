const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.auth.admin.listUsers();
  console.log("Total users:", data?.users?.length);
  const recentUser = data?.users?.[0];
  console.log("Most recent user:", recentUser?.email, "Confirmed at:", recentUser?.email_confirmed_at);
}
run();
