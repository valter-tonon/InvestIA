import { api } from './client';
import type {
    Plan,
    Subscription,
    Transaction,
    PaymentIntent,
    CreateSubscriptionInput,
    CreateSubscriptionOutput,
} from '@/types/payments';

/**
 * API client para módulo de pagamentos
 */
export const paymentsApi = {
    // ============ PLANOS ============

    /**
     * Listar todos os planos ativos
     */
    async getPlans(activeOnly = true): Promise<Plan[]> {
        const response = await api.get('/payments/plans', {
            params: { activeOnly: activeOnly.toString() },
        });
        return response.data;
    },

    /**
     * Obter um plano específico por ID
     * Nota: fetch all + filter client-side
     */
    async getPlan(planId: string): Promise<Plan | undefined> {
        const plans = await this.getPlans(false);
        return plans.find(p => p.id === planId);
    },

    // ============ PAYMENT INTENTS ============

    /**
     * Criar payment intent para checkout
     */
    async createPaymentIntent(data: {
        planId: string;
        userId?: string;
        paymentMethodId?: string;
    }): Promise<PaymentIntent> {
        const response = await api.post('/payments/create-intent', {
            planId: data.planId,
            amount: data.paymentMethodId,
            currency: 'BRL',
        });
        return response.data;
    },

    // ============ SUBSCRIPTIONS ============

    /**
     * Criar nova assinatura
     */
    async createSubscription(
        data: CreateSubscriptionInput
    ): Promise<CreateSubscriptionOutput> {
        const response = await api.post('/payments/create-subscription', {
            planId: data.planId,
            paymentMethodId: data.paymentMethodId,
            trialDays: data.trialDays,
        });
        return response.data;
    },

    /**
     * Obter assinatura do usuário
     * Nota: userId não é necessário; backend extrai do JWT
     */
    async getUserSubscription(userId?: string): Promise<Subscription | null> {
        try {
            const response = await api.get('/payments/subscription');
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    },

    /**
     * Cancelar assinatura
     */
    async cancelSubscription(userId?: string, reason?: string): Promise<void> {
        await api.post('/payments/cancel-subscription', { reason });
    },

    // ============ TRANSACTIONS ============

    /**
     * Listar transações do usuário
     * Nota: userId não é necessário; backend extrai do JWT
     */
    async getUserTransactions(userId?: string, limit?: number): Promise<Transaction[]> {
        const response = await api.get('/payments/transactions', {
            params: { limit: limit || 50 },
        });
        return response.data;
    },
};
