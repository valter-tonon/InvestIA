'use client';

import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '@/lib/api/payments';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Calendar, CreditCard, ShieldCheck } from 'lucide-react';
import { CancelSubscriptionDialog } from './CancelSubscriptionDialog';
import { TransactionHistory } from './TransactionHistory';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';
import { formatCurrency, getIntervalLabel } from '@/lib/stripe/utils'; // Importar utils criados anteriormente

interface SubscriptionDetailsProps {
    userId: string;
}

export function SubscriptionDetails({ userId }: SubscriptionDetailsProps) {
    const router = useRouter();
    const [isCancelling, setIsCancelling] = useState(false);

    // Buscar assinatura
    const {
        data: subscription,
        isLoading: loadingSub,
        refetch: refetchSub
    } = useQuery({
        queryKey: ['subscription', userId],
        queryFn: () => paymentsApi.getUserSubscription(userId),
        enabled: !!userId,
    });

    // Buscar histórico de transações
    const {
        data: transactions = [],
        isLoading: loadingTx
    } = useQuery({
        queryKey: ['transactions', userId],
        queryFn: () => paymentsApi.getUserTransactions(userId),
        enabled: !!userId,
    });

    const handleCancel = async (reason: string) => {
        setIsCancelling(true);
        try {
            await paymentsApi.cancelSubscription(userId, reason);
            toast.success('Assinatura cancelada com sucesso.');
            await refetchSub();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Erro ao cancelar assinatura.');
        } finally {
            setIsCancelling(false);
        }
    };

    if (loadingSub) {
        return <Skeleton className="h-[400px] w-full" />;
    }

    // Sem assinatura ativa ou cancelada (null)
    if (!subscription) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Assinatura Premium</CardTitle>
                    <CardDescription>Você está no plano gratuito.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
                        <ShieldCheck className="h-10 w-10 text-muted-foreground" />
                        <div>
                            <p className="font-medium">Faça o upgrade agora</p>
                            <p className="text-sm text-muted-foreground">
                                Desbloqueie todos os recursos e acesse ferramentas exclusivas.
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={() => router.push('/dashboard/checkout')} className="w-full sm:w-auto">
                        Ver Planos Disponíveis
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    const isTrial = subscription.status === 'TRIAL';
    const isCanceled = subscription.status === 'CANCELED';
    const isActive = subscription.status === 'ACTIVE' || isTrial;

    return (
        <div className="space-y-8">
            {/* Detalhes da Assinatura */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-xl flex items-center gap-2">
                                {subscription.plan?.displayName || 'Plano Premium'}
                                {isTrial && <Badge variant="secondary">Período de Teste</Badge>}
                                {isCanceled && <Badge variant="destructive">Cancelado</Badge>}
                                {!isTrial && !isCanceled && <Badge className="bg-green-500 hover:bg-green-600">Ativo</Badge>}
                            </CardTitle>
                            <CardDescription>Gerencie os detalhes do seu plano atual.</CardDescription>
                        </div>
                        {subscription.plan && (
                            <div className="text-right">
                                <p className="text-2xl font-bold">{formatCurrency(subscription.plan.price)}</p>
                                <p className="text-sm text-muted-foreground">/{getIntervalLabel(subscription.plan.interval)}</p>
                            </div>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Início da Assinatura
                            </span>
                            <p>{format(new Date(subscription.startDate), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                        </div>

                        <div className="space-y-1">
                            <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <CreditCard className="h-4 w-4" />
                                Próxima Renovação
                            </span>
                            <p>
                                {subscription.endDate
                                    ? format(new Date(subscription.endDate), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
                                    : 'N/A'}
                                {isCanceled && <span className="text-sm text-destructive ml-2">(Expira nesta data)</span>}
                            </p>
                        </div>
                    </div>

                    {isCanceled && (
                        <div className="flex items-center gap-2 p-3 text-sm text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 rounded-md border border-amber-200 dark:border-amber-900">
                            <AlertCircle className="h-4 w-4" />
                            <p>Sua assinatura foi cancelada, mas você mantém o acesso até o fim do período atual.</p>
                        </div>
                    )}
                </CardContent>

                {isActive && !isCanceled && (
                    <CardFooter className="flex justify-between border-t py-4 bg-muted/20">
                        <p className="text-xs text-muted-foreground">
                            Para mudar de plano, você precisará cancelar o atual primeiro ou entrar em contato com o suporte.
                        </p>
                        <CancelSubscriptionDialog onConfirm={handleCancel} isLoading={isCancelling} />
                    </CardFooter>
                )}
            </Card>

            {/* Histórico de Transações */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Histórico de Pagamentos</h3>
                <TransactionHistory transactions={transactions} isLoading={loadingTx} />
            </div>
        </div>
    );
}
