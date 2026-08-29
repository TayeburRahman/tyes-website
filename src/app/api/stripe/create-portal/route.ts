import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    // Fetch the user profile from auth
    const { data: userAuth, error: authError } = await supabase.auth.admin.getUserById(userId);
    
    if (authError || !userAuth?.user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isLive = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_');
    const customerIdKey = isLive ? 'stripe_customer_id_live' : 'stripe_customer_id_test';

    const metadata = userAuth.user.user_metadata || {};
    let stripeCustomerId = metadata[customerIdKey] || metadata.stripe_customer_id;

    if (stripeCustomerId) {
      try {
        const existingCustomer = await stripe.customers.retrieve(stripeCustomerId);
        if ((existingCustomer as any).deleted) {
          stripeCustomerId = null;
        }
      } catch (err) {
        stripeCustomerId = null;
      }
    }

    if (!stripeCustomerId) {
      // If they don't have a Stripe customer ID, create one
      const customer = await stripe.customers.create({
        email: userAuth.user.email,
        name: `${metadata.first_name || ''} ${metadata.last_name || ''}`.trim(),
        address: metadata.country ? { country: metadata.country } : undefined,
      });
      stripeCustomerId = customer.id;
      
      await supabase.auth.admin.updateUserById(userId, {
        user_metadata: { 
          ...metadata, 
          [customerIdKey]: stripeCustomerId,
          stripe_customer_id: stripeCustomerId 
        }
      });
    }

    // Create the Stripe Customer Portal session
    const returnUrl = `${req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://tyes-website-nu.vercel.app'}/dashboard/client`;

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error creating portal session:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
