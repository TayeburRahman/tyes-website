const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data: orders, error } = await supabase.from('orders').select('*').ilike('plan', '%Strategy%');
  if (error) {
    console.error("Error fetching orders:", error);
    return;
  }
  
  console.log(`Found ${orders.length} strategy orders`);
  
  for (const order of orders) {
    const { data: existing } = await supabase.from('brand_strategy_requests').select('id').eq('order_id', order.id);
    if (!existing || existing.length === 0) {
      console.log(`Backfilling for order ${order.id}...`);
      
      const brandData = {
        brandName: order.customer_name || 'Unknown',
        category: order.category || 'N/A'
      };
      
      const status = order.status === 'completed' || order.status === 'delivered' ? 'sent' : 
                     (order.status === 'in_progress' ? 'in_progress' : 'new');
      
      const { error: insertError } = await supabase.from('brand_strategy_requests').insert([{
        user_id: order.user_id,
        order_id: order.id,
        brand_data: brandData,
        source: 'Auto-backfilled',
        tier: order.plan,
        status: status,
        assigned_to: 'Raluca',
        created_at: order.created_at
      }]);
      
      if (insertError) {
        console.error(`Error inserting for order ${order.id}:`, insertError);
      } else {
        console.log(`Successfully backfilled order ${order.id}`);
      }
    } else {
      console.log(`Order ${order.id} already exists in brand_strategy_requests`);
    }
  }
}
run();
