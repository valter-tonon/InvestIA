import {
    Controller,
    Get,
    Post,
    Patch,
    Body,
    Param,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { UpdateGatewayConfigUseCase } from '../../application/use-cases/update-gateway-config.use-case';
import { TestGatewayConnectionUseCase } from '../../application/use-cases/test-gateway-connection.use-case';
import { ToggleGatewayUseCase } from '../../application/use-cases/toggle-gateway.use-case';
import { GetGatewayConfigsUseCase } from '../../application/use-cases/get-gateway-configs.use-case';
import { PaymentGateway } from '@prisma/client';

@Controller('admin/gateway-config')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class AdminGatewayConfigController {
    constructor(
        private readonly updateConfig: UpdateGatewayConfigUseCase,
        private readonly testConnection: TestGatewayConnectionUseCase,
        private readonly toggleGateway: ToggleGatewayUseCase,
        private readonly getConfigs: GetGatewayConfigsUseCase,
    ) { }

    /**
     * Listar todas configurações de gateway
     */
    @Get()
    async list() {
        return this.getConfigs.execute();
    }

    /**
     * Atualizar configuração do Stripe
     */
    @Post('stripe')
    async updateStripe(@Body() body: {
        publishableKey: string;
        secretKey: string;
        webhookSecret?: string;
        isTest: boolean;
    }) {
        return this.updateConfig.execute({
            gateway: PaymentGateway.STRIPE,
            apiKey: body.publishableKey,
            secretKey: body.secretKey,
            webhookKey: body.webhookSecret,
            isTest: body.isTest,
        });
    }

    /**
     * Testar conexão com gateway
     */
    @Post(':gateway/test')
    async test(@Param('gateway') gateway: PaymentGateway) {
        return this.testConnection.execute({ gateway });
    }

    /**
     * Ativar/desativar gateway
     */
    @Patch(':gateway/toggle')
    async toggle(
        @Param('gateway') gateway: PaymentGateway,
        @Body() body: { isActive: boolean },
    ) {
        return this.toggleGateway.execute({
            gateway,
            isActive: body.isActive,
        });
    }
}
