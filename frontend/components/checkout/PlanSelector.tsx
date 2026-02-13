import { Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Plan } from '@/types/payments';
import { formatCurrency, calculateMonthlyEquivalent } from '@/lib/stripe/utils';

interface PlanSelectorProps {
    plans: Plan[];
    selectedPlanId?: string;
    onSelectPlan: (plan: Plan) => void;
    isLoading?: boolean;
}

export function PlanSelector({ plans, selectedPlanId, onSelectPlan, isLoading }: PlanSelectorProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-[400px] bg-muted/20 animate-pulse rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Escolha o plano ideal para você</h2>
                <p className="text-muted-foreground">
                    Desbloqueie todo o potencial dos seus investimentos com nossos planos premium
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => {
                    const isSelected = selectedPlanId === plan.id;
                    const isYearly = plan.interval === 'YEARLY';
                    const monthlyPrice = calculateMonthlyEquivalent(plan.price, plan.interval);

                    return (
                        <Card
                            key={plan.id}
                            className={cn(
                                "relative flex flex-col transition-all duration-200 cursor-pointer hover:border-primary/50",
                                isSelected ? "border-primary shadow-lg ring-1 ring-primary" : "border-border",
                                plan.name === 'pro' && !isSelected && "border-primary/20 bg-primary/5" // Destaque para plano Pro
                            )}
                            onClick={() => onSelectPlan(plan)}
                        >
                            {plan.name === 'pro' && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <Badge className="bg-primary text-primary-foreground hover:bg-primary">
                                        Mais Popular
                                    </Badge>
                                </div>
                            )}

                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    <span>{plan.displayName}</span>
                                    {isSelected && <Check className="h-5 w-5 text-primary" />}
                                </CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                            </CardHeader>

                            <CardContent className="flex-1 space-y-4">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-bold">{formatCurrency(plan.price)}</span>
                                    <span className="text-muted-foreground">/{plan.interval === 'MONTHLY' ? 'mês' : 'ano'}</span>
                                </div>

                                {isYearly && (
                                    <p className="text-sm text-green-600 font-medium">
                                        Economize assinando o plano anual
                                    </p>
                                )}

                                <div className="space-y-2 pt-4">
                                    {Object.entries(plan.features || {}).map(([key, value]) => (
                                        <div key={key} className="flex items-center gap-2 text-sm">
                                            <Check className="h-4 w-4 text-green-500 shrink-0" />
                                            <span>
                                                {typeof value === 'boolean'
                                                    ? key.replace(/_/g, ' ')
                                                    : `${value} ${key.replace(/_/g, ' ')}`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>

                            <CardFooter>
                                <Button
                                    className="w-full"
                                    variant={isSelected ? "default" : "outline"}
                                >
                                    {isSelected ? "Selecionado" : "Escolher este plano"}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
