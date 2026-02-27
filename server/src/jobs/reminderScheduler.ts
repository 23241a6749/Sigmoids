import cron from 'node-cron';
import { Invoice } from '../models/Invoice.js';
import { evaluateEscalation } from '../utils/escalationEngine.js';
import { generateMessage } from '../services/messageGenerator.js';
import { sendNotification } from '../services/communicationService.js';

// Channel selection strategy based on escalation level
function selectChannel(invoice: any, level: number): string {
    // Level 1 → WhatsApp (soft)
    // Level 2 → WhatsApp again (more firm)
    // Level 3 → Voice Call (escalated)
    // Level 4 → Voice Call (final)
    if (!invoice.client_phone) return 'email';
    if (level <= 2) return 'whatsapp';
    return 'call';
}

export function startInvoiceScheduler() {
    // Runs every minute — perfect for hackathon live demos
    cron.schedule('* * * * *', async () => {
        try {
            console.log('[Scheduler] ─── Running Invoice Reminder Cycle ───');

            // Fetch all active invoices (unpaid or overdue). Skip disputed ones.
            const activeInvoices = await Invoice.find({
                status: { $in: ['unpaid', 'overdue'] }  // Skip 'disputed', 'promised', 'paid'
            });

            console.log(`[Scheduler] Found ${activeInvoices.length} active invoices to evaluate.`);

            for (const invoice of activeInvoices) {
                const escalation = evaluateEscalation(invoice);

                if (!escalation.shouldRemind) {
                    continue; // Not time yet according to the escalation engine
                }

                const channel = selectChannel(invoice, escalation.level);

                console.log(`[Scheduler] 🎯 ${invoice.client_name} | ₹${invoice.amount} | Level ${escalation.level} (${escalation.tone}) via ${channel.toUpperCase()}`);

                try {
                    // Generate AI message tailored for channel and tone
                    const generatedMessage = await generateMessage(invoice, escalation.tone, channel);

                    // Send via the selected channel
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
                    console.log(`[Scheduler] ✅ Invoice ${invoice.invoice_id} — ${channel} sent (${delivery_status})`);

                } catch (innerErr) {
                    console.error(`[Scheduler] ❌ Failed for ${invoice.client_name}:`, innerErr);
                }
            }

        } catch (error) {
            console.error('[Scheduler] Critical cron error:', error);
        }
    });

    console.log('[Scheduler] 🚀 Invoice Auto-Pilot Scheduler is running (every 1 minute).');
}
