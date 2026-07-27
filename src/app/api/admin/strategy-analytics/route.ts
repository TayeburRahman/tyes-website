import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createClientBase } from '@supabase/supabase-js';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = createClientBase(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Total Requests
    const { count: totalRequests } = await supabaseAdmin
      .from('brand_strategy_requests')
      .select('*', { count: 'exact', head: true });

    // Pending requests
    const { count: pendingRequests } = await supabaseAdmin
      .from('brand_strategy_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new');

    // To calculate Avg Delivery time, we'd look at created_at vs updated_at where status = 'sent' or 'converted'
    // Since we don't have a specific `delivered_at` column, we'll estimate based on `updated_at`.
    // We can do this in JS.
    const { data: deliveredRequests } = await supabaseAdmin
      .from('brand_strategy_requests')
      .select('created_at, updated_at')
      .in('status', ['sent', 'converted_to_deep_dive']);

    let avgDeliveryDays = 0;
    if (deliveredRequests && deliveredRequests.length > 0) {
      const totalMs = deliveredRequests.reduce((sum, req) => {
        const start = new Date(req.created_at).getTime();
        const end = new Date(req.updated_at).getTime();
        return sum + (end - start);
      }, 0);
      avgDeliveryDays = totalMs / deliveredRequests.length / (1000 * 60 * 60 * 24);
    }

    // Free -> Paid conversion
    // Find all users who ordered "Free Image" at least once.
    const { data: freeOrders } = await supabaseAdmin
      .from('orders')
      .select('user_id')
      .eq('plan', 'Free Image');

    let freeToPaidConversion = 0;
    if (freeOrders && freeOrders.length > 0) {
      const freeUserIds = Array.from(new Set(freeOrders.map(o => o.user_id)));
      
      // Check how many of these users have a paid order (not Free Image) or a paid strategy request
      const { data: paidOrders } = await supabaseAdmin
        .from('orders')
        .select('user_id')
        .neq('plan', 'Free Image')
        .in('user_id', freeUserIds);

      const { data: paidStrategy } = await supabaseAdmin
        .from('brand_strategy_requests')
        .select('user_id, tier, source')
        .in('user_id', freeUserIds);
        
      const convertedUsers = new Set();
      
      (paidOrders || []).forEach(o => convertedUsers.add(o.user_id));
      
      // Filter paid strategies (tier = Brand Strategy, or source includes addon)
      (paidStrategy || []).forEach(r => {
        const isPaidStrat = r.tier === 'Brand Strategy' || (r.source && r.source.includes('addon'));
        if (isPaidStrat) convertedUsers.add(r.user_id);
      });

      freeToPaidConversion = Math.round((convertedUsers.size / freeUserIds.length) * 100);
    }
    
    // Strategy Revenue
    // Revenue from $25 add-ons + standalones ($25 each)
    const { data: allRequests } = await supabaseAdmin
      .from('brand_strategy_requests')
      .select('tier, source');
      
    let paidStrategyCount = 0;
    if (allRequests) {
      allRequests.forEach(r => {
        const source = r.source || '';
        const tier = r.tier || '';
        // Paid if it's the standalone Brand Strategy tier, or if the source indicates an addon purchase
        if (tier === 'Brand Strategy' || source.includes('addon_25') || source === 'Order Add-on') {
          paidStrategyCount++;
        }
      });
    }

    const strategyRevenue = paidStrategyCount * 25;

    return NextResponse.json({
      data: {
        totalRequests: totalRequests || 0,
        pendingRequests: pendingRequests || 0,
        avgDeliveryDays: Number(avgDeliveryDays.toFixed(1)),
        freeToPaidConversion,
        strategyRevenue
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
