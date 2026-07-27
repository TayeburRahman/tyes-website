import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sendOrderConfirmationEmail } from '@/utils/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    // 1. Retrieve the Stripe Checkout Session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['invoice'],
    });

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 402 });
    }

    const orderId = session.metadata?.orderId;
    if (!orderId) {
      return NextResponse.json({ error: 'No orderId in session metadata' }, { status: 400 });
    }

    // 2. Check if order is already processed (webhook may have already handled it)
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('status, customer_email, customer_name, title, plan, revenue, user_id, id, attachments')
      .eq('id', orderId)
      .single();

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 3. Extract invoice URL from Stripe (VAT invoice)
    let invoiceUrl = '';
    let invoiceId = '';

    if (session.invoice && typeof session.invoice === 'object') {
      const inv = session.invoice as Stripe.Invoice;
      invoiceUrl = inv.hosted_invoice_url || '';
      invoiceId = inv.id;
    } else if (typeof session.invoice === 'string') {
      try {
        const inv = await stripe.invoices.retrieve(session.invoice);
        invoiceUrl = inv.hosted_invoice_url || '';
        invoiceId = inv.id;
      } catch (e) {
        console.error('Could not fetch invoice:', e);
      }
    }

    // 4. If webhook already processed this, just return the invoice URL (for UI use)
    if (existingOrder.status === 'paid') {
      return NextResponse.json({ success: true, alreadyProcessed: true, invoiceUrl });
    }

    // 5. Mark order as paid
    const updatedAttachments = { ...(existingOrder.attachments || {}) };
    updatedAttachments.payment_status = 'paid';

    await supabase
      .from('orders')
      .update({ status: 'paid', attachments: updatedAttachments })
      .eq('id', orderId);

    // Handle brand_strategy_requests for this order
    const { data: existingRequest } = await supabase
      .from('brand_strategy_requests')
      .select('id, status')
      .eq('order_id', orderId)
      .single();

    if (existingRequest) {
      if (existingRequest.status === 'pending' || existingRequest.status === 'new') {
        await supabase
          .from('brand_strategy_requests')
          .update({ status: 'new', assigned_to: 'Raluca' })
          .eq('id', existingRequest.id);
      }
    } else {
      const plan = existingOrder.plan || '';
      const hasStrategyAddon = existingOrder.attachments?.has_strategy_addon;
      const needsStrategy = plan.includes('Campaign 5') || plan.includes('Campaign 10') || plan.includes('Custom') || plan === 'Brand Strategy' || hasStrategyAddon;
      
      if (needsStrategy) {
        await supabase.from('brand_strategy_requests').insert([{
           user_id: existingOrder.user_id,
           order_id: orderId,
           status: 'new',
           brand_data: { brandName: existingOrder.customer_name || 'Unknown', category: 'N/A' },
           source: plan === 'Brand Strategy' ? 'Standalone Request' : 'Order Add-on',
           tier: plan,
           assigned_to: 'Raluca',
           created_at: new Date().toISOString()
        }]);
      }
    }

    // 6. Save invoice record
    if (invoiceUrl && invoiceId) {
      await supabase.from('invoices').insert([{
        order_id: orderId,
        user_id: existingOrder.user_id,
        amount: session.amount_total ? session.amount_total / 100 : existingOrder.revenue,
        status: 'paid',
        due_date: new Date().toISOString().split('T')[0],
        invoice_url: invoiceUrl,
        stripe_invoice_id: invoiceId,
      }]);
    }

    // 7. Send confirmation email with Stripe invoice link
    const customerEmail =
      existingOrder.customer_email ||
      session.customer_details?.email ||
      '';

    if (customerEmail) {
      await sendOrderConfirmationEmail({
        to: customerEmail,
        customerName:
          existingOrder.customer_name ||
          session.customer_details?.name ||
          'Client',
        orderTitle: existingOrder.title,
        planName: existingOrder.plan,
        price: existingOrder.revenue,
        orderId: existingOrder.id,
        invoiceUrl,
        taxAmount: session.total_details?.amount_tax ? session.total_details.amount_tax / 100 : 0,
        totalAmount: session.amount_total ? session.amount_total / 100 : existingOrder.revenue,
      });
    }

    return NextResponse.json({ success: true, invoiceUrl });
  } catch (error: any) {
    console.error('Verify session error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
