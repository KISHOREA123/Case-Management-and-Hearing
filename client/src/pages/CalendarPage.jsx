import React, { useState, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    Clock,
    MapPin,
    Filter,
    Plus,
    Search
} from 'lucide-react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    eachDayOfInterval
} from 'date-fns';
import api from '../api/axios';
import { toast } from 'react-toastify';
import { cn } from '../utils/cn';
import Dropdown, { DropdownItem, DropdownDivider } from '../components/Dropdown';

const CalendarPage = () => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [hearings, setHearings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHearings();
    }, []);

    const fetchHearings = async () => {
        try {
            const { data } = await api.get('/hearings');
            setHearings(data);
        } catch (error) {
            toast.error('Failed to fetch hearings');
        } finally {
            setLoading(false);
        }
    };

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Hearing Calendar</h1>
                    <p className="text-muted-foreground">Schedule and monitor judicial proceedings.</p>
                </div>
                <div className="flex items-center gap-4 bg-card border border-border p-1.5 rounded-xl shadow-sm">
                    <button
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="p-2 hover:bg-accent rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-bold w-32 text-center">
                        {format(currentMonth, 'MMMM yyyy')}
                    </span>
                    <button
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="p-2 hover:bg-accent rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex gap-3">
                    <Dropdown
                        trigger={
                            <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-accent transition-all shadow-sm">
                                <Filter className="w-4 h-4" /> Filter
                            </button>
                        }
                    >
                        <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Case Priority</div>
                        <DropdownItem onClick={() => { }}>Urgent Only</DropdownItem>
                        <DropdownItem onClick={() => { }}>High Priority</DropdownItem>
                        <DropdownDivider />
                        <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Case Status</div>
                        <DropdownItem onClick={() => { }}>Active Cases</DropdownItem>
                        <DropdownItem onClick={() => { }}>Hearing Scheduled</DropdownItem>
                        <DropdownDivider />
                        <DropdownItem onClick={() => { }} className="text-primary">Clear All Filters</DropdownItem>
                    </Dropdown>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-bold shadow-lg hover:bg-primary/90 transition-all">
                        <Plus className="w-4 h-4" /> New Hearing
                    </button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return (
            <div className="grid grid-cols-7 mb-2">
                {days.map(day => (
                    <div key={day} className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-2">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const rows = [];
        let days = [];
        let day = startDate;

        while (day <= endDate) {
            for (let i = 0; i < 7; i++) {
                const formattedDate = format(day, 'd');
                const cloneDay = day;

                const dayHearings = hearings.filter(h => isSameDay(new Date(h.hearing_date), cloneDay));
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);

                days.push(
                    <div
                        key={day}
                        className={cn(
                            "min-h-[120px] p-2 border-l border-b border-border transition-all relative group cursor-pointer hover:bg-accent/10",
                            !isCurrentMonth ? "bg-accent/5 text-muted-foreground/30" : "bg-card",
                            isSelected && "ring-2 ring-primary ring-inset z-10"
                        )}
                        onClick={() => setSelectedDate(cloneDay)}
                    >
                        <span className={cn(
                            "text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-2",
                            isSameDay(day, new Date()) ? "bg-primary text-primary-foreground" : ""
                        )}>
                            {formattedDate}
                        </span>

                        <div className="space-y-1">
                            {dayHearings.map(h => (
                                <div
                                    key={h._id}
                                    className="text-[10px] p-1.5 rounded-md bg-primary/10 text-primary border border-primary/20 truncate font-bold hover:bg-primary/20 transition-colors shadow-sm"
                                    title={h.case_id?.case_title}
                                >
                                    {h.hearing_time} • {h.case_id?.case_title}
                                </div>
                            ))}
                        </div>
                    </div>
                );
                day = addDays(day, 1);
            }
            rows.push(
                <div className="grid grid-cols-7 border-t border-border" key={day}>
                    {days}
                </div>
            );
            days = [];
        }
        return <div className="border-r border-border rounded-xl overflow-hidden shadow-sm">{rows}</div>;
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {renderHeader()}

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Main Calendar Section */}
                <div className="xl:col-span-3">
                    {renderDays()}
                    {renderCells()}
                </div>

                {/* Sidebar Details Section */}
                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold flex items-center gap-2 mb-6">
                            <CalendarIcon className="w-5 h-5 text-primary" />
                            {format(selectedDate, 'MMMM d, yyyy')}
                        </h3>

                        <div className="space-y-4">
                            {hearings.filter(h => isSameDay(new Date(h.hearing_date), selectedDate)).length > 0 ? (
                                hearings.filter(h => isSameDay(new Date(h.hearing_date), selectedDate)).map(h => (
                                    <div key={h._id} className="p-4 bg-accent/30 rounded-xl border border-border/50 hover:bg-accent/50 transition-all group">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-bold text-sm text-primary group-hover:underline cursor-pointer">{h.case_id?.case_title}</p>
                                            <span className="text-[10px] font-bold px-2 py-0.5 bg-background rounded-full border border-border uppercase tracking-tight">{h.status}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mb-3 font-medium">Case #{h.case_id?.case_number}</p>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                {h.hearing_time}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                                                <MapPin className="w-3 h-3" />
                                                {h.courtroom || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center text-muted-foreground bg-accent/10 rounded-xl border border-dashed border-border">
                                    <p className="text-xs italic">No hearings scheduled for this day.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                        <h4 className="font-bold text-sm mb-2 text-primary">Monthly Summary</h4>
                        <p className="text-xs text-muted-foreground mb-4">You have {hearings.filter(h => isSameMonth(new Date(h.hearing_date), currentMonth)).length} hearings this month.</p>
                        <button className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors">Download Schedule</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarPage;
