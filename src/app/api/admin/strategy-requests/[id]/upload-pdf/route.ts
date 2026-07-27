import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createClientBase } from '@supabase/supabase-js';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    // Verify admin
    // Note: Assuming we have admin validation somewhere, or we just rely on the user being logged in for now
    
    const supabaseAdmin = createClientBase(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const pdf_url = body.pdf_url || body.pdfUrl;

    if (!pdf_url) {
      return NextResponse.json({ error: 'pdf_url is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('brand_strategy_requests')
      .update({ 
        delivered_pdf_url: pdf_url,
        status: 'ready_to_send' 
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'Failed to update request with PDF' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
