import { Router, Request, Response } from 'express';
import { Invoice } from '../models/Invoice.js';
import { CustomerAccount } from '../models/CustomerAccount.js';
import { auth } from '../middleware/auth.js';

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

// Import Live Pending Khata Balances into Voice Auto-Pilot Queue
invoiceRouter.post('/import-khata', auth, async (req, res) => {
    try {
        // Find all Khata accounts for this shopkeeper that have pending dues (balance > 0)
        const overdueAccounts = await CustomerAccount.find({
            shopkeeperId: req.auth?.userId,
            balance: { $gt: 0 }
        }).populate('customerId');

        let importedCount = 0;
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 15); // Force it instantly overdue for demo/auto-pilot fast pickup

        for (const account of overdueAccounts) {
            const customer = account.customerId as any;
            if (!customer || !customer.phoneNumber) continue;

            const cleanPhone = customer.phoneNumber.replace('whatsapp:', '').replace('+', '\\+');

            // Check if AI is already chasing this client natively (any active status)
            const existingInvoice = await Invoice.findOne({
                client_phone: { $regex: new RegExp(cleanPhone.slice(-10) + '$') },
                status: { $in: ['unpaid', 'overdue', 'promised', 'disputed'] }
            });

            if (!existingInvoice) {
                // Bridge Khata to Invoice Chaser
                const khataInvoice = new Invoice({
                    invoice_id: `KHATA-${Math.floor(Math.random() * 100000)}`,
                    client_name: customer.name || 'Valued Customer',
                    client_email: `${(customer.name || 'user').replace(/\s/g, '').toLowerCase()}@example.com`,
                    client_phone: customer.phoneNumber,
                    amount: account.balance,
                    due_date: pastDate, // Overdue instantly 
                    status: 'overdue',
                    reminder_level: 0   // Start at 0 so escalation engine sends WhatsApp first
                });
                await khataInvoice.save();
                importedCount++;
            }
        }

        res.json({ message: `Successfully synchronized ${importedCount} pending Khata customers into the Voice Auto-Pilot queue.` });
    } catch (error) {
        console.error('Error importing khata to invoices:', error);
        res.status(500).json({ error: 'Failed to synchronize Khata balances' });
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
