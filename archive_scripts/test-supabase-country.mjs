import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function check() {
  const { data } = await supabase.from('profiles').select('id, email, country, is_business, vat_number').order('created_at', { ascending: false }).limit(5);
  console.log(JSON.stringify(data, null, 2));
}
check();
