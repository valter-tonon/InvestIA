import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database';
import { ExternalApiLoggerService } from '../../infrastructure/services/external-api-logger.service';
import { EncryptionService } from '../../infrastructure/services/encryption.service';
import { PaymentGatewayFactory } from './infrastructure/factories/payment-gateway.factory';

// Use Cases - Payments
import { CreatePaymentIntentUseCase } from './application/use-cases/create-payment-intent.use-case';
import { CreateSubscriptionUseCase } from './application/use-cases/create-subscription.use-case';
import { CancelSubscriptionUseCase } from './application/use-cases/cancel-subscription.use-case';
import { HandleWebhookUseCase } from './application/use-cases/handle-webhook.use-case';
import { GetSubscriptionUseCase } from './application/use-cases/get-subscription.use-case';
import { GetTransactionsUseCase } from './application/use-cases/get-transactions.use-case';

// Use Cases - Admin Gateway
import { UpdateGatewayConfigUseCase } from './application/use-cases/update-gateway-config.use-case';
import { TestGatewayConnectionUseCase } from './application/use-cases/test-gateway-connection.use-case';
import { ToggleGatewayUseCase } from './application/use-cases/toggle-gateway.use-case';
import { GetGatewayConfigsUseCase } from './application/use-cases/get-gateway-configs.use-case';

// Use Cases - Admin Plans
import { CreatePlanUseCase } from './application/use-cases/create-plan.use-case';
import { UpdatePlanUseCase } from './application/use-cases/update-plan.use-case';
import { DeletePlanUseCase } from './application/use-cases/delete-plan.use-case';
import { ListPlansUseCase } from './application/use-cases/list-plans.use-case';

// Controllers
import { PaymentsController } from './infrastructure/controllers/payments.controller';
import { WebhooksController } from './infrastructure/controllers/webhooks.controller';
import { AdminGatewayConfigController } from './infrastructure/controllers/admin-gateway-config.controller';
import { AdminPlansController } from './infrastructure/controllers/admin-plans.controller';

@Module({
    imports: [DatabaseModule],
    controllers: [
        PaymentsController,
        WebhooksController,
        AdminGatewayConfigController,
        AdminPlansController,
    ],
    providers: [
        // Services
        ExternalApiLoggerService,
        EncryptionService,
        PaymentGatewayFactory,
        // Payment Use Cases
        CreatePaymentIntentUseCase,
        CreateSubscriptionUseCase,
        CancelSubscriptionUseCase,
        HandleWebhookUseCase,
        GetSubscriptionUseCase,
        GetTransactionsUseCase,
        // Admin Gateway Use Cases
        UpdateGatewayConfigUseCase,
        TestGatewayConnectionUseCase,
        ToggleGatewayUseCase,
        GetGatewayConfigsUseCase,
        // Admin Plans Use Cases
        CreatePlanUseCase,
        UpdatePlanUseCase,
        DeletePlanUseCase,
        ListPlansUseCase,
    ],
    exports: [
        PaymentGatewayFactory,
        ExternalApiLoggerService,
        EncryptionService,
        CreatePaymentIntentUseCase,
        CreateSubscriptionUseCase,
        CancelSubscriptionUseCase,
    ],
})
export class PaymentsModule { }
