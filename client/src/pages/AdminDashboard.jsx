import React, { useState, useEffect } from 'react';
import {
    Users,
    Briefcase,
    Calendar,
    Scale,
    ArrowUpRight,
    Clock,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Activity,
    AlertTriangle,
    History,
    AlarmClock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import StatCard from '../components/StatCard';
import { cn } from '../utils/cn';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [deadlines, setDeadlines] = useState({ upcoming: [], overdue: [] });
    const navigate = useNavigate();

    useEffect(() => {
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
        fetchDashboardData();

        api.get('/deadlines/upcoming').then(res => setDeadlines(res.data)).catch(() => { });
    }, []);

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const { stats, recentCases, upcomingHearings, urgentCases, recentActivity } = data || {};

    const iconMap = {
        'Total Cases': <Briefcase className="w-5 h-5" />,
        'Active Cases': <Scale className="w-5 h-5" />,
        'Upcoming Hearings': <Calendar className="w-5 h-5" />,
        'Total Clients': <Users className="w-5 h-5" />,
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Overview of your firm's performance and activity.</p>
                </div>
                <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow hover:bg-primary/90 transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                    Export Report
                </button>
            </div>

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
                {/* Recent Cases Table */}
                <div className="lg:col-span-2 bg-card border border-border rounded-xl">
                    <div className="p-6 border-b border-border flex items-center justify-between">
                        <h3 className="font-bold">Recent Cases</h3>
                        <button className="text-sm text-primary hover:underline">View all</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-accent/50 text-muted-foreground text-xs uppercase tracking-wider">
                                    <th className="px-6 py-3 font-semibold">Case Title</th>
                                    <th className="px-6 py-3 font-semibold">Lawyer</th>
                                    <th className="px-6 py-3 font-semibold">Status</th>
                                    <th className="px-6 py-3 font-semibold">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {recentCases?.length > 0 ? recentCases.map((c) => (
                                    <tr key={c._id} className="hover:bg-accent/30 transition-colors text-sm">
                                        <td className="px-6 py-4">
                                            <div className="font-medium">{c.case_title}</div>
                                            <div className="text-xs text-muted-foreground">{c.case_number}</div>
                                        </td>
                                        <td className="px-6 py-4">{c.lawyer_id?.name || 'Unassigned'}</td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                                                c.status === 'Active' ? "bg-green-500/10 text-green-600" : "bg-gray-500/10 text-gray-600"
                                            )}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {new Date(c.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-muted-foreground italic">
                                            No recent cases found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Upcoming Hearings */}
                <div className="bg-card border border-border rounded-xl">
                    <div className="p-6 border-b border-border">
                        <h3 className="font-bold">Upcoming Hearings</h3>
                    </div>
                    <div className="p-6 space-y-6">
                        {upcomingHearings?.length > 0 ? upcomingHearings.map((hearing, i) => (
                            <div key={i} className="flex gap-4">
                                <div className={cn("mt-1 text-primary")}>
                                    <Clock className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-sm leading-none mb-1">
                                        Hearing #{hearing.case_id?.case_number}
                                    </p>
                                    <p className="text-xs text-muted-foreground mb-1 truncate">{hearing.case_id?.case_title}</p>
                                    <p className="text-xs font-bold text-primary">
                                        {new Date(hearing.hearing_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-4 text-muted-foreground text-sm italic">
                                No upcoming hearings.
                            </div>
                        )}
                        <button
                            onClick={() => navigate('/calendar')}
                            className="w-full py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-border transition-colors"
                        >
                            View Calendar
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Urgent Cases */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold flex items-center gap-2 text-red-600 uppercase tracking-widest text-xs">
                            <AlertTriangle className="w-4 h-4" />
                            Urgent Attention
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {urgentCases?.map(c => (
                            <div key={c._id} className="p-4 bg-red-50/10 border border-red-100/20 rounded-xl hover:bg-red-50/20 transition-all flex items-center justify-between group border-l-4 border-l-red-500">
                                <div>
                                    <p className="font-bold text-sm truncate">{c.case_title}</p>
                                    <p className="text-xs text-muted-foreground">Lawyer: {c.lawyer_id?.name || 'Unassigned'}</p>
                                </div>
                                <ArrowUpRight className="w-4 h-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        ))}
                        {(!urgentCases || urgentCases.length === 0) && (
                            <p className="text-sm text-muted-foreground italic text-center py-8">No urgent cases flagged.</p>
                        )}
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="font-bold mb-6 flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                        <History className="w-4 h-4 text-primary" />
                        Live Firm Activity
                    </h3>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {recentActivity?.map((act) => (
                            <div key={act._id} className="flex gap-3 text-sm pb-4 border-b border-border/50 last:border-0">
                                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                                    <Activity className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium text-foreground">{act.description}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">{act.case_id?.case_title}</span>
                                        <span className="text-[10px] text-muted-foreground font-medium">{formatDistanceToNow(new Date(act.created_at), { addSuffix: true })}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Deadlines Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Upcoming Deadlines */}
                <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                        <AlarmClock className="w-5 h-5 text-orange-500" />
                        Upcoming Deadlines (7 days)
                    </h3>
                    <div className="space-y-3">
                        {(deadlines.upcoming || []).length === 0 ? (
                            <p className="text-muted-foreground text-sm text-center py-2">No upcoming deadlines.</p>
                        ) : deadlines.upcoming.map(d => (
                            <div key={d._id} className="flex items-center justify-between text-sm">
                                <div>
                                    <p className="font-medium">{d.deadline_title}</p>
                                    <p className="text-xs text-muted-foreground">{d.case_id?.case_number || 'Unknown'}</p>
                                </div>
                                <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full">{new Date(d.deadline_date).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Overdue Deadlines */}
                <div className="bg-card border border-red-500/20 rounded-xl p-6">
                    <h3 className="font-bold text-base mb-4 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        Overdue Deadlines
                    </h3>
                    <div className="space-y-3">
                        {(deadlines.overdue || []).length === 0 ? (
                            <p className="text-muted-foreground text-sm text-center py-2">No overdue deadlines. ✅</p>
                        ) : deadlines.overdue.map(d => (
                            <div key={d._id} className="flex items-center justify-between text-sm">
                                <div>
                                    <p className="font-medium text-red-500">{d.deadline_title}</p>
                                    <p className="text-xs text-muted-foreground">{d.case_id?.case_number || 'Unknown'}</p>
                                </div>
                                <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full">{new Date(d.deadline_date).toLocaleDateString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
