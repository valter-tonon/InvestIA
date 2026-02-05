import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon?: React.ReactNode;
    description?: string;
    className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    change,
    icon,
    description,
    className
}) => {
    const isPositive = change !== undefined && change >= 0;
    const hasChange = change !== undefined;

    return (
        <Card className={cn(className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className="text-muted-foreground">{icon}</div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold font-display">{value}</div>
                {(hasChange || description) && (
                    <div className="flex flex-col gap-1 mt-1">
                        {hasChange && (
                            <div className={`flex items-center text-xs font-medium ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {isPositive ? (
                                    <ArrowUpIcon className="mr-1 h-3 w-3" />
                                ) : (
                                    <ArrowDownIcon className="mr-1 h-3 w-3" />
                                )}
                                <span>{Math.abs(change).toFixed(2)}%</span>
                            </div>
                        )}
                        {description && (
                            <p className="text-xs text-muted-foreground">{description}</p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
