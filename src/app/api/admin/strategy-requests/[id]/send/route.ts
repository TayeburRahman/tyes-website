import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendStrategySnapshotEmail } from '@/utils/email';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: request, error: requestError } = await supabase
      .from('brand_strategy_requests')
      .select('*, profiles:user_id (email, full_name, billing_email)')
      .eq('id', id)
      .single();

    if (requestError || !request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (!request.delivered_pdf_url) {
      return NextResponse.json({ error: 'No PDF uploaded yet' }, { status: 400 });
    }

    const clientEmail = request.profiles?.billing_email || request.profiles?.email;
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

    const { data: updatedRequest, error: updateError } = await supabase
      .from('brand_strategy_requests')
      .update({ status: 'sent' })
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
