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

    // 4. Get or create Stripe Customer
    let stripeCustomerId = profile.stripe_customer_id;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: customerEmail || profile.email,
        name: customerName || `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        address: { country: selectedCountry },
      });
      
      stripeCustomerId = customer.id;

      // Update profile with the new Stripe Customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', profile.id);
    } else {
      // Ensure customer has the default country set
      await stripe.customers.update(stripeCustomerId, {
        address: { country: selectedCountry },
      });
    }

    // 5. Calculate VAT based on the selected country using custom engine
    const vatResult = await calculateVAT(selectedCountry, profile.is_business || false, profile.vat_number || undefined);
    let taxRatesToApply: string[] = [];

    if (vatResult.vatRate > 0) {
      // Find the tax rate we synced for this country
      const existingRates = await stripe.taxRates.list({ active: true, limit: 100 });
      let taxRate = existingRates.data.find(r => 
        r.percentage === vatResult.vatRate && 
        r.inclusive === false && 
        r.country === selectedCountry
      );
      
      if (!taxRate) {
        // Fallback in case sync script missed it or it's a new rate
        taxRate = await stripe.taxRates.create({
          display_name: vatResult.taxName || 'VAT',
          description: `Custom ${vatResult.vatRate}% VAT`,
          percentage: vatResult.vatRate,
          country: selectedCountry,
          inclusive: false,
          metadata: { source: 'tyes_vat_engine' }
        });
      }
      taxRatesToApply.push(taxRate.id);
    }

    // 6. Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: stripeCustomerId,
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
          tax_rates: taxRatesToApply.length > 0 ? taxRatesToApply : undefined,
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
