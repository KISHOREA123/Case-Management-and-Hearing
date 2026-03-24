import React, { useState, useEffect } from 'react';
import {
    Plus,
    FileText,
    Download,
    CheckCircle2,
    Clock,
    AlertCircle,
    X,
    Trash,
    Edit
} from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';
import CustomSelect from '../components/CustomSelect';

const InvoicesPage = () => {
    const { user } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [cases, setCases] = useState([]);
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        invoice_number: `INV-${Date.now().toString().slice(-6)}`,
        case_id: '',
        client_id: '',
        amount: 0,
        status: 'pending',
        due_date: '',
        items: []
    });

    const DEFAULT_LINE_ITEMS = [
        { description: 'Case Research', amount: 5000 },
        { description: 'Case Investigation', amount: 7000 },
        { description: 'Legal Documentation', amount: 3000 },
        { description: 'Court Representation', amount: 10000 }
    ];

    const addItem = (item) => {
        const newItems = [...formData.items, { ...item, id: Date.now() }];
        const newTotal = newItems.reduce((sum, i) => sum + i.amount, 0);
        setFormData({ ...formData, items: newItems, amount: newTotal });
    };

    const removeItem = (id) => {
        const newItems = formData.items.filter(i => i.id !== id);
        const newTotal = newItems.reduce((sum, i) => sum + i.amount, 0);
        setFormData({ ...formData, items: newItems, amount: newTotal });
    };

    useEffect(() => {
        fetchInvoices();
        fetchMetadata();
    }, []);

    const fetchInvoices = async () => {
        try {
            const { data } = await api.get('/invoices');
            setInvoices(data);
        } catch (error) {
            toast.error('Failed to fetch invoices');
        } finally {
            setLoading(false);
        }
    };

    const fetchMetadata = async () => {
        try {
            const [cRes, clRes] = await Promise.all([
                api.get('/cases'),
                api.get('/clients')
            ]);
            setCases(cRes.data);
            setClients(clRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    const openCreateModal = () => {
        setFormData({
            invoice_number: `INV-${Date.now().toString().slice(-6)}`,
            case_id: '',
            client_id: '',
            amount: 0,
            status: 'pending',
            due_date: '',
            items: []
        });
        setEditingId(null);
        setIsModalOpen(true);
    };

    const handleEdit = (inv) => {
        setFormData({
            invoice_number: inv.invoice_number,
            case_id: inv.case_id?._id || inv.case?._id || inv.case_id || '',
            client_id: inv.client_id?._id || inv.client?._id || inv.client_id || '',
            amount: inv.amount,
            status: inv.status,
            due_date: inv.due_date ? new Date(inv.due_date).toISOString().split('T')[0] : '',
            items: inv.items || []
        });
        setEditingId(inv._id);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this invoice?')) return;
        try {
            await api.delete(`/invoices/${id}`);
            toast.success('Invoice deleted');
            fetchInvoices();
        } catch (error) {
            toast.error('Failed to delete invoice');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.put(`/invoices/${editingId}`, formData);
                toast.success('Invoice updated');
            } else {
                await api.post('/invoices', formData);
                toast.success('Invoice created');
            }
            setIsModalOpen(false);
            fetchInvoices();
        } catch (error) {
            toast.error(editingId ? 'Failed to update invoice' : 'Failed to create invoice');
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'paid': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case 'pending': return <Clock className="w-4 h-4 text-orange-500" />;
            case 'overdue': return <AlertCircle className="w-4 h-4 text-red-500" />;
            default: return null;
        }
    };

    const stats = {
        totalOutstanding: invoices
            .filter(inv => inv.status !== 'paid')
            .reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0),
        paidThisMonth: invoices
            .filter(inv => {
                if (inv.status !== 'paid') return false;
                const date = new Date(inv.updatedAt || inv.createdAt);
                const now = new Date();
                return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
            })
            .reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0),
        overdue: invoices
            .filter(inv => inv.status === 'overdue')
            .reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0)
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                    <p className="text-muted-foreground">Manage billing and payments for your cases.</p>
                </div>
                {user?.role !== 'admin' && (
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow hover:bg-primary/90 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Create Invoice
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="text-sm font-bold text-muted-foreground mb-1 uppercase tracking-widest">Total Outstanding</h4>
                    <p className="text-2xl font-bold font-mono text-primary">₹{stats.totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-6 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="text-sm font-bold text-muted-foreground mb-1 uppercase tracking-widest">Paid this month</h4>
                    <p className="text-2xl font-bold font-mono text-green-600">₹{stats.paidThisMonth.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="p-6 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="text-sm font-bold text-muted-foreground mb-1 uppercase tracking-widest">Overdue</h4>
                    <p className="text-2xl font-bold font-mono text-red-600">₹{stats.overdue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-accent/50 text-muted-foreground text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Invoice #</th>
                                <th className="px-6 py-4 font-semibold">Case & Client</th>
                                <th className="px-6 py-4 font-semibold">Amount</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Due Date</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-sm">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-10 text-center text-muted-foreground">Loading invoices...</td></tr>
                            ) : invoices.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-10 text-center text-muted-foreground">No invoices found.</td></tr>
                            ) : invoices.map((inv) => (
                                <tr key={inv._id} className="hover:bg-accent/30 transition-colors">
                                    <td className="px-6 py-4 font-mono font-medium">{inv.invoice_number}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-semibold">{inv.case_id?.case_title}</p>
                                        <p className="text-xs text-muted-foreground">{inv.client_id?.name}</p>
                                    </td>
                                    <td className="px-6 py-4 font-mono font-bold">₹{parseFloat(inv.amount).toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(inv.status)}
                                            <span className="capitalize">{inv.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {user?.role !== 'admin' && (
                                                <button onClick={() => handleEdit(inv)} className="p-2 hover:bg-accent rounded-lg transition-colors text-primary" title="Edit">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button className="p-2 hover:bg-accent rounded-lg transition-colors text-primary" title="Download PDF">
                                                <Download className="w-4 h-4" />
                                            </button>
                                            {user?.role !== 'admin' && (
                                                <button onClick={() => handleDelete(inv._id)} className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive" title="Delete">
                                                    <Trash className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-xl border border-border rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h2 className="text-xl font-bold">{editingId ? 'Edit Invoice' : 'Create Invoice'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-accent rounded-full transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Invoice Number</label>
                                    <input
                                        className="w-full bg-accent/30 border border-border rounded-lg px-4 py-2 text-sm font-mono"
                                        readOnly
                                        value={formData.invoice_number}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Due Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-accent/30 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none"
                                        required
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                    />
                                </div>
                            </div>
                            <CustomSelect
                                label="Select Case"
                                required
                                placeholder="Search Case"
                                options={cases.map(c => ({ value: c._id, label: c.case_title, sublabel: c.case_number }))}
                                value={formData.case_id}
                                onChange={(val) => setFormData({ ...formData, case_id: val })}
                            />
                            <CustomSelect
                                label="Select Client"
                                required
                                placeholder="Search Client"
                                options={clients.map(c => ({ value: c._id, label: c.name, sublabel: c.email || 'Client' }))}
                                value={formData.client_id}
                                onChange={(val) => setFormData({ ...formData, client_id: val })}
                            />
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Invoice Items</label>
                                    <div className="flex gap-2">
                                        {DEFAULT_LINE_ITEMS.map((item, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => addItem(item)}
                                                className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 transition-colors"
                                            >
                                                + {item.description}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                                    {formData.items.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3 bg-accent/30 p-2 rounded-lg group">
                                            <input
                                                className="flex-1 bg-transparent border-none text-sm focus:ring-0 p-0"
                                                value={item.description}
                                                onChange={(e) => {
                                                    const newItems = formData.items.map(i => i.id === item.id ? { ...i, description: e.target.value } : i);
                                                    setFormData({ ...formData, items: newItems });
                                                }}
                                            />
                                            <div className="flex items-center gap-1">
                                                <span className="text-xs text-muted-foreground font-bold">₹</span>
                                                <input
                                                    type="number"
                                                    className="w-20 bg-transparent border-none text-sm focus:ring-0 p-0 text-right font-mono font-bold"
                                                    value={item.amount}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value) || 0;
                                                        const newItems = formData.items.map(i => i.id === item.id ? { ...i, amount: val } : i);
                                                        const newTotal = newItems.reduce((sum, i) => sum + i.amount, 0);
                                                        setFormData({ ...formData, items: newItems, amount: newTotal });
                                                    }}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeItem(item.id)}
                                                className="p-1 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded transition-colors"
                                            >
                                                <Trash className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {formData.items.length === 0 && (
                                        <p className="text-xs text-muted-foreground italic text-center py-4 border border-dashed border-border rounded-lg">No items added yet. Click a default service above or add custom.</p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => addItem({ description: 'Custom Service', amount: 0 })}
                                    className="w-full py-2 border border-dashed border-border rounded-lg text-xs font-bold text-muted-foreground hover:bg-accent/30 transition-all"
                                >
                                    + Add Custom Item
                                </button>
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-medium">Total Amount (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                    <input
                                        type="number"
                                        readOnly
                                        className="w-full bg-accent/30 border border-border rounded-lg pl-8 pr-4 py-2 text-sm font-mono font-bold text-primary focus:outline-none"
                                        value={formData.amount}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg border border-border hover:bg-accent text-sm font-medium">Cancel</button>
                                <button type="submit" className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold shadow-lg">Generate Invoice</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoicesPage;
