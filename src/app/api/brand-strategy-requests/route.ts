import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('brand_strategy_requests')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching strategy requests:', error);
      return NextResponse.json({ error: 'Failed to fetch strategy requests' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { order_id, brand_data, source, tier } = body;

    const { data, error } = await supabase
      .from('brand_strategy_requests')
      .insert({
        user_id: user.id,
        order_id: order_id || null,
        brand_data,
        source,
        tier,
        status: 'new',
        assigned_to: 'Raluca'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating strategy request:', error);
      return NextResponse.json({ error: 'Failed to create strategy request' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
