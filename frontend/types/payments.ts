// Types para o módulo de pagamentos
export interface Plan {
    id: string;
    name: string;
    displayName: string;
    description: string;
    price: number;
    interval: 'MONTHLY' | 'YEARLY';
    features: Record<string, any>;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Subscription {
    id: string;
    userId: string;
    planId: string;
    status: 'ACTIVE' | 'CANCELED' | 'TRIAL' | 'EXPIRED';
    startDate: string;
    endDate?: string;
    plan?: Plan;
}

export interface Transaction {
    id: string;
    userId: string;
    planId?: string;
    gateway: 'STRIPE' | 'PAGARME' | 'MERCADOPAGO';
    gatewayTxId?: string;
    amount: number;
    currency: string;
    status: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED' | 'CANCELED';
    type: 'SUBSCRIPTION_CREATE' | 'SUBSCRIPTION_RENEW' | 'UPGRADE' | 'DOWNGRADE' | 'REFUND';
    errorMessage?: string;
    createdAt: string;
    processedAt?: string;
}

export interface PaymentIntent {
    clientSecret: string;
}

export interface CreateSubscriptionInput {
    userId: string;
    planId: string;
    paymentMethodId: string;
    trialDays?: number;
}

export interface CreateSubscriptionOutput {
    subscriptionId: string;
    status: string;
    transactionId: string;
    currentPeriodEnd: Date;
}

export interface CheckoutState {
    step: 'plan' | 'payment' | 'processing' | 'success' | 'error';
    selectedPlan?: Plan;
    error?: string;
}
