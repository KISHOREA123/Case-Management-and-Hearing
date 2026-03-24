import React from 'react';
import { cn } from '../utils/cn';

const StatCard = ({ title, value, icon, trend, description, className }) => {
    return (
        <div className={cn("p-6 bg-card border border-border rounded-xl shadow-sm", className)}>
            <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {icon}
                </div>
                {trend && (
                    <span className={cn(
                        "text-xs font-medium px-2 py-1 rounded-full",
                        trend > 0 ? "bg-green-500/10 text-green-600" : "bg-red-500/10 text-red-600"
                    )}>
                        {trend > 0 ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">{title}</h4>
                <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold tracking-tight">{value}</span>
                </div>
                {description && (
                    <p className="text-xs text-muted-foreground mt-1">{description}</p>
                )}
            </div>
        </div>
    );
};

export default StatCard;
