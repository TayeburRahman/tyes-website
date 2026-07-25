const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: request } = await supabase.from('brand_strategy_requests').select('*').eq('id', '6a9fa01d-37aa-4299-8b3a-54514e13c55c').single();
  console.log('Request user_id:', request?.user_id);
  
  if (request?.user_id) {
    const { data: profile } = await supabase.from('profiles').select('email, full_name, billing_email').eq('id', request.user_id).single();
    console.log('Profile:', profile);
    const clientEmail = profile?.billing_email || profile?.email;
    console.log('Resolved email:', clientEmail);
  }
}
run();
