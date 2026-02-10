import {
    Controller,
    Get,
    Patch,
    Param,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { ListSubscriptionsUseCase } from '../../application/use-cases/list-subscriptions.use-case';
import { UpdateSubscriptionUseCase } from '../../application/use-cases/update-subscription.use-case';
import { ListSubscriptionsInput } from '../../application/dtos/list-subscriptions.input';
import { UpdateSubscriptionInput } from '../../application/dtos/update-subscription.input';

@Controller('admin/subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class AdminSubscriptionsController {
    constructor(
        private readonly listSubscriptions: ListSubscriptionsUseCase,
        private readonly updateSubscription: UpdateSubscriptionUseCase,
    ) { }

    @Get()
    async list(@Query() query: ListSubscriptionsInput) {
        return this.listSubscriptions.execute(query);
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() body: UpdateSubscriptionInput,
    ) {
        return this.updateSubscription.execute(id, body);
    }
}
