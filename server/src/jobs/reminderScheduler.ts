import cron from 'node-cron';
import { Invoice } from '../models/Invoice.js';
import { evaluateEscalation } from '../utils/escalationEngine.js';
import { generateMessage } from '../services/messageGenerator.js';
import { sendNotification } from '../services/communicationService.js';

const DEMO_MODE = process.env.DEMO_MODE === 'true';

// Smart channel selection based on escalation level
// Level 1-2: WhatsApp (polite nudge → firm follow-up)
// Level 3-4: Voice Call (urgent → final)
function selectChannel(invoice: any, level: number): string {
    if (!invoice.client_phone) return 'email';
    if (level <= 2) return 'whatsapp';
    return 'call';
}

async function runEscalationCycle() {
    try {
        const tag = DEMO_MODE ? '🎬 DEMO' : '⏰';
        console.log(`\n${tag} ─── Running Escalation Cycle ───`);

        const activeInvoices = await Invoice.find({
            status: { $in: ['unpaid', 'overdue'] }
        });

        if (activeInvoices.length === 0) {
            console.log(`${tag} No active invoices. Agent idle.`);
            return;
        }

        console.log(`${tag} Evaluating ${activeInvoices.length} invoices...`);

        for (const invoice of activeInvoices) {
            const escalation = evaluateEscalation(invoice);

            if (!escalation.shouldRemind) continue;

            const channel = selectChannel(invoice, escalation.level);
            console.log(`${tag} 🎯 ${invoice.client_name} | ₹${invoice.amount} | Level ${escalation.level} (${escalation.tone}) → ${channel.toUpperCase()}`);

            try {
                const generatedMessage = await generateMessage(invoice, escalation.tone, channel);
                const delivery_status = await sendNotification(invoice, generatedMessage, channel);

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
                console.log(`${tag} ✅ ${invoice.invoice_id} → ${channel} sent (${delivery_status})`);
            } catch (innerErr) {
                console.error(`${tag} ❌ Failed for ${invoice.client_name}:`, innerErr);
            }
        }
    } catch (error) {
        console.error('[Scheduler] Critical error:', error);
    }
}

export function startInvoiceScheduler() {
    if (DEMO_MODE) {
        // DEMO: Run every 30 seconds for real-time hackathon presentation
        console.log('🎬 [DEMO MODE] Voice Auto-Pilot running every 30 seconds for live demo!');
        setInterval(runEscalationCycle, 30 * 1000);
    } else {
        // PRODUCTION: Run every minute
        cron.schedule('* * * * *', runEscalationCycle);
        console.log('🚀 [PROD] Invoice Auto-Pilot Scheduler running (every 1 minute).');
    }
}
