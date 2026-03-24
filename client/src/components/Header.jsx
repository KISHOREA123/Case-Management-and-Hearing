import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    User as UserIcon,
    Moon,
    Sun,
    Settings,
    LogOut,
    Shield,
    Plus,
    Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import Dropdown, { DropdownItem, DropdownDivider } from './Dropdown';

const Header = () => {
    const { user, accounts, logout, switchAccount } = useAuth();
    const [darkMode, setDarkMode] = React.useState(false);
    const navigate = useNavigate();

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle('dark');
    };

    return (
        <header className="h-16 flex items-center justify-between px-6 bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-40">
            <div className="flex-1 max-w-xl">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search cases, lawyers, clients..."
                        className="w-full bg-accent/50 border-transparent focus:bg-background focus:border-border rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={toggleDarkMode}
                    className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full transition-colors"
                >
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <NotificationDropdown />

                <div className="h-8 w-px bg-border mx-2"></div>

                <Dropdown
                    trigger={
                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold leading-none group-hover:text-primary transition-colors">{user?.name}</p>
                                <p className="text-xs text-muted-foreground capitalize font-medium">{user?.role}</p>
                            </div>
                            <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary border border-primary/20 group-hover:border-primary/40 transition-all shadow-sm">
                                <UserIcon className="w-5 h-5" />
                            </div>
                        </div>
                    }
                >
                    <div className="px-3 py-2 border-b border-border mb-1">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Accounts</p>
                    </div>

                    {accounts.map((acc) => (
                        <DropdownItem
                            key={acc.user._id}
                            onClick={() => switchAccount(acc.user._id)}
                            icon={acc.user._id === user?._id ? <Check className="w-4 h-4 text-green-500" /> : <UserIcon className="w-4 h-4" />}
                        >
                            <div className="flex flex-col">
                                <span className={acc.user._id === user?._id ? "font-bold text-primary" : ""}>{acc.user.name}</span>
                                <span className="text-[10px] text-muted-foreground capitalize">{acc.user.role}</span>
                            </div>
                        </DropdownItem>
                    ))}

                    <DropdownDivider />
                    <DropdownItem icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/login')}>
                        Add Another Account
                    </DropdownItem>
                    <DropdownDivider />
                    <DropdownItem icon={<Settings className="w-4 h-4" />}>Account Settings</DropdownItem>
                    <DropdownDivider />
                    <DropdownItem icon={<LogOut className="w-4 h-4" />} danger onClick={logout}>Sign Out of Current</DropdownItem>
                </Dropdown>
            </div>
        </header>
    );
};

export default Header;
