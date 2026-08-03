import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createClientBase } from '@supabase/supabase-js';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = createClientBase(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: request, error } = await supabaseAdmin
      .from('brand_strategy_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const { data: profileData } = request.user_id 
      ? await supabaseAdmin.from('profiles').select('email, full_name').eq('id', request.user_id).single()
      : { data: null };

    const data = { ...request, profiles: profileData };

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const updates: any = {};
    if (body.status !== undefined) updates.status = body.status;
    if (body.assigned_to !== undefined) updates.assigned_to = body.assigned_to;

    const supabaseAdmin = createClientBase(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabaseAdmin
      .from('brand_strategy_requests')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
    }

    if (data && data.order_id && ['sent', 'delivered', 'ready_to_send'].includes(body.status)) {
      const { data: linkedOrder } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', data.order_id)
        .single();

      if (linkedOrder) {
        const hasNoImages = linkedOrder.images_count === 0 || linkedOrder.plan === 'Brand Strategy' || linkedOrder.plan === 'Brand Strategy (Only)';
        const items = linkedOrder.items || [];
        const deliveredItems = items.filter((i: any) => i.finishImage || i.v2Image || i.status === 'delivered' || i.status === 'completed');
        const allImagesDelivered = items.length === 0 || deliveredItems.length === items.length;

        if (hasNoImages || allImagesDelivered) {
          await supabaseAdmin
            .from('orders')
            .update({ status: 'completed', progress: 100 })
            .eq('id', data.order_id);
        } else {
          const newProgress = Math.round((deliveredItems.length / items.length) * 100);
          await supabaseAdmin
            .from('orders')
            .update({
              status: linkedOrder.status === 'pending' ? 'in_progress' : linkedOrder.status,
              progress: newProgress
            })
            .eq('id', data.order_id);
        }
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
