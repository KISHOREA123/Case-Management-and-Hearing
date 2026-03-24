import React, { useState, useEffect } from 'react';
import {
    Gavel,
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    MapPin,
    Loader2
} from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const CourtsPage = () => {
    const { user } = useAuth();
    const [courts, setCourts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newCourt, setNewCourt] = useState({
        court_number: '',
        court_name: '',
        address: '',
        state: ''
    });

    useEffect(() => {
        fetchCourts();
    }, []);

    const fetchCourts = async () => {
        try {
            const { data } = await api.get('/courts');
            setCourts(data);
        } catch (error) {
            toast.error('Failed to load courts');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourt = async (e) => {
        e.preventDefault();
        try {
            await api.post('/courts', newCourt);
            toast.success('Court added successfully');
            setShowAddModal(false);
            setNewCourt({
                court_number: '',
                court_name: '',
                address: '',
                state: ''
            });
            fetchCourts();
        } catch (error) {
            toast.error('Failed to create court');
        }
    };

    const filteredCourts = courts.filter(court =>
        court.court_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        court.court_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        court.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        court.state?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Courts</h1>
                    <p className="text-muted-foreground">Manage judicial locations and jurisdictions.</p>
                </div>
                {user.role === 'admin' && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow hover:bg-primary/90 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Add Court
                    </button>
                )}
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search courts by name, number, address or state..."
                        className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-accent transition-all">
                    <Filter className="w-4 h-4" />
                    Filters
                </button>
            </div>

            {/* Courts Table */}
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-accent/50 text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
                                <th className="px-6 py-4 font-semibold">Court #</th>
                                <th className="px-6 py-4 font-semibold">Court Name</th>
                                <th className="px-6 py-4 font-semibold">Address</th>
                                <th className="px-6 py-4 font-semibold">State</th>
                                <th className="px-6 py-4 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredCourts.length > 0 ? (
                                filteredCourts.map((court) => (
                                    <tr key={court._id} className="hover:bg-accent/30 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-sm">
                                            {court.court_number}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                                    <Gavel className="w-4 h-4" />
                                                </div>
                                                <span className="font-semibold text-sm">{court.court_name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <MapPin className="w-3.5 h-3.5" />
                                                {court.address}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium">{court.state}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button className="p-1.5 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {user.role === 'admin' && (
                                                    <button className="p-1.5 hover:bg-destructive/10 rounded-md transition-colors text-muted-foreground hover:text-destructive">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button className="p-1.5 hover:bg-accent rounded-md transition-colors text-muted-foreground">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground italic">
                                        No courts found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Court Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
                        <h2 className="text-xl font-bold mb-4">Add New Court</h2>
                        <form onSubmit={handleCreateCourt} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Court Number</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. CRT-101"
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    value={newCourt.court_number}
                                    onChange={(e) => setNewCourt({ ...newCourt, court_number: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Court Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Supreme Court of Justice"
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    value={newCourt.court_name}
                                    onChange={(e) => setNewCourt({ ...newCourt, court_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        required
                                        type="text"
                                        placeholder="Full address here"
                                        className="w-full pl-10 pr-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        value={newCourt.address}
                                        onChange={(e) => setNewCourt({ ...newCourt, address: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">State</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="State/Province"
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    value={newCourt.state}
                                    onChange={(e) => setNewCourt({ ...newCourt, state: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-border transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 shadow transition-all"
                                >
                                    Create Court
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourtsPage;
