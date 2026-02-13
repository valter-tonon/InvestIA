import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { EncryptionService } from '../../../../infrastructure/services/encryption.service';
import { PaymentGateway } from '@prisma/client';

export interface UpdateGatewayConfigInput {
    gateway: PaymentGateway;
    apiKey: string;
    secretKey: string;
    webhookKey?: string;
    isTest: boolean;
}

@Injectable()
export class UpdateGatewayConfigUseCase {
    constructor(
        private readonly prisma: PrismaService,
        private readonly encryption: EncryptionService,
    ) { }

    async execute(input: UpdateGatewayConfigInput) {
        // Validar credenciais (básico)
        if (!input.apiKey || !input.secretKey) {
            throw new BadRequestException('API Key and Secret Key are required');
        }

        // Criptografar credenciais
        const encryptedApiKey = this.encryption.encrypt(input.apiKey);
        const encryptedSecretKey = this.encryption.encrypt(input.secretKey);
        const encryptedWebhookKey = input.webhookKey
            ? this.encryption.encrypt(input.webhookKey)
            : null;

        // Upsert configuração
        const config = await this.prisma.paymentGatewayConfig.upsert({
            where: { gateway: input.gateway },
            create: {
                gateway: input.gateway,
                apiKey: encryptedApiKey,
                secretKey: encryptedSecretKey,
                webhookKey: encryptedWebhookKey,
                isActive: false, // Não ativar automaticamente
                isTest: input.isTest,
            },
            update: {
                apiKey: encryptedApiKey,
                secretKey: encryptedSecretKey,
                webhookKey: encryptedWebhookKey,
                isTest: input.isTest,
            },
        });

        return {
            gateway: config.gateway,
            isActive: config.isActive,
            isTest: config.isTest,
            updatedAt: config.updatedAt,
        };
    }
}
