import React from 'react';
import { CheckCircle2, Clock, Circle } from 'lucide-react';

const CaseProgressTracker = ({ status }) => {
    const steps = [
        'Draft',
        'Filed',
        'Under Investigation',
        'Hearing Scheduled',
        'Trial Ongoing',
        'Judgment Pending',
        'Closed'
    ];

    const currentStepIndex = steps.indexOf(status);

    return (
        <div className="relative">
            <div className="flex justify-between">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStepIndex;
                    const isCurrent = index === currentStepIndex;
                    const isLast = index === steps.length - 1;

                    return (
                        <div key={step} className="flex flex-col items-center flex-1 relative group">
                            {/* Line */}
                            {!isLast && (
                                <div className={`absolute left-1/2 top-4 w-full h-1 -translate-y-1/2 z-0 ${isCompleted ? 'bg-primary' : 'bg-border'
                                    }`} />
                            )}

                            {/* Node */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 border-4 transition-all duration-300 ${isCompleted ? 'bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20' :
                                    isCurrent ? 'bg-background border-primary text-primary scale-110 shadow-lg' :
                                        'bg-card border-border text-muted-foreground'
                                }`}>
                                {isCompleted ? (
                                    <CheckCircle2 className="w-5 h-5" />
                                ) : isCurrent ? (
                                    <Clock className="w-5 h-5 animate-pulse" />
                                ) : (
                                    <span className="text-xs font-bold">{index + 1}</span>
                                )}
                            </div>

                            {/* Label */}
                            <span className={`mt-3 text-[10px] font-bold text-center uppercase tracking-tighter px-1 ${isCurrent ? 'text-primary' : isCompleted ? 'text-foreground' : 'text-muted-foreground'
                                }`}>
                                {step}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CaseProgressTracker;
