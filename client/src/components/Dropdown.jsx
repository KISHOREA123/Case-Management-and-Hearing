import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../utils/cn';

export const DropdownItem = ({ children, onClick, icon, className, danger = false }) => {
    return (
        <button
            onClick={onClick ? (e) => { e.stopPropagation(); onClick(e); } : undefined}
            className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all",
                danger
                    ? "text-red-500 hover:bg-red-500/10"
                    : "text-foreground hover:bg-accent hover:text-primary",
                className
            )}
        >
            {icon && <span className={cn("w-4 h-4 shrink-0 transition-colors", !danger && "text-muted-foreground group-hover:text-primary")}>{icon}</span>}
            <span className="truncate">{children}</span>
        </button>
    );
};

export const DropdownDivider = () => <div className="h-px bg-border my-1 mx-1" />;

const Dropdown = ({ trigger, children, align = 'right', className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className={cn("relative inline-block text-left", className)} ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="cursor-pointer"
            >
                {trigger}
            </div>

            {isOpen && (
                <div
                    className={cn(
                        "absolute mt-2 w-56 p-1.5 rounded-xl bg-card border border-border shadow-xl z-50 animate-in fade-in zoom-in-95 duration-200",
                        align === 'right' ? "right-0 origin-top-right" : "left-0 origin-top-left"
                    )}
                    onClick={() => setIsOpen(false)}
                >
                    {children}
                </div>
            )}
        </div>
    );
};

export default Dropdown;
