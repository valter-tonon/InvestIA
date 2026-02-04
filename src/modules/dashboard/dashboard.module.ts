import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../infrastructure/database/database.module';
import { DashboardController } from './infrastructure/controllers/dashboard.controller';
import { GetDashboardSummaryUseCase } from './application/use-cases/get-dashboard-summary.use-case';
import { GetPortfolioPerformanceUseCase } from './application/use-cases/get-portfolio-performance.use-case';
import { GetSectorDistributionUseCase } from './application/use-cases/get-sector-distribution.use-case';
import { GetTopAssetsUseCase } from './application/use-cases/get-top-assets.use-case';
import { AlertsModule } from '../alerts/alerts.module';

@Module({
    imports: [DatabaseModule, AlertsModule],
    controllers: [DashboardController],
    providers: [
        GetDashboardSummaryUseCase,
        GetPortfolioPerformanceUseCase,
        GetSectorDistributionUseCase,
        GetTopAssetsUseCase,
    ],
})
export class DashboardModule { }
