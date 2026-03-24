import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    Gavel,
    LayoutDashboard,
    Briefcase,
    Calendar,
    Users,
    Scale,
    FileText,
    LogOut,
    ChevronLeft,
    ChevronRight,
    MessageSquare,
    Calendar as CalendarIcon,
    Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../utils/cn';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { user, logout } = useAuth();

    const adminLinks = [
        { title: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/admin-dashboard' },
        { title: 'Cases', icon: <Briefcase className="w-5 h-5" />, path: '/cases' },
        { title: 'Case Types', icon: <FileText className="w-5 h-5" />, path: '/case-types' },
        { title: 'Hearings', icon: <Calendar className="w-5 h-5" />, path: '/hearings' },
        { title: 'Lawyers', icon: <Scale className="w-5 h-5" />, path: '/lawyers' },
        { title: 'Clients', icon: <Users className="w-5 h-5" />, path: '/clients' },
        { title: 'Courts', icon: <Gavel className="w-5 h-5" />, path: '/courts' },
        { title: 'Invoices', icon: <FileText className="w-5 h-5" />, path: '/invoices' },
        { title: 'Permissions', icon: <Shield className="w-5 h-5" />, path: '/permissions' },
        { title: 'Access Requests', icon: <Shield className="w-5 h-5" />, path: '/access-requests' },
    ];

    const lawyerLinks = [
        { title: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/lawyer-dashboard' },
        { title: 'Cases', icon: <Briefcase className="w-5 h-5" />, path: '/cases' },
        { title: 'Hearings', icon: <Calendar className="w-5 h-5" />, path: '/hearings' },
        { title: 'Clients', icon: <Users className="w-5 h-5" />, path: '/clients' },
        { title: 'Invoices', icon: <FileText className="w-5 h-5" />, path: '/invoices' },
        { title: 'Access Requests', icon: <Shield className="w-5 h-5" />, path: '/access-requests' },
    ];

    const clientLinks = [
        { title: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/client-dashboard' },
        { title: 'My Cases', icon: <Briefcase className="w-5 h-5" />, path: '/my-cases' },
        { title: 'Chat', icon: <MessageSquare className="w-5 h-5" />, path: '/chat' },
        { title: 'My Invoices', icon: <FileText className="w-5 h-5" />, path: '/my-invoices' },
    ];

    const links = user?.role === 'admin' ? adminLinks : user?.role === 'lawyer' ? lawyerLinks : clientLinks;

    return (
        <aside className={cn(
            "fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-50",
            isOpen ? "w-64" : "w-20"
        )}>
            <div className="flex items-center justify-between p-6">
                {isOpen && (
                    <div className="flex items-center gap-2">
                        <Gavel className="w-8 h-8 text-primary" />
                        <span className="text-xl font-bold tracking-tight">CMH</span>
                    </div>
                )}
                {!isOpen && <Gavel className="w-8 h-8 text-primary mx-auto" />}
            </div>

            <nav className="mt-8 px-4 space-y-2">
                {links.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 p-3 rounded-lg transition-colors",
                            isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                            !isOpen && "justify-center"
                        )}
                    >
                        {link.icon}
                        {isOpen && <span className="font-medium">{link.title}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className="absolute bottom-6 w-full px-4">
                <button
                    onClick={logout}
                    className={cn(
                        "flex items-center gap-3 p-3 w-full rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors",
                        !isOpen && "justify-center"
                    )}
                >
                    <LogOut className="w-5 h-5" />
                    {isOpen && <span className="font-medium">Logout</span>}
                </button>
            </div>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="absolute -right-3 top-20 bg-card border border-border p-1 rounded-full text-muted-foreground hover:text-foreground"
            >
                {isOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
        </aside>
    );
};

export default Sidebar;
