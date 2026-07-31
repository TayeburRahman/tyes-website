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

    // Fetch the user profile to get the stripe_customer_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email, first_name, last_name, country')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    let stripeCustomerId = profile.stripe_customer_id;

    if (!stripeCustomerId) {
      // If they don't have a Stripe customer ID, create one
      const customer = await stripe.customers.create({
        email: profile.email,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
        address: profile.country ? { country: profile.country } : undefined,
      });
      stripeCustomerId = customer.id;
      
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', userId);
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
