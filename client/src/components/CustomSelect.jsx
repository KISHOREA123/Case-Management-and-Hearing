import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';
import { cn } from '../utils/cn';

const CustomSelect = ({
    options,
    value,
    onChange,
    placeholder = "Select an option",
    label,
    required = false,
    isMulti = false,
    className
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);
    const searchInputRef = useRef(null);

    const getSelected = () => {
        if (isMulti) {
            return options.filter(opt => Array.isArray(value) && value.includes(opt.value));
        }
        return options.find(opt => opt.value === value);
    };

    const selected = getSelected();

    const filteredOptions = options.filter(opt =>
        opt.label.toLowerCase().includes(search.toLowerCase()) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(search.toLowerCase()))
    );

    const handleSelect = (val) => {
        if (isMulti) {
            const newValue = Array.isArray(value) ? [...value] : [];
            const index = newValue.indexOf(val);
            if (index > -1) {
                newValue.splice(index, 1);
            } else {
                newValue.push(val);
            }
            onChange(newValue);
        } else {
            onChange(val);
            setIsOpen(false);
            setSearch('');
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    return (
        <div className={cn("space-y-1 relative", className)} ref={containerRef}>
            {label && (
                <label className="text-sm font-medium flex items-center gap-1">
                    {label} {required && <span className="text-destructive">*</span>}
                </label>
            )}

            <div
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full bg-accent/30 border border-border rounded-lg px-4 py-2 text-sm flex items-center justify-between cursor-pointer transition-all hover:bg-accent/50 focus:ring-2 focus:ring-primary/20",
                    isOpen && "ring-2 ring-primary/20 bg-background border-primary/50"
                )}
            >
                <div className="flex flex-wrap gap-1 items-center overflow-hidden">
                    {isMulti ? (
                        Array.isArray(selected) && selected.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                                {selected.map(opt => (
                                    <span key={opt.value} className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                                        {opt.label}
                                        <X className="w-2.5 h-2.5 cursor-pointer" onClick={(e) => { e.stopPropagation(); handleSelect(opt.value); }} />
                                    </span>
                                ))}
                            </div>
                        ) : <span className="text-muted-foreground">{placeholder}</span>
                    ) : (
                        <span className={cn("truncate", !selected && "text-muted-foreground")}>
                            {selected ? selected.label : placeholder}
                        </span>
                    )}
                </div>
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0", isOpen && "rotate-180")} />
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top">
                    <div className="p-2 border-b border-border bg-accent/30">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search..."
                                className="w-full bg-background border-none text-xs rounded-md pl-9 pr-4 py-2 focus:ring-1 focus:ring-primary/30 outline-none"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto no-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt) => {
                                const isSelected = isMulti ? (Array.isArray(value) && value.includes(opt.value)) : (value === opt.value);
                                return (
                                    <div
                                        key={opt.value}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleSelect(opt.value);
                                        }}
                                        className={cn(
                                            "px-4 py-2.5 text-sm cursor-pointer hover:bg-primary/10 flex items-center justify-between group transition-colors",
                                            isSelected && "bg-primary/5 text-primary"
                                        )}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium">{opt.label}</span>
                                            {opt.sublabel && <span className="text-[10px] text-muted-foreground group-hover:text-primary/70">{opt.sublabel}</span>}
                                        </div>
                                        {isSelected && <Check className="w-4 h-4" />}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="px-4 py-8 text-center text-xs text-muted-foreground italic">
                                No results found.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
