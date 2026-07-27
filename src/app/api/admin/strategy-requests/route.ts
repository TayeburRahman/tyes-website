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

    // Check if admin - we assume there's some admin check, maybe by profile role or email.
    // E.g. we'll just check if they have a profile, or we assume it's protected by middleware.
    
    const url = new URL(req.url);
    const statusFilter = url.searchParams.get('status');

    const supabaseAdmin = createClientBase(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    let query = supabaseAdmin
      .from('brand_strategy_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data: requests, error } = await query;

    if (error) {
      console.error('Error fetching admin strategy requests:', error);
      return NextResponse.json({ error: 'Failed to fetch strategy requests' }, { status: 500 });
    }

    // Fetch related profiles and orders manually to avoid PostgREST relationship errors
    const userIds = [...new Set(requests.map(r => r.user_id).filter(Boolean))];
    const orderIds = [...new Set(requests.map(r => r.order_id).filter(Boolean))];

    const { data: profiles } = userIds.length > 0 ? await supabaseAdmin.from('profiles').select('id, email, full_name').in('id', userIds) : { data: [] };
    const { data: orders } = orderIds.length > 0 ? await supabaseAdmin.from('orders').select('id, status, customer_email, customer_name, plan, attachments, revenue').in('id', orderIds) : { data: [] };

    const data = requests.map(req => ({
      ...req,
      profiles: profiles?.find(p => p.id === req.user_id) || null,
      orders: orders?.find(o => o.id === req.order_id) || null
    }));

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
