import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateSmartBillInvoice } from '@/utils/smartbill';
import { sendOrderConfirmationEmail } from '@/utils/email';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    // 1. Fetch the order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      console.error('Error fetching order:', orderError);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 2. Fetch the user's profile to get billing details (mocking some if missing)
    let companyName = order.customer_name || 'Client';
    let clientEmail = order.customer_email || '';

    // 3. Generate SmartBill Invoice
    let invoiceRecord = null;
    try {
      const invoiceData = await generateSmartBillInvoice({
        companyVatCode: process.env.SMARTBILL_COMPANY_VAT_CODE || '',
        client: {
          name: companyName,
          address: 'Adresa nespecificata', // Fallback
          isTaxPayer: false,
          city: 'Bucuresti', // Fallback
          county: 'Bucuresti', // Fallback
          country: 'Romania', // Fallback
          email: clientEmail
        },
        issueDate: new Date().toISOString().split('T')[0],
        isDraft: false,
        dueDate: new Date().toISOString().split('T')[0], // Same day
        deliveryDate: new Date().toISOString().split('T')[0],
        products: [
          {
            name: `Pachet Servicii: ${order.plan}`,
            code: 'SRV-01',
            isTaxIncluded: parseInt(process.env.SMARTBILL_TAX_PERCENTAGE || '19', 10) > 0,
            taxName: process.env.SMARTBILL_TAX_NAME !== undefined ? process.env.SMARTBILL_TAX_NAME : 'Normala',
            taxPercentage: parseInt(process.env.SMARTBILL_TAX_PERCENTAGE || '19', 10),
            measuringUnitName: 'buc',
            currency: 'USD',
            quantity: 1,
            price: order.revenue,
            isService: true
          }
        ]
      });

      // Insert invoice into Supabase
      const { data: invoiceInserted, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
          order_id: order.id,
          user_id: order.user_id,
          amount: order.revenue,
          status: order.revenue > 0 ? 'paid' : 'pending',
          due_date: new Date().toISOString().split('T')[0],
          smartbill_series: invoiceData.series,
          smartbill_number: invoiceData.number,
          invoice_url: invoiceData.url
        }])
        .select()
        .single();

      if (invoiceError) {
        console.error('Error saving invoice to DB:', invoiceError);
      } else {
        invoiceRecord = invoiceInserted;
      }
    } catch (smartbillError) {
      console.error('SmartBill integration error:', smartbillError);
      // We don't fail the entire request, just log the error
    }

    // 4. Send Order Confirmation Email
    try {
      await sendOrderConfirmationEmail({
        to: clientEmail,
        customerName: companyName,
        orderTitle: order.title,
        planName: order.plan,
        price: order.revenue,
        orderId: order.id,
        invoiceUrl: invoiceRecord?.invoice_url
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }

    return NextResponse.json({ success: true, invoice: invoiceRecord });
  } catch (error: any) {
    console.error('Post-payment Handler Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
