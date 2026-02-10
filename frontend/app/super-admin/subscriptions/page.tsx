"use client";

import { useEffect, useState } from "react";
import { listSubscriptions, Subscription, updateSubscription } from "@/lib/api/admin";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import { CreditCard, Calendar, User } from "lucide-react";

export default function SubscriptionsManagementPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
    const [actionDialog, setActionDialog] = useState<{
        open: boolean;
        type: 'status' | null;
        newStatus?: 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'TRIAL';
    }>({ open: false, type: null });

    useEffect(() => {
        loadSubscriptions();
    }, [page, statusFilter]);

    const loadSubscriptions = async () => {
        try {
            setLoading(true);
            const params: any = { page, perPage: 20 };
            if (statusFilter !== 'all') params.status = statusFilter;

            const response = await listSubscriptions(params);
            setSubscriptions(response.data);
            setTotal(response.meta.total);
        } catch (error) {
            toast.error("Erro ao carregar assinaturas");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedSubscription || !actionDialog.newStatus) return;

        try {
            await updateSubscription(selectedSubscription.id, { status: actionDialog.newStatus });
            toast.success("Status atualizado com sucesso");
            loadSubscriptions();
            setActionDialog({ open: false, type: null });
            setSelectedSubscription(null);
        } catch (error) {
            toast.error("Erro ao atualizar status");
            console.error(error);
        }
    };

    const getPlanBadgeColor = (planName: string) => {
        const name = planName.toUpperCase();
        if (name.includes('FREE')) return 'bg-gray-500';
        if (name.includes('PRO')) return 'bg-blue-500';
        if (name.includes('PREMIUM')) return 'bg-purple-500';
        return 'bg-gray-500';
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-500';
            case 'TRIAL': return 'bg-blue-500';
            case 'CANCELED': return 'bg-orange-500';
            case 'EXPIRED': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price);
    };

    const formatInterval = (interval: string) => {
        switch (interval) {
            case 'MONTHLY': return 'mensal';
            case 'YEARLY': return 'anual';
            case 'LIFETIME': return 'vitalício';
            default: return interval;
        }
    };

    if (loading && subscriptions.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Assinaturas</h1>
                <p className="text-muted-foreground">
                    Gerencie as assinaturas dos usuários
                </p>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Filtros</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4">
                    <div className="flex-1">
                        <label className="text-sm font-medium mb-2 block">Status</label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger>
                                <SelectValue placeholder="Todos os status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos os status</SelectItem>
                                <SelectItem value="ACTIVE">Ativo</SelectItem>
                                <SelectItem value="TRIAL">Trial</SelectItem>
                                <SelectItem value="CANCELED">Cancelado</SelectItem>
                                <SelectItem value="EXPIRED">Expirado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Subscriptions List */}
            <Card>
                <CardHeader>
                    <CardTitle>Assinaturas ({total})</CardTitle>
                    <CardDescription>
                        Lista de todas as assinaturas do sistema
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {subscriptions.map((subscription) => (
                            <div
                                key={subscription.id}
                                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{subscription.user.name || subscription.user.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <CreditCard className="h-4 w-4" />
                                            <Badge className={getPlanBadgeColor(subscription.plan.name)}>
                                                {subscription.plan.displayName}
                                            </Badge>
                                            <span className="text-xs">
                                                {formatPrice(subscription.plan.price)}/{formatInterval(subscription.plan.interval)}
                                            </span>
                                            <Badge className={getStatusBadgeColor(subscription.status)}>
                                                {subscription.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span>
                                                Início: {new Date(subscription.startDate).toLocaleDateString('pt-BR')}
                                            </span>
                                            {subscription.endDate && (
                                                <span>
                                                    • Fim: {new Date(subscription.endDate).toLocaleDateString('pt-BR')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <Select
                                        value={subscription.status}
                                        onValueChange={(value) => {
                                            setSelectedSubscription(subscription);
                                            setActionDialog({
                                                open: true,
                                                type: 'status',
                                                newStatus: value as 'ACTIVE' | 'CANCELED' | 'EXPIRED' | 'TRIAL'
                                            });
                                        }}
                                    >
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">Ativo</SelectItem>
                                            <SelectItem value="TRIAL">Trial</SelectItem>
                                            <SelectItem value="CANCELED">Cancelado</SelectItem>
                                            <SelectItem value="EXPIRED">Expirado</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-6">
                        <p className="text-sm text-muted-foreground">
                            Mostrando {subscriptions.length} de {total} assinaturas
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
                                disabled={subscriptions.length < 20}
                            >
                                Próxima
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <AlertDialog open={actionDialog.open} onOpenChange={(open) => {
                if (!open) {
                    setActionDialog({ open: false, type: null });
                    setSelectedSubscription(null);
                }
            }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Alterar Status</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja alterar o status de <strong>{selectedSubscription?.user.email}</strong> para <strong>{actionDialog.newStatus}</strong>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleUpdateStatus}>
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
