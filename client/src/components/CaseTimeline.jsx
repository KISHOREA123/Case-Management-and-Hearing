import React from 'react';
import { CheckCircle2, Circle, Clock, FileText, Calendar, MessageSquare, Plus } from 'lucide-react';
import { format } from 'date-fns';

const CaseTimeline = ({ timeline }) => {
    const getEventIcon = (type) => {
        switch (type) {
            case 'Case Created': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'Document Uploaded': return <FileText className="w-5 h-5 text-blue-500" />;
            case 'Hearing Scheduled': return <Calendar className="w-5 h-5 text-purple-500" />;
            case 'Hearing Completed': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
            case 'Lawyer Comment Added': return <MessageSquare className="w-5 h-5 text-orange-500" />;
            case 'Case Status Updated': return <Clock className="w-5 h-5 text-amber-500" />;
            default: return <Circle className="w-5 h-5 text-muted-foreground" />;
        }
    };

    if (!timeline || timeline.length === 0) {
        return (
            <div className="py-10 text-center text-muted-foreground bg-accent/20 rounded-xl border border-dashed border-border">
                No history recorded yet.
            </div>
        );
    }

    return (
        <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-border before:via-border before:to-transparent">
            {timeline.map((event, index) => (
                <div key={event._id} className="relative flex items-start gap-6 group">
                    <div className="absolute left-0 mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-background border border-border shadow-sm group-hover:border-primary/30 transition-colors z-10">
                        {getEventIcon(event.event_type)}
                    </div>
                    <div className="pl-14 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                            <h4 className="font-bold text-foreground text-base">{event.event_type}</h4>
                            <time className="text-xs font-medium text-muted-foreground bg-accent/50 px-2 py-1 rounded">
                                {format(new Date(event.created_at), 'PPP p')}
                            </time>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {event.description}
                        </p>
                        {event.created_by && (
                            <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-primary/70">
                                BY {event.created_by.name} • {event.created_by.role}
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CaseTimeline;
