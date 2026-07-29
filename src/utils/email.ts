// Email utility – sends order confirmation emails via Resend

export interface OrderConfirmationEmailProps {
  to: string;
  customerName: string;
  orderTitle: string;
  planName: string;
  price: number;
  orderId: string;
  invoiceUrl?: string;
  taxAmount?: number;
  totalAmount?: number;
}

import { Resend } from 'resend';

export const sendOrderConfirmationEmail = async (props: OrderConfirmationEmailProps) => {
  const resendApiKey = process.env.RESEND_API_KEY;

  // Formatting helpers
  const formatMoney = (amount: number) => `$${amount.toFixed(2)}`;
  const dateStr = new Date().toISOString().split('T')[0];

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f7f6; margin: 0; padding: 40px 20px; color: #1f2937; }
        .container { max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04); }
        .header { background-color: #4ECDC4; padding: 40px; text-align: center; }
        .header p { color: #ffffff; margin: 8px 0 0; font-size: 15px; }
        .content { padding: 40px; }
        .greeting { font-size: 18px; font-weight: 600; margin-top: 0; color: #111827; }
        .text { font-size: 15px; line-height: 1.6; color: #4b5563; }
        
        .receipt-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; margin: 32px 0; }
        .receipt-title { font-size: 13px; text-transform: uppercase; font-weight: 700; color: #6b7280; letter-spacing: 0.5px; margin: 0 0 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; }
        
        .item-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
        .item-table th { text-align: left; font-size: 12px; color: #6b7280; border-bottom: 1px solid #e5e7eb; padding: 8px 0; font-weight: 600; }
        .item-table td { padding: 12px 0; border-bottom: 1px solid #e5e7eb; font-size: 14px; color: #1f2937; }
        
        .btn-wrapper { text-align: center; margin: 32px 0; }
        .btn { display: inline-block; background-color: #4ecdc4; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; }
        
        .footer { padding: 24px 40px; background: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.5; }
      </style>
    </head>
    <body>
 
      <div class="container">
        <div class="header">
           <img src="https://tyes-website-nu.vercel.app/images/tyes-logo-new.svg" alt="tyes" style="height: 28px; display: block; margin: 0 auto 8px;" />
           <img src="https://tyes-website-nu.vercel.app/images/tyes-wordmark.svg" alt="tyes" style="height: 32px; display: block; margin: 0 auto;" />
           <p>Order Confirmation</p>
        </div>
        
        <div class="content">
          <p class="greeting">Hi ${props.customerName},</p>
          <p class="text">Thank you for your order! Your request for the <strong>${props.planName}</strong> plan has been successfully processed.</p>
          
          <div class="receipt-card">
            <h3 class="receipt-title">Order Details</h3>
            
            <table class="item-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: right;">Base Price</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Service Plan: ${props.planName}</strong><br>
                    <span style="font-size: 12px; color: #6b7280;">Order Ref: ${props.orderId.slice(0, 8)}</span>
                  </td>
                  <td style="text-align: right; font-weight: 500;">${formatMoney(props.price)}</td>
                </tr>
                ${props.taxAmount !== undefined && props.taxAmount > 0 ? `
                <tr>
                  <td style="color: #6b7280; font-size: 14px; border-bottom: none;">
                    <strong>Tax/VAT</strong>
                  </td>
                  <td style="text-align: right; font-weight: 500; color: #6b7280; border-bottom: none;">${formatMoney(props.taxAmount)}</td>
                </tr>
                ` : ''}
                ${props.totalAmount !== undefined && props.totalAmount > props.price ? `
                <tr>
                  <td style="padding-top: 16px; border-top: 1px solid #e5e7eb; border-bottom: none;">
                    <strong style="font-size: 15px; color: #111827;">Total</strong>
                  </td>
                  <td style="text-align: right; font-weight: 700; font-size: 15px; color: #111827; padding-top: 16px; border-top: 1px solid #e5e7eb; border-bottom: none;">${formatMoney(props.totalAmount)}</td>
                </tr>
                ` : ''}
              </tbody>
            </table>
          </div>

          ${props.invoiceUrl ? `
            <div class="btn-wrapper">
              <a href="${props.invoiceUrl}" class="btn">View Official Invoice</a>
            </div>
            <p class="text" style="font-size: 13px; text-align: center;">Click the button above to view and download your official invoice, which includes all VAT and tax details.</p>
          ` : ''}
          
          <p class="text">We are already working on your request and will notify you as soon as there are updates.</p>
        </div>

        <div class="footer">
          <p>Tyes · hello@tyes.com<br>tyes.app</p>
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
      subject: `Order Confirmation - ${props.orderTitle}`,
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

export const sendStrategySnapshotEmail = async (props: { to: string; brandName: string; pdfUrl: string }) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Inter', -apple-system, sans-serif; background-color: #f4f7f6; margin: 0; padding: 40px 20px; color: #1f2937; }
        .container { max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04); }
        .header { background-color: #4ECDC4; padding: 40px; text-align: center; }
        .header p { color: #ffffff; margin: 8px 0 0; font-size: 15px; }
        .content { padding: 40px; text-align: center; }
        .btn { display: inline-block; background-color: #4ecdc4; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; margin-top: 24px; }
        .btn-outline { display: inline-block; background-color: transparent; color: #4ecdc4; border: 1.5px solid #4ecdc4; text-decoration: none; padding: 13px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; margin-top: 12px; }
        .footer { padding: 24px 40px; background: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
           <img src="https://tyes-website-nu.vercel.app/images/tyes-logo-new.svg" alt="tyes" style="height: 28px; display: block; margin: 0 auto 8px;" />
           <img src="https://tyes-website-nu.vercel.app/images/tyes-wordmark.svg" alt="tyes" style="height: 32px; display: block; margin: 0 auto;" />
           <p>Strategy Snapshot</p>
        </div>
        <div class="content">
          <h2 style="margin-top: 0;">Your Brand Strategy Snapshot is Ready</h2>
          <p>Hi there,</p>
          <p>We've completed the Brand Strategy Snapshot for <strong>${props.brandName}</strong>.</p>
          <p>You can view and download your PDF using the button below. Ready for the execution roadmap? Book a Deep Dive call with us!</p>
          <div style="margin-top: 24px;">
            <a href="${props.pdfUrl}" class="btn" style="margin-top: 0; margin-bottom: 12px; display: block; max-width: 250px; margin-left: auto; margin-right: auto;">View & Download PDF</a>
          </div>
        </div>
        <div class="footer">
          <p>Tyes &middot; hello@tyes.com<br>tyes.app</p>
        </div>
      </div>
    </body>
    </html>
  `;
  if (!resendApiKey) {
    console.log(`[MOCK EMAIL] To: ${props.to} | Subject: Your Brand Strategy Snapshot`);
    return { success: true, mocked: true, htmlContent };
  }
  const resend = new Resend(resendApiKey);
  return await resend.emails.send({
    from: 'Tyes <hello@tyes.app>',
    to: props.to,
    subject: `Your Brand Strategy Snapshot - ${props.brandName}`,
    html: htmlContent,
  });
};

export const sendDeepDiveNudgeEmail = async (props: { to: string; brandName: string }) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_DISCOVERY_URL || 'https://calendly.com/tayebrayhan101/client';
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Inter', -apple-system, sans-serif; background-color: #f4f7f6; margin: 0; padding: 40px 20px; color: #1f2937; }
        .container { max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04); }
        .header { background-color: #4ECDC4; padding: 40px; text-align: center; }
        .header p { color: #ffffff; margin: 8px 0 0; font-size: 15px; }
        .content { padding: 40px; text-align: center; }
        .btn { display: inline-block; background-color: #4ecdc4; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 15px; margin-top: 24px; }
        .footer { padding: 24px 40px; background: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb; }
        .footer p { margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.5; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
           <img src="https://tyes-website-nu.vercel.app/images/tyes-logo-new.svg" alt="tyes" style="height: 28px; display: block; margin: 0 auto 8px;" />
           <img src="https://tyes-website-nu.vercel.app/images/tyes-wordmark.svg" alt="tyes" style="height: 32px; display: block; margin: 0 auto;" />
           <p>Brand Strategy Deep Dive</p>
        </div>
        <div class="content">
          <h2 style="margin-top: 0;">Ready for the full playbook?</h2>
          <p>Hi there,</p>
          <p>We see massive potential for <strong>${props.brandName}</strong> based on your recent snapshot. A Brand Strategy Snapshot diagnoses the gaps, but our Deep Dive Brand Strategy actually gives you the execution roadmap.</p>
          <p>Let's talk about retail intros, viral product concepts, and how to dominate your niche.</p>
          <a href="${calendlyUrl}" class="btn">Book a Deep Dive call &rarr;</a>
        </div>
        <div class="footer">
          <p>Tyes &middot; hello@tyes.com<br>tyes.app</p>
        </div>
      </div>
    </body>
    </html>
  `;
  if (!resendApiKey) {
    console.log(`[MOCK EMAIL] To: ${props.to} | Subject: Ready for the full playbook?`);
    return { success: true, mocked: true, htmlContent };
  }
  const resend = new Resend(resendApiKey);
  return await resend.emails.send({
    from: 'Tyes <hello@tyes.app>',
    to: props.to,
    subject: `Ready for the full playbook?`,
    html: htmlContent,
  });
};

export const sendRevisionRequestEmail = async (props: { to: string; orderId: string; clientEmail: string; feedback: string }) => {
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    console.log("No RESEND_API_KEY set. Skipping email.");
    return;
  }
  
  const { Resend } = require('resend');
  const resend = new Resend(resendApiKey);

  try {
    await resend.emails.send({
      from: 'TYES <noreply@updates.tyes.com>',
      to: props.to,
      subject: `New Revision Request for Order ${props.orderId}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Revision Requested</h2>
          <p><strong>Client:</strong> ${props.clientEmail}</p>
          <p><strong>Order:</strong> ${props.orderId}</p>
          <p><strong>Feedback:</strong></p>
          <blockquote style="background: #f4f4f5; padding: 12px; border-left: 4px solid #fbb424; margin: 0;">
            ${props.feedback}
          </blockquote>
        </div>
      `,
    });
  } catch (err) {
    console.error('Failed to send revision request email:', err);
  }
};
