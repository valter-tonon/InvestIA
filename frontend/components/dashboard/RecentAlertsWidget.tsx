'use client';

import { Bell, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import type { PriceAlert } from '@/lib/types/alerts';
import { formatCurrency } from '@/lib/utils';

interface RecentAlertsWidgetProps {
    alerts: PriceAlert[];
    loading?: boolean;
}

export function RecentAlertsWidget({ alerts, loading = false }: RecentAlertsWidgetProps) {
    if (loading) {
        return (
            <div className="glass-card rounded-xl p-6 h-full flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                    <div className="h-6 w-32 bg-muted/50 rounded animate-pulse" />
                    <div className="h-8 w-20 bg-muted/50 rounded animate-pulse" />
                </div>
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 w-full bg-muted/20 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="glass-card rounded-xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Bell className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg">Alertas Recentes</h3>
                </div>
                <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                    <Link href="/dashboard/alerts" className="gap-2">
                        Ver todos <ArrowRight className="h-3 w-3" />
                    </Link>
                </Button>
            </div>

            {alerts.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground min-h-[200px] border border-dashed rounded-lg border-muted/50">
                    <Bell className="h-8 w-8 mb-3 opacity-20" />
                    <p className="text-sm">Nenhum alerta configurado</p>
                    <Button variant="link" asChild className="mt-2">
                        <Link href="/dashboard/alerts">Criar alerta</Link>
                    </Button>
                </div>
            ) : (
                <div className="space-y-3">
                    {alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border font-bold text-xs">
                                    {alert.asset?.ticker}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{alert.asset?.name}</span>
                                        {!alert.isActive && (
                                            <Badge variant="secondary" className="text-[10px] h-4 px-1">
                                                Inativo
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        Target:
                                        <span className="font-mono text-foreground">
                                            {formatCurrency(Number(alert.targetPrice))}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className={`p-2 rounded-full ${alert.condition === 'ABOVE' ? 'bg-green-500/10 text-green-500' :
                                alert.condition === 'BELOW' ? 'bg-red-500/10 text-red-500' :
                                    'bg-blue-500/10 text-blue-500'
                                }`}>
                                {alert.condition === 'ABOVE' ? <TrendingUp className="h-4 w-4" /> :
                                    alert.condition === 'BELOW' ? <TrendingDown className="h-4 w-4" /> :
                                        <Minus className="h-4 w-4" />}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
