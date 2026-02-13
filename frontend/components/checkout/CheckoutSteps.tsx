import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckoutStepsProps {
    currentStep: 'plan' | 'payment' | 'processing' | 'success' | 'error';
}

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
    const steps = [
        { id: 'plan', label: 'Escolha o Plano' },
        { id: 'payment', label: 'Pagamento' },
        { id: 'confirmation', label: 'Confirmação' },
    ];

    const getStepStatus = (stepId: string) => {
        if (stepId === 'plan') {
            return currentStep === 'plan' ? 'current' : 'completed';
        }

        if (stepId === 'payment') {
            if (currentStep === 'plan') return 'upcoming';
            if (currentStep === 'success') return 'completed';
            // payment, processing, or error
            return 'current';
        }

        if (stepId === 'confirmation') {
            return currentStep === 'success' ? 'current' : 'upcoming';
        }

        return 'upcoming';
    };

    return (
        <div className="w-full py-6">
            <div className="flex items-center justify-center space-x-4 sm:space-x-8">
                {steps.map((step, index) => {
                    const status = getStepStatus(step.id);
                    const isCompleted = status === 'completed';
                    const isCurrent = status === 'current';

                    return (
                        <div key={step.id} className="flex items-center">
                            <div className="flex flex-col items-center relative">
                                <div
                                    className={cn(
                                        "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors duration-200",
                                        isCompleted ? "bg-primary border-primary text-primary-foreground" :
                                            isCurrent ? "border-primary text-primary" : "border-muted-foreground/30 text-muted-foreground/30"
                                    )}
                                >
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-5 h-5" />
                                    ) : (
                                        <span className="text-sm font-semibold">{index + 1}</span>
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        "absolute -bottom-6 text-xs font-medium whitespace-nowrap",
                                        isCurrent ? "text-primary" : "text-muted-foreground"
                                    )}
                                >
                                    {step.label}
                                </span>
                            </div>

                            {index < steps.length - 1 && (
                                <div className={cn(
                                    "w-12 h-[2px] mx-2 sm:mx-4 mb-4", // mb-4 to align with circles not text
                                    status === 'completed' ? "bg-primary" : "bg-muted-foreground/20"
                                )} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
