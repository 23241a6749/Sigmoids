import { IInvoice } from '../models/Invoice.js';

export interface EscalationResult {
    shouldRemind: boolean;
    level: number;
    tone: string;
}

export function evaluateEscalation(invoice: IInvoice): EscalationResult {
    const now = new Date();
    const dueDate = new Date(invoice.due_date);

    // Default: no action
    const defaultResult: EscalationResult = { shouldRemind: false, level: invoice.reminder_level, tone: '' };

    if (now <= dueDate || invoice.status === 'paid') {
        return defaultResult;
    }

    const timeDifferenceMs = now.getTime() - dueDate.getTime();

    // For hackathon demo purposes
    let timeUnitOverdue = timeDifferenceMs / (1000 * 60 * 60 * 24); // days
    if (process.env.DEMO_MODE === 'true') {
        timeUnitOverdue = timeDifferenceMs / (1000 * 60); // minutes for fast testing
    }

    // Process from most severe to least severe
    if (timeUnitOverdue >= 14 && invoice.reminder_level < 4) {
        return { shouldRemind: true, level: 4, tone: 'final notice' };
    }
    if (timeUnitOverdue >= 7 && invoice.reminder_level < 3) {
        return { shouldRemind: true, level: 3, tone: 'urgent reminder' };
    }
    if (timeUnitOverdue >= 3 && invoice.reminder_level < 2) {
        return { shouldRemind: true, level: 2, tone: 'polite follow-up' };
    }
    if (timeUnitOverdue >= 1 && invoice.reminder_level < 1) {
        return { shouldRemind: true, level: 1, tone: 'friendly reminder' };
    }

    return defaultResult;
}
