import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Bell,
    Check,
    Clock,
    Calendar,
    MessageSquare,
    AlertTriangle,
    Inbox,
    Shield
} from 'lucide-react';
import { cn } from '../utils/cn';
import api from '../api/axios';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Set up polling or just fetch on open
        if (isOpen) {
            fetchNotifications();
        }

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n._id === id ? { ...n, is_read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'Hearing Reminder': return <Calendar className="w-4 h-4 text-blue-500" />;
            case 'New Document': return <Clock className="w-4 h-4 text-green-500" />;
            case 'Chat Message': return <MessageSquare className="w-4 h-4 text-purple-500" />;
            case 'Case Update': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
            case 'access_request': return <Shield className="w-4 h-4 text-amber-500" />;
            case 'access_response': return <Check className="w-4 h-4 text-green-500" />;
            default: return <Bell className="w-4 h-4 text-primary" />;
        }
    };

    const handleNotificationClick = (notif) => {
        markAsRead(notif._id);
        if (notif.type === 'access_request') {
            navigate('/access-requests');
        } else if (notif.type === 'access_response') {
            navigate('/client-dashboard');
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors relative"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-primary text-[10px] text-primary-foreground font-bold rounded-full border-2 border-background flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <div className="p-4 border-b border-border flex items-center justify-between bg-accent/20">
                        <h3 className="font-bold text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">
                                {unreadCount} New
                            </span>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                            <div className="divide-y divide-border">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif._id}
                                        className={cn(
                                            "p-4 transition-colors hover:bg-accent/30 cursor-pointer flex gap-3",
                                            !notif.is_read && "bg-primary/5"
                                        )}
                                        onClick={() => handleNotificationClick(notif)}
                                    >
                                        <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center shrink-0 border border-border shadow-sm">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={cn("text-sm leading-tight", !notif.is_read ? "font-bold" : "text-muted-foreground")}>
                                                    {notif.title}
                                                </p>
                                                {!notif.is_read && <div className="w-2 h-2 rounded-full bg-primary mt-1 shrink-0"></div>}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notif.message}</p>
                                            <p className="text-[10px] text-muted-foreground mt-2 font-medium">
                                                {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true }) : 'Just now'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <Inbox className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-20" />
                                <p className="text-sm text-muted-foreground italic">Your inbox is empty.</p>
                            </div>
                        )}
                    </div>

                    {notifications.length > 0 && (
                        <div className="p-2 border-t border-border bg-accent/20">
                            <button className="w-full py-1.5 text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">
                                Mark all as read
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;
