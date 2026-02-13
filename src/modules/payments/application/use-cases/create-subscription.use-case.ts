import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PaymentGatewayFactory } from '../../infrastructure/factories/payment-gateway.factory';

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

@Injectable()
export class CreateSubscriptionUseCase {
    constructor(
        private readonly prisma: PrismaService,
        private readonly gatewayFactory: PaymentGatewayFactory,
    ) { }

    async execute(input: CreateSubscriptionInput): Promise<CreateSubscriptionOutput> {
        // 1. Buscar usuário e plano
        const [user, plan] = await Promise.all([
            this.prisma.user.findUnique({
                where: { id: input.userId },
                include: { subscription: true },
            }),
            this.prisma.plan.findUnique({
                where: { id: input.planId },
            }),
        ]);

        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (!plan) {
            throw new BadRequestException('Plan not found');
        }

        if (!plan.active) {
            throw new BadRequestException('Plan is not active');
        }

        // 2. Verificar se já tem subscription ativa
        if (user.subscription && user.subscription.status === 'ACTIVE') {
            throw new BadRequestException('User already has an active subscription');
        }

        // 3. Criar transação no banco
        const transaction = await this.prisma.transaction.create({
            data: {
                userId: input.userId,
                gateway: await this.gatewayFactory.getActiveGatewayType(),
                amount: Number(plan.price),
                currency: 'BRL',
                status: 'PENDING',
                type: 'SUBSCRIPTION_CREATE',
                metadata: {
                    planId: input.planId,
                    planName: plan.name,
                    trialDays: input.trialDays,
                },
            },
        });

        try {
            // 4. Obter gateway ativo
            const gateway = await this.gatewayFactory.getActive();

            // 5. Criar ou reutilizar customer no Stripe
            let stripeCustomerId = user.stripeCustomerId;
            if (!stripeCustomerId) {
                const customer = await gateway.createCustomer(input.userId, user.email);
                stripeCustomerId = customer.id;
                // Persistir stripeCustomerId no User
                await this.prisma.user.update({
                    where: { id: input.userId },
                    data: { stripeCustomerId },
                });
            }

            // 6. Criar subscription no gateway
            // Usar stripePriceId se disponível, senão fallback para plan.name
            const stripePriceId = plan.stripePriceId || plan.name;
            const gatewaySubscription = await gateway.createSubscription({
                userId: input.userId,
                planId: stripePriceId,
                paymentMethodId: input.paymentMethodId,
                trialDays: input.trialDays,
                customer: stripeCustomerId,
            });

            // 7. Atualizar transação
            await this.prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    gatewayTxId: gatewaySubscription.id,
                    status: 'SUCCEEDED',
                    processedAt: new Date(),
                },
            });

            // 8. Criar/atualizar subscription no banco
            const subscription = await this.prisma.subscription.upsert({
                where: { userId: input.userId },
                create: {
                    userId: input.userId,
                    planId: input.planId,
                    status: input.trialDays ? 'TRIAL' : 'ACTIVE',
                    startDate: new Date(),
                    endDate: gatewaySubscription.currentPeriodEnd,
                },
                update: {
                    planId: input.planId,
                    status: input.trialDays ? 'TRIAL' : 'ACTIVE',
                    startDate: new Date(),
                    endDate: gatewaySubscription.currentPeriodEnd,
                },
            });

            // 9. Vincular transação à subscription
            await this.prisma.transaction.update({
                where: { id: transaction.id },
                data: { subscriptionId: subscription.id },
            });

            // 10. Log activity
            await this.prisma.activityLog.create({
                data: {
                    userId: input.userId,
                    action: 'SUBSCRIPTION_CREATED',
                    details: {
                        planId: input.planId,
                        planName: plan.displayName,
                        gatewaySubscriptionId: gatewaySubscription.id,
                        trial: !!input.trialDays,
                    },
                },
            });

            return {
                subscriptionId: gatewaySubscription.id,
                status: gatewaySubscription.status,
                transactionId: transaction.id,
                currentPeriodEnd: gatewaySubscription.currentPeriodEnd,
            };
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
