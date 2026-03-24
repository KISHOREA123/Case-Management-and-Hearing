import React, { useState, useEffect } from 'react';
import { Scale, Mail, Phone, Plus, Search, MoreVertical, Award } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';

const LawyersPage = () => {
    const [lawyers, setLawyers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchLawyers();
    }, []);

    const fetchLawyers = async () => {
        try {
            const { data } = await api.get('/lawyers');
            setLawyers(data);
        } catch (error) {
            toast.error('Failed to fetch lawyers');
        } finally {
            setLoading(false);
        }
    };

    const filteredLawyers = lawyers.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Lawyers</h1>
                    <p className="text-muted-foreground">Manage your firm's legal team and specializations.</p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search lawyers by name or email..."
                        className="w-full bg-accent/30 border-transparent focus:bg-background focus:border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-muted-foreground">Loading legal team...</div>
                ) : filteredLawyers.length === 0 ? (
                    <div className="col-span-full py-20 text-center text-muted-foreground">No lawyers found.</div>
                ) : filteredLawyers.map((l) => (
                    <div key={l._id} className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600">
                                <Scale className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{l.name}</h3>
                                <div className="flex items-center gap-1 text-xs text-primary font-bold">
                                    <Award className="w-3 h-3" />
                                    Legal Team
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-3">
                                <Mail className="w-4 h-4" />
                                <span className="truncate">{l.email}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-4 h-4" />
                                <span>{l.phone || 'N/A'}</span>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-border flex justify-between items-center text-xs">
                            <span className="text-muted-foreground">Cases managed: <span className="text-foreground font-bold">{l.caseCount || 0}</span></span>
                            <button className="text-primary font-bold hover:underline">View Profile</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LawyersPage;
