import { Router, Request, Response } from 'express';
import { Invoice } from '../models/Invoice.js';
import { CustomerAccount } from '../models/CustomerAccount.js';
import { classifyIntent, Intent } from '../services/intentClassifier.js';
import { sendGenericMessage } from '../services/communicationService.js';
import { appendToHistory, getHistory, clearHistory } from '../services/conversationMemory.js';
import OpenAI from 'openai';

export const invoiceWebhooksRouter = Router();

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Auto-resolve Khata balance when an invoice is marked paid
// ─────────────────────────────────────────────────────────────────────────────
async function syncKhataOnPayment(invoice: any) {
    try {
        const phone = invoice.client_phone.replace('whatsapp:', '');
        // Find all CustomerAccounts that match this phone number and reduce their balance
        const { Customer } = await import('../models/Customer.js');
        const customer = await Customer.findOne({
            phoneNumber: { $regex: new RegExp(phone.slice(-10) + '$') }
        });
        if (customer) {
            await CustomerAccount.updateMany(
                { customerId: customer._id, balance: { $gt: 0 } },
                { $inc: { balance: -invoice.amount } }  // Reduce balance (floor at 0 handled by business logic)
            );
            console.log(`[AgentWorkflow] Khata balance synced for ${invoice.client_name}, reduced by ₹${invoice.amount}`);
        }
    } catch (e) {
        console.error('[AgentWorkflow] Khata sync error:', e);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: Post-call WhatsApp follow-up with UPI payment link
// ─────────────────────────────────────────────────────────────────────────────
async function sendWhatsAppFollowUp(invoice: any) {
    const paymentLink = invoice.payment_link || `https://kiranalink.in/pay/${invoice.invoice_id}`;
    const upiUrl = `upi://pay?pa=kiranalink@oksbi&pn=KiranaLink Shop&am=${invoice.amount}&cu=INR&tn=Invoice+${invoice.invoice_id}`;
    const message = `Hi ${invoice.client_name}! 🙏\nThanks for talking with us.

As discussed, here's your payment link for *₹${invoice.amount}*:

💳 *Pay via UPI:*\n${upiUrl}

Or use this link: ${paymentLink}

_This is an automated reminder from your local KiranaLink store._`;

    await sendGenericMessage(invoice.client_phone, message, 'whatsapp');
    console.log(`[AgentWorkflow] WhatsApp follow-up sent to ${invoice.client_name}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// TWILIO: SMS / WhatsApp Text Reply Webhook
// Customer replies to SMS/WhatsApp → AI classifies intent → takes action
// ─────────────────────────────────────────────────────────────────────────────
invoiceWebhooksRouter.post('/reply', async (req: Request, res: Response) => {
    try {
        const { From, Body } = req.body;
        if (!From || !Body) {
            res.status(400).send('Missing Twilio payload.');
            return;
        }

        const cleanPhone = From.replace('whatsapp:', '');
        const invoice = await Invoice.findOne({
            client_phone: { $regex: new RegExp(cleanPhone.slice(-10) + '$') },
            status: { $in: ['unpaid', 'overdue'] }
        });

        if (!invoice) {
            console.log(`[Webhook Reply] No active invoice for ${cleanPhone}`);
            res.status(200).send('<Response></Response>');
            return;
        }

        const intent: Intent = await classifyIntent(Body);
        console.log(`[Webhook Reply] ${invoice.client_name} said "${Body}" → Intent: ${intent}`);

        let agentResponse = '';

        if (intent === 'PAYMENT_PROMISED') {
            // Set status to 'promised' — pauses the scheduler for 24 hours
            invoice.status = 'promised';
            invoice.last_contacted_at = new Date();
            invoice.reminder_history.push({
                timestamp: new Date(),
                channel: 'customer_reply',
                message_content: `[PROMISED TO PAY] "${Body}"`,
                delivery_status: 'received'
            });
            agentResponse = `Thank you ${invoice.client_name}! Your payment promise has been noted. We will send you a reminder tomorrow. Please pay by then! 🙏`;
            await sendGenericMessage(cleanPhone, agentResponse, 'whatsapp');
        }

        else if (intent === 'EXTENSION_REQUESTED') {
            // Grant a 3-day extension — update due_date in the invoice
            const newDueDate = new Date();
            newDueDate.setDate(newDueDate.getDate() + 3);
            invoice.due_date = newDueDate;
            invoice.reminder_level = Math.max(0, invoice.reminder_level - 1); // Allow re-escalation
            invoice.reminder_history.push({
                timestamp: new Date(),
                channel: 'customer_reply',
                message_content: `[EXTENSION GRANTED — 3 days] "${Body}"`,
                delivery_status: 'received'
            });
            agentResponse = `We understand ${invoice.client_name}. We have extended your payment deadline by *3 days* (until ${newDueDate.toLocaleDateString('en-IN')}). Please make sure to pay by then! ₹${invoice.amount} is pending.`;
            await sendGenericMessage(cleanPhone, agentResponse, 'whatsapp');
        }

        else if (intent === 'DISPUTE') {
            // Flag the invoice — stop automated reminders, escalate to human
            invoice.status = 'disputed' as any;
            invoice.reminder_history.push({
                timestamp: new Date(),
                channel: 'customer_reply',
                message_content: `[DISPUTE RAISED] "${Body}"`,
                delivery_status: 'received'
            });
            agentResponse = `We apologize for the inconvenience ${invoice.client_name}! Your dispute has been logged and our team will review it within 24 hours. Automated reminders are now paused. 🙏`;
            await sendGenericMessage(cleanPhone, agentResponse, 'whatsapp');
        }

        else {
            // Unknown — send a helpful nudge
            const paymentLink = invoice.payment_link || `https://kiranalink.in/pay/${invoice.invoice_id}`;
            agentResponse = `Hi ${invoice.client_name}! You have a pending balance of *₹${invoice.amount}*. To pay: ${paymentLink}\n\nReply *PAY* to get UPI link or *LATER* for an extension.`;
            await sendGenericMessage(cleanPhone, agentResponse, 'whatsapp');
            invoice.reminder_history.push({
                timestamp: new Date(),
                channel: 'customer_reply',
                message_content: `[UNKNOWN] "${Body}"`,
                delivery_status: 'received'
            });
        }

        await invoice.save();
        res.status(200).send('<Response></Response>');

    } catch (error) {
        console.error('Invoice Webhook Reply Error:', error);
        res.status(500).send('Server Error');
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// TWILIO: Voice Call Webhook (multi-turn, memory-aware)
// Customer speaks → GPT-4o-mini with history → responds, tracks intent
// On call end → WhatsApp follow-up + Khata sync (if paid)
// ─────────────────────────────────────────────────────────────────────────────
invoiceWebhooksRouter.post('/voice', async (req: Request, res: Response) => {
    res.type('text/xml');
    try {
        const { To, From, SpeechResult } = req.body;

        let targetPhone = From;
        if (From === process.env.TWILIO_PHONE_NUMBER?.replace('whatsapp:', '')) {
            targetPhone = To;
        }

        const backendUrl = process.env.BACKEND_URL || 'https://REPLACE_WITH_NGROK_URL';
        const buildTwiml = (text: string) =>
            `<Response><Gather input="speech" action="${backendUrl}/api/invoices/webhook/voice" timeout="4" speechTimeout="auto" language="en-IN" enhanced="true" speechModel="phone_call" profanityFilter="false" hints="pay, tomorrow, Friday, today, next week, wait, cash, UPI, salary, later, done, sent, clear"><Say voice="alice" language="en-IN">${text}</Say></Gather></Response>`;

        if (!SpeechResult) {
            return res.send(buildTwiml("Hello? I can't hear you clearly. Are you there?"));
        }

        const isOR = (process.env.OPENAI_API_KEY || '').startsWith('sk-or');
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
            ...(isOR ? { baseURL: 'https://openrouter.ai/api/v1' } : {})
        });

        // Find active invoice
        const invoice = await Invoice.findOne({
            client_phone: { $regex: new RegExp(targetPhone.replace('+', '\\+').slice(-10) + '$') },
            status: { $in: ['unpaid', 'overdue'] }
        });

        if (!invoice) {
            return res.send(`<Response><Say voice="alice" language="en-IN">Thank you for calling. Goodbye.</Say><Hangup/></Response>`);
        }

        // 1. Classify customer intent FIRST (in parallel with building response)
        const intentPromise = classifyIntent(SpeechResult);

        // 2. Build multi-turn history
        const invoiceId = invoice.invoice_id;
        const history = getHistory(invoiceId);

        const systemPrompt = `You are a Kirana shop owner in India collecting a debt via phone call. You are talking to ${invoice.client_name} about a pending amount of rupees ${invoice.amount}.
Be polite, friendly, and firm. Talk in short 1-2 sentences like a real Indian shopkeeper.
If they promise to pay, say "Okay ${invoice.client_name}, noted. Please pay soon. Thank you, goodbye!" and include the word END_CALL.
If they ask for extension, say "Okay, I will give you 3 more days. But please pay then!" and include END_CALL.
If they dispute the bill, say "I understand. I will check and call you back." and include END_CALL.
Current date: ${new Date().toDateString()}. Due date was: ${invoice.due_date.toDateString()}.
Do NOT use rupee symbol, emojis, or special characters.`;

        // Append their speech to history
        appendToHistory(invoiceId, 'user', SpeechResult);

        const messages = [
            { role: 'system' as const, content: systemPrompt },
            ...history
        ];

        const response = await openai.chat.completions.create({
            model: isOR ? 'openai/gpt-4o-mini' : 'gpt-4o-mini',
            messages,
            max_tokens: 80,
            temperature: 0.65,
        });

        let aiReply = response.choices[0].message?.content || 'Please pay your dues. Thank you. END_CALL';

        // Append AI reply to history
        appendToHistory(invoiceId, 'assistant', aiReply);

        // Check for conversation end
        const shouldEnd = aiReply.includes('END_CALL');
        aiReply = aiReply.replace('END_CALL', '').trim();

        // Sanitize for TwiML XML
        const safeReply = aiReply
            .replace(/&/g, ' and ')
            .replace(/</g, '')
            .replace(/>/g, '')
            .replace(/₹/g, 'rupees ')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');

        // Wait for intent classification result
        const intent = await intentPromise;
        console.log(`[Voice Webhook] ${invoice.client_name}: "${SpeechResult}" → Intent: ${intent}`);

        // Log conversation turn
        invoice.reminder_history.push({
            timestamp: new Date(),
            channel: 'voice_call',
            message_content: `[Customer]: ${SpeechResult} | [Agent]: ${aiReply} | [Intent: ${intent}]`,
            delivery_status: 'delivered'
        });

        if (shouldEnd) {
            // Clear conversation memory
            clearHistory(invoiceId);

            // Handle intent-based actions
            if (intent === 'PAYMENT_PROMISED') {
                invoice.reminder_history.push({
                    timestamp: new Date(),
                    channel: 'system',
                    message_content: '[AUTO] Customer promised payment. Sending WhatsApp payment link.',
                    delivery_status: 'delivered'
                });
                // Send WhatsApp follow-up after call ends
                setImmediate(async () => {
                    await sendWhatsAppFollowUp(invoice);
                });
            } else if (intent === 'DISPUTE') {
                invoice.status = 'disputed' as any;
            } else if (intent === 'EXTENSION_REQUESTED') {
                const extDate = new Date();
                extDate.setDate(extDate.getDate() + 3);
                invoice.due_date = extDate;
                invoice.reminder_level = Math.max(0, invoice.reminder_level - 1);
                invoice.reminder_history.push({
                    timestamp: new Date(),
                    channel: 'system',
                    message_content: `[AUTO] Extension granted. New due date: ${extDate.toDateString()}`,
                    delivery_status: 'delivered'
                });
            }

            await invoice.save();
            return res.send(`<Response><Say voice="alice" language="en-IN">${safeReply}</Say><Hangup/></Response>`);
        }

        await invoice.save();
        return res.send(buildTwiml(safeReply));

    } catch (e) {
        console.error('Voice Webhook Error:', e);
        return res.send(`<Response><Say voice="alice">Sorry, technical issue. Goodbye.</Say><Hangup/></Response>`);
    }
});
