import { NextResponse } from 'next/server';
import { createClient as createClientBase } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabaseAdmin = createClientBase(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const [
      { data: studioSettings },
      { data: pricingPlans },
      { data: orders },
      { data: profiles }
    ] = await Promise.all([
      supabaseAdmin.from('studio_settings').select('*').eq('id', 1).single(),
      supabaseAdmin.from('pricing_plans').select('*').order('created_at', { ascending: true }),
      supabaseAdmin.from('orders').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('profiles').select('*').order('created_at', { descending: true })
    ]);

    return NextResponse.json({
      studioSettings: studioSettings || null,
      pricingPlans: pricingPlans || [],
      orders: orders || [],
      profiles: profiles || []
    });
  } catch (error: any) {
    console.error('Error fetching admin dashboard data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
