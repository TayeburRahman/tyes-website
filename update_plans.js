import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data, error } = await supabase
    .from('pricing_plans')
    .update({ strategy_included: true })
    .in('name', ['Campaign 5', 'Campaign 10', 'Custom']);
  
  if (error) console.error(error);
  else console.log('Successfully updated plans:', data);
}
run();
