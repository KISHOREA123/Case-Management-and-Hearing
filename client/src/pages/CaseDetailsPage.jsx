import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Plus,
    AlertTriangle,
    FolderOpen,
    Download,
    Trash2,
    ArrowLeft,
    FileText,
    Calendar,
    Scale,
    Clock,
    MapPin,
    User,
    History,
    AlarmClock,
    CheckCircle2,
    XCircle,
    Pencil
} from 'lucide-react';
import Dropdown, { DropdownItem, DropdownDivider } from '../components/Dropdown';
import CaseTimeline from '../components/CaseTimeline';
import CaseProgressTracker from '../components/CaseProgressTracker';
import DocumentManager from '../components/DocumentManager';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { cn } from '../utils/cn';
import CustomSelect from '../components/CustomSelect';
import { X } from 'lucide-react';

const CaseDetailsPage = () => {
    const { id } = useParams();
    const [caseData, setCaseData] = useState(null);
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHearingModalOpen, setIsHearingModalOpen] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const { user } = useAuth();
    const [deadlines, setDeadlines] = useState([]);
    const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);
    const [editingDeadline, setEditingDeadline] = useState(null);
    const [deadlineForm, setDeadlineForm] = useState({ deadline_title: '', deadline_date: '', description: '' });

    // Form State
    const [formData, setFormData] = useState({
        case_title: '',
        case_number: '',
        case_type_id: '',
        court_id: '',
        petitioner: '',
        defender: '',
        filing_date: '',
        description: '',
        priority: 'Medium',
        lawyer_id: ''
    });

    const [hearingFormData, setHearingFormData] = useState({
        hearing_date: '',
        hearing_time: '',
        courtroom: '',
        notes: '',
        status: 'scheduled'
    });

    const [lawyers, setLawyers] = useState([]);
    const [caseTypes, setCaseTypes] = useState([]);
    const [courts, setCourts] = useState([]);

    useEffect(() => {
        fetchCaseDetails();
        fetchDeadlines();
        if (user?.role === 'admin' || user?.role === 'lawyer') {
            fetchMetadata();
        }
    }, [id]);

    const fetchMetadata = async () => {
        try {
            const [lRes, tRes, cRes] = await Promise.all([
                user?.role === 'admin' ? api.get('/lawyers') : Promise.resolve({ data: [] }),
                api.get('/case-types'),
                api.get('/courts')
            ]);
            setLawyers(lRes.data);
            setCaseTypes(tRes.data);
            setCourts(cRes.data);
        } catch (error) {
            console.error('Metadata fetch error', error);
        }
    };

    const fetchDeadlines = async () => {
        try {
            const res = await api.get(`/cases/${id}/deadlines`);
            setDeadlines(res.data);
        } catch (error) {
            console.error('Failed to fetch deadlines', error);
        }
    };

    const handleSubmitDeadline = async (e) => {
        e.preventDefault();
        try {
            if (editingDeadline) {
                await api.put(`/cases/${id}/deadlines/${editingDeadline._id}`, deadlineForm);
                toast.success('Deadline updated');
            } else {
                await api.post(`/cases/${id}/deadlines`, deadlineForm);
                toast.success('Deadline added');
            }
            setIsDeadlineModalOpen(false);
            setEditingDeadline(null);
            setDeadlineForm({ deadline_title: '', deadline_date: '', description: '' });
            fetchDeadlines();
        } catch (error) {
            toast.error('Failed to save deadline');
        }
    };

    const handleMarkComplete = async (deadline) => {
        try {
            await api.put(`/cases/${id}/deadlines/${deadline._id}`, { status: 'Completed' });
            toast.success('Marked as completed');
            fetchDeadlines();
        } catch (error) {
            toast.error('Failed to update deadline');
        }
    };

    const handleDeleteDeadline = async (deadlineId) => {
        if (window.confirm('Delete this deadline?')) {
            try {
                await api.delete(`/cases/${id}/deadlines/${deadlineId}`);
                toast.success('Deadline deleted');
                fetchDeadlines();
            } catch (error) {
                toast.error('Failed to delete deadline');
            }
        }
    };

    const fetchCaseDetails = async () => {
        try {
            const [caseRes, timelineRes, invoiceRes] = await Promise.all([
                api.get(`/cases/${id}`),
                api.get(`/timeline/${id}`),
                api.get(`/invoices?case_id=${id}`)
            ]);
            setCaseData(caseRes.data);
            setTimeline(timelineRes.data);
            setInvoices(invoiceRes.data);
        } catch (error) {
            toast.error('Failed to fetch case details');
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (status) => {
        try {
            await api.put(`/cases/${id}`, { status });
            toast.success(`Case status updated to ${status}`);
            fetchCaseDetails();
        } catch (error) {
            toast.error('Failed to update case status');
        }
    };

    const handleEditClick = () => {
        setFormData({
            case_title: caseData.case_title,
            case_number: caseData.case_number,
            case_type_id: caseData.case_type_id?._id || caseData.case_type_id,
            court_id: caseData.court_id?._id || caseData.court_id,
            petitioner: caseData.petitioner,
            defender: caseData.defender,
            filing_date: caseData.filing_date ? new Date(caseData.filing_date).toISOString().split('T')[0] : '',
            description: caseData.description || '',
            priority: caseData.priority || 'Medium',
            lawyer_id: caseData.lawyer_id?._id || caseData.lawyer_id || ''
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/cases/${id}`, formData);
            toast.success('Case updated successfully');
            setIsModalOpen(false);
            fetchCaseDetails();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed');
        }
    };

    const handleScheduleHearing = () => {
        setHearingFormData({
            hearing_date: '',
            hearing_time: '',
            courtroom: '',
            notes: '',
            status: 'scheduled'
        });
        setIsHearingModalOpen(true);
    };

    const submitHearing = async (e) => {
        e.preventDefault();
        try {
            await api.post('/hearings', {
                ...hearingFormData,
                case_id: id
            });
            toast.success('Hearing scheduled successfully');
            setIsHearingModalOpen(false);
            fetchCaseDetails();
        } catch (error) {
            toast.error('Failed to schedule hearing');
        }
    };

    if (loading) return <div className="p-8 text-center text-muted-foreground">Loading case details...</div>;
    if (!caseData) return <div className="p-8 text-center text-destructive">Case not found.</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to="/cases" className="p-2 hover:bg-accent rounded-full text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold tracking-tight">{caseData.case_title}</h1>
                            <span className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-medium uppercase tracking-wider",
                                caseData.status === 'active' ? "bg-green-500/10 text-green-600" : "bg-gray-500/10 text-gray-600"
                            )}>
                                {caseData.status}
                            </span>
                        </div>
                        <p className="text-muted-foreground">
                            Case #{caseData.case_number} • {caseData.case_type_id?.name || 'General'}
                            {caseData.court_id && ` • ${caseData.court_id.court_name} (${caseData.court_id.court_number})`}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    {user?.role !== 'client' && (
                        <>
                            <button
                                onClick={handleEditClick}
                                className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                            >
                                Edit Case
                            </button>
                            <Dropdown
                                trigger={
                                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold shadow-lg hover:bg-primary/90 transition-all">Update Status</button>
                                }
                            >
                                <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Workflow State</div>
                                <DropdownItem onClick={() => updateStatus('Filed')}>Mark as Filed</DropdownItem>
                                <DropdownItem onClick={() => updateStatus('Under Investigation')}>Investigation</DropdownItem>
                                <DropdownItem onClick={() => updateStatus('Trial Ongoing')}>Trial Ongoing</DropdownItem>
                                <DropdownItem onClick={() => updateStatus('Judgment Pending')}>Judgment Pending</DropdownItem>
                                <DropdownDivider />
                                <DropdownItem icon={<Trash2 className="w-4 h-4" />} danger onClick={() => updateStatus('Closed')}>Close Case</DropdownItem>
                            </Dropdown>
                        </>
                    )}
                </div>
            </div>

            {/* Progress Tracker for Clients (or all for context) */}
            <div className="bg-card border border-border rounded-xl p-8 shadow-sm">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-8 text-center">Current Case Progress</h3>
                <CaseProgressTracker status={caseData.status} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details & Description */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-card border border-border rounded-xl p-6 flex items-center gap-4">
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center",
                                caseData.priority === 'Urgent' ? "bg-red-500/10 text-red-600" :
                                    caseData.priority === 'High' ? "bg-orange-500/10 text-orange-600" :
                                        "bg-blue-500/10 text-blue-600"
                            )}>
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Priority</p>
                                <p className="font-bold text-lg">{caseData.priority || 'Medium'}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2 italic"><FileText className="w-4 h-4" /> Description</h3>
                        <p className="text-muted-foreground leading-relaxed">
                            {caseData.description || 'No description provided for this case.'}
                        </p>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold flex items-center gap-2"><Calendar className="w-4 h-4" /> Hearings History</h3>
                            <button
                                onClick={handleScheduleHearing}
                                className="text-xs text-primary hover:underline flex items-center gap-1 font-bold"
                            >
                                <Plus className="w-3 h-3" /> Schedule New
                            </button>
                        </div>
                        <div className="space-y-4">
                            {caseData.hearings?.map((h, i) => (
                                <div key={h._id || i} className="flex items-start gap-4 p-4 bg-accent/30 rounded-lg border border-transparent hover:border-border transition-all">
                                    <div className="mt-1 p-2 bg-background rounded-full">
                                        <Scale className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <p className="font-bold text-sm">Status Conference</p>
                                            <span className="text-xs font-medium capitalize opacity-60">{h.status}</span>
                                        </div>
                                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(h.hearing_date).toLocaleDateString()}</span>
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {h.hearing_time}</span>
                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {h.courtroom || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {!caseData.hearings?.length && <p className="text-sm text-muted-foreground italic">No hearings recorded for this case.</p>}
                        </div>
                    </div>

                    <DocumentManager caseId={id} />

                    {/* Invoices Section */}
                    <div className="bg-card border border-border rounded-xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold flex items-center gap-2 italic"><FileText className="w-4 h-4" /> Billing & Invoices</h3>
                            {user?.role !== 'client' && (
                                <Link
                                    to={`/invoices`}
                                    className="text-xs text-primary hover:underline flex items-center gap-1 font-bold"
                                >
                                    <Plus className="w-3 h-3" /> Create New
                                </Link>
                            )}
                        </div>
                        <div className="space-y-3">
                            {invoices.length > 0 ? invoices.map((inv) => (
                                <div key={inv._id} className="flex items-center justify-between p-4 bg-accent/30 rounded-lg border border-transparent hover:border-border transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-background rounded-lg">
                                            <FileText className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{inv.invoice_number}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Due: {new Date(inv.due_date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm font-mono">₹{parseFloat(inv.amount).toFixed(2)}</p>
                                        <span className={cn(
                                            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                                            inv.status === 'paid' ? "bg-green-500/10 text-green-600" :
                                                inv.status === 'overdue' ? "bg-red-500/10 text-red-600" :
                                                    "bg-orange-500/10 text-orange-600"
                                        )}>
                                            {inv.status}
                                        </span>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-sm text-muted-foreground italic">No invoices issued for this case yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Roles & Meta */}
                <div className="space-y-8">
                    <div className="bg-card border border-border rounded-xl p-6">
                        <h3 className="font-bold mb-6">Parties Involved</h3>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                    <Scale className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Lawyer</p>
                                    <p className="font-bold">{caseData.lawyer?.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">{user?.role === 'admin' ? 'Client' : 'Petitioner (Client)'}</p>
                                    <p className="font-bold">{caseData.petitioner}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">{user?.role === 'admin' ? 'Client' : 'Defender'}</p>
                                    <p className="font-bold">{caseData.defender}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border border-border rounded-xl p-6">
                        <h3 className="font-bold mb-6 flex items-center justify-between">
                            <span>Case Timeline</span>
                            <History className="w-4 h-4 text-muted-foreground" />
                        </h3>
                        <CaseTimeline timeline={timeline} />
                    </div>
                </div>
            </div>

            {/* Deadlines Section */}
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold flex items-center gap-2">
                        <AlarmClock className="w-5 h-5 text-orange-500" />
                        Case Deadlines
                    </h3>
                    {(user?.role === 'admin' || user?.role === 'lawyer') && (
                        <button
                            onClick={() => { setEditingDeadline(null); setDeadlineForm({ deadline_title: '', deadline_date: '', description: '' }); setIsDeadlineModalOpen(true); }}
                            className="flex items-center gap-1 text-sm bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 px-3 py-1.5 rounded-lg transition-colors font-medium"
                        >
                            <Plus className="w-4 h-4" /> Add Deadline
                        </button>
                    )}
                </div>
                {deadlines.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">No deadlines added for this case.</p>
                ) : (
                    <div className="divide-y divide-border">
                        {deadlines.map((d) => {
                            const isOverdue = d.status === 'Pending' && new Date(d.deadline_date) < new Date();
                            return (
                                <div key={d._id} className={`py-3 flex items-center justify-between gap-4 ${isOverdue ? 'bg-red-500/5 -mx-6 px-6 rounded' : ''}`}>
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${d.status === 'Completed' ? 'bg-green-500' : d.status === 'Missed' || isOverdue ? 'bg-red-500' : 'bg-orange-500'}`} />
                                        <div className="min-w-0">
                                            <p className={`font-medium text-sm ${d.status === 'Completed' ? 'line-through text-muted-foreground' : isOverdue ? 'text-red-500' : ''}`}>{d.deadline_title}</p>
                                            <p className="text-xs text-muted-foreground">{new Date(d.deadline_date).toLocaleDateString()} {isOverdue && d.status === 'Pending' ? '· ⚠ Overdue' : ''}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.status === 'Completed' ? 'bg-green-500/10 text-green-500' : d.status === 'Missed' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                            {d.status}
                                        </span>
                                        {(user?.role === 'admin' || user?.role === 'lawyer') && d.status === 'Pending' && (
                                            <button onClick={() => handleMarkComplete(d)} title="Mark Complete" className="text-green-500 hover:text-green-400">
                                                <CheckCircle2 className="w-4 h-4" />
                                            </button>
                                        )}
                                        {(user?.role === 'admin' || user?.role === 'lawyer') && (
                                            <button onClick={() => { setEditingDeadline(d); setDeadlineForm({ deadline_title: d.deadline_title, deadline_date: d.deadline_date ? new Date(d.deadline_date).toISOString().split('T')[0] : '', description: d.description || '' }); setIsDeadlineModalOpen(true); }} title="Edit" className="text-muted-foreground hover:text-foreground">
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                        )}
                                        {user?.role === 'admin' && (
                                            <button onClick={() => handleDeleteDeadline(d._id)} title="Delete" className="text-muted-foreground hover:text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Edit Case Modal */}

            {isModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-2xl border border-border rounded-2xl shadow-2xl overflow-hidden scale-in-center transition-transform">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h2 className="text-xl font-bold">Edit Case</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-accent rounded-full transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Case Title</label>
                                    <input
                                        className="w-full bg-accent/30 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        required
                                        value={formData.case_title}
                                        onChange={(e) => setFormData({ ...formData, case_title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Case Number</label>
                                    <input
                                        className="w-full bg-accent/30 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        required
                                        value={formData.case_number}
                                        onChange={(e) => setFormData({ ...formData, case_number: e.target.value })}
                                    />
                                </div>
                                <CustomSelect
                                    label="Case Type"
                                    required
                                    placeholder="Select Type"
                                    options={caseTypes.map(t => ({ value: t._id, label: t.name }))}
                                    value={formData.case_type_id}
                                    onChange={(val) => setFormData({ ...formData, case_type_id: val })}
                                />
                                <CustomSelect
                                    label="Court"
                                    required
                                    placeholder="Select Court"
                                    options={courts.map(c => ({
                                        value: c._id,
                                        label: c.court_name,
                                        sublabel: c.court_number
                                    }))}
                                    value={formData.court_id}
                                    onChange={(val) => setFormData({ ...formData, court_id: val })}
                                />
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Petitioner</label>
                                    <input
                                        className="w-full bg-accent/30 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        required
                                        value={formData.petitioner}
                                        onChange={(e) => setFormData({ ...formData, petitioner: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Defender</label>
                                    <input
                                        className="w-full bg-accent/30 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        required
                                        value={formData.defender}
                                        onChange={(e) => setFormData({ ...formData, defender: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Filing Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-accent/30 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        required
                                        value={formData.filing_date}
                                        onChange={(e) => setFormData({ ...formData, filing_date: e.target.value })}
                                    />
                                </div>
                                {user?.role === 'admin' && (
                                    <CustomSelect
                                        label="Assign Lawyer"
                                        required
                                        placeholder="Select Lawyer"
                                        options={lawyers.map(l => ({ value: l._id, label: l.name, sublabel: l.email }))}
                                        value={formData.lawyer_id}
                                        onChange={(val) => setFormData({ ...formData, lawyer_id: val })}
                                    />
                                )}
                                <CustomSelect
                                    label="Priority"
                                    required
                                    placeholder="Select Priority"
                                    options={[
                                        { value: 'Low', label: 'Low' },
                                        { value: 'Medium', label: 'Medium' },
                                        { value: 'High', label: 'High' },
                                        { value: 'Urgent', label: 'Urgent' }
                                    ]}
                                    value={formData.priority}
                                    onChange={(val) => setFormData({ ...formData, priority: val })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    className="w-full bg-accent/30 border border-border rounded-lg px-4 py-2 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg border border-border hover:bg-accent text-sm font-medium">Cancel</button>
                                <button type="submit" className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold shadow-lg">Update Case</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Schedule Hearing Modal */}
            {isHearingModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-xl border border-border rounded-2xl shadow-2xl overflow-hidden scale-in-center transition-transform">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h2 className="text-xl font-bold">Schedule New Hearing</h2>
                            <button onClick={() => setIsHearingModalOpen(false)} className="p-2 hover:bg-accent rounded-full transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={submitHearing} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Hearing Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-accent/30 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        required
                                        value={hearingFormData.hearing_date}
                                        onChange={(e) => setHearingFormData({ ...hearingFormData, hearing_date: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium">Hearing Time</label>
                                    <input
                                        type="time"
                                        className="w-full bg-accent/30 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        required
                                        value={hearingFormData.hearing_time}
                                        onChange={(e) => setHearingFormData({ ...hearingFormData, hearing_time: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Courtroom</label>
                                <input
                                    className="w-full bg-accent/30 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="e.g. 4B"
                                    value={hearingFormData.courtroom}
                                    onChange={(e) => setHearingFormData({ ...hearingFormData, courtroom: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Notes</label>
                                <textarea
                                    className="w-full bg-accent/30 border border-border rounded-lg px-4 py-2 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    value={hearingFormData.notes}
                                    onChange={(e) => setHearingFormData({ ...hearingFormData, notes: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-border">
                                <button type="button" onClick={() => setIsHearingModalOpen(false)} className="px-6 py-2 rounded-lg border border-border hover:bg-accent text-sm font-medium">Cancel</button>
                                <button type="submit" className="px-6 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold shadow-lg transition-all">Schedule</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Deadline Modal */}
            {isDeadlineModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                    <div className="bg-card w-full max-w-md border border-border rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-border flex items-center justify-between">
                            <h2 className="text-xl font-bold">{editingDeadline ? 'Edit Deadline' : 'Add Deadline'}</h2>
                            <button onClick={() => setIsDeadlineModalOpen(false)} className="p-2 hover:bg-accent rounded-full transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSubmitDeadline} className="p-6 space-y-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Deadline Title *</label>
                                <input
                                    required
                                    className="w-full bg-accent/30 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="e.g. Evidence Submission"
                                    value={deadlineForm.deadline_title}
                                    onChange={(e) => setDeadlineForm({ ...deadlineForm, deadline_title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Deadline Date *</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-accent/30 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    value={deadlineForm.deadline_date}
                                    onChange={(e) => setDeadlineForm({ ...deadlineForm, deadline_date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    className="w-full bg-accent/30 border border-border rounded-lg px-4 py-2 text-sm h-20 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="Optional details..."
                                    value={deadlineForm.description}
                                    onChange={(e) => setDeadlineForm({ ...deadlineForm, description: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2 border-t border-border">
                                <button type="button" onClick={() => setIsDeadlineModalOpen(false)} className="px-4 py-2 rounded-lg border border-border hover:bg-accent text-sm">Cancel</button>
                                <button type="submit" className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 text-sm font-bold">{editingDeadline ? 'Update' : 'Add Deadline'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CaseDetailsPage;
