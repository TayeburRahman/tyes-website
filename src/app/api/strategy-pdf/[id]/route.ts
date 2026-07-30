import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createClientBase } from '@supabase/supabase-js';

export async function GET(
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

    const supabaseAdmin = createClientBase(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Fetch strategy request record
    const { data: request, error: reqError } = await supabaseAdmin
      .from('brand_strategy_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (reqError || !request) {
      return NextResponse.json({ error: 'Strategy request not found' }, { status: 404 });
    }

    // Security check: must be owner or admin
    const isAdmin = user.email?.toLowerCase().includes('tyes') || user.email?.toLowerCase().includes('raluca') || user.email === 'tayebur@gmail.com';
    if (request.user_id !== user.id && !isAdmin) {
      return NextResponse.json({ error: 'Access denied: You do not own this strategy deliverable' }, { status: 403 });
    }

    const rawPdfUrl = request.delivered_pdf_url;
    if (!rawPdfUrl) {
      return NextResponse.json({ error: 'PDF not delivered yet' }, { status: 404 });
    }

    // If it's a Supabase storage URL, create a short-lived Signed URL
    if (rawPdfUrl.includes('supabase') && rawPdfUrl.includes('/storage/')) {
      const parts = rawPdfUrl.split('/storage/v1/object/public/');
      if (parts.length > 1) {
        const fullPath = parts[1];
        const pathSegments = fullPath.split('/');
        const bucket = pathSegments[0];
        const path = pathSegments.slice(1).join('/');

        const { data: signedData, error: signedError } = await supabaseAdmin.storage
          .from(bucket)
          .createSignedUrl(path, 3600); // 1-hour expiry

        if (!signedError && signedData?.signedUrl) {
          return NextResponse.redirect(signedData.signedUrl);
        }
      }
    }

    // Direct redirect if already signed or external link
    return NextResponse.redirect(rawPdfUrl);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
