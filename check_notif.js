require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function check() {
  const { data: o } = await supabase.from('orders').select('id, items, status, created_at').eq('id', 'ORD-470D').single();
  console.log('Order Items:', o.items);
  
  const formattedId = o.id ? (o.id.toUpperCase().startsWith('ORD-') ? o.id.toUpperCase() : `ORD-${o.id.slice(0, 8).toUpperCase()}`) : '';
  const items = o.items || [];
  const deliveredItems = items.filter(i => i.finishImage || i.v2Image);
  const v2Items = items.filter(i => i.v2Image);
  
  const realNotifs = [];
  if (deliveredItems.length > 0) {
    if (deliveredItems.length === items.length) {
      realNotifs.push({
        id: `notif-del-${o.id}`,
        text: `Images delivered for ${formattedId}`,
        time: o.created_at ? new Date(o.created_at).toLocaleDateString() : 'Recently',
        read: o.status === 'completed'
      });
    } else {
      realNotifs.push({
        id: `notif-part-${o.id}`,
        text: `${deliveredItems.length} of ${items.length} images delivered for ${formattedId}`,
        time: o.created_at ? new Date(o.created_at).toLocaleDateString() : 'Recently',
        read: false
      });
    }
  }
  console.log('Generated Notifs:', realNotifs);
}
check();
