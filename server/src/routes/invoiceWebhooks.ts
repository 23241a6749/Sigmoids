import { Router, Request, Response } from 'express';
import { Invoice } from '../models/Invoice.js';
import { classifyIntent } from '../services/intentClassifier.js';
import OpenAI from 'openai';

export const invoiceWebhooksRouter = Router();

// Twilio webhook endpoint for incoming SMS or WhatsApp replies
invoiceWebhooksRouter.post('/reply', async (req: Request, res: Response) => {
    try {
        const { From, Body } = req.body;

        if (!From || !Body) {
            res.status(400).send('Missing Twilio payload formatting.');
            return;
        }

        // Clean WhatsApp prefix if it exists 'whatsapp:+1234567890' -> '+1234567890'
        let cleanPhone = From.replace('whatsapp:', '');

        // Find an active invoice for this phone number. 
        // We match unpaid or overdue natively since if it's paid, we don't care about their reply stopping the bot.
        const invoice = await Invoice.findOne({
            client_phone: cleanPhone,
            status: { $in: ['unpaid', 'overdue'] }
        });

        if (!invoice) {
            console.log(`[Webhook] No active invoice found for sender ${cleanPhone}. Ignoring reply.`);
            res.status(200).send('<Response></Response>'); // Acknowledge Twilio cleanly
            return;
        }

        // Classify what they said
        const intent = await classifyIntent(Body);
        console.log(`[Webhook] Message from ${cleanPhone} categorized as: ${intent}`);

        // Handle business rules based on intent
        let replySimulation = '';
        if (intent === 'PAYMENT_PROMISED') {
            invoice.status = 'paid'; // Or 'promised' if you expanded the enum, but for Hackathon stopping it via 'paid' or a new status is safest. 
            // We'll just pause escalations by artificially resetting the due date slightly, or in our schema we can just assume 'Unknown' if we haven't added generic 'paused'
            // For simplicity, let's mark the 'reminder_level' artificially high or add a note so it's visible.
            replySimulation = 'Thanks for promising payment! We will pause automated reminders.';
        } else if (intent === 'DISPUTE') {
            replySimulation = 'A human agent has been notified about your query.';
        } else if (intent === 'EXTENSION_REQUESTED') {
            replySimulation = 'We will review your extension request.';
        }

        // Append to history natively
        invoice.reminder_history.push({
            timestamp: new Date(),
            channel: 'customer_reply',
            message_content: `(Intent: ${intent}) ${Body}`,
            delivery_status: 'received'
        });

        await invoice.save();
        res.status(200).send('<Response></Response>'); // Respond to Twilio

    } catch (error) {
        console.error('Invoice Webhook Processing Error:', error);
        res.status(500).send('Server Error');
    }
});

// Twilio Voice Webhook for real-time conversation via <Gather>
invoiceWebhooksRouter.post('/voice', async (req: Request, res: Response) => {
    res.type('text/xml');
    try {
        const { To, From, SpeechResult } = req.body;
        // The From number during an active call is the customer, but we can also check To
        let targetPhone = From;
        if (From === process.env.TWILIO_PHONE_NUMBER?.replace('whatsapp:', '')) {
            targetPhone = To; // If Twilio is 'From' (sometimes flip-flops on outbound webhooks)
        }

        const backendUrl = process.env.BACKEND_URL || 'https://REPLACE_WITH_NGROK_URL';
        const buildTwiml = (text: string) => `<Response><Gather input="speech" action="${backendUrl}/api/invoices/webhook/voice" timeout="3" speechTimeout="auto" language="en-IN"><Say voice="alice" language="en-IN">${text}</Say></Gather></Response>`;

        // If they didn't say anything or missed it
        if (!SpeechResult) {
            return res.send(buildTwiml("I didn't hear that. Are you there?"));
        }

        const isOR = (process.env.OPENAI_API_KEY || '').startsWith('sk-or');
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
            ...(isOR ? { baseURL: "https://openrouter.ai/api/v1" } : {})
        });

        let cleanPhone = targetPhone.replace('whatsapp:', '').replace('+', '\\+');
        // Find invoice
        const invoice = await Invoice.findOne({
            client_phone: { $regex: new RegExp(targetPhone.replace('+', '\\+').slice(-10) + '$') },
            status: { $in: ['unpaid', 'overdue'] }
        });

        if (!invoice) {
            return res.send(`<Response><Say voice="alice" language="en-IN">Thank you. Goodbye.</Say><Hangup/></Response>`);
        }

        const systemPrompt = `You are a Kirana store (local shop) owner in India talking on the phone with your customer (${invoice.client_name}) to collect a pending balance of ₹${invoice.amount}. 
        Be polite but firm. Talk like a real human shopkeeper. Very short conversational sentences. 
        If they promise to pay, say "Okay, please pay soon. Thank you bye." and include the exact word "END_CALL".
        Current date: ${new Date().toDateString()}. Due date was ${invoice.due_date.toDateString()}.`;

        const response = await openai.chat.completions.create({
            model: isOR ? 'openai/gpt-3.5-turbo' : 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: SpeechResult }
            ],
            max_tokens: 60,
            temperature: 0.6,
        });

        let aiReply = response.choices[0].message?.content || 'Okay, please pay soon. END_CALL';

        const shouldEnd = aiReply.includes('END_CALL');
        aiReply = aiReply.replace('END_CALL', '').trim();

        invoice.reminder_history.push({
            timestamp: new Date(),
            channel: 'voice_call',
            message_content: `[User]: ${SpeechResult} | [Shopkeeper]: ${aiReply}`,
            delivery_status: 'delivered'
        });

        if (shouldEnd) {
            invoice.status = 'paid'; // Stop loop
        }
        await invoice.save();

        if (shouldEnd) {
            return res.send(`<Response><Say voice="alice" language="en-IN">${aiReply}</Say><Hangup/></Response>`);
        } else {
            return res.send(buildTwiml(aiReply));
        }

    } catch (e) {
        console.error('Voice Webhook Error', e);
        return res.send(`<Response><Say voice="alice">Sorry, connection issue. Goodbye.</Say><Hangup/></Response>`);
    }
});
