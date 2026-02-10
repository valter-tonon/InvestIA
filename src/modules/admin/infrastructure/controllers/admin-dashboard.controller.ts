import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { GetAdminDashboardUseCase } from '../../application/use-cases/get-admin-dashboard.use-case';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class AdminDashboardController {
    constructor(
        private readonly getAdminDashboard: GetAdminDashboardUseCase,
    ) { }

    @Get()
    async getDashboard() {
        return this.getAdminDashboard.execute();
    }
}
