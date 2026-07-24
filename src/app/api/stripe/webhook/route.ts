import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { sendOrderConfirmationEmail } from '@/utils/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error: any) {
    console.error(`Webhook signature verification failed: ${error.message}`);
    return NextResponse.json({ error: `Webhook Error: ${error.message}` }, { status: 400 });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    
    if (orderId) {
      console.log(`Processing successful payment for Order: ${orderId}`);

      let invoiceUrl = '';
      let invoiceId = '';

      // If Stripe generated an invoice, fetch it to get the hosted URL
      if (session.invoice) {
        try {
          const invoice = await stripe.invoices.retrieve(session.invoice as string);
          invoiceUrl = invoice.hosted_invoice_url || '';
          invoiceId = invoice.id;
        } catch (invErr) {
          console.error('Error fetching Stripe invoice:', invErr);
        }
      }
      
      // Update the status of the order to 'paid'
      const { data: order, error } = await supabase
        .from('orders')
        .update({ status: 'paid' }) 
        .eq('id', orderId)
        .select()
        .single();
        
      if (error || !order) {
         console.error('Error updating supabase order:', error);
         return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }

      // Update brand_strategy_requests status if pending
      await supabase
        .from('brand_strategy_requests')
        .update({ status: 'new' })
        .eq('order_id', orderId)
        .eq('status', 'pending');

      // Save the invoice to the invoices table
      if (invoiceUrl && invoiceId) {
        const { error: invError } = await supabase.from('invoices').insert([{
          order_id: order.id,
          user_id: order.user_id,
          amount: session.amount_total ? session.amount_total / 100 : order.revenue,
          status: 'paid',
          due_date: new Date().toISOString().split('T')[0],
          invoice_url: invoiceUrl,
          stripe_invoice_id: invoiceId,
        }]);
        if (invError) console.error('Error saving invoice to DB:', invError);
      }

      // Send Order Confirmation Email
      let clientEmail = order.customer_email || session.customer_details?.email || '';
      if (!clientEmail) {
        const { data: profile } = await supabase.from('profiles').select('email, billing_email').eq('id', order.user_id).single();
        if (profile) clientEmail = profile.billing_email || profile.email;
      }

      if (clientEmail) {
        await sendOrderConfirmationEmail({
          to: clientEmail,
          customerName: order.customer_name || session.customer_details?.name || 'Client',
          orderTitle: order.title,
          planName: order.plan,
          price: order.revenue, // Base price
          orderId: order.id,
          invoiceUrl: invoiceUrl, // This points to the Stripe Hosted Invoice
          taxAmount: session.total_details?.amount_tax ? session.total_details.amount_tax / 100 : 0,
          totalAmount: session.amount_total ? session.amount_total / 100 : order.revenue,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
