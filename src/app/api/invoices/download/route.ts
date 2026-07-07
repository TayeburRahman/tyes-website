import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const invoiceId = searchParams.get('id');

  if (!invoiceId) {
    return new NextResponse('Missing invoice id parameter', { status: 400 });
  }

  try {
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('invoice_url')
      .eq('id', invoiceId)
      .single();

    if (error || !invoice || !invoice.invoice_url) {
      console.error('Error fetching invoice:', error);
      return new NextResponse('Invoice not found or URL not available', { status: 404 });
    }

    // Redirect to the Stripe hosted invoice URL
    return NextResponse.redirect(invoice.invoice_url);
  } catch (error) {
    console.error('Download Invoice Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

