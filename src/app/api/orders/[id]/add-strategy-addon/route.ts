import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2026-05-27.dahlia',
});

export async function POST(
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

    // Since this is a Free Image, there might not be a Stripe session yet or the order might just be updated in DB to include the add-on.
    // The spec doesn't fully detail how the add-on is billed if it's added during checkout before placing the order.
    // Usually, the order is updated to mark strategy addon allowed/added, and then the checkout session is created.
    // We'll update the order record.
    
    // In Next.js App Router 15+ (React 19), params must be awaited if it's a promise, but in Next 14 it's sync. In Next 15: `const { id } = await params;`. We did that.

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Example logic to update the order to add strategy add-on price ($25)
    // You would typically adjust the `revenue` and maybe a `has_strategy_addon` flag.
    // We'll add 25 to the revenue and update a flag if it exists, or just revenue.
    const newRevenue = (order.revenue || 0) + 25;

    const { error: updateError } = await supabase
      .from('orders')
      .update({ revenue: newRevenue })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating order:', updateError);
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
