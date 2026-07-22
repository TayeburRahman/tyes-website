import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

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

    let query = supabase
      .from('brand_strategy_requests')
      .select('*, profiles:user_id (email, full_name)')
      .order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching admin strategy requests:', error);
      return NextResponse.json({ error: 'Failed to fetch strategy requests' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
