import { Router, Request, Response } from 'express';
import { Invoice } from '../models/Invoice.js';

export const invoiceRouter = Router();

// Create new invoice
invoiceRouter.post('/', async (req, res) => {
    try {
        const invoice = new Invoice(req.body);
        await invoice.save();
        res.status(201).json(invoice);
    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({ error: 'Failed to create invoice' });
    }
});

// List overdue invoices (must be defined BEFORE /:id logic, though there are no pure /:id routes right now)
invoiceRouter.get('/overdue', async (req, res) => {
    try {
        const invoices = await Invoice.find({ status: 'overdue' }).sort({ due_date: 1 });
        res.json(invoices);
    } catch (error) {
        console.error('Error fetching overdue invoices:', error);
        res.status(500).json({ error: 'Failed to fetch overdue invoices' });
    }
});

// List ALL invoices
invoiceRouter.get('/', async (req, res) => {
    try {
        const invoices = await Invoice.find().sort({ createdAt: -1 });
        res.json(invoices);
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
});

// Update invoice status
invoiceRouter.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        // Look up by invoice_id, not MongoDB _id
        const invoice = await Invoice.findOneAndUpdate(
            { invoice_id: req.params.id },
            { status },
            { new: true }
        );
        if (!invoice) {
            res.status(404).json({ error: 'Invoice not found' });
            return;
        }
        res.json(invoice);
    } catch (error) {
        console.error('Error updating invoice status:', error);
        res.status(500).json({ error: 'Failed to update invoice status' });
    }
});

// Record payment confirmation explicitly (Stops reminders)
invoiceRouter.put('/:id/payment', async (req, res) => {
    try {
        const now = new Date();
        const invoice = await Invoice.findOneAndUpdate(
            { invoice_id: req.params.id },
            {
                status: 'paid',
                last_contacted_at: now,
                $push: {
                    reminder_history: {
                        timestamp: now,
                        channel: 'system',
                        message_content: 'Payment explicitly confirmed and recorded. Escalation halted.',
                        delivery_status: 'delivered'
                    }
                }
            },
            { new: true }
        );

        if (!invoice) {
            res.status(404).json({ error: 'Invoice not found' });
            return;
        }
        res.json(invoice);
    } catch (error) {
        console.error('Error recording invoice payment:', error);
        res.status(500).json({ error: 'Failed to record payment' });
    }
});
