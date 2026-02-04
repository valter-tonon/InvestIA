import { Controller, Get, Query, UseGuards, Request, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { GetDashboardSummaryUseCase } from '../../application/use-cases/get-dashboard-summary.use-case';
import { GetPortfolioPerformanceUseCase } from '../../application/use-cases/get-portfolio-performance.use-case';
import { GetSectorDistributionUseCase } from '../../application/use-cases/get-sector-distribution.use-case';
import { GetTopAssetsUseCase } from '../../application/use-cases/get-top-assets.use-case';
import { ListAlertsUseCase } from '../../../alerts/application/use-cases/list-alerts.use-case';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
    private readonly logger = new Logger(DashboardController.name);

    constructor(
        private readonly getDashboardSummary: GetDashboardSummaryUseCase,
        private readonly getPortfolioPerformance: GetPortfolioPerformanceUseCase,
        private readonly getSectorDistribution: GetSectorDistributionUseCase,
        private readonly getTopAssetsUseCase: GetTopAssetsUseCase,
        private readonly listAlertsUseCase: ListAlertsUseCase,
    ) { }

    @Get('summary')
    @ApiOperation({ summary: 'Get dashboard summary with key metrics' })
    async getSummary(@Request() req) {
        const userId = req.user.id;
        return this.getDashboardSummary.execute(userId);
    }

    @Get('performance')
    @ApiOperation({ summary: 'Get portfolio performance over time' })
    @ApiQuery({ name: 'period', required: false, enum: ['7d', '30d', '90d', '1y', 'all'] })
    async getPerformance(@Request() req, @Query('period') period?: string) {
        const userId = req.user.id;
        return {
            data: await this.getPortfolioPerformance.execute(userId, period),
        };
    }

    @Get('sectors')
    @ApiOperation({ summary: 'Get asset distribution by sector' })
    async getSectors(@Request() req) {
        const userId = req.user.id;
        return {
            data: await this.getSectorDistribution.execute(userId),
        };
    }

    @Get('top-assets')
    @ApiOperation({ summary: 'Get top performing assets' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getTopAssets(@Request() req, @Query('limit') limit?: string) {
        const userId = req.user.id;
        const limitNum = limit ? parseInt(limit, 10) : 5;
        return {
            data: await this.getTopAssetsUseCase.execute(userId, limitNum),
        };
    }

    @Get('alerts')
    @ApiOperation({ summary: 'Get recent price alerts' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    async getAlerts(@Request() req, @Query('limit') limit?: string) {
        const userId = req.user.id;
        const limitNum = limit ? parseInt(limit, 10) : 5;
        return {
            data: await this.listAlertsUseCase.execute(userId, limitNum),
        };
    }
}
