import React, { useState, useEffect } from 'react';
import { Users, Mail, Phone, Plus, Search, MoreVertical, Briefcase, Pencil, Trash2 } from 'lucide-react';
import Dropdown, { DropdownItem } from '../components/Dropdown';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { cn } from '../utils/cn';

const ClientsPage = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', role: 'Petitioner'
    });

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const { data } = await api.get('/clients');
            setClients(data);
        } catch (error) {
            toast.error('Failed to fetch clients');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({ name: '', email: '', phone: '', role: 'Petitioner' });
        setEditingClient(null);
        setIsModalOpen(false);
    };

    const handleEdit = (client) => {
        setEditingClient(client);
        setFormData({
            name: client.name || '',
            email: client.email || '',
            phone: client.phone || '',
            role: client.role || 'Petitioner'
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this client?')) return;
        try {
            await api.delete(`/clients/${id}`);
            toast.success('Client deleted successfully');
            fetchClients();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete client');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingClient) {
                await api.put(`/clients/${editingClient._id}`, formData);
                toast.success('Client updated successfully');
            } else {
                await api.post('/clients', formData);
                toast.success('Client created successfully');
            }
            resetForm();
            fetchClients();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save client');
        }
    };

    const filteredClients = clients.filter(cl =>
        cl.name.toLowerCase().includes(search.toLowerCase()) ||
        cl.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
                    <p className="text-muted-foreground">Manage relationships and track client history.</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Client
                </button>
            </div>

            <div className="flex items-center gap-4 bg-card p-4 border border-border rounded-xl">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search clients..."
                        className="w-full bg-accent/30 border-transparent focus:bg-background focus:border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-muted-foreground">Loading clients...</div>
                ) : filteredClients.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-muted-foreground">No clients found.</div>
                ) : filteredClients.map((client) => (
                    <div key={client._id} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                                    {client.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">{client.name}</h3>
                                    <span className={cn(
                                        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mt-1 inline-block",
                                        client.role === 'Petitioner' ? "bg-blue-500/10 text-blue-600" : "bg-purple-500/10 text-purple-600"
                                    )}>
                                        {client.role || 'Petitioner'}
                                    </span>
                                </div>
                            </div>
                            <Dropdown
                                trigger={
                                    <button className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                }
                                align="end"
                            >
                                <DropdownItem icon={<Pencil className="w-4 h-4" />} onClick={() => handleEdit(client)}>
                                    Edit Client
                                </DropdownItem>
                                <DropdownItem icon={<Trash2 className="w-4 h-4" />} onClick={() => handleDelete(client._id)} className="text-destructive hover:text-destructive focus:text-destructive">
                                    Delete Client
                                </DropdownItem>
                            </Dropdown>
                        </div>
                        <div className="space-y-2 mt-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                <span>{client.email || 'No email provided'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span>{client.phone || 'No phone provided'}</span>
                            </div>
                            {client.case && (
                                <div className="flex items-center gap-2 pt-2 border-t border-border mt-4">
                                    <Briefcase className="w-4 h-4 text-primary" />
                                    <span className="font-medium text-foreground truncate">{client.case.case_title}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Client Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="bg-card border border-border rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-border flex justify-between items-center">
                            <h2 className="text-lg font-bold">{editingClient ? 'Edit' : 'Add'} Client</h2>
                            <button onClick={resetForm} className="text-muted-foreground hover:text-foreground transition-colors">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Name</label>
                                <input
                                    className="w-full bg-accent/30 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Email</label>
                                <input
                                    type="email"
                                    className="w-full bg-accent/30 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Phone</label>
                                <input
                                    className="w-full bg-accent/30 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Default Role</label>
                                <select
                                    className="w-full bg-accent/30 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="Petitioner">Petitioner</option>
                                    <option value="Defender">Defender</option>
                                </select>
                            </div>
                            <div className="flex gap-3 justify-end mt-6">
                                <button type="button" onClick={resetForm} className="px-4 py-2 text-sm font-medium hover:bg-accent rounded-lg transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors">
                                    {editingClient ? 'Save Changes' : 'Create Client'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientsPage;
