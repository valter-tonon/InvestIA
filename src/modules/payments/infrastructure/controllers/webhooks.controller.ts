import {
    Controller,
    Post,
    Headers,
    Req,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import type { Request, RawBodyRequest } from '@nestjs/common';
import { PaymentGatewayFactory } from '../factories/payment-gateway.factory';
import { HandleWebhookUseCase } from '../../application/use-cases/handle-webhook.use-case';

@Controller('webhooks')
export class WebhooksController {
    private readonly logger = new Logger(WebhooksController.name);

    constructor(
        private readonly gatewayFactory: PaymentGatewayFactory,
        private readonly handleWebhook: HandleWebhookUseCase,
    ) { }

    /**
     * Webhook endpoint for Stripe
     * 
     * IMPORTANT: This endpoint needs raw body, not JSON parsed
     * Configure in main.ts with rawBody middleware
     */
    @Post('stripe')
    async stripeWebhook(
        @Req() req: RawBodyRequest<Request>,
        @Headers('stripe-signature') signature: string,
    ) {
        if (!signature) {
            throw new BadRequestException('Missing stripe-signature header');
        }

        // Get raw body as string
        const rawBody = req.rawBody?.toString('utf8') || '';

        if (!rawBody) {
            throw new BadRequestException('Missing request body');
        }

        try {
            // Get Stripe gateway to verify signature
            const gateway = await this.gatewayFactory.create('STRIPE');

            // Verify webhook signature
            const isValid = gateway.verifyWebhookSignature(rawBody, signature);

            if (!isValid) {
                this.logger.warn('Invalid webhook signature');
                throw new BadRequestException('Invalid signature');
            }

            // Parse event
            const event = gateway.parseWebhookEvent(rawBody);

            // Process webhook
            await this.handleWebhook.execute({
                event,
                rawPayload: rawBody,
            });

            return { received: true };
        } catch (error) {
            this.logger.error(`Webhook error: ${error.message}`, error.stack);
            throw error;
        }
    }
}
