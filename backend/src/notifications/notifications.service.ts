import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class NotificationsService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly logger = new Logger(NotificationsService.name);

  constructor() {
    this.initTransporter();
  }

  private initTransporter() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT) || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log(`Nodemailer SMTP Transporter initialized: ${host}:${port}`);
    } else {
      this.logger.warn('SMTP credentials missing in environment. Email notifications will run in MOCK mode (printed to console).');
    }
  }

  private async sendMail(options: nodemailer.SendMailOptions) {
    const from = process.env.SMTP_FROM || '"Diya Creation" <no-reply@diyacreation.com>';
    const mailOptions = { from, ...options };

    if (this.transporter) {
      try {
        const info = await this.transporter.sendMail(mailOptions);
        this.logger.log(`Email successfully sent to ${mailOptions.to}. Message ID: ${info.messageId}`);
        return info;
      } catch (error) {
        this.logger.error(`Failed to send email to ${mailOptions.to}`, error);
        throw error;
      }
    } else {
      // Mock execution (helpful for local development)
      this.logger.log('--- [MOCK MAIL SENDING] ---');
      this.logger.log(`TO: ${mailOptions.to}`);
      this.logger.log(`SUBJECT: ${mailOptions.subject}`);
      this.logger.log(`CONTENT: ${mailOptions.text || '(HTML Content)'}`);
      this.logger.log('---------------------------');
      return { messageId: 'mock-id-' + Date.now() };
    }
  }

  // 1. Order Confirmation Email
  async sendOrderConfirmation(email: string, order: any) {
    const itemsList = order.items
      .map((item: any) => `- ${item.product?.name || 'Chocolate creation'} (Qty: ${item.quantity})`)
      .join('\n');

    const subject = `Order Confirmed - #${order.orderNumber}`;
    const text = `Dear Customer,

Thank you for shopping with Diya Creation. Your premium 3D customized order has been received and confirmed.

Order Details:
Order Number: ${order.orderNumber}
Total Amount: Rs. ${order.totalAmount.toFixed(2)}
Payment Status: ${order.payments?.[0]?.status || 'SUCCESS'}

Items Ordered:
${itemsList}

We will notify you once your hand-crafted package is shipped.

Warm regards,
The Diya Creation Team`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #d4af37; border-radius: 8px; background-color: #080808; color: #f5f5f5;">
        <h2 style="color: #d4af37; font-family: 'Georgia', serif; text-align: center; border-bottom: 1px solid rgba(212, 175, 55, 0.2); padding-bottom: 15px;">Order Confirmed</h2>
        <p>Dear Customer,</p>
        <p>Thank you for shopping with <strong>Diya Creation</strong>. Your premium 3D customized order has been received and confirmed.</p>
        
        <div style="background-color: #121212; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #d4af37;">
          <h3 style="color: #d4af37; margin-top: 0;">Order Summary</h3>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Order Number:</strong> ${order.orderNumber}</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Total Amount:</strong> Rs. ${order.totalAmount.toFixed(2)}</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Payment Status:</strong> <span style="color: #4ade80;">${order.payments?.[0]?.status || 'SUCCESS'}</span></p>
        </div>

        <h4 style="color: #d4af37; margin-bottom: 10px;">Items Ordered:</h4>
        <ul style="padding-left: 20px; font-size: 14px; line-height: 1.6;">
          ${order.items.map((item: any) => `<li><strong>${item.product?.name || 'Chocolate'}</strong> (Qty: ${item.quantity})</li>`).join('')}
        </ul>

        <p style="font-size: 13px; color: #a3a3a3; margin-top: 25px;">We will email you the tracking details as soon as your hand-crafted gifts leave our studio.</p>
        
        <footer style="margin-top: 30px; border-top: 1px solid rgba(212, 175, 55, 0.1); padding-top: 15px; font-size: 12px; text-align: center; color: #737373;">
          &copy; ${new Date().getFullYear()} Diya Creation. All rights reserved.
        </footer>
      </div>
    `;

    return this.sendMail({ to: email, subject, text, html });
  }

  // 2. Shipment Tracking Details Email
  async sendShipmentTracking(email: string, order: any, shipment: any) {
    const subject = `Your Diya Creation Order has Shipped - #${order.orderNumber}`;
    const text = `Dear Customer,

Great news! Your premium order #${order.orderNumber} has been shipped and is on its way.

Shipping details:
Carrier: ${shipment.carrier}
Tracking Number: ${shipment.trackingNumber}
AWB: ${shipment.awb}

You can track your delivery on our portal using your order number: #${order.orderNumber}

Warm regards,
The Diya Creation Team`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #d4af37; border-radius: 8px; background-color: #080808; color: #f5f5f5;">
        <h2 style="color: #d4af37; font-family: 'Georgia', serif; text-align: center; border-bottom: 1px solid rgba(212, 175, 55, 0.2); padding-bottom: 15px;">Your Order Has Shipped</h2>
        <p>Dear Customer,</p>
        <p>Exciting news! Your hand-crafted treats and customized keepsakes from order <strong>#${order.orderNumber}</strong> are on their way to you.</p>
        
        <div style="background-color: #121212; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #d4af37;">
          <h3 style="color: #d4af37; margin-top: 0;">Delivery Information</h3>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Logistics Partner:</strong> ${shipment.carrier}</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>AWB / Tracking ID:</strong> <span style="font-family: monospace; color: #d4af37;">${shipment.trackingNumber}</span></p>
        </div>

        <p style="font-size: 13px; color: #a3a3a3;">You can track this shipment in real-time on our website by entering your order number on the tracking page.</p>
        
        <footer style="margin-top: 30px; border-top: 1px solid rgba(212, 175, 55, 0.1); padding-top: 15px; font-size: 12px; text-align: center; color: #737373;">
          &copy; ${new Date().getFullYear()} Diya Creation. All rights reserved.
        </footer>
      </div>
    `;

    return this.sendMail({ to: email, subject, text, html });
  }

  // 3. Corporate Quote Published Email
  async sendCorporateQuote(email: string, companyName: string, quote: any) {
    const subject = `Bespoke Corporate Quotation - #${quote.quoteNumber}`;
    const text = `Dear ${companyName} Team,

Thank you for contacting Diya Creation for your bespoke corporate gifting requirements.

We are pleased to present our quotation:
Quote Number: ${quote.quoteNumber}
Total Amount: Rs. ${quote.totalAmount.toFixed(2)}
Valid Until: ${new Date(quote.validUntil).toLocaleDateString()}

Our team will follow up shortly to discuss options and timeline adjustments.

Warm regards,
Corporate Sales Team
Diya Creation`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #d4af37; border-radius: 8px; background-color: #080808; color: #f5f5f5;">
        <h2 style="color: #d4af37; font-family: 'Georgia', serif; text-align: center; border-bottom: 1px solid rgba(212, 175, 55, 0.2); padding-bottom: 15px;">Corporate Gifting Proposal</h2>
        <p>Dear ${companyName} Gifting Team,</p>
        <p>Thank you for expressing interest in <strong>Diya Creation</strong> for your corporate hampers and customized corporate branding requirements.</p>
        
        <div style="background-color: #121212; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #d4af37;">
          <h3 style="color: #d4af37; margin-top: 0;">Quotation Overview</h3>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Quotation Number:</strong> ${quote.quoteNumber}</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Proposed Total:</strong> Rs. ${quote.totalAmount.toFixed(2)}</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Validity Date:</strong> ${new Date(quote.validUntil).toLocaleDateString()}</p>
        </div>

        <p style="font-size: 13px; color: #a3a3a3;">One of our corporate account managers will get in touch with you shortly to coordinate sample deliveries and scheduling.</p>
        
        <footer style="margin-top: 30px; border-top: 1px solid rgba(212, 175, 55, 0.1); padding-top: 15px; font-size: 12px; text-align: center; color: #737373;">
          &copy; ${new Date().getFullYear()} Diya Creation. All rights reserved.
        </footer>
      </div>
    `;

    return this.sendMail({ to: email, subject, text, html });
  }
}
