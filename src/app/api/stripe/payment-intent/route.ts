import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    const { price, planName, vatRate, viesConsultationId } = await req.json();

    if (!price || price <= 0) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(price * 100),
      currency: 'usd',
      description: `Tyes Studio – ${planName} Plan`,
      automatic_payment_methods: { enabled: true },
      metadata: {
        vatRate: vatRate ? vatRate.toString() : '0',
        viesConsultationId: viesConsultationId || '',
      }
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error('PaymentIntent Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
