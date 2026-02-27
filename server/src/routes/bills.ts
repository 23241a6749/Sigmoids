import express from 'express';
import mongoose from 'mongoose';
import { Bill } from '../models/Bill.js';
import { Product } from '../models/Product.js';
import { Customer } from '../models/Customer.js';
import { CustomerAccount } from '../models/CustomerAccount.js';
import { LedgerEntry } from '../models/LedgerEntry.js';
import { OTP } from '../models/OTP.js';
import { auth } from '../middleware/auth.js';
import { recalculateGlobalKhataScore } from '../utils/khataScore.js';
import twilio from 'twilio';

const router = express.Router();
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Helper function to create a bill (reusable)
async function createBillInternal(session: mongoose.ClientSession, data: any, userId: string) {
    const { customerPhoneNumber: rawPhone, customerName, items, paymentType } = data;
    const customerPhoneNumber = rawPhone.startsWith('+91') ? rawPhone : '+91' + rawPhone.replace(/\D/g, '').slice(-10);

    // 1. Find or Create Customer
    let customer = await Customer.findOne({ phoneNumber: customerPhoneNumber }).session(session);
    if (!customer) {
        customer = new Customer({
            phoneNumber: customerPhoneNumber,
            name: customerName || ''
        });
        await customer.save({ session });
    } else if (customerName && !customer.name) {
        customer.name = customerName;
        await customer.save({ session });
    }

    let totalAmount = 0;
    const processedItems = [];

    // 2. Validate Stock and Calculate Total
    for (const item of items) {
        const product = await Product.findById(item.productId).session(session);
        if (!product) throw new Error(`Product ${item.productId} not found`);
        if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);

        product.stock -= item.quantity;
        await product.save({ session });

        totalAmount += product.price * item.quantity;
        processedItems.push({
            productId: product._id,
            name: product.name,
            quantity: item.quantity,
            price: product.price
        });
    }

    // 3. Create Bill
    const bill = new Bill({
        shopkeeperId: userId,
        customerId: customer._id,
        items: processedItems,
        totalAmount,
        paymentType
    });
    await bill.save({ session });

    // 4. Handle Ledger if applicable
    if (paymentType === 'ledger') {
        const ledgerEntry = new LedgerEntry({
            shopkeeperId: userId,
            customerId: customer._id,
            billId: bill._id,
            amount: totalAmount,
            type: 'debit',
            status: 'pending'
        });
        await ledgerEntry.save({ session });

        let account = await CustomerAccount.findOne({
            customerId: customer._id,
            shopkeeperId: userId
        }).session(session);

        if (!account) {
            account = new CustomerAccount({
                customerId: customer._id,
                shopkeeperId: userId,
                balance: totalAmount
            });
        } else {
            account.balance += totalAmount;
        }
        await account.save({ session });
    }

    // Recalculate Global Khata Score after any transaction (new debt or cash purchase)
    recalculateGlobalKhataScore(customer._id.toString()).catch(err => console.error('Score calculation error:', err));

    return bill;
}

// Create a new bill (Cash/Online)
router.post('/', auth, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (req.body.paymentType === 'ledger') {
            throw new Error('Ledger payments require OTP verification');
        }

        if (!req.auth?.userId) throw new Error('Authentication required');
        const bill = await createBillInternal(session, req.body, req.auth.userId);
        await session.commitTransaction();
        res.status(201).json(bill);
    } catch (err: any) {
        await session.abortTransaction();
        res.status(400).json({ message: err.message });
    } finally {
        session.endSession();
    }
});

// Send OTP for Khata payment
router.post('/khata/send-otp', auth, async (req, res) => {
    try {
        const { customerPhoneNumber: rawPhone } = req.body;
        if (!rawPhone) return res.status(400).json({ message: 'Phone number is required' });
        const customerPhoneNumber = rawPhone.startsWith('+91') ? rawPhone : '+91' + rawPhone.replace(/\D/g, '').slice(-10);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await OTP.findOneAndUpdate(
            { phoneNumber: customerPhoneNumber },
            { otp, expiresAt, attempts: 0 },
            { upsert: true }
        );


        if (process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_SMS_NUMBER) {
            const isWhatsApp = process.env.TWILIO_PHONE_NUMBER?.startsWith('whatsapp:');
            const from = isWhatsApp ? process.env.TWILIO_PHONE_NUMBER : (process.env.TWILIO_SMS_NUMBER || process.env.TWILIO_PHONE_NUMBER);

            const cleanPhone = customerPhoneNumber.replace(/\D/g, '').slice(-10);
            const to = isWhatsApp ? `whatsapp:+91${cleanPhone}` : `+91${cleanPhone}`;

            console.log(`[Twilio] Sending OTP via ${isWhatsApp ? 'WhatsApp' : 'SMS'} to ${to} from ${from}...`);
            try {
                await twilioClient.messages.create({
                    body: `[KLink] Your OTP for Khata payment is: ${otp}. Valid for 5 mins.`,
                    from: from,
                    to: to
                });
                console.log('[Twilio] OTP sent successfully');
            } catch (twilioErr: any) {
                console.error('[Twilio] Error:', twilioErr.message);
                // Don't throw here, just log it so the response can still be sent (though OTP failed)
            }
        } else {
            console.log(`[MOCK OTP] Phone: ${customerPhoneNumber}, OTP: ${otp}`);
        }

        res.json({ message: 'OTP sent' });
    } catch (err: any) {
        res.status(500).json({ message: 'Failed to send OTP' });
    }
});

// Verify OTP and complete Khata payment
router.post('/khata/verify-otp', auth, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { customerPhoneNumber: rawPhone, otp, billData } = req.body;
        const customerPhoneNumber = rawPhone.startsWith('+91') ? rawPhone : '+91' + rawPhone.replace(/\D/g, '').slice(-10);

        const otpRecord = await OTP.findOne({ phoneNumber: customerPhoneNumber });
        if (!otpRecord) throw new Error('OTP expired or not requested');

        if (otpRecord.attempts >= 3) {
            await OTP.deleteOne({ phoneNumber: customerPhoneNumber });
            throw new Error('Max attempts reached. Please resend OTP.');
        }

        if (otpRecord.otp !== otp) {
            otpRecord.attempts += 1;
            await otpRecord.save();
            throw new Error('Invalid OTP');
        }

        await OTP.deleteOne({ phoneNumber: customerPhoneNumber });

        if (!req.auth?.userId) throw new Error('Authentication required');
        const bill = await createBillInternal(session, { ...billData, paymentType: 'ledger' }, req.auth.userId);
        await session.commitTransaction();
        res.status(201).json(bill);
    } catch (err: any) {
        await session.abortTransaction();
        res.status(400).json({ message: err.message });
    } finally {
        session.endSession();
    }
});

// Get all bills
router.get('/', auth, async (req, res) => {
    try {
        const bills = await Bill.find({ shopkeeperId: req.auth?.userId }).populate('customerId').sort({ createdAt: -1 });
        res.json(bills);
    } catch (err: any) {
        res.status(500).json({ message: err.message });
    }
});

export { router as billRouter };
