'use client';

import { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe/config';
import { usePlans } from '@/lib/hooks/use-plans';
import { useCheckout } from '@/lib/hooks/use-checkout';
import { Plan } from '@/types/payments';
import { CheckoutSteps } from './CheckoutSteps';
import { PlanSelector } from './PlanSelector';
import { PaymentSummary } from './PaymentSummary';
import { PaymentForm } from './PaymentForm';
import { useAuth } from '@/lib/hooks/useAuth'; // Assumindo que existe
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function CheckoutForm() {
    const { user } = useAuth();
    const { data: plans = [], isLoading: loadingPlans } = usePlans();
    const { createSubscription, isLoading: processingPayment } = useCheckout({
        userId: user?.id,
    });

    const [step, setStep] = useState<'plan' | 'payment'>('plan');
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

    const handleSelectPlan = (plan: Plan) => {
        setSelectedPlan(plan);
        setStep('payment');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBack = () => {
        setStep('plan');
    };

    const handlePaymentSuccess = async (paymentMethodId: string) => {
        if (!selectedPlan || !user?.id) return;

        await createSubscription.mutateAsync({
            userId: user.id,
            planId: selectedPlan.id,
            paymentMethodId,
            // trialDays: 0, // Adicionar lógica de trial se necessário
        });
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <CheckoutSteps currentStep={step} />

            <div className="mt-8">
                {step === 'plan' ? (
                    <PlanSelector
                        plans={plans}
                        selectedPlanId={selectedPlan?.id}
                        onSelectPlan={handleSelectPlan}
                        isLoading={loadingPlans}
                    />
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
                                    <ArrowLeft className="h-4 w-4" />
                                    Trocar Plano
                                </Button>
                                <h2 className="text-xl font-semibold">Finalizar Pagamento</h2>
                            </div>

                            {selectedPlan && (
                                <div className="border rounded-xl p-6 shadow-sm bg-card">
                                    <Elements
                                        stripe={stripePromise}
                                        options={{
                                            mode: 'subscription',
                                            currency: 'brl',
                                            amount: Math.round(selectedPlan.price * 100),
                                            appearance: {
                                                theme: 'stripe',
                                                variables: {
                                                    colorPrimary: '#0f172a', // slate-900 (primary)
                                                },
                                            },
                                        }}
                                    >
                                        <PaymentForm
                                            amount={selectedPlan.price}
                                            onSuccess={handlePaymentSuccess}
                                            isLoading={processingPayment}
                                        />
                                    </Elements>
                                </div>
                            )}
                        </div>

                        <div className="lg:col-span-1">
                            {selectedPlan && <PaymentSummary plan={selectedPlan} />}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
