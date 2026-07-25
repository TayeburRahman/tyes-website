const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: orders, error } = await supabase.from('orders').select('*');
  
  for (const order of orders) {
    const { data: existing } = await supabase.from('brand_strategy_requests').select('*').eq('order_id', order.id);
    if (!existing || existing.length === 0) {
      console.log('Missing strategy request for order', order.id);
      
      const { error: insertError } = await supabase.from('brand_strategy_requests').insert({
        user_id: order.user_id,
        order_id: order.id,
        status: 'new',
        brand_data: { brandName: order.customer, category: order.category || 'N/A' },
        source: 'Auto-recovered',
        tier: order.plan || 'Unknown',
        created_at: order.created_at
      });
      if (insertError) {
         console.error('Failed to insert', insertError);
      } else {
         console.log('Inserted strategy request for', order.id);
      }
    }
  }
}
run();
