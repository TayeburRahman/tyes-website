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

    // 2. Fetch user profile to resolve billing details + country
    let companyName = order.customer_name || 'Client';
    let clientEmail = order.customer_email || '';
    let clientCountryCode = 'RO'; // Default to Romania (seller country)
    let clientAddress = 'Adresa nespecificata';
    let clientCity = 'Bucuresti';
    let clientCountry = 'Romania';
    let clientVatCode = '';
    let isTaxPayer = false;

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', order.user_id)
      .maybeSingle();

    if (profile) {
      // Prefer profile data; fall back to order fields
      companyName = profile.company_name || profile.first_name
        ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
        : companyName;
      clientEmail = profile.email || clientEmail;

      // Resolve country from profile, with RO as default
      clientCountryCode = profile.country || 'RO';

      if (profile.registered_address) clientAddress = profile.registered_address;
      if (profile.is_business && profile.vat_number) {
        clientVatCode = profile.vat_number;
        isTaxPayer = true;
      }

      // Use billing_email if set
      if (profile.billing_email) clientEmail = profile.billing_email;
    }

    // 3. Resolve VAT rate dynamically from country code
    const vatInfo = getVatInfo(clientCountryCode);
    clientCountry = vatInfo.name;

    // Determine if Reverse Charge applies (EU cross-border B2B)
    const isReverseCharge = vatInfo.isEU && clientCountryCode !== 'RO' && isTaxPayer;
    
    let appliedVatRate = vatInfo.rate;
    let appliedTaxName = vatInfo.taxName;
    let invoiceMentions = '';

    if (isReverseCharge) {
      appliedVatRate = 0;
      appliedTaxName = 'Scutita'; // or 'Taxare Inversa' depending on SmartBill config
      invoiceMentions = 'Reverse charge — Art. 196 Directive 2006/112/ EC';
      console.log(`[Invoice] Applied Reverse Charge for ${clientCountryCode} B2B`);
    } else {
      console.log(`[Invoice] Country: ${clientCountryCode} → VAT: ${appliedVatRate}% (${appliedTaxName})`);
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
          county: clientCity,
          country: clientCountry,
          email: clientEmail,
        },
        issueDate: new Date().toISOString().split('T')[0],
        isDraft: false,
        dueDate: new Date().toISOString().split('T')[0],
        deliveryDate: new Date().toISOString().split('T')[0],
        mentions: invoiceMentions,
        products: [
          {
            name: `Pachet Servicii: ${order.plan}`,
            code: 'SRV-01',
            isTaxIncluded: appliedVatRate > 0,
            taxName: appliedTaxName,
            taxPercentage: appliedVatRate,
            measuringUnitName: 'buc',
            currency: 'USD',
            quantity: 1,
            price: order.revenue,
            isService: true,
          },
        ],
      };

      try {
        // Attempt 1: Dynamic EU VAT
        invoiceData = await generateSmartBillInvoice(smartbillPayload);
      } catch (firstAttemptError: any) {
        if (firstAttemptError.message && firstAttemptError.message.includes('Cota tva')) {
          console.warn('[Invoice] SmartBill rejected the dynamic VAT rate. Falling back to .env settings...');
          
          const fallbackVatRate = parseInt(process.env.SMARTBILL_TAX_PERCENTAGE || '0', 10);
          const fallbackTaxName = process.env.SMARTBILL_TAX_NAME || 'SFDD';
          
          smartbillPayload.products[0].isTaxIncluded = fallbackVatRate > 0;
          smartbillPayload.products[0].taxPercentage = fallbackVatRate;
          smartbillPayload.products[0].taxName = fallbackTaxName;
          
          // Update the applied VAT so the Email Receipt matches the fallback invoice!
          appliedVatRate = fallbackVatRate; 
          
          // Attempt 2: Fallback VAT
          invoiceData = await generateSmartBillInvoice(smartbillPayload);
        } else {
          throw firstAttemptError;
        }
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
        vatRate: appliedVatRate,
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
