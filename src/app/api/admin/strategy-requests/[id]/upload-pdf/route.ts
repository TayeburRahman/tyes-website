import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

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

    const body = await req.json();
    const { pdf_url } = body;

    if (!pdf_url) {
      return NextResponse.json({ error: 'pdf_url is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('brand_strategy_requests')
      .update({ 
        delivered_pdf_url: pdf_url,
        status: 'ready' // Usually changes to ready after uploading PDF
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
