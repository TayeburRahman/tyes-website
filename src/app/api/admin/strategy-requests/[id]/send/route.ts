import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createClientBase } from '@supabase/supabase-js';
import { sendStrategySnapshotEmail } from '@/utils/email';

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

    if (!request.delivered_pdf_url) {
      return NextResponse.json({ error: 'No PDF uploaded yet' }, { status: 400 });
    }


    const brandName = request.brand_data?.brandName || 'your brand';

    if (clientEmail) {
      const emailResult = await sendStrategySnapshotEmail({
        to: clientEmail,
        brandName,
        pdfUrl: request.delivered_pdf_url
      });
      if ('error' in emailResult && (emailResult as any).error) {
        console.error('Failed to send email:', (emailResult as any).error);
      }
    }

    const { data: updatedRequest, error: updateError } = await supabaseAdmin
      .from('brand_strategy_requests')
      .update({ status: 'sent' })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update request status' }, { status: 500 });
    }

    if (request.order_id) {
      const { data: linkedOrder } = await supabaseAdmin
        .from('orders')
        .select('*')
        .eq('id', request.order_id)
        .single();

      if (linkedOrder) {
        const hasNoImages = linkedOrder.images_count === 0 || linkedOrder.plan === 'Brand Strategy' || linkedOrder.plan === 'Brand Strategy (Only)';
        const items = linkedOrder.items || [];
        const deliveredItems = items.filter((i: any) => i.finishImage || i.v2Image || i.status === 'delivered' || i.status === 'completed');
        const allImagesDelivered = items.length === 0 || deliveredItems.length === items.length;

        if (hasNoImages || allImagesDelivered) {
          await supabaseAdmin
            .from('orders')
            .update({ status: 'completed', progress: 100 })
            .eq('id', request.order_id);
        } else {
          const newProgress = Math.round((deliveredItems.length / items.length) * 100);
          await supabaseAdmin
            .from('orders')
            .update({
              status: linkedOrder.status === 'pending' ? 'in_progress' : linkedOrder.status,
              progress: newProgress
            })
            .eq('id', request.order_id);
        }
      }
    }

    return NextResponse.json({ success: true, data: updatedRequest });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
