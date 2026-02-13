import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

export interface HandleWebhookInput {
    event: any; // Stripe event object
    rawPayload: string;
}

/**
 * Use case para processar webhooks do payment gateway
 * 
 * Eventos importantes:
 * - checkout.session.completed: Pagamento inicial bem-sucedido
 * - customer.subscription.updated: Renovação, upgrade, downgrade
 * - customer.subscription.deleted: Cancelamento
 * - invoice.payment_succeeded: Pagamento recorrente bem-sucedido
 * - invoice.payment_failed: Falha no pagamento
 */
@Injectable()
export class HandleWebhookUseCase {
    private readonly logger = new Logger(HandleWebhookUseCase.name);

    constructor(private readonly prisma: PrismaService) { }

    async execute(input: HandleWebhookInput): Promise<void> {
        const { event } = input;

        this.logger.log(`Processing webhook event: ${event.type}`);

        // Save webhook log
        await this.prisma.externalApiLog.create({
            data: {
                provider: 'STRIPE',
                endpoint: '/webhooks',
                method: 'POST',
                requestBody: event,
                statusCode: 200,
                success: true,
            },
        });

        try {
            switch (event.type) {
                case 'checkout.session.completed':
                    await this.handleCheckoutCompleted(event.data.object);
                    break;

                case 'customer.subscription.created':
                    await this.handleSubscriptionCreated(event.data.object);
                    break;

                case 'customer.subscription.updated':
                    await this.handleSubscriptionUpdated(event.data.object);
                    break;

                case 'customer.subscription.deleted':
                    await this.handleSubscriptionDeleted(event.data.object);
                    break;

                case 'invoice.payment_succeeded':
                    await this.handleInvoicePaymentSucceeded(event.data.object);
                    break;

                case 'invoice.payment_failed':
                    await this.handleInvoicePaymentFailed(event.data.object);
                    break;

                default:
                    this.logger.warn(`Unhandled event type: ${event.type}`);
            }
        } catch (error) {
            this.logger.error(`Error processing webhook: ${error.message}`, error.stack);
            throw error;
        }
    }

    private async handleCheckoutCompleted(session: any): Promise<void> {
        this.logger.log(`Checkout completed for customer: ${session.customer}`);

        // Extract metadata
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;

        if (!userId || !planId) {
            this.logger.warn('Missing userId or planId in checkout session metadata');
            return;
        }

        // Find or create subscription
        await this.prisma.subscription.upsert({
            where: { userId },
            create: {
                userId,
                planId,
                status: 'ACTIVE',
                startDate: new Date(),
            },
            update: {
                status: 'ACTIVE',
            },
        });

        // Log activity
        await this.prisma.activityLog.create({
            data: {
                userId,
                action: 'CHECKOUT_COMPLETED',
                details: {
                    sessionId: session.id,
                    planId,
                },
            },
        });
    }

    private async handleSubscriptionCreated(subscription: any): Promise<void> {
        this.logger.log(`Subscription created: ${subscription.id}`);

        const userId = subscription.metadata?.userId;
        if (!userId) return;

        // Update transaction status
        await this.prisma.transaction.updateMany({
            where: {
                userId,
                gatewayTxId: subscription.id,
                status: 'PROCESSING',
            },
            data: {
                status: 'SUCCEEDED',
                processedAt: new Date(),
            },
        });
    }

