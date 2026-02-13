import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plan } from '@/types/payments';
import { formatCurrency, getIntervalLabel } from '@/lib/stripe/utils';
import { Check, ShieldCheck } from 'lucide-react';

interface PaymentSummaryProps {
    plan: Plan;
    interval?: 'MONTHLY' | 'YEARLY';
}

export function PaymentSummary({ plan, interval = 'MONTHLY' }: PaymentSummaryProps) {
    const isYearly = interval === 'YEARLY';

    // Se o plano tiver preço diferenciado por intervalo, aqui ajustaria
    // Assumindo que o preço no objeto Plan é mensal
    const price = plan.price; // Todo: Ajustar se houver lógica de preço anual no backend
    const total = isYearly ? price * 12 : price;

    return (
        <Card className="h-fit sticky top-6">
            <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    Resumo do Pedido
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="font-semibold text-lg">{plan.displayName}</h3>
                            <p className="text-sm text-muted-foreground">{plan.description}</p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                            {getIntervalLabel(interval)}
                        </Badge>
                    </div>

                    <div className="space-y-2 mt-4">
                        {Object.entries(plan.features || {}).slice(0, 3).map(([key, value]) => (
                            <div key={key} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Check className="h-4 w-4 text-green-500 shrink-0" />
                                <span>
                                    {typeof value === 'boolean'
                                        ? key.replace(/_/g, ' ')
                                        : `${value} ${key.replace(/_/g, ' ')}`}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <Separator />

                <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>{formatCurrency(total)}</span>
                    </div>
                    {isYearly && (
                        <div className="flex justify-between text-sm text-green-600">
                            <span>Desconto Anual</span>
                            <span>- {formatCurrency(0)}</span> {/* TODO: Implementar desconto real */}
                        </div>
                    )}
                    <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Taxas</span>
                        <span>R$ 0,00</span>
                    </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                    <span className="font-bold">Total a pagar</span>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                            {formatCurrency(total)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Cobrado a cada {getIntervalLabel(interval)}
                        </p>
                    </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md text-xs text-blue-700 dark:text-blue-300">
                    <p>
                        Sua assinatura será renovada automaticamente. Você pode cancelar a qualquer momento no seu painel.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
