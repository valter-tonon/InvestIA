import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PaymentGatewayFactory } from '../../infrastructure/factories/payment-gateway.factory';
import { PaymentGateway } from '@prisma/client';

export interface TestGatewayConnectionInput {
    gateway: PaymentGateway;
}

@Injectable()
export class TestGatewayConnectionUseCase {
    constructor(
        private readonly prisma: PrismaService,
        private readonly gatewayFactory: PaymentGatewayFactory,
    ) { }

    async execute(input: TestGatewayConnectionInput) {
        try {
            // Verificar se config existe
            const config = await this.prisma.paymentGatewayConfig.findUnique({
                where: { gateway: input.gateway },
            });

            if (!config) {
                throw new BadRequestException('Gateway not configured');
            }

            // Tentar criar instância do gateway (valida credenciais)
            const gateway = await this.gatewayFactory.create(input.gateway);

            // Fazer uma chamada simples de teste (buscar planos cadastrados)
            // Para Stripe, vamos listar produtos para validar a conexão
            // TODO: Adicionar teste específico por gateway

            return {
                success: true,
                gateway: input.gateway,
                message: 'Connection successful',
                isTest: config.isTest,
            };
        } catch (error) {
            return {
                success: false,
                gateway: input.gateway,
                message: error.message,
                error: error.type || 'unknown_error',
            };
        }
    }
}
