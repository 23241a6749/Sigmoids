import twilio from 'twilio';
import nodemailer from 'nodemailer';
import { IInvoice } from '../models/Invoice.js';

// Setup Twilio
const twilioAvailable = !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER);
const twilioClient = twilioAvailable ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;

// Setup Nodemailer Ethanereal (mock testing) or real SMTP if provided
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    auth: {
        user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
        pass: process.env.SMTP_PASS || 'ethereal_password'
    }
});

export async function sendNotification(invoice: IInvoice, message: string, channel: string): Promise<string> {
    try {
        if (channel === 'whatsapp') {
            if (!twilioAvailable || !twilioClient) {
                console.log(`[Mock WhatsApp] to ${invoice.client_phone}: ${message}`);
                return 'simulated_delivered';
            }
            const fromNum = process.env.TWILIO_PHONE_NUMBER?.startsWith('whatsapp:')
                ? process.env.TWILIO_PHONE_NUMBER
                : `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`;
            const toNum = invoice.client_phone.startsWith('whatsapp:')
                ? invoice.client_phone
                : `whatsapp:${invoice.client_phone}`;

            await twilioClient.messages.create({
                body: message,
                from: fromNum,
                to: toNum
            });
            return 'delivered';

        } else if (channel === 'sms') {
            if (!twilioAvailable || !twilioClient) {
                console.log(`[Mock SMS] to ${invoice.client_phone}: ${message}`);
                return 'simulated_delivered';
            }
            const fromNumSms = process.env.TWILIO_PHONE_NUMBER?.replace('whatsapp:', '') || '';
            const toNumSms = invoice.client_phone.replace('whatsapp:', '');

            await twilioClient.messages.create({
                body: message,
                from: fromNumSms,
                to: toNumSms
            });
            return 'delivered';

        } else if (channel === 'call') {
            if (!twilioAvailable || !twilioClient) {
                console.log(`[Mock Call] to ${invoice.client_phone}: ${message}`);
                return 'simulated_delivered';
            }
            const fromNumCall = process.env.TWILIO_PHONE_NUMBER?.replace('whatsapp:', '') || '';
            const toNumCall = invoice.client_phone.replace('whatsapp:', '');

            const backendUrl = process.env.BACKEND_URL || 'https://REPLACE_WITH_NGROK_URL';

            await twilioClient.calls.create({
                twiml: `<Response><Gather input="speech" action="${backendUrl}/api/invoices/webhook/voice" timeout="4" speechTimeout="auto" language="en-IN"><Say voice="alice" language="en-IN">${message}</Say></Gather></Response>`,
                to: toNumCall,
                from: fromNumCall
            });
            return 'delivered';

        } else if (channel === 'email') {
            // For email, we expect the LLM might have put 'Subject: ...' at the start
            let subject = `Invoice Reminder: KiranaLink`;
            let textBody = message;

            if (message.toLowerCase().startsWith('subject:')) {
                const parts = message.split('\n');
                subject = parts[0].replace(/subject:/i, '').trim();
                textBody = parts.slice(1).join('\n').trim();
            }

            console.log(`[Sending Email] to ${invoice.client_email}, Subject: ${subject}`);
            // In a real hackathon lacking keys, this might fail to ethereal if the auth is totally bogus,
            // so wrap it safely.
            try {
                await transporter.sendMail({
                    from: '"KiranaLink Billing" <billing@kiranalink.in>',
                    to: invoice.client_email,
                    subject: subject,
                    text: textBody
                });
                return 'delivered';
            } catch (smtpErr) {
                console.error('[Mock Email fallback] SMTP fail, but recorded as simulated:', smtpErr);
                return 'simulated_delivered';
            }
        }

        return 'failed_unknown_channel';
    } catch (error) {
        console.error(`Error sending ${channel} notification to ${invoice.client_name}:`, error);
        return 'failed';
    }
}
