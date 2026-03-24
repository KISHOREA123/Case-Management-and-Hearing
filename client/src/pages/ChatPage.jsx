import React, { useState, useEffect } from 'react';
import { Send, User, Search, Paperclip, MoreVertical, ShieldCheck, Clock } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { cn } from '../utils/cn';

const ChatPage = () => {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real app, this would fetch all conversations for the user
        // For this demo, we'll simulate finding conversations by fetching cases
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            const { data } = await api.get('/cases');
            setConversations(data);
        } catch (error) {
            toast.error('Failed to load chats');
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (caseId) => {
        try {
            const { data } = await api.get(`/chat/case/${caseId}`);
            setSelectedConv(data.conversation);
            setMessages(data.messages);
        } catch (error) {
            toast.error('Failed to load messages');
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConv) return;

        try {
            const { data } = await api.post('/chat/message', {
                conversation_id: selectedConv._id,
                message: newMessage
            });
            setMessages([...messages, { ...data, sender_id: { _id: user.id, name: user.name, role: user.role } }]);
            setNewMessage('');
        } catch (error) {
            toast.error('Failed to send message');
        }
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex bg-card border border-border rounded-2xl overflow-hidden shadow-xl animate-in fade-in zoom-in duration-500">
            {/* Sidebar */}
            <div className="w-80 border-r border-border flex flex-col bg-accent/5">
                <div className="p-6 border-b border-border space-y-4">
                    <h2 className="text-xl font-bold tracking-tight">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search discussions..."
                            className="w-full bg-background border border-border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.map((conv) => (
                        <button
                            key={conv._id}
                            onClick={() => fetchMessages(conv._id)}
                            className={cn(
                                "w-full p-4 text-left border-b border-border/50 hover:bg-accent/40 transition-all flex gap-3 group",
                                selectedConv?.case_id === conv._id && "bg-accent/60"
                            )}
                        >
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold shrink-0">
                                {conv.case_title.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h4 className="font-bold text-sm truncate">{conv.case_title}</h4>
                                    <span className="text-[10px] text-muted-foreground">12:45</span>
                                </div>
                                <p className="text-xs text-muted-foreground truncate font-medium">Click to open case discussion</p>
                            </div>
                        </button>
                    ))}
                    {conversations.length === 0 && !loading && (
                        <div className="p-8 text-center text-muted-foreground italic text-sm">No active discussions.</div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-background">
                {selectedConv ? (
                    <>
                        <div className="p-4 border-b border-border flex items-center justify-between bg-card">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                                    {selectedConv?.case_id?.case_title?.charAt(0) || 'C'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Case Discussion</h3>
                                    <div className="flex items-center gap-1.5 text-[10px] text-green-600 font-bold uppercase tracking-wider">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                        Secure Channel
                                    </div>
                                </div>
                            </div>
                            <button className="p-2 hover:bg-accent rounded-full transition-colors">
                                <MoreVertical className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-accent/5">
                            {messages.map((msg) => (
                                <div
                                    key={msg._id}
                                    className={cn(
                                        "flex gap-3 max-w-[80%]",
                                        msg.sender_id?._id === user.id ? "ml-auto flex-row-reverse" : ""
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                                        msg.sender_id?._id === user.id ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
                                    )}>
                                        {msg.sender_id?.name?.charAt(0)}
                                    </div>
                                    <div className="space-y-1">
                                        <div className={cn(
                                            "p-4 rounded-2xl text-sm shadow-sm",
                                            msg.sender_id?._id === user.id
                                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                                : "bg-card border border-border rounded-tl-none"
                                        )}>
                                            {msg.message}
                                        </div>
                                        <p className={cn(
                                            "text-[10px] font-bold text-muted-foreground flex items-center gap-1 opacity-60",
                                            msg.sender_id?._id === user.id ? "justify-end" : ""
                                        )}>
                                            <Clock className="w-2.5 h-2.5" />
                                            {format(new Date(msg.createdAt), 'p')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleSendMessage} className="p-4 bg-card border-t border-border flex gap-3">
                            <button type="button" className="p-2.5 hover:bg-accent rounded-xl text-muted-foreground transition-colors">
                                <Paperclip className="w-5 h-5" />
                            </button>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Write a message..."
                                className="flex-1 bg-accent/30 border-transparent focus:bg-background focus:border-border rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                            <button
                                type="submit"
                                className="bg-primary text-primary-foreground p-2.5 rounded-xl shadow-lg hover:bg-primary/90 transition-all flex items-center justify-center disabled:opacity-50"
                                disabled={!newMessage.trim()}
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-accent/5">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                            <Send className="w-10 h-10" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2 tracking-tight">Your Workspace</h3>
                        <p className="text-muted-foreground max-w-sm mb-8 leading-relaxed">
                            Select a case from the sidebar to start a secure conversation with the assigned legal team.
                        </p>
                        <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full text-xs font-bold text-muted-foreground shadow-sm">
                            <ShieldCheck className="w-4 h-4 text-green-500" />
                            End-to-end encrypted discussion
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
