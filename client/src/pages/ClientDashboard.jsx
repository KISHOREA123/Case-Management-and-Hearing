import React, { useState, useEffect } from 'react';
import {
    Briefcase,
    Clock,
    FileText,
    Calendar,
    Download,
    CheckCircle2,
    Loader2,
    Search,
    Send
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { cn } from '../utils/cn';
import api from '../api/axios';
import { toast } from 'react-toastify';

const ClientDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [requestLoading, setRequestLoading] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const { data } = await api.get('/dashboard');
            setData(data);
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setSearchLoading(true);
        setSearchResult(null);
        try {
            const { data } = await api.get(`/cases/search/${searchQuery.trim()}`);
            setSearchResult(data);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Case not found');
        } finally {
            setSearchLoading(false);
        }
    };

    const handleRequestAccess = async (caseId) => {
        setRequestLoading(true);
        try {
            await api.post('/cases/request-access', { caseId });
            toast.success('Access request sent to lawyer');
            setSearchResult(prev => ({ ...prev, requestStatus: 'Pending' }));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send request');
        } finally {
            setRequestLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const { stats, timeline, documents } = data || {};
    const hasActiveCases = stats && stats.some(s => s.title === 'Active Cases' && parseInt(s.value) > 0);

    const iconMap = {
        'Active Cases': <Briefcase className="w-5 h-5" />,
        'Next Hearing': <Calendar className="w-5 h-5" />,
        'Case Status': <CheckCircle2 className="w-5 h-5" />,
        'Pending Invoices': <FileText className="w-5 h-5" />,
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
                    <p className="text-muted-foreground">Track your legal proceedings and access related documents.</p>
                </div>

                {/* Quick Search Section */}
                <div className="w-full max-w-md">
                    <form onSubmit={handleSearch} className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Enter Case Number (e.g. CMH-2024-0001)"
                            className="w-full bg-card border border-border rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />}
                    </form>

                    {searchResult && (
                        <div className="mt-2 p-4 bg-primary/5 border border-primary/10 rounded-xl animate-in slide-in-from-top-2 duration-200">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-semibold text-primary uppercase tracking-wider">Case Found</p>
                                    <p className="text-lg font-bold">{searchResult.case_number}</p>
                                </div>
                                {searchResult.requestStatus ? (
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-xs font-bold",
                                        searchResult.requestStatus === 'Approved' ? "bg-green-500/10 text-green-600" :
                                        searchResult.requestStatus === 'Pending' ? "bg-amber-500/10 text-amber-600" : "bg-red-500/10 text-red-600"
                                    )}>
                                        {searchResult.requestStatus}
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => handleRequestAccess(searchResult._id)}
                                        disabled={requestLoading}
                                        className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                                    >
                                        <Send className="w-3.5 h-3.5" />
                                        Request Access
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {!hasActiveCases && !searchResult && (
                <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-4 shadow-sm">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Briefcase className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold">No Active Cases Found</h2>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        To get started, please search for your case using the case number provided by your lawyer.
                    </p>
                </div>
            )}

            {hasActiveCases && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats?.map((stat, i) => (
                            <StatCard
                                key={i}
                                {...stat}
                                icon={iconMap[stat.title] || <Briefcase className="w-5 h-5" />}
                            />
                        ))}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-card border border-border rounded-xl p-6">
                                <h3 className="font-bold mb-6">Case Timeline</h3>
                                <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary before:to-muted">
                                    {timeline?.length > 0 ? timeline.map((step, i) => (
                                        <div key={i} className="relative flex items-center justify-between pl-12">
                                            <div className={cn(
                                                "absolute left-0 w-10 h-10 rounded-full border-4 border-background flex items-center justify-center z-10",
                                                step.done ? "bg-primary text-primary-foreground" : step.active ? "bg-primary/20 text-primary border-primary/20" : "bg-muted text-muted-foreground"
                                            )}>
                                                {step.done ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-2 h-2 rounded-full bg-current"></div>}
                                            </div>
                                            <div>
                                                <p className={cn("font-bold", step.active && "text-primary")}>{step.title}</p>
                                                <p className="text-sm text-muted-foreground">{step.date}</p>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-muted-foreground italic pl-12">No timeline events recorded.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-card border border-border rounded-xl p-6 h-fit">
                            <h3 className="font-bold mb-6">Recent Documents</h3>
                            <div className="space-y-4">
                                {documents?.length > 0 ? documents.map((doc, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors group cursor-pointer">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                            <div>
                                                <p className="text-sm font-medium">{doc.name}</p>
                                                <p className="text-xs text-muted-foreground">{doc.size}</p>
                                            </div>
                                        </div>
                                        <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                                    </div>
                                )) : (
                                    <div className="text-center py-6 text-muted-foreground text-sm italic">
                                        No documents uploaded.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default ClientDashboard;
