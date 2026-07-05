import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateSmartBillInvoice } from '@/utils/smartbill';
import { sendOrderConfirmationEmail } from '@/utils/email';
import { getVatInfo } from '@/utils/eu-vat-rates';

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

    // 2. Fetch user profile to resolve billing details
    let companyName = order.customer_name || 'Client';
    let clientEmail = order.customer_email || '';
    
    // Read billing details from the order payload first (single source of truth for this invoice)
    const bd = order.attachments?.billing_details;
    let clientAddress = bd?.address || 'Adresa nespecificata';
    let clientCity = bd?.city || 'Bucuresti';
    let clientCounty = bd?.county || 'Bucuresti';
    
    if (bd && bd.is_business && bd.company) {
      companyName = bd.company;
    }

    // We strictly use the VAT details stored on the order (single source of truth)
    const clientCountryCode = bd?.country || order.vat_country || 'RO';
    const clientVatCode = order.vat_number || '';
    const isTaxPayer = !!clientVatCode;
    const vatRate = parseFloat(order.vat_rate) || 21;
    const vatMode = order.vat_mode || 'DOMESTIC';
    const viesConsultationId = order.vies_consultation_id || '';
    
    // In SmartBill, the country name needs to be provided.
    // Map the 2-letter ISO code to the full country name.
    let clientCountry = getVatInfo(clientCountryCode).name || 'Romania';

    // Fallback to profile for email if not present
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', order.user_id)
      .maybeSingle();

    if (profile) {
      clientEmail = profile.billing_email || profile.email || clientEmail;
      
      // If billing details were somehow missing from order, try to fall back to profile
      if (!bd?.address && profile.registered_address) clientAddress = profile.registered_address;
      if (!bd?.company && profile.company_name) companyName = profile.company_name;
    }

    // 3. Resolve exact SmartBill fields from the order's VAT state
    let appliedTaxName = 'Normala';
    let invoiceLanguage = clientCountryCode === 'RO' ? 'RO' : 'EN';
    let invoiceMentions = '';
    let isReverseCharge = false;

    if (vatMode === 'EU_B2B_RC' || (vatMode === 'NON_EU' && vatRate === 0)) {
      appliedTaxName = 'Taxare inversa';
    }

    if (vatMode === 'EU_B2B_RC') {
      isReverseCharge = true;
      invoiceMentions = 'Reverse charge — Art. 196 Directive 2006/112/EC';
      if (viesConsultationId) {
        invoiceMentions += ` (VIES Consultation ID: ${viesConsultationId})`;
      }
      console.log(`[Invoice] Applied Reverse Charge for ${clientCountryCode} B2B`);
    } else {
      console.log(`[Invoice] Country: ${clientCountryCode} → VAT: ${vatRate}% (${appliedTaxName})`);
    }

    // 4. Generate SmartBill Invoice
    let invoiceRecord = null;
    let invoiceData = null;
    try {
      const smartbillPayload = {
        companyVatCode: process.env.SMARTBILL_COMPANY_VAT_CODE || '',
        client: {
          name: companyName,
          address: clientAddress,
          isTaxPayer,
          vatCode: clientVatCode || undefined,
          city: clientCity,
          county: clientCounty,
          country: clientCountry,
          email: clientEmail,
        },
        issueDate: new Date().toISOString().split('T')[0],
        isDraft: false,
        dueDate: new Date().toISOString().split('T')[0],
        deliveryDate: new Date().toISOString().split('T')[0],
        mentions: invoiceMentions,
        language: invoiceLanguage,
        products: [
          {
            name: `Pachet Servicii: ${order.plan}`,
            code: 'SRV-01',
            isTaxIncluded: vatRate > 0,
            taxName: appliedTaxName,
            taxPercentage: vatRate,
            measuringUnitName: 'buc',
            currency: 'USD',
            quantity: 1,
            price: order.revenue,
            isService: true,
          },
        ],
      };

      try {
        invoiceData = await generateSmartBillInvoice(smartbillPayload);
      } catch (firstAttemptError: any) {
        console.error('[Invoice] SmartBill error:', firstAttemptError.message);
        throw firstAttemptError;
      }

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
          invoice_url: invoiceData.url,
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
    }

    // 5. Send Order Confirmation Email
    try {
      await sendOrderConfirmationEmail({
        to: clientEmail,
        customerName: companyName,
        orderTitle: order.title,
        planName: order.plan,
        price: order.revenue,
        orderId: order.id,
        invoiceUrl: invoiceRecord?.invoice_url,
        // Compliance fields for modern receipt email
        invoiceNumber: invoiceRecord?.smartbill_series && invoiceRecord?.smartbill_number 
          ? `${invoiceRecord.smartbill_series}-${invoiceRecord.smartbill_number}` 
          : undefined,
        issueDate: new Date().toISOString().split('T')[0],
        buyerAddress: clientAddress,
        buyerVatCode: clientVatCode || undefined,
        vatRate: vatRate,
        isReverseCharge: isReverseCharge
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
