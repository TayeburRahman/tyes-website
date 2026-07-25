import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createClientBase } from '@supabase/supabase-js';
import { sendDeepDiveNudgeEmail } from '@/utils/email';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    const supabaseAdmin = createClientBase(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: request, error: requestError } = await supabaseAdmin
      .from('brand_strategy_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (requestError || !request) {
      console.error('Request not found or error:', requestError);
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email, full_name, billing_email')
      .eq('id', request.user_id)
      .single();

    let clientEmail = profile?.billing_email || profile?.email;

    if (!clientEmail && request.order_id) {
      const { data: order } = await supabaseAdmin
        .from('orders')
        .select('customer_email')
        .eq('id', request.order_id)
        .single();
      clientEmail = order?.customer_email;
    }
    const brandName = request.brand_data?.brandName || 'your brand';

    if (clientEmail) {
      const emailResult = await sendDeepDiveNudgeEmail({
        to: clientEmail,
        brandName
      });
      if ('error' in emailResult && (emailResult as any).error) {
        console.error('Failed to send nudge email:', (emailResult as any).error);
      }
    }

    const { data: updatedRequest, error: updateError } = await supabaseAdmin
      .from('brand_strategy_requests')
      .update({ status: 'converted_to_deep_dive' })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update request status' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: updatedRequest });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
