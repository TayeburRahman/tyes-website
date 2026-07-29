import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { sendImageDeliveryEmail } from '@/utils/email';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { to, customerName, orderTitle, dashboardUrl } = await req.json();

    if (!to || !orderTitle) {
      return NextResponse.json({ error: 'Missing required fields: to, orderTitle' }, { status: 400 });
    }

    const result = await sendImageDeliveryEmail({
      to,
      customerName: customerName || 'Client',
      orderTitle,
      dashboardUrl: dashboardUrl || 'https://tyes.app/dashboard/client',
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('[image-delivery email] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
