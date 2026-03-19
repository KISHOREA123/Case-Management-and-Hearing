import React, { useState, useEffect } from 'react';
import {
    User,
    Check,
    X,
    Clock,
    Shield,
    Phone,
    Mail,
    Briefcase,
    Loader2,
    Inbox
} from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { cn } from '../utils/cn';

const AccessRequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchRequests = async () => {
        try {
            const { data } = await api.get('/cases/access-requests');
            setRequests(data);
        } catch (error) {
            toast.error('Failed to fetch requests');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleAction = async (requestId, status) => {
        setActionLoading(requestId);
        try {
            await api.put(`/cases/access-requests/${requestId}`, { status });
            toast.success(`Request ${status.toLowerCase()} successfully`);
            setRequests(prev => prev.filter(r => r._id !== requestId));
        } catch (error) {
            toast.error('Failed to process request');
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Case Access Requests</h1>
                <p className="text-muted-foreground">Verify client details and grant read-only access to cases.</p>
            </div>

            {requests.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-12 text-center space-y-4 shadow-sm">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold">No Pending Requests</h2>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                        All access requests have been processed. New requests from clients will appear here.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {requests.map((request) => (
                        <div key={request._id} className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-6 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                        <User className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
                                        <Clock className="w-3 h-3" />
                                        Pending
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold">{request.client_id?.name || 'Unknown Client'}</h3>
                                    <div className="space-y-1.5 mt-2">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Mail className="w-3.5 h-3.5" />
                                            {request.client_id?.email}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Phone className="w-3.5 h-3.5" />
                                            {request.client_id?.phone || 'N/A'}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Requested Access To</p>
                                    <div className="bg-accent/50 p-3 rounded-xl flex items-center gap-3">
                                        <Briefcase className="w-4 h-4 text-primary" />
                                        <div>
                                            <p className="text-sm font-bold text-primary">{request.case_id?.case_number}</p>
                                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{request.case_id?.case_title}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => handleAction(request._id, 'Approved')}
                                        disabled={actionLoading === request._id}
                                        className="flex-1 bg-green-500 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        {actionLoading === request._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleAction(request._id, 'Rejected')}
                                        disabled={actionLoading === request._id}
                                        className="flex-1 bg-destructive/10 text-destructive px-4 py-2 rounded-xl text-sm font-bold hover:bg-destructive/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <X className="w-4 h-4" />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AccessRequestsPage;
