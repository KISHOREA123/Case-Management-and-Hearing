import React, { useState, useEffect } from 'react';
import { FolderOpen, FileText, Plus, Upload, Download, Trash2, MoreVertical } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const DocumentManager = ({ caseId }) => {
    const [docs, setDocs] = useState([]);
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentFolder, setCurrentFolder] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchDocs();
    }, [caseId]);

    const fetchDocs = async () => {
        try {
            const { data } = await api.get(`/docs/case/${caseId}`);
            setDocs(data.docs);
            setFolders(data.folders);
        } catch (error) {
            toast.error('Failed to fetch documents');
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = () => {
        toast.info("File upload logic would trigger here (drag & drop simulated)");
        // In a real app, this would use a file input and FormData
    };

    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border bg-accent/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FolderOpen className="w-5 h-5 text-primary" />
                    <h3 className="font-bold">Case Documents</h3>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleFileUpload} className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors" title="Upload Document">
                        <Upload className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground transition-colors" title="Add Folder">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Folders */}
                    {folders.map(folder => (
                        <button key={folder._id} className="flex items-center gap-3 p-4 bg-accent/20 rounded-xl border border-transparent hover:border-border hover:bg-accent/40 transition-all text-left group">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                <FolderOpen className="w-6 h-6" />
                            </div>
                            <div className="flex-1 truncate">
                                <p className="font-bold text-sm truncate">{folder.folder_name}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-medium">Folder</p>
                            </div>
                        </button>
                    ))}

                    {/* Default Folders if empty */}
                    {folders.length === 0 && (
                        ['Evidence', 'Client Documents', 'Court Orders', 'Contracts'].map(name => (
                            <button key={name} className="flex items-center gap-3 p-4 bg-accent/20 rounded-xl border border-transparent hover:border-border hover:bg-accent/40 transition-all text-left">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                                    <FolderOpen className="w-6 h-6" />
                                </div>
                                <div className="flex-1 truncate">
                                    <p className="font-bold text-sm truncate">{name}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Default</p>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                <div className="mt-8">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Files</h4>
                    <div className="space-y-2">
                        {docs.map(doc => (
                            <div key={doc._id} className="flex items-center justify-between p-3 hover:bg-accent/30 rounded-lg transition-colors group">
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-muted-foreground" />
                                    <div>
                                        <p className="text-sm font-medium">{doc.file_name}</p>
                                        <p className="text-[10px] text-muted-foreground">Uploaded by {doc.uploaded_by?.name} • {new Date(doc.uploaded_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 hover:bg-accent rounded-lg text-muted-foreground hover:text-foreground">
                                        <Download className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 hover:bg-destructive/10 rounded-lg text-destructive">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {docs.length === 0 && <p className="text-sm text-muted-foreground italic py-4">No standalone documents in this folder.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentManager;