    private async handleSubscriptionUpdated(subscription: any): Promise<void> {
        this.logger.log(`Subscription updated: ${subscription.id}`);

        const userId = subscription.metadata?.userId;
        if (!userId) return;

        // Map Stripe status to our status
        let status: 'ACTIVE' | 'CANCELED' | 'TRIAL' | 'EXPIRED' = 'ACTIVE';

        switch (subscription.status) {
            case 'active':
                status = 'ACTIVE';
                break;
            case 'trialing':
                status = 'TRIAL';
                break;
            case 'canceled':
            case 'unpaid':
                status = 'CANCELED';
                break;
            case 'past_due':
                status = 'EXPIRED';
                break;
        }

        // Update subscription
        await this.prisma.subscription.updateMany({
            where: { userId },
            data: {
                status,
                endDate: new Date(subscription.current_period_end * 1000),
            },
        });

        // Log activity
        await this.prisma.activityLog.create({
            data: {
                userId,
                action: 'SUBSCRIPTION_UPDATED',
                details: {
                    subscriptionId: subscription.id,
                    status: subscription.status,
                },
            },
        });
    }

    private async handleSubscriptionDeleted(subscription: any): Promise<void> {
        this.logger.log(`Subscription deleted: ${subscription.id}`);

        const userId = subscription.metadata?.userId;
        if (!userId) return;

        // Cancel subscription
        await this.prisma.subscription.updateMany({
            where: { userId },
            data: {
                status: 'CANCELED',
                endDate: new Date(),
            },
        });

        // Create transaction record
        await this.prisma.transaction.create({
            data: {
                userId,
                gateway: 'STRIPE',
                gatewayTxId: subscription.id,
                amount: 0,
                currency: 'BRL',
                status: 'SUCCEEDED',
                type: 'SUBSCRIPTION_CREATE',
                processedAt: new Date(),
                metadata: {
                    event: 'subscription_deleted',
                },
            },
        });

        // Log activity
        await this.prisma.activityLog.create({
            data: {
                userId,
                action: 'SUBSCRIPTION_DELETED',
                details: {
                    subscriptionId: subscription.id,
                },
            },
        });
    }

    private async handleInvoicePaymentSucceeded(invoice: any): Promise<void> {
        this.logger.log(`Invoice payment succeeded: ${invoice.id}`);

        const userId = invoice.subscription_details?.metadata?.userId;
        if (!userId) return;

        // Create transaction record for renewal
        await this.prisma.transaction.create({
            data: {
                userId,
                gateway: 'STRIPE',
                gatewayTxId: invoice.id,
                amount: invoice.amount_paid / 100, // Convert cents to currency
                currency: invoice.currency.toUpperCase(),
                status: 'SUCCEEDED',
                type: 'SUBSCRIPTION_RENEW',
                processedAt: new Date(),
                metadata: {
                    invoiceId: invoice.id,
                    subscriptionId: invoice.subscription,
                },
            },
        });

        // Log activity
        await this.prisma.activityLog.create({
            data: {
                userId,
                action: 'INVOICE_PAYMENT_SUCCEEDED',
                details: {
                    invoiceId: invoice.id,
                    amount: invoice.amount_paid / 100,
                },
            },
        });
    }

    private async handleInvoicePaymentFailed(invoice: any): Promise<void> {
        this.logger.log(`Invoice payment failed: ${invoice.id}`);

        const userId = invoice.subscription_details?.metadata?.userId;
        if (!userId) return;

        // Create failed transaction
        await this.prisma.transaction.create({
            data: {
                userId,
                gateway: 'STRIPE',
                gatewayTxId: invoice.id,
                amount: invoice.amount_due / 100,
                currency: invoice.currency.toUpperCase(),
                status: 'FAILED',
                type: 'SUBSCRIPTION_RENEW',
                errorMessage: 'Payment failed',
                processedAt: new Date(),
                metadata: {
                    invoiceId: invoice.id,
                    subscriptionId: invoice.subscription,
                },
            },
        });

        // Update subscription to EXPIRED
        await this.prisma.subscription.updateMany({
            where: { userId },
            data: {
                status: 'EXPIRED',
            },
        });

        // Log activity
        await this.prisma.activityLog.create({
            data: {
                userId,
                action: 'INVOICE_PAYMENT_FAILED',
                details: {
                    invoiceId: invoice.id,
                    amount: invoice.amount_due / 100,
                },
            },
        });
    }
}
