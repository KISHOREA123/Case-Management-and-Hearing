import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Shield, ShieldAlert, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

const RolePermissionsPage = () => {
    const { user } = useAuth();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    const permissionKeys = [
        { key: 'case_create', label: 'Create Cases', desc: 'Allow adding new cases' },
        { key: 'case_edit', label: 'Edit Cases', desc: 'Allow modifying existing cases' },
        { key: 'case_delete', label: 'Delete Cases', desc: 'Allow removing cases permanently' },
        { key: 'hearing_create', label: 'Schedule Hearings', desc: 'Allow scheduling new hearings' },
        { key: 'document_upload', label: 'Upload Documents', desc: 'Allow uploading files to cases' },
        { key: 'message_send', label: 'Send Messages', desc: 'Allow sending chat messages' },
        { key: 'invoice_generate', label: 'Generate Invoices', desc: 'Allow creating and sending invoices' }
    ];

    const fetchPermissions = async () => {
        setLoading(true);
        try {
            const res = await api.get('/permissions');
            setRoles(res.data);
        } catch (error) {
            toast.error('Failed to load permissions');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPermissions();
    }, []);

    const handleToggle = async (roleName, permissionKey, currentValue) => {
        try {
            const res = await api.put('/permissions', {
                role: roleName,
                permission_key: permissionKey,
                allowed: !currentValue
            });

            // Update local state to reflect change instantly
            setRoles(prev => prev.map(r => {
                if (r.role === roleName) {
                    const newPermissions = { ...(r.permissions || {}) };
                    newPermissions[permissionKey] = !currentValue;
                    return { ...r, permissions: newPermissions };
                }
                return r;
            }));

            toast.success('Permission updated');
        } catch (error) {
            toast.error('Failed to update permission');
            console.error(error);
            fetchPermissions(); // Revert on failure
        }
    };

    if (user?.role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold">Access Denied</h2>
                <p className="text-muted-foreground mt-2">Only administrators can manage role permissions.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Role Permissions</h1>
                    <p className="text-muted-foreground mt-1">Configure feature access for Lawyers and Clients.</p>
                </div>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-accent/50 border-b border-border">
                            <tr>
                                <th className="px-6 py-4 font-semibold w-1/3">Permission</th>
                                <th className="px-6 py-4 font-semibold text-center">Lawyer</th>
                                <th className="px-6 py-4 font-semibold text-center">Client</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            <span>Loading permission matrix...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                permissionKeys.map(({ key, label, desc }) => {
                                    const lawyerRole = roles.find(r => r.role === 'lawyer');
                                    const clientRole = roles.find(r => r.role === 'client');

                                    const lawyerHasPerm = lawyerRole?.permissions?.[key] || false;
                                    const clientHasPerm = clientRole?.permissions?.[key] || false;

                                    return (
                                        <tr key={key} className="hover:bg-accent/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-foreground">{label}</div>
                                                <div className="text-xs text-muted-foreground mt-1">{desc}</div>
                                                <code className="text-[10px] text-muted-foreground/50 mt-1 block">{key}</code>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleToggle('lawyer', key, lawyerHasPerm)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${lawyerHasPerm ? 'bg-primary' : 'bg-muted'}`}
                                                >
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${lawyerHasPerm ? 'translate-x-6' : 'translate-x-1'}`} />
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleToggle('client', key, clientHasPerm)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${clientHasPerm ? 'bg-primary' : 'bg-muted'}`}
                                                >
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${clientHasPerm ? 'translate-x-6' : 'translate-x-1'}`} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-accent/30 p-4 border-t border-border text-xs text-muted-foreground text-center">
                    Note: Admin role intrinsically bypasses all permission checks and retains full system access.
                </div>
            </div>
        </div>
    );
};

export default RolePermissionsPage;
