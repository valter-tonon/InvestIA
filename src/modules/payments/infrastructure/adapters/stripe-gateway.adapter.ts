import Stripe from 'stripe';
import { Injectable } from '@nestjs/common';
import {
    IPaymentGateway,
    CreatePaymentIntentInput,
    PaymentIntentResult,
    CreateSubscriptionInput,
    SubscriptionResult,
    CustomerResult,
} from '../../domain/interfaces/payment-gateway.interface';
import { ExternalApiLoggerService } from '../../../../infrastructure/services/external-api-logger.service';

export interface StripeConfig {
    apiKey: string;
    webhookSecret: string;
}

@Injectable()
export class StripeGatewayAdapter implements IPaymentGateway {
    private stripe: Stripe;
    private webhookSecret: string;

    constructor(
        private readonly apiLogger: ExternalApiLoggerService,
        config: StripeConfig,
    ) {
        this.stripe = new Stripe(config.apiKey, {
            apiVersion: '2026-01-28.clover' as any,
        });
        this.webhookSecret = config.webhookSecret;
    }

    async createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult> {
        const startTime = Date.now();
        const endpoint = '/v1/payment_intents';

        try {
            const intent = await this.stripe.paymentIntents.create({
                amount: Math.round(input.amount * 100), // Convert to cents
                currency: input.currency.toLowerCase(),
                metadata: {
                    userId: input.userId,
                    planId: input.planId,
                    ...input.metadata,
                },
                automatic_payment_methods: {
                    enabled: true,
                },
            });

            await this.apiLogger.log({
                provider: 'STRIPE',
                endpoint,
                method: 'POST',
                requestBody: {
                    amount: input.amount,
                    currency: input.currency,
                    userId: input.userId,
                },
                responseBody: { id: intent.id, status: intent.status },
                statusCode: 200,
                success: true,
                duration: Date.now() - startTime,
                userId: input.userId,
            });

            return {
                id: intent.id,
                clientSecret: intent.client_secret!,
                status: intent.status,
                amount: intent.amount / 100,
            };
        } catch (error) {
            await this.apiLogger.log({
                provider: 'STRIPE',
                endpoint,
                method: 'POST',
                requestBody: input,
                responseBody: error,
                statusCode: error.statusCode || 500,
                success: false,
                duration: Date.now() - startTime,
                userId: input.userId,
                errorMessage: error.message,
            });

            throw error;
        }
    }

    async confirmPaymentIntent(intentId: string): Promise<PaymentIntentResult> {
        const startTime = Date.now();
        const endpoint = `/v1/payment_intents/${intentId}/confirm`;

        try {
            const intent = await this.stripe.paymentIntents.confirm(intentId);

            await this.apiLogger.log({
                provider: 'STRIPE',
                endpoint,
                method: 'POST',
                requestBody: { intentId },
                responseBody: { id: intent.id, status: intent.status },
                statusCode: 200,
                success: true,
                duration: Date.now() - startTime,
            });

            return {
                id: intent.id,
                clientSecret: intent.client_secret!,
                status: intent.status,
                amount: intent.amount / 100,
            };
        } catch (error) {
            await this.apiLogger.log({
                provider: 'STRIPE',
                endpoint,
                method: 'POST',
                requestBody: { intentId },
                responseBody: error,
                statusCode: error.statusCode || 500,
                success: false,
                duration: Date.now() - startTime,
                errorMessage: error.message,
            });

            throw error;
        }
    }

    async createSubscription(input: CreateSubscriptionInput): Promise<SubscriptionResult> {
        const startTime = Date.now();
        const endpoint = '/v1/subscriptions';

        try {
            // Attach payment method to customer first
            if (input.customer && input.paymentMethodId) {
                await this.stripe.paymentMethods.attach(input.paymentMethodId, {
                    customer: input.customer,
                });

                await this.stripe.customers.update(input.customer, {
                    invoice_settings: {
                        default_payment_method: input.paymentMethodId,
                    },
                });
            }

            const subscription = await this.stripe.subscriptions.create({
                customer: input.customer!,
                items: [{ price: input.planId }], // planId is actually Stripe Price ID
                trial_period_days: input.trialDays || undefined,
                payment_behavior: 'default_incomplete',
                payment_settings: { save_default_payment_method: 'on_subscription' },
                expand: ['latest_invoice.payment_intent'],
            });

            await this.apiLogger.log({
                provider: 'STRIPE',
                endpoint,
                method: 'POST',
                requestBody: {
                    customer: input.customer,
                    planId: input.planId,
                    trialDays: input.trialDays,
                },
                responseBody: { id: subscription.id, status: subscription.status },
                statusCode: 200,
                success: true,
                duration: Date.now() - startTime,
                userId: input.userId,
            });

            return {
                id: subscription.id,
                status: subscription.status,
                currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                customer: subscription.customer as string,
            };
        } catch (error) {
            await this.apiLogger.log({
                provider: 'STRIPE',
                endpoint,
                method: 'POST',
                requestBody: input,
                responseBody: error,
                statusCode: error.statusCode || 500,
                success: false,
                duration: Date.now() - startTime,
                userId: input.userId,
                errorMessage: error.message,
            });

            throw error;
        }
    }

