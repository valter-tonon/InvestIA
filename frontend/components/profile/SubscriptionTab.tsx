'use client';

import { SubscriptionDetails } from './SubscriptionDetails';

interface SubscriptionTabProps {
    userId: string;
}

export function SubscriptionTab({ userId }: SubscriptionTabProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <h3 className="text-lg font-medium">Assinatura e Cobrança</h3>
                <p className="text-sm text-muted-foreground">
                    Gerencie seu plano, método de pagamento e visualize seu histórico de faturas.
                </p>
            </div>
            <SubscriptionDetails userId={userId} />
        </div>
    );
}
