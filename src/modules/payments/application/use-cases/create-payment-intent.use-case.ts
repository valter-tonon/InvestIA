import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PaymentGatewayFactory } from '../../infrastructure/factories/payment-gateway.factory';

export interface CreatePaymentIntentInput {
    userId: string;
    planId: string;
    amount?: number;
    currency?: string;
}

export interface CreatePaymentIntentOutput {
    clientSecret: string;
    paymentIntentId: string;
    amount: number;
    currency: string;
}

@Injectable()
export class CreatePaymentIntentUseCase {
    constructor(
        private readonly prisma: PrismaService,
        private readonly gatewayFactory: PaymentGatewayFactory,
    ) { }

    async execute(input: CreatePaymentIntentInput): Promise<CreatePaymentIntentOutput> {
        // 1. Buscar plano
        const plan = await this.prisma.plan.findUnique({
            where: { id: input.planId },
        });

        if (!plan) {
            throw new BadRequestException('Plan not found');
        }

        if (!plan.active) {
            throw new BadRequestException('Plan is not active');
        }

        // 2. Determinar valores
        const amount = input.amount ?? Number(plan.price);
        const currency = input.currency ?? 'BRL';

        // 3. Criar transação PENDING no banco
        const transaction = await this.prisma.transaction.create({
            data: {
                userId: input.userId,
                gateway: await this.gatewayFactory.getActiveGatewayType(),
                amount,
                currency,
                status: 'PENDING',
                type: 'SUBSCRIPTION_CREATE',
                metadata: {
                    planId: input.planId,
                    planName: plan.name,
                },
            },
        });

        try {
            // 4. Obter gateway ativo e criar payment intent
            const gateway = await this.gatewayFactory.getActive();

            const paymentIntent = await gateway.createPaymentIntent({
                amount,
                currency,
                userId: input.userId,
                planId: input.planId,
                metadata: {
                    transactionId: transaction.id,
                    planName: plan.name,
                },
            });

            // 5. Atualizar transação com ID externo
            await this.prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    gatewayTxId: paymentIntent.id,
                    status: 'PROCESSING',
                },
            });

            return {
                clientSecret: paymentIntent.clientSecret,
                paymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount,
                currency,
            };
        } catch (error) {
            // 6. Marcar transação como FAILED
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