    async cancelSubscription(subscriptionId: string): Promise<void> {
        const startTime = Date.now();
        const endpoint = `/v1/subscriptions/${subscriptionId}`;

        try {
            await this.stripe.subscriptions.cancel(subscriptionId);

            await this.apiLogger.log({
                provider: 'STRIPE',
                endpoint,
                method: 'DELETE',
                requestBody: { subscriptionId },
                statusCode: 200,
                success: true,
                duration: Date.now() - startTime,
            });
        } catch (error) {
            await this.apiLogger.log({
                provider: 'STRIPE',
                endpoint,
                method: 'DELETE',
                requestBody: { subscriptionId },
                responseBody: error,
                statusCode: error.statusCode || 500,
                success: false,
                duration: Date.now() - startTime,
                errorMessage: error.message,
            });

            throw error;
        }
    }

    async updateSubscription(subscriptionId: string, newPlanId: string): Promise<SubscriptionResult> {
        const startTime = Date.now();
        const endpoint = `/v1/subscriptions/${subscriptionId}`;

        try {
            const subscription = await this.stripe.subscriptions.retrieve(subscriptionId);
            const updated = await this.stripe.subscriptions.update(subscriptionId, {
                items: [{
                    id: subscription.items.data[0].id,
                    price: newPlanId,
                }],
                proration_behavior: 'create_prorations',
            });

            await this.apiLogger.log({
                provider: 'STRIPE',
                endpoint,
                method: 'POST',
                requestBody: { subscriptionId, newPlanId },
                responseBody: { id: updated.id, status: updated.status },
                statusCode: 200,
                success: true,
                duration: Date.now() - startTime,
            });

            return {
                id: updated.id,
                status: updated.status,
                currentPeriodEnd: new Date((updated as any).current_period_end * 1000),
                customer: updated.customer as string,
            };
        } catch (error) {
            await this.apiLogger.log({
                provider: 'STRIPE',
                endpoint,
                method: 'POST',
                requestBody: { subscriptionId, newPlanId },
                responseBody: error,
                statusCode: error.statusCode || 500,
                success: false,
                duration: Date.now() - startTime,
                errorMessage: error.message,
            });

            throw error;
        }
    }

    async createCustomer(userId: string, email: string): Promise<CustomerResult> {
        const startTime = Date.now();
        const endpoint = '/v1/customers';

        try {
            const customer = await this.stripe.customers.create({
                email,
                metadata: { userId },
            });

            await this.apiLogger.log({
                provider: 'STRIPE',
                endpoint,
                method: 'POST',
                requestBody: { email, userId },
                responseBody: { id: customer.id },
                statusCode: 200,
                success: true,
                duration: Date.now() - startTime,
                userId,
            });

            return {
                id: customer.id,
                email: customer.email!,
            };
        } catch (error) {
            await this.apiLogger.log({
                provider: 'STRIPE',
                endpoint,
                method: 'POST',
                requestBody: { email, userId },
                responseBody: error,
                statusCode: error.statusCode || 500,
                success: false,
                duration: Date.now() - startTime,
                userId,
                errorMessage: error.message,
            });

            throw error;
        }
    }

    async attachPaymentMethod(customerId: string, paymentMethodId: string): Promise<void> {
        const startTime = Date.now();
        const endpoint = `/v1/payment_methods/${paymentMethodId}/attach`;

        try {
            await this.stripe.paymentMethods.attach(paymentMethodId, {
                customer: customerId,
            });

            await this.apiLogger.log({
                provider: 'STRIPE',
                endpoint,
                method: 'POST',
                requestBody: { customerId, paymentMethodId },
                statusCode: 200,
                success: true,
                duration: Date.now() - startTime,
            });
        } catch (error) {
            await this.apiLogger.log({
                provider: 'STRIPE',
                endpoint,
                method: 'POST',
                requestBody: { customerId, paymentMethodId },
                responseBody: error,
                statusCode: error.statusCode || 500,
                success: false,
                duration: Date.now() - startTime,
                errorMessage: error.message,
            });

            throw error;
        }
    }

    verifyWebhookSignature(payload: string, signature: string): boolean {
        try {
            this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
            return true;
        } catch {
            return false;
        }
    }

    parseWebhookEvent(payload: string): any {
        return JSON.parse(payload);
    }
}
