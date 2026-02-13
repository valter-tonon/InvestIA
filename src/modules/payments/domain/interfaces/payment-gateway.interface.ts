export interface CreatePaymentIntentInput {
    amount: number;
    currency: string;
    userId: string;
    planId: string;
    metadata?: Record<string, any>;
}

export interface PaymentIntentResult {
    id: string;
    clientSecret: string;
    status: string;
    amount: number;
}

export interface CreateSubscriptionInput {
    userId: string;
    planId: string;
    paymentMethodId: string;
    trialDays?: number;
    customer?: string;
}

export interface SubscriptionResult {
    id: string;
    status: string;
    currentPeriodEnd: Date;
    customer: string;
}

export interface CustomerResult {
    id: string;
    email: string;
}

/**
 * Payment Gateway Interface
 * 
 * Abstração para qualquer gateway de pagamento (Stripe, Pagar.me, etc.)
 * Permite trocar gateways sem impactar o código da aplicação
 */
export interface IPaymentGateway {
    // Payment Intents (para pagamentos únicos)
    createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult>;
    confirmPaymentIntent(intentId: string): Promise<PaymentIntentResult>;

    // Subscriptions (assinaturas recorrentes)
    createSubscription(input: CreateSubscriptionInput): Promise<SubscriptionResult>;
    cancelSubscription(subscriptionId: string): Promise<void>;
    updateSubscription(subscriptionId: string, newPlanId: string): Promise<SubscriptionResult>;

    // Webhooks
    verifyWebhookSignature(payload: string, signature: string): boolean;
    parseWebhookEvent(payload: string): any;

    // Customers
    createCustomer(userId: string, email: string): Promise<CustomerResult>;
    attachPaymentMethod(customerId: string, paymentMethodId: string): Promise<void>;
}
