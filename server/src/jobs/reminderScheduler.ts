import cron from 'node-cron';
import { Invoice } from '../models/Invoice.js';
import { evaluateEscalation } from '../utils/escalationEngine.js';
import { generateMessage } from '../services/messageGenerator.js';
import { sendNotification } from '../services/communicationService.js';

export function startInvoiceScheduler() {
    // Run every minute (useful for hackathon demo mode tests, can be tweaked to '0 * * * *' for hourly later)
    cron.schedule('* * * * *', async () => {
        try {
            console.log('--- Running Invoice Scheduler Cron Job ---');
            // Fetch all active invoices (unpaid or overdue)
            const activeInvoices = await Invoice.find({ status: { $in: ['unpaid', 'overdue'] } });

            for (const invoice of activeInvoices) {
                const escalation = evaluateEscalation(invoice);

                if (escalation.shouldRemind) {
                    console.log(`[Invoice Scheduler] Triggering ${escalation.tone} for client ${invoice.client_name} (Level ${escalation.level})`);

                    // Generate AI text and send notification
                    const channel = invoice.client_phone ? 'whatsapp' : 'email';
                    const generatedMessage = await generateMessage(invoice, escalation.tone, channel);

                    console.log(`[Invoice Scheduler] Sending: "${generatedMessage}" via ${channel}`);

                    const delivery_status = await sendNotification(invoice, generatedMessage, channel);

                    // Update invoice state
                    const now = new Date();
                    invoice.status = 'overdue';
                    invoice.reminder_level = escalation.level;
                    invoice.last_contacted_at = now;

                    invoice.reminder_history.push({
                        timestamp: now,
                        channel,
                        message_content: generatedMessage,
                        delivery_status
                    });

                    await invoice.save();
                    console.log(`[Invoice Scheduler] Updated invoice ${invoice.invoice_id} state.`);
                }
            }
        } catch (error) {
            console.error('Error executing Invoice Scheduler Cron Job:', error);
        }
    });

    console.log('Invoice Scheduler Cron Job has been started.');
}
