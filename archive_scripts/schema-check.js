const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data: pData } = await supabase.from('profiles').select('*').limit(1);
  if (pData && pData.length > 0) console.log('Profiles columns:', Object.keys(pData[0]));
  const { data: oData } = await supabase.from('orders').select('*').limit(1);
  if (oData && oData.length > 0) console.log('Orders columns:', Object.keys(oData[0]));
}

run();
