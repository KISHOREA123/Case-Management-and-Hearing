import React, { useState, useEffect } from 'react';
import {
    Briefcase,
    Calendar,
    Users,
    Clock,
    ExternalLink,
    Plus,
    Loader2,
    Activity,
    History,
    AlertTriangle,
    AlarmClock
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import StatCard from '../components/StatCard';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { cn } from '../utils/cn';

const LawyerDashboard = () => {
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
        'My Cases': <Briefcase className="w-5 h-5" />,
        'Active Cases': <Briefcase className="w-5 h-5" />,
        'My Hearings': <Calendar className="w-5 h-5" />,
        'My Clients': <Users className="w-5 h-5" />,
    };

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Lawyer Dashboard</h1>
                    <p className="text-muted-foreground">Here's what's happening with your cases today.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/hearings')}
                        className="flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-lg font-medium hover:bg-border transition-all"
                    >
                        Schedule Hearing
                    </button>
                    <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow hover:bg-primary/90 transition-all">
                        <Plus className="w-4 h-4" />
                        New Case
                    </button>
                </div>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upcoming Hearings */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            Next Hearings
                        </h3>
                    </div>
                    <div className="space-y-4">
                        {upcomingHearings?.length > 0 ? upcomingHearings.map((h, i) => (
                            <div key={h._id} className={cn(
                                "p-4 rounded-xl border border-transparent transition-all",
                                i === 0 ? "bg-primary/5 border-primary/10 shadow-sm" : "hover:bg-accent/50 hover:border-border"
                            )}>
                                <div className="flex justify-between items-start">
                                    <p className="font-bold text-sm">{h.case_id?.case_title}</p>
                                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{h.status}</span>
                                </div>
                                <div className="flex gap-4 mt-2 text-xs text-muted-foreground font-medium">
                                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(h.hearing_date).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {h.hearing_time}</span>
                                </div>
                            </div>
                        )) : (
                            <div className="py-8 text-center text-muted-foreground italic text-sm">No upcoming sessions.</div>
                        )}
                    </div>
                </div>

                {/* Case Activity Feed */}
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <h3 className="font-bold mb-6 flex items-center gap-2">
                        <History className="w-4 h-4 text-primary" />
                        My Recent Activity
                    </h3>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {recentActivity?.map((act) => (
                            <div key={act._id} className="flex gap-3 text-sm pb-4 border-b border-border/50 last:border-0 group">
                                <div className="w-8 h-8 rounded-full bg-accent/50 flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                                    <Activity className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                                </div>
                                <div>
                                    <p className="font-medium">{act.description}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] text-primary font-bold">{act.case_id?.case_title}</span>
                                        <span className="text-[10px] text-muted-foreground">{formatDistanceToNow(new Date(act.created_at), { addSuffix: true })}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* My Urgent Cases */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold flex items-center gap-2 text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        Urgent Cases
                    </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {urgentCases?.map(c => (
                        <div key={c._id} className="p-4 bg-red-50/5 border border-red-100/20 rounded-xl hover:bg-red-50/10 transition-all flex flex-col justify-between group">
                            <div className="mb-4">
                                <p className="font-bold text-sm">{c.case_title}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-1">Case #{c.case_number}</p>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold">URGENT</span>
                                <ExternalLink className="w-4 h-4 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    ))}
                    {(!urgentCases || urgentCases.length === 0) && (
                        <p className="col-span-full text-sm text-muted-foreground italic text-center py-8">No urgent cases currently flagged.</p>
                    )}
                </div>
            </div>

            {/* Deadlines Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="font-bold text-base mb-4 flex items-center gap-2"><AlarmClock className="w-5 h-5 text-orange-500" />Upcoming Deadlines (7 days)</h3>
                    <div className="space-y-3">
                        {(deadlines.upcoming || []).length === 0 ? <p className="text-muted-foreground text-sm text-center py-2">No upcoming deadlines.</p>
                            : deadlines.upcoming.map(d => (
                                <div key={d._id} className="flex items-center justify-between text-sm">
                                    <div><p className="font-medium">{d.deadline_title}</p><p className="text-xs text-muted-foreground">{d.case_id?.case_number || 'Unknown'}</p></div>
                                    <span className="text-xs bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full">{new Date(d.deadline_date).toLocaleDateString()}</span>
                                </div>
                            ))}
                    </div>
                </div>
                <div className="bg-card border border-red-500/20 rounded-xl p-6">
                    <h3 className="font-bold text-base mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-500" />Overdue Deadlines</h3>
                    <div className="space-y-3">
                        {(deadlines.overdue || []).length === 0 ? <p className="text-muted-foreground text-sm text-center py-2">No overdue deadlines. ✅</p>
                            : deadlines.overdue.map(d => (
                                <div key={d._id} className="flex items-center justify-between text-sm">
                                    <div><p className="font-medium text-red-500">{d.deadline_title}</p><p className="text-xs text-muted-foreground">{d.case_id?.case_number || 'Unknown'}</p></div>
                                    <span className="text-xs bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full">{new Date(d.deadline_date).toLocaleDateString()}</span>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LawyerDashboard;
