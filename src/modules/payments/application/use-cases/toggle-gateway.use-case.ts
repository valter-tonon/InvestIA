import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PaymentGateway } from '@prisma/client';

export interface ToggleGatewayInput {
    gateway: PaymentGateway;
    isActive: boolean;
}

@Injectable()
export class ToggleGatewayUseCase {
    constructor(private readonly prisma: PrismaService) { }

    async execute(input: ToggleGatewayInput) {
        // Verificar se config existe
        const config = await this.prisma.paymentGatewayConfig.findUnique({
            where: { gateway: input.gateway },
        });

        if (!config) {
            throw new NotFoundException('Gateway configuration not found');
        }

        // Se ativando este gateway, desativar todos os outros
        if (input.isActive) {
            await this.prisma.paymentGatewayConfig.updateMany({
                where: {
                    gateway: { not: input.gateway },
                    isActive: true,
                },
                data: { isActive: false },
            });
        }

        // Atualizar o gateway alvo
        const updated = await this.prisma.paymentGatewayConfig.update({
            where: { gateway: input.gateway },
            data: { isActive: input.isActive },
        });

        return {
            gateway: updated.gateway,
            isActive: updated.isActive,
            isTest: updated.isTest,
        };
    }
}
