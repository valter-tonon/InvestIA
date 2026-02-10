"use client";

import { useEffect, useState } from "react";
import { getDashboard, DashboardStats } from "@/lib/api/admin";
import { KPICard } from "@/components/admin/kpi-card";
import { Users, UserCheck, UserPlus, CreditCard, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";

export default function SuperAdminDashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const data = await getDashboard();
            setStats(data);
        } catch (error) {
            console.error('Failed to load dashboard:', error);
            toast.error('Erro ao carregar dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <LoadingSpinner className="h-8 w-8 text-primary" />
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="text-center text-muted-foreground">
                Erro ao carregar dados do dashboard
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
                <p className="text-muted-foreground">
                    Visão geral do sistema InvestCopilot
                </p>
            </div>

            {/* KPIs */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Total de Usuários"
                    value={stats.totalUsers.toLocaleString()}
                    icon={Users}
                    description="Usuários cadastrados"
                />
                <KPICard
                    title="Usuários Ativos"
                    value={stats.activeUsers.toLocaleString()}
                    icon={UserCheck}
                    description="Últimos 30 dias"
                />
                <KPICard
                    title="Novos Hoje"
                    value={stats.newUsersToday.toLocaleString()}
                    icon={UserPlus}
                    description={`${stats.newUsersThisWeek} esta semana`}
                />
                <KPICard
                    title="Novos Este Mês"
                    value={stats.newUsersThisMonth.toLocaleString()}
                    icon={UserPlus}
                />
            </div>

            {/* Subscriptions */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Assinaturas por Plano
                        </CardTitle>
                        <CardDescription>
                            Distribuição de usuários por plano
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">FREE</span>
                                <span className="text-2xl font-bold">{stats.subscriptionsByPlan.FREE}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">PRO</span>
                                <span className="text-2xl font-bold text-primary">{stats.subscriptionsByPlan.PRO}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">PREMIUM</span>
                                <span className="text-2xl font-bold text-blue-600">{stats.subscriptionsByPlan.PREMIUM}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Status das Assinaturas
                        </CardTitle>
                        <CardDescription>
                            Estado atual das assinaturas
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">ATIVAS</span>
                                <span className="text-2xl font-bold text-green-600">{stats.subscriptionsByStatus.ACTIVE}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">TRIAL</span>
                                <span className="text-2xl font-bold text-blue-600">{stats.subscriptionsByStatus.TRIAL}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">CANCELADAS</span>
                                <span className="text-2xl font-bold text-orange-600">{stats.subscriptionsByStatus.CANCELED}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">EXPIRADAS</span>
                                <span className="text-2xl font-bold text-red-600">{stats.subscriptionsByStatus.EXPIRED}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Atividade Recente</CardTitle>
                    <CardDescription>
                        Últimas 20 ações no sistema
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {stats.recentActivity.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">
                                Nenhuma atividade registrada
                            </p>
                        ) : (
                            stats.recentActivity.map((activity) => (
                                <div
                                    key={activity.id}
                                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                                >
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{activity.action}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(activity.createdAt).toLocaleString('pt-BR')}
                                        </p>
                                    </div>
                                    {activity.userId && (
                                        <span className="text-xs text-muted-foreground font-mono">
                                            {activity.userId.slice(0, 8)}...
                                        </span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
