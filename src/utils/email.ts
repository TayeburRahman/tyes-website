// This is a placeholder for the Resend email system
// You can later implement this using the 'resend' npm package

export interface OrderConfirmationEmailProps {
  to: string;
  customerName: string;
  orderTitle: string;
  planName: string;
  price: number;
  orderId: string;
  invoiceUrl?: string;

  // New compliance fields
  invoiceNumber?: string;
  issueDate?: string;
  buyerAddress?: string;
  buyerVatCode?: string;
  vatRate?: number;
  isReverseCharge?: boolean;
}

import { Resend } from 'resend';

export const sendOrderConfirmationEmail = async (props: OrderConfirmationEmailProps) => {
  const resendApiKey = process.env.RESEND_API_KEY;

  // Calculate totals
  const total = props.price;
  let vatRateStr = props.vatRate ? `${props.vatRate}%` : '0%';
  let vatAmount = 0;
  let subtotal = total;

  if (props.vatRate && props.vatRate > 0 && !props.isReverseCharge) {
    // If tax is included in the final price:
    subtotal = total / (1 + (props.vatRate / 100));
    vatAmount = total - subtotal;
  } else if (props.isReverseCharge) {
    vatRateStr = '0% (Reverse Charge)';
  }

  // Formatting helpers
  const formatMoney = (amount: number) => `$${amount.toFixed(2)}`;
  const dateStr = props.issueDate || new Date().toISOString().split('T')[0];
  const invNumberStr = props.invoiceNumber || `INV-${props.orderId.slice(0, 8).toUpperCase()}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 40px 20px; color: #1f2937; }
        .container { max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04); }
        .header { background-color: #111827; padding: 40px; text-align: center; }
        .header h1 { color: #4ecdc4; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { color: #9ca3af; margin: 8px 0 0; font-size: 15px; }
        .content { padding: 40px; }
        .greeting { font-size: 18px; font-weight: 600; margin-top: 0; color: #111827; }
        .text { font-size: 15px; line-height: 1.6; color: #4b5563; }
        
        .receipt-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin: 32px 0; }
        .receipt-title { font-size: 13px; text-transform: uppercase; font-weight: 700; color: #6b7280; letter-spacing: 0.5px; margin: 0 0 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; }
        
        .flex-row { display: table; width: 100%; margin-bottom: 24px; }
        .col-half { display: table-cell; width: 50%; vertical-align: top; }
        
        .info-label { font-size: 11px; text-transform: uppercase; color: #9ca3af; font-weight: 600; margin: 0 0 4px; }
        .info-val { font-size: 13px; color: #374151; margin: 0 0 12px; line-height: 1.4; }
        
        .item-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .item-table th { text-align: left; font-size: 12px; color: #6b7280; border-bottom: 1px solid #e5e7eb; padding: 8px 0; font-weight: 600; }
        .item-table td { padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #1f2937; }
        
        .totals { width: 100%; text-align: right; }
        .totals td { padding: 4px 0; font-size: 14px; color: #4b5563; }
        .totals .total-row td { font-size: 18px; font-weight: 700; color: #111827; padding-top: 12px; }
        
        .reverse-charge { margin-top: 24px; padding: 12px; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; font-size: 12px; color: #92400e; text-align: center; }
        
        .btn-wrapper { text-align: center; margin: 32px 0; }
        .btn { display: inline-block; background-color: #4ecdc4; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; }
        
        .footer { padding: 24px 40px; background: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.5; }
      </style>
    </head>
    <body>

      <div class="container">
        <div class="header">
           <img src="https://tyes-website-nu.vercel.app/images/tyes-wordmark.svg" alt="tyes" style="height: 32px; display: block; margin: 0 auto;" />
                  <img src="https://tyes-website-nu.vercel.app/images/tyes-logo-new.svg" alt="Tyes Logo" style="height: 40px; margin-bottom: 16px;" />

           <p>Order Confirmation & Receipt</p>
        </div>
        
        <div class="content">
          <p class="greeting">Hi ${props.customerName},</p>
          <p class="text">Thank you for your order! Your request for the <strong>${props.planName}</strong> plan has been successfully processed.</p>
          
          <div class="receipt-card">
            <h3 class="receipt-title">Invoice / Receipt Details</h3>
            
            <div class="flex-row">
              <div class="col-half">
                <p class="info-label">Seller</p>
                <p class="info-val">
                  <strong>Tyes SRL</strong><br>
                  Str. Principala, Bucuresti, RO<br>
                  VAT: ${process.env.SMARTBILL_COMPANY_VAT_CODE || 'RO12345678'}
                </p>
              </div>
              <div class="col-half">
                <p class="info-label">Buyer</p>
                <p class="info-val">
                  <strong>${props.customerName}</strong><br>
                  ${props.buyerAddress || 'N/A'}<br>
                  ${props.buyerVatCode ? `VAT: ${props.buyerVatCode}` : ''}
                </p>
              </div>
            </div>

            <div class="flex-row" style="margin-bottom: 12px;">
              <div class="col-half">
                <p class="info-label">Invoice Number</p>
                <p class="info-val" style="font-weight: 600;">${invNumberStr}</p>
              </div>
              <div class="col-half">
                <p class="info-label">Issue Date</p>
                <p class="info-val">${dateStr}</p>
              </div>
            </div>

            <table class="item-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Service Plan: ${props.planName}</strong><br>
                    <span style="font-size: 12px; color: #6b7280;">Order Ref: ${props.orderId.slice(0, 8)}</span>
                  </td>
                  <td style="text-align: right; font-weight: 500;">${formatMoney(subtotal)}</td>
                </tr>
              </tbody>
            </table>

            <table class="totals" style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="width: 70%;">Subtotal</td>
                <td style="text-align: right;">${formatMoney(subtotal)}</td>
              </tr>
              <tr>
                <td>VAT (${vatRateStr})</td>
                <td style="text-align: right;">${formatMoney(vatAmount)}</td>
              </tr>
              <tr class="total-row">
                <td>Total</td>
                <td style="text-align: right;">${formatMoney(total)}</td>
              </tr>
            </table>

            ${props.isReverseCharge ? `
              <div class="reverse-charge">
                <strong>Reverse charge — Art. 196 Directive 2006/112/ EC</strong>
              </div>
            ` : ''}
          </div>

          ${props.invoiceUrl ? `
            <div class="btn-wrapper">
              <a href="${props.invoiceUrl}" class="btn">Download PDF Invoice</a>
            </div>
          ` : ''}
          
          <p class="text">We are already working on your request and will notify you as soon as there are updates.</p>
        </div>

        <div class="footer">
          <p>Tyes SRL<br>This electronic receipt is generated automatically.<br>Your official PDF invoice is stored securely in our systems for 10 years in compliance with EU regulations.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (!resendApiKey) {
    console.log(`[MOCK EMAIL] To: ${props.to} | Subject: Order Confirmation for ${props.orderTitle}`);
    return { success: true, mocked: true, htmlContent };
  }

  try {
    const resend = new Resend(resendApiKey);
    const { data, error } = await resend.emails.send({
      from: 'Tyes <hello@tyes.app>',
      to: props.to,
      subject: `Order Confirmation & Receipt - ${props.orderTitle}`,
      html: htmlContent,
    });

    if (error) {
      console.error('Error sending email via Resend:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error sending email:', err);
    return { success: false, error: err };
  }
};
