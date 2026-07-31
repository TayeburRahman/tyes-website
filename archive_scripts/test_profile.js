require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase.from('profiles').update({ country: 'RO' }).eq('id', '036f4493-02b9-4242-b057-364bdfaee399');
  console.log("Update Error:", error);
}
test();
