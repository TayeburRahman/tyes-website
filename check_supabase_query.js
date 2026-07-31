require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data: ascData } = await supabase.from('orders').select('id, created_at').order('created_at', { ascending: true }).limit(2);
  const { data: descData } = await supabase.from('orders').select('id, created_at').order('created_at', { ascending: false }).limit(2);
  const { data: wrongData } = await supabase.from('orders').select('id, created_at').order('created_at', { descending: true }).limit(2);
  
  console.log("Ascending (oldest):", ascData.map(o => o.id));
  console.log("Ascending false (newest):", descData.map(o => o.id));
  console.log("Wrong arg (default):", wrongData.map(o => o.id));
}
test();
