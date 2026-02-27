import { useEffect, useState } from 'react';
import { invoiceApi } from '../../services/api';
import {
    CheckCircle, Clock, Zap, AlertTriangle,
    Send, RefreshCw, Smartphone, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ReplyHistory {
    timestamp: string;
    channel: string;
    message_content: string;
    delivery_status: string;
}

export interface Invoice {
    invoice_id: string;
    client_name: string;
    client_email: string;
    client_phone: string;
    amount: number;
    due_date: string;
    status: string;
    reminder_level: number;
    last_contacted_at: string | null;
    reminder_history: ReplyHistory[];
}

export default function InvoiceDashboard() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [demoLoading, setDemoLoading] = useState(false);

    const fetchInvoices = async () => {
        try {
            const { data } = await invoiceApi.getInvoices();
            setInvoices(data);
        } catch (err) {
            console.error('Failed to load invoices', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
        // For the hackathon demo, poll every 5 seconds to watch the AI chron work live
        const interval = setInterval(fetchInvoices, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkPaid = async (invoiceId: string) => {
        try {
            await invoiceApi.markInvoicePaid(invoiceId);
            await fetchInvoices();
        } catch (err) {
            console.error('Failed to mark paid', err);
        }
    };

    const handleStartDemo = async () => {
        setDemoLoading(true);
        try {
            // Create a heavily aged invoice so the backend cron picks it up instantly
            const past20Days = new Date();
            past20Days.setDate(past20Days.getDate() - 20);

            const fakeInvoice = {
                invoice_id: `DEMO-${Math.floor(Math.random() * 10000)}`,
                client_name: 'Hackathon Judge',
                client_email: 'judge@example.com',
                client_phone: '+919876543210', // Provide your active WhatsApp sandbox Number here
                amount: Math.floor(Math.random() * 5000) + 1000,
                due_date: past20Days.toISOString()
            };

            await invoiceApi.createDemoInvoice(fakeInvoice);
            await fetchInvoices();
        } catch (err) {
            console.error('Demo trigger failed', err);
        } finally {
            setTimeout(() => setDemoLoading(false), 1000);
        }
    };

    const totalInvoices = invoices.length;
    const activeRecoveries = invoices.filter(i => i.status === 'overdue').length;
    const recoveredInvoices = invoices.filter(i => i.status === 'paid').length;
    const totalAmountRecovered = invoices.filter(i => i.status === 'paid').reduce((acc, cv) => acc + cv.amount, 0);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 drop-shadow-sm flex items-center gap-2">
                        <Send className="text-indigo-600 h-8 w-8" />
                        Invoice Chaser Agent
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Autonomous Debt Recovery on Autopilot</p>
                </div>

                <button
                    onClick={handleStartDemo}
                    disabled={demoLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all text-white px-6 py-2.5 rounded-lg shadow-lg font-medium flex items-center gap-2 disabled:opacity-50"
                >
                    {demoLoading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Zap className="h-5 w-5" />}
                    Start Auto-Pilot Demo
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[
                    { title: 'Total Invoices', val: totalInvoices, icon: <Clock className="h-6 w-6 text-blue-500" />, color: 'bg-blue-50 border-blue-100' },
                    { title: 'Active Recoveries', val: activeRecoveries, icon: <AlertTriangle className="h-6 w-6 text-orange-500" />, color: 'bg-orange-50 border-orange-100' },
                    { title: 'Recovered (Paid)', val: recoveredInvoices, icon: <CheckCircle className="h-6 w-6 text-green-500" />, color: 'bg-green-50 border-green-100' },
                    { title: 'Amount Recovered', val: `₹${totalAmountRecovered}`, icon: <Zap className="h-6 w-6 text-purple-500" />, color: 'bg-purple-50 border-purple-100' },
                ].map((card, idx) => (
                    <div key={idx} className={`p-6 rounded-xl border ${card.color} shadow-sm backdrop-blur-sm`}>
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-semibold text-gray-600 mb-1">{card.title}</p>
                                <h3 className="text-3xl font-bold text-gray-900">{card.val}</h3>
                            </div>
                            {card.icon}
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                    <h2 className="text-lg font-semibold text-gray-800">Active Pipeline</h2>
                </div>
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-8 text-center text-gray-500"><RefreshCw className="h-6 w-6 animate-spin mx-auto" /></div>
                    ) : invoices.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No invoices generated yet. Click the Demo button!</div>
                    ) : (
                        <table className="w-full text-left text-sm text-gray-600 text-center">
                            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left">Client & ID</th>
                                    <th className="px-6 py-4">Amount Owed</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Escalation Level</th>
                                    <th className="px-6 py-4">Channel Used</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {invoices.map((inv) => (
                                        <motion.tr
                                            key={inv.invoice_id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="border-b last:border-0 hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 text-left">
                                                <div className="font-semibold text-gray-900">{inv.client_name}</div>
                                                <div className="text-xs text-gray-400">{inv.invoice_id}</div>
                                            </td>
                                            <td className="px-6 py-4 font-medium">₹{inv.amount}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                          ${inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                        inv.status === 'overdue' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-gray-100 text-gray-700'}`}>
                                                    {inv.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-1">
                                                    {[1, 2, 3, 4].map((level) => (
                                                        <div key={level} className={`h-2 w-6 rounded-full ${inv.reminder_level >= level ?
                                                            (level > 2 ? 'bg-red-500' : 'bg-orange-400') : 'bg-gray-200'}`}
                                                        />
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 flex justify-center gap-2">
                                                {inv.reminder_history.length > 0 ? (
                                                    inv.reminder_history[inv.reminder_history.length - 1].channel === 'whatsapp' ?
                                                        <span title="WhatsApp"><Smartphone className="text-green-500 h-5 w-5" /></span> :
                                                        <span title="Email"><Mail className="text-blue-500 h-5 w-5" /></span>
                                                ) : (
                                                    <span className="text-gray-300">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleMarkPaid(inv.invoice_id)}
                                                    disabled={inv.status === 'paid'}
                                                    className="text-indigo-600 hover:text-indigo-900 font-medium disabled:opacity-30 disabled:hover:text-indigo-600"
                                                >
                                                    Mark Paid
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
