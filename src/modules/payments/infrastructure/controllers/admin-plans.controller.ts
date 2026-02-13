import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { CreatePlanDto, UpdatePlanDto } from '../../application/dtos/plan.dto';
import { CreatePlanUseCase } from '../../application/use-cases/create-plan.use-case';
import { UpdatePlanUseCase } from '../../application/use-cases/update-plan.use-case';
import { DeletePlanUseCase } from '../../application/use-cases/delete-plan.use-case';
import { ListPlansUseCase } from '../../application/use-cases/list-plans.use-case';

@Controller('admin/plans')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class AdminPlansController {
    constructor(
        private readonly createPlan: CreatePlanUseCase,
        private readonly updatePlan: UpdatePlanUseCase,
        private readonly deletePlan: DeletePlanUseCase,
        private readonly listPlans: ListPlansUseCase,
    ) { }

    /**
     * Listar todos os planos
     */
    @Get()
    async list(
        @Query('activeOnly') activeOnly?: string,
        @Query('includeCount') includeCount?: string,
    ) {
        return this.listPlans.execute({
            activeOnly: activeOnly === 'true',
            includeSubscriptionCount: includeCount === 'true',
        });
    }

    /**
     * Criar novo plano
     */
    @Post()
    async create(@Body() dto: CreatePlanDto) {
        return this.createPlan.execute({
            name: dto.name,
            displayName: dto.displayName,
            description: dto.description,
            price: dto.price,
            interval: dto.interval,
            features: dto.features,
            active: dto.active,
        });
    }

    /**
     * Atualizar plano existente
     */
    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdatePlanDto) {
        return this.updatePlan.execute({
            planId: id,
            ...dto,
        });
    }

    /**
     * Deletar plano
     */
    @Delete(':id')
    async delete(
        @Param('id') id: string,
        @Query('force') force?: string,
    ) {
        return this.deletePlan.execute({
            planId: id,
            force: force === 'true',
        });
    }
}
