import React, { useState, useEffect } from 'react';
import {
    Briefcase,
    Plus,
    Search,
    Edit,
    Trash2,
    Loader2,
    X,
    FileText
} from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const CaseTypesPage = () => {
    const { user } = useAuth();
    const [caseTypes, setCaseTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingType, setEditingType] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        fetchCaseTypes();
    }, []);

    const fetchCaseTypes = async () => {
        try {
            const { data } = await api.get('/case-types');
            setCaseTypes(data);
        } catch (error) {
            toast.error('Failed to load case types');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingType) {
                await api.put(`/case-types/${editingType._id}`, formData);
                toast.success('Case type updated successfully');
            } else {
                await api.post('/case-types', formData);
                toast.success('Case type added successfully');
            }
            setShowModal(false);
            setEditingType(null);
            setFormData({ name: '', description: '' });
            fetchCaseTypes();
        } catch (error) {
            toast.error(editingType ? 'Failed to update case type' : 'Failed to create case type');
        }
    };

    const handleEdit = (type) => {
        setEditingType(type);
        setFormData({
            name: type.name,
            description: type.description || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this case type?')) return;
        try {
            await api.delete(`/case-types/${id}`);
            toast.success('Case type deleted successfully');
            fetchCaseTypes();
        } catch (error) {
            toast.error('Failed to delete case type');
        }
    };

    const filteredTypes = caseTypes.filter(type =>
        type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.description?.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Case Types</h1>
                    <p className="text-muted-foreground">Manage classifications for legal proceedings.</p>
                </div>
                {user.role === 'admin' && (
                    <button
                        onClick={() => {
                            setEditingType(null);
                            setFormData({ name: '', description: '' });
                            setShowModal(true);
                        }}
                        className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium shadow hover:bg-primary/90 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        Add Case Type
                    </button>
                )}
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search case types..."
                    className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-accent/50 text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
                                <th className="px-6 py-4 font-semibold text-center w-20">Icon</th>
                                <th className="px-6 py-4 font-semibold">Name</th>
                                <th className="px-6 py-4 font-semibold">Description</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredTypes.length > 0 ? (
                                filteredTypes.map((type) => (
                                    <tr key={type._id} className="hover:bg-accent/30 transition-colors group">
                                        <td className="px-6 py-4 text-center">
                                            <div className="p-2 bg-primary/10 rounded-lg text-primary inline-block">
                                                <Briefcase className="w-4 h-4" />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-sm">
                                            {type.name}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                            {type.description || <span className="italic opacity-50 text-xs">No description provided</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleEdit(type)}
                                                    className="p-1.5 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(type._id)}
                                                    className="p-1.5 hover:bg-destructive/10 rounded-md transition-colors text-muted-foreground hover:text-destructive"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-muted-foreground italic">
                                        No case types found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-2xl p-6 overflow-hidden scale-in-center">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">{editingType ? 'Edit Case Type' : 'Add New Case Type'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-1 hover:bg-accent rounded-full text-muted-foreground transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Criminal Law"
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    rows="3"
                                    placeholder="Enter category description..."
                                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-3 pt-4 border-t border-border">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-border transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold hover:bg-primary/90 shadow transition-all"
                                >
                                    {editingType ? 'Save Changes' : 'Create Type'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CaseTypesPage;
