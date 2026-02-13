import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PaymentGatewayFactory } from '../../infrastructure/factories/payment-gateway.factory';

export interface CancelSubscriptionInput {
    userId: string;
    reason?: string;
}

@Injectable()
export class CancelSubscriptionUseCase {
    constructor(
        private readonly prisma: PrismaService,
        private readonly gatewayFactory: PaymentGatewayFactory,
    ) { }

    async execute(input: CancelSubscriptionInput): Promise<void> {
        // 1. Buscar subscription do usuário
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId: input.userId },
            include: { plan: true, user: true },
        });

        if (!subscription) {
            throw new NotFoundException('Subscription not found');
        }

        if (subscription.status === 'CANCELED' || subscription.status === 'EXPIRED') {
            throw new BadRequestException('Subscription is already canceled or expired');
        }

        // 2. Buscar última transação para pegar gatewayTxId (subscription ID no Stripe)
        const lastTransaction = await this.prisma.transaction.findFirst({
            where: {
                userId: input.userId,
                subscriptionId: subscription.id,
                type: { in: ['SUBSCRIPTION_CREATE', 'SUBSCRIPTION_RENEW'] },
            },
            orderBy: { createdAt: 'desc' },
        });

        if (!lastTransaction || !lastTransaction.gatewayTxId) {
            throw new BadRequestException('No active gateway subscription found');
        }

        // 3. Criar transação de cancelamento
        const transaction = await this.prisma.transaction.create({
            data: {
                userId: input.userId,
                subscriptionId: subscription.id,
                gateway: await this.gatewayFactory.getActiveGatewayType(),
                amount: 0,
                currency: 'BRL',
                status: 'PROCESSING',
                type: 'SUBSCRIPTION_CREATE', // Cancelamento não gera cobrança
                metadata: {
                    reason: input.reason,
                    canceledPlanId: subscription.planId,
                },
            },
        });

        try {
            // 4. Cancelar no gateway
            const gateway = await this.gatewayFactory.getActive();
            await gateway.cancelSubscription(lastTransaction.gatewayTxId);

            // 5. Atualizar subscription no banco
            await this.prisma.subscription.update({
                where: { id: subscription.id },
                data: {
                    status: 'CANCELED',
                    endDate: new Date(), // Cancela imediatamente
                },
            });

            // 6. Atualizar transação
            await this.prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    status: 'SUCCEEDED',
                    processedAt: new Date(),
                },
            });

            // 7. Log activity
            await this.prisma.activityLog.create({
                data: {
                    userId: input.userId,
                    action: 'SUBSCRIPTION_CANCELED',
                    details: {
                        planName: subscription.plan.displayName,
                        reason: input.reason,
                        gatewaySubscriptionId: lastTransaction.gatewayTxId,
                    },
                },
            });
        } catch (error) {
            // Marcar transação como FAILED
            await this.prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    status: 'FAILED',
                    errorMessage: error.message,
                },
            });

            throw error;
        }
    }
}
