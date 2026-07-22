import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

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
    const { 
      name, price, images_included, revisions, delivery_time, is_active, 
      strategy_included, strategy_call_included, strategy_addon_allowed, strategy_addon_price 
    } = body;

    const { data, error } = await supabase
      .from('pricing_plans')
      .update({
        name,
        price,
        images_included,
        revisions,
        delivery_time,
        is_active,
        strategy_included,
        strategy_call_included,
        strategy_addon_allowed,
        strategy_addon_price
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating plan:', error);
      return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
