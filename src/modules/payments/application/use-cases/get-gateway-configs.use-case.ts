import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

@Injectable()
export class GetGatewayConfigsUseCase {
    constructor(private readonly prisma: PrismaService) { }

    async execute() {
        const configs = await this.prisma.paymentGatewayConfig.findMany({
            select: {
                id: true,
                gateway: true,
                isActive: true,
                isTest: true,
                createdAt: true,
                updatedAt: true,
                // Não retornar credenciais
            },
        });

        return configs;
    }
}
