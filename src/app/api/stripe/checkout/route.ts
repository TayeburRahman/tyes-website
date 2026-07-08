import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { orderId, planName, price, customerEmail, customerName } = await req.json();

    if (!orderId || !planName || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. Fetch the order to get the user ID
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('user_id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 2. Fetch the user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', order.user_id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // 3. Get or create Stripe Customer
    let stripeCustomerId = profile.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: customerEmail || profile.email,
        name: customerName || `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
      });
      
      stripeCustomerId = customer.id;

      // Update profile with the new Stripe Customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', profile.id);
    }

    // 4. Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: stripeCustomerId,
      automatic_tax: { enabled: true },
      tax_id_collection: { enabled: true },
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
      invoice_creation: {
        enabled: true,
      },
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: planName,
              // Marketing & Design services tax code — Stripe Tax uses this to determine
              // the correct VAT/sales tax treatment per jurisdiction.
              // Update only this code if the product classification changes.
              tax_code: 'txcd_20030000',
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      metadata: {
        orderId,
      },
      success_url: `${req.headers.get('origin')}/dashboard/client?paid=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/dashboard/client?cancel=true`,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
