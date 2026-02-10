"use client";

import { useEffect, useState } from "react";
import { listActivityLogs, ActivityLog } from "@/lib/api/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { Activity, User, Calendar, MapPin } from "lucide-react";

export default function ActivityLogsPage() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);

    useEffect(() => {
        loadLogs();
    }, [page]);

    const loadLogs = async () => {
        try {
            setLoading(true);
            const response = await listActivityLogs(page, 20);
            setLogs(response.data);
            setTotal(response.meta.total);
        } catch (error) {
            toast.error("Erro ao carregar logs de atividade");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getActionBadgeColor = (action: string) => {
        if (action.includes('CREATE') || action.includes('REGISTER')) return 'bg-green-500';
        if (action.includes('UPDATE') || action.includes('EDIT')) return 'bg-blue-500';
        if (action.includes('DELETE') || action.includes('SUSPEND')) return 'bg-red-500';
        if (action.includes('LOGIN')) return 'bg-purple-500';
        return 'bg-gray-500';
    };

    const formatAction = (action: string) => {
        const actionMap: Record<string, string> = {
            'USER_REGISTERED': 'Usuário Registrado',
            'USER_LOGIN': 'Login',
            'USER_UPDATED': 'Usuário Atualizado',
            'USER_SUSPENDED': 'Usuário Suspenso',
            'USER_ROLE_UPDATED': 'Papel Atualizado',
            'SUBSCRIPTION_CREATED': 'Assinatura Criada',
            'SUBSCRIPTION_UPDATED': 'Assinatura Atualizada',
            'SUBSCRIPTION_CANCELED': 'Assinatura Cancelada',
            'PLAN_CHANGED': 'Plano Alterado'
        };
        return actionMap[action] || action;
    };

    const formatDetails = (details: unknown) => {
        if (!details || typeof details !== 'object') return null;

        try {
            const detailsObj = details as Record<string, any>;
            const entries = Object.entries(detailsObj);

            if (entries.length === 0) return null;

            return (
                <div className="mt-2 text-xs text-muted-foreground space-y-1">
                    {entries.slice(0, 3).map(([key, value]) => (
                        <div key={key}>
                            <span className="font-medium">{key}:</span>{' '}
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </div>
                    ))}
                    {entries.length > 3 && (
                        <div className="text-xs italic">+{entries.length - 3} mais...</div>
                    )}
                </div>
            );
        } catch {
            return null;
        }
    };

    if (loading && logs.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Logs de Atividade</h1>
                <p className="text-muted-foreground">
                    Histórico de ações realizadas no sistema
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Atividades Recentes ({total})</CardTitle>
                    <CardDescription>
                        Registro cronológico de todas as ações do sistema
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {logs.length === 0 ? (
                        <div className="text-center py-12">
                            <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">Nenhuma atividade registrada</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {logs.map((log) => (
                                <div
                                    key={log.id}
                                    className="flex flex-col gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <Activity className="h-5 w-5 text-muted-foreground" />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={getActionBadgeColor(log.action)}>
                                                        {formatAction(log.action)}
                                                    </Badge>
                                                    {log.userId && (
                                                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                            <User className="h-3 w-3" />
                                                            ID: {log.userId.substring(0, 8)}...
                                                        </span>
                                                    )}
                                                </div>
                                                {formatDetails(log.details)}
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(log.createdAt).toLocaleString('pt-BR')}
                                            </div>
                                            {log.ipAddress && (
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {log.ipAddress}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {logs.length > 0 && (
                        <div className="flex items-center justify-between mt-6">
                            <p className="text-sm text-muted-foreground">
                                Mostrando {logs.length} de {total} atividades
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                >
                                    Anterior
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={logs.length < 20}
                                >
                                    Próxima
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
