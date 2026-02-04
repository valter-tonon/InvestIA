'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, DollarSign, Briefcase, Activity, RefreshCcw } from 'lucide-react';
import { dashboardApi } from '@/lib/api/dashboard';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { PortfolioPerformanceChart } from '@/components/dashboard/PortfolioPerformanceChart';
import { SectorDistributionChart } from '@/components/dashboard/SectorDistributionChart';
import { TopAssetsChart } from '@/components/dashboard/TopAssetsChart';
import type { DashboardSummary, PerformanceDataPoint, SectorDistribution, TopAsset } from '@/lib/types/dashboard';
import { useAuth } from '@/lib/hooks/useAuth';
import type { PriceAlert } from '@/lib/types/alerts';
import { RecentAlertsWidget } from '@/components/dashboard/RecentAlertsWidget';

export default function DashboardPage() {
    const { user } = useAuth();
    const [summary, setSummary] = useState<DashboardSummary | null>(null);
    const [performance, setPerformance] = useState<PerformanceDataPoint[]>([]);
    const [sectors, setSectors] = useState<SectorDistribution[]>([]);
    const [topAssets, setTopAssets] = useState<TopAsset[]>([]);
    const [alerts, setAlerts] = useState<PriceAlert[]>([]);
    const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
    const [dataLoading, setDataLoading] = useState(true);

    // Initial load
    useEffect(() => {
        if (user) {
            loadDashboardData();
        }
    }, [user, period]);

    const loadDashboardData = async () => {
        try {
            setDataLoading(true);
            const [summaryData, performanceData, sectorsData, topAssetsData, alertsData] = await Promise.all([
                dashboardApi.getSummary(),
                dashboardApi.getPerformance(period),
                dashboardApi.getSectors(),
                dashboardApi.getTopAssets(5),
                dashboardApi.getRecentAlerts(5),
            ]);

            setSummary(summaryData);
            setPerformance(performanceData);
            setSectors(sectorsData);
            setTopAssets(topAssetsData);
            setAlerts(alertsData);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setDataLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight font-display text-primary">
                        Olá, {user?.name?.split(' ')[0]} 👋
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Aqui está o resumo da sua carteira InvestCopilot hoje.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={loadDashboardData}
                        disabled={dataLoading}
                        className="h-9 gap-2"
                    >
                        <RefreshCcw className={`h-4 w-4 ${dataLoading ? 'animate-spin' : ''}`} />
                        Atualizar
                    </Button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total de Ativos"
                    value={summary?.totalAssets || 0}
                    icon={<Briefcase className="h-4 w-4 text-primary" />}
                    description="ativos monitorados"
                    className="glass-card transition-all hover:scale-[1.02]"
                />
                <MetricCard
                    title="Patrimônio Total"
                    value={`R$ ${(summary?.totalValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                    change={summary?.totalChange}
                    icon={<DollarSign className="h-4 w-4 text-emerald-500" />}
                    className="glass-card transition-all hover:scale-[1.02] border-emerald-500/20"
                />
                {summary?.topGainer && (
                    <MetricCard
                        title="Maior Alta (24h)"
                        value={summary.topGainer.ticker}
                        change={summary.topGainer.change}
                        icon={<TrendingUp className="h-4 w-4 text-green-500" />}
                        className="glass-card transition-all hover:scale-[1.02]"
                    />
                )}
                {summary?.topLoser && (
                    <MetricCard
                        title="Maior Baixa (24h)"
                        value={summary.topLoser.ticker}
                        change={summary.topLoser.change}
                        icon={<Activity className="h-4 w-4 text-rose-500" />}
                        className="glass-card transition-all hover:scale-[1.02]"
                    />
                )}
            </div>

            {/* Main Charts Area */}
            <div className="grid gap-6 lg:grid-cols-7">
                {/* Evolution Chart */}
                <div className="lg:col-span-4">
                    <div className="flex items-center justify-end mb-2">
                        <Tabs value={period} onValueChange={(value) => setPeriod(value as any)} className="w-[200px]">
                            <TabsList className="grid w-full grid-cols-4 h-8 bg-background/50">
                                <TabsTrigger value="7d" className="text-xs">7D</TabsTrigger>
                                <TabsTrigger value="30d" className="text-xs">1M</TabsTrigger>
                                <TabsTrigger value="90d" className="text-xs">3M</TabsTrigger>
                                <TabsTrigger value="1y" className="text-xs">1A</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                    <div className="w-full">
                        {dataLoading ? (
                            <div className="h-[300px] flex items-center justify-center text-muted-foreground animate-pulse glass-card rounded-xl">Carregando gráfico...</div>
                        ) : (
                            <PortfolioPerformanceChart data={performance} />
                        )}
                    </div>
                </div>

                {/* Recent Alerts */}
                <div className="lg:col-span-3">
                    <RecentAlertsWidget alerts={alerts} loading={dataLoading} />
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-7">
                {/* Top Assets */}
                <div className="lg:col-span-4">
                    <div className="w-full h-full">
                        {dataLoading ? (
                            <div className="h-[300px] flex items-center justify-center text-muted-foreground animate-pulse glass-card rounded-xl">Carregando posições...</div>
                        ) : (
                            <TopAssetsChart data={topAssets} />
                        )}
                    </div>
                </div>

                {/* Sector Distribution */}
                <div className="lg:col-span-3">
                    <div className="w-full">
                        {dataLoading ? (
                            <div className="h-[300px] flex items-center justify-center text-muted-foreground animate-pulse glass-card rounded-xl">Carregando setores...</div>
                        ) : (
                            <SectorDistributionChart data={sectors} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
