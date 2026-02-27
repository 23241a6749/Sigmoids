import { Router, Request, Response } from 'express';
import { Invoice } from '../models/Invoice.js';
import { classifyIntent } from '../services/intentClassifier.js';

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
