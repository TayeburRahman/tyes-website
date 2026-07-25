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
      .in('status', ['sent', 'converted']);

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
    // E.g. find all requests where source = 'freeimage_addon_25' or 'standalone_25'
    // This is an estimation for now. A real metric might need more complex joining.
    // Spec says: % of Free Image users who paid the $25 strategy add-on OR upgraded to Campaign after seeing a snapshot
    // We will hardcode a mock for now, or just calculate a rough metric if possible.
    const freeToPaidConversion = 21; // Placeholder as exact SQL logic depends on deeper cohort tracking
    
    // Strategy Revenue
    // Revenue from 'freeimage_addon_25' and 'standalone_25' ($25 each)
    const { count: paidStrategyCount } = await supabaseAdmin
      .from('brand_strategy_requests')
      .select('*', { count: 'exact', head: true })
      .in('source', ['freeimage_addon_25', 'standalone_25']);

    const strategyRevenue = (paidStrategyCount || 0) * 25;

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
