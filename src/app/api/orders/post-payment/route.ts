import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendOrderConfirmationEmail } from '@/utils/email';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    // 1. Fetch the order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Error fetching order:', orderError);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'pending') {
      return NextResponse.json({ error: 'Order already processed' }, { status: 400 });
    }

    // 2. Mark order as paid for non-custom free orders
    const isCustom = order.plan?.includes('Custom') || order.is_custom || order.plan?.includes('Deep Dive');
    const updatedAttachments = { ...(order.attachments || {}) };
    
    if (!isCustom) {
      if (order.plan === 'Free Image' && order.revenue === 0) {
        updatedAttachments.payment_status = 'free';
      } else {
        updatedAttachments.payment_status = 'paid';
      }
    }

    await supabase
      .from('orders')
      .update({ attachments: updatedAttachments })
      .eq('id', order.id);

    // Update brand_strategy_requests status if pending
    await supabase
      .from('brand_strategy_requests')
      .update({ status: 'new' })
      .eq('order_id', order.id)
      .eq('status', 'pending');

    // 3. Fetch user profile for email
    let clientEmail = order.customer_email || '';
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', order.user_id)
      .maybeSingle();

    if (profile) {
      clientEmail = profile.billing_email || profile.email || clientEmail;
    }

    // 4. Send Order Confirmation Email
    try {
      await sendOrderConfirmationEmail({
        to: clientEmail,
        customerName: order.customer_name || 'Client',
        orderTitle: order.title,
        planName: order.plan,
        price: order.revenue,
        orderId: order.id,
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Post-payment Handler Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
