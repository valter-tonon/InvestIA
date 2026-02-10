"use client";

import { useEffect, useState } from "react";
import { getDashboard, DashboardStats } from "@/lib/api/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { TrendingUp, Users, CreditCard, Activity } from "lucide-react";

export default function AnalyticsPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const data = await getDashboard();
            setStats(data);
        } catch (error) {
            toast.error("Erro ao carregar analytics");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum dado disponível</p>
            </div>
        );
    }

    const activeSubscriptions = stats.subscriptionsByStatus.ACTIVE || 0;
    const totalSubscriptions = Object.values(stats.subscriptionsByStatus).reduce((a, b) => a + b, 0);

    const metrics = [
        {
            title: "Total de Usuários",
            value: stats.totalUsers,
            icon: Users,
            description: "Usuários cadastrados no sistema",
            color: "text-blue-500"
        },
        {
            title: "Usuários Ativos",
            value: stats.activeUsers,
            icon: Activity,
            description: "Usuários com status ativo",
            color: "text-green-500"
        },
        {
            title: "Assinaturas Ativas",
            value: activeSubscriptions,
            icon: CreditCard,
            description: "Assinaturas em vigor",
            color: "text-purple-500"
        },
        {
            title: "Taxa de Conversão",
            value: stats.totalUsers > 0
                ? `${((activeSubscriptions / stats.totalUsers) * 100).toFixed(1)}%`
                : "0%",
            icon: TrendingUp,
            description: "Assinaturas / Total de usuários",
            color: "text-orange-500"
        }
    ];

    // Convert subscriptionsByPlan object to array for rendering
    const planDistribution = Object.entries(stats.subscriptionsByPlan).map(([plan, count]) => ({
        plan,
        count
    }));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
                <p className="text-muted-foreground">
                    Métricas e estatísticas do sistema
                </p>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {metrics.map((metric) => {
                    const Icon = metric.icon;
                    return (
                        <Card key={metric.title}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {metric.title}
                                </CardTitle>
                                <Icon className={`h-4 w-4 ${metric.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{metric.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {metric.description}
                                </p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* User Growth */}
            <Card>
                <CardHeader>
                    <CardTitle>Crescimento de Usuários</CardTitle>
                    <CardDescription>
                        Novos usuários por período
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Hoje</p>
                            <p className="text-2xl font-bold">{stats.newUsersToday}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Esta Semana</p>
                            <p className="text-2xl font-bold">{stats.newUsersThisWeek}</p>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Este Mês</p>
                            <p className="text-2xl font-bold">{stats.newUsersThisMonth}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Plans Distribution */}
            <Card>
                <CardHeader>
                    <CardTitle>Distribuição por Plano</CardTitle>
                    <CardDescription>
                        Quantidade de assinaturas em cada plano
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {planDistribution.length > 0 ? (
                            planDistribution.map((item) => {
                                const percentage = totalSubscriptions > 0
                                    ? (item.count / totalSubscriptions) * 100
                                    : 0;

                                return (
                                    <div key={item.plan} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{item.plan}</span>
                                                <span className="text-sm text-muted-foreground">
                                                    ({item.count} {item.count === 1 ? 'assinatura' : 'assinaturas'})
                                                </span>
                                            </div>
                                            <span className="text-sm font-medium">
                                                {percentage.toFixed(1)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-secondary rounded-full h-2">
                                            <div
                                                className="bg-primary h-2 rounded-full transition-all"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-6 text-muted-foreground">
                                Nenhuma assinatura ativa
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Subscription Status */}
            <Card>
                <CardHeader>
                    <CardTitle>Status das Assinaturas</CardTitle>
                    <CardDescription>
                        Distribuição por status
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Ativas</p>
                            <p className="text-2xl font-bold text-green-600">
                                {stats.subscriptionsByStatus.ACTIVE || 0}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Trial</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {stats.subscriptionsByStatus.TRIAL || 0}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Canceladas</p>
                            <p className="text-2xl font-bold text-orange-600">
                                {stats.subscriptionsByStatus.CANCELED || 0}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">Expiradas</p>
                            <p className="text-2xl font-bold text-red-600">
                                {stats.subscriptionsByStatus.EXPIRED || 0}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
