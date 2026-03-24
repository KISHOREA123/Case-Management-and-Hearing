import React, { useState, useEffect } from 'react';
import {
    Plus,
    Calendar,
    Clock,
    MapPin,
    MoreVertical,
    CheckCircle2,
    AlertCircle,
    X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { cn } from '../utils/cn';
import CustomSelect from '../components/CustomSelect';

const HearingsPage = () => {
    const [hearings, setHearings] = useState([]);
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        case_id: '',
        hearing_date: '',
        hearing_time: '',
        courtroom: '',
        status: 'scheduled',
        notes: ''
    });

    useEffect(() => {
        fetchHearings();
        fetchCases();
    }, []);

    const fetchHearings = async () => {
        try {
            const { data } = await api.get('/hearings');
            setHearings(data);
        } catch (error) {
            toast.error('Failed to fetch hearings');
        } finally {
            setLoading(false);
        }
    };

    const fetchCases = async () => {
        try {
            const { data } = await api.get('/cases');
            setCases(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/hearings', formData);
            toast.success('Hearing scheduled');
            setIsModalOpen(false);
            fetchHearings();
        } catch (error) {
            toast.error('Failed to schedule hearing');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'scheduled': return 'bg-blue-500/10 text-blue-600';
            case 'completed': return 'bg-green-500/10 text-green-600';
            case 'postponed': return 'bg-orange-500/10 text-orange-600';
            default: return 'bg-gray-500/10 text-gray-600';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Hearings</h1>
                    <p className="text-muted-foreground">Keep track of all upcoming and past court sessions.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow hover:bg-primary/90 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Schedule Hearing
                </button>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-accent/50 text-muted-foreground text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Case</th>
                                <th className="px-6 py-4 font-semibold">Date & Time</th>
                                <th className="px-6 py-4 font-semibold">Courtroom</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Notes</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-sm">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-10 text-center text-muted-foreground">Loading hearings...</td></tr>
                            ) : hearings.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-10 text-center text-muted-foreground">No hearings scheduled.</td></tr>
                            ) : hearings.map((h) => (
                                <tr key={h._id} className="hover:bg-accent/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <p className="font-semibold">{h.case_id?.case_title}</p>
                                        <p className="text-xs text-muted-foreground">{h.case_id?.case_number}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Calendar className="w-3 h-3 text-primary" />
                                            <span>{new Date(h.hearing_date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            <span>{h.hearing_time}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-muted-foreground" />
                                            <span>{h.courtroom || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", getStatusColor(h.status))}>
                                            {h.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 max-w-xs truncate text-muted-foreground">
                                        {h.notes || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => navigate(`/cases/${h.case_id?._id}`)}
                                            className="p-2 hover:bg-accent rounded-lg transition-colors text-primary font-medium text-xs flex items-center gap-1 ml-auto"
                                        >
                                            View Case
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-xl border border-border rounded-2xl shadow-2xl overflow-hidden scale-in-center">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h2 className="text-xl font-bold">Schedule New Hearing</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-accent rounded-full transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <CustomSelect
                                label="Select Case"
                                required
                                placeholder="Search Case Title or Number"
                                options={cases.map(c => ({
                                    value: c._id,
                                    label: c.case_title,
                                    sublabel: c.case_number
                                }))}
                                value={formData.case_id}
                                onChange={(val) => setFormData({ ...formData, case_id: val })}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Hearing Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-accent/30 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        required
                                        value={formData.hearing_date}
                                        onChange={(e) => setFormData({ ...formData, hearing_date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Hearing Time</label>
                                    <input
                                        type="time"
                                        className="w-full bg-accent/30 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        required
                                        value={formData.hearing_time}
                                        onChange={(e) => setFormData({ ...formData, hearing_time: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Courtroom</label>
                                <input
                                    className="w-full bg-accent/30 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="e.g. 4B"
                                    value={formData.courtroom}
                                    onChange={(e) => setFormData({ ...formData, courtroom: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Notes</label>
                                <textarea
                                    className="w-full bg-accent/30 border border-border rounded-lg px-4 py-2 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg border border-border hover:bg-accent text-sm font-medium">Cancel</button>
                                <button type="submit" className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold shadow-lg transition-all">Schedule</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HearingsPage;
