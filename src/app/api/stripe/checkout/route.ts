import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { calculateVAT } from '@/utils/eu-vat-rates';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { orderId, planName, price, customerEmail, customerName, billingCountry, isInvoice } = await req.json();

    if (!orderId || !planName || !price) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
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

    // 3. Determine the country to use (frontend selection or fallback)
    const { data: userAuth } = await supabase.auth.admin.getUserById(order.user_id);
    const fallbackCountry = userAuth?.user?.user_metadata?.country || 'RO';
    const selectedCountry = billingCountry || fallbackCountry;

    // 4. Get or create Stripe Customer (Mode-aware for both Test and Live environments)
    const isLive = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_');
    const customerIdKey = isLive ? 'stripe_customer_id_live' : 'stripe_customer_id_test';

    let stripeCustomerId = userAuth?.user?.user_metadata?.[customerIdKey] || userAuth?.user?.user_metadata?.stripe_customer_id;

    if (stripeCustomerId) {
      try {
        const existingCustomer = await stripe.customers.retrieve(stripeCustomerId);
        if ((existingCustomer as any).deleted) {
          stripeCustomerId = null;
        } else {
          await stripe.customers.update(stripeCustomerId, {
            address: { country: selectedCountry },
          });
        }
      } catch (err) {
        // If customer was created in test mode and now running in live mode (or vice versa)
        stripeCustomerId = null;
      }
    }

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: customerEmail || profile.email,
        name: customerName || `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        address: { country: selectedCountry },
      });
      
      stripeCustomerId = customer.id;

      // Update auth metadata with mode-specific and default Stripe Customer ID
      await supabase.auth.admin.updateUserById(order.user_id, {
        user_metadata: { 
          ...userAuth?.user?.user_metadata, 
          [customerIdKey]: stripeCustomerId,
          stripe_customer_id: stripeCustomerId 
        }
      });
    }

    // 5. Create Checkout Session with Stripe automatic_tax
    //    Stripe calculates VAT dynamically based on the customer's actual billing address.
    //    This means if the customer changes their country in checkout, the VAT updates automatically.
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: stripeCustomerId,
      tax_id_collection: { enabled: true },
      billing_address_collection: 'required',
      automatic_tax: { enabled: true },
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
            // 'exclusive' = tax added on top of the price shown
            tax_behavior: 'exclusive',
            product_data: {
              name: planName,
              // Marketing & Design services tax code — Stripe Tax uses this to determine
              // the correct VAT/sales tax treatment per jurisdiction.
              tax_code: 'txcd_10103000',
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
      success_url: `${req.headers.get('origin')}/dashboard/client?paid=1${isInvoice ? '&invoice_payment=1' : ''}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/dashboard/client?cancel=true`,
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe Checkout Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
