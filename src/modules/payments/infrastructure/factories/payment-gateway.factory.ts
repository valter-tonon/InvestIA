import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { IPaymentGateway } from '../../domain/interfaces/payment-gateway.interface';
import { StripeGatewayAdapter } from '../adapters/stripe-gateway.adapter';
import { ExternalApiLoggerService } from '../../../../infrastructure/services/external-api-logger.service';
import { EncryptionService } from '../../../../infrastructure/services/encryption.service';
import { PaymentGateway } from '@prisma/client';

@Injectable()
export class PaymentGatewayFactory {
    constructor(
        private readonly prisma: PrismaService,
        private readonly apiLogger: ExternalApiLoggerService,
        private readonly encryption: EncryptionService,
    ) { }

    /**
     * Create a gateway instance based on gateway type
     */
    async create(gateway: PaymentGateway): Promise<IPaymentGateway> {
        const config = await this.prisma.paymentGatewayConfig.findUnique({
            where: { gateway },
        });

        if (!config) {
            throw new Error(`Gateway ${gateway} not configured`);
        }

        if (!config.isActive) {
            throw new Error(`Gateway ${gateway} is not active`);
        }

        // Decrypt credentials
        const apiKey = this.encryption.decrypt(config.apiKey);
        const secretKey = this.encryption.decrypt(config.secretKey);
        const webhookKey = config.webhookKey
            ? this.encryption.decrypt(config.webhookKey)
            : '';

        switch (gateway) {
            case PaymentGateway.STRIPE:
                return new StripeGatewayAdapter(this.apiLogger, {
                    apiKey: secretKey,
                    webhookSecret: webhookKey,
                });

            case PaymentGateway.PAGARME:
                // return new PagarmeGatewayAdapter(this.apiLogger, { ... });
                throw new Error('Pagar.me gateway not implemented yet');

            case PaymentGateway.MERCADOPAGO:
                // return new MercadoPagoGatewayAdapter(this.apiLogger, { ... });
                throw new Error('Mercado Pago gateway not implemented yet');

            default:
                throw new Error(`Unknown gateway: ${gateway}`);
        }
    }

    /**
     * Get the currently active payment gateway
     */
    async getActive(): Promise<IPaymentGateway> {
        const activeConfig = await this.prisma.paymentGatewayConfig.findFirst({
            where: { isActive: true },
        });

        if (!activeConfig) {
            throw new Error('No active payment gateway configured');
        }

        return this.create(activeConfig.gateway);
    }

    /**
     * Get active gateway type
     */
    async getActiveGatewayType(): Promise<PaymentGateway> {
        const activeConfig = await this.prisma.paymentGatewayConfig.findFirst({
            where: { isActive: true },
            select: { gateway: true },
        });

        if (!activeConfig) {
            throw new Error('No active payment gateway configured');
        }

        return activeConfig.gateway;
    }
}
