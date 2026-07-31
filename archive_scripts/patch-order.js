import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data: order } = await supabase.from('orders').select('id, attachments').eq('id', 'ORD-7B2D').single();
  if (order) {
    const updated = { ...order.attachments, payment_status: 'paid' };
    await supabase.from('orders').update({ attachments: updated }).eq('id', 'ORD-7B2D');
    console.log("Patched ORD-7B2D!");
  }
}
run();
