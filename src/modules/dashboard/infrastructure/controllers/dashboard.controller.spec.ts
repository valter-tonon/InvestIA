import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { GetDashboardSummaryUseCase } from '../../application/use-cases/get-dashboard-summary.use-case';
import { GetPortfolioPerformanceUseCase } from '../../application/use-cases/get-portfolio-performance.use-case';
import { GetSectorDistributionUseCase } from '../../application/use-cases/get-sector-distribution.use-case';
import { GetTopAssetsUseCase } from '../../application/use-cases/get-top-assets.use-case';
import { ListAlertsUseCase } from '../../../alerts/application/use-cases/list-alerts.use-case';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';

describe('DashboardController', () => {
    let controller: DashboardController;
    let getDashboardSummary: jest.Mocked<GetDashboardSummaryUseCase>;
    let getPortfolioPerformance: jest.Mocked<GetPortfolioPerformanceUseCase>;
    let getSectorDistribution: jest.Mocked<GetSectorDistributionUseCase>;
    let getTopAssetsUseCase: jest.Mocked<GetTopAssetsUseCase>;
    let listAlertsUseCase: jest.Mocked<ListAlertsUseCase>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [DashboardController],
            providers: [
                { provide: GetDashboardSummaryUseCase, useValue: { execute: jest.fn() } },
                { provide: GetPortfolioPerformanceUseCase, useValue: { execute: jest.fn() } },
                { provide: GetSectorDistributionUseCase, useValue: { execute: jest.fn() } },
                { provide: GetTopAssetsUseCase, useValue: { execute: jest.fn() } },
                { provide: ListAlertsUseCase, useValue: { execute: jest.fn() } },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();

        controller = module.get<DashboardController>(DashboardController);
        getDashboardSummary = module.get(GetDashboardSummaryUseCase);
        getPortfolioPerformance = module.get(GetPortfolioPerformanceUseCase);
        getSectorDistribution = module.get(GetSectorDistributionUseCase);
        getTopAssetsUseCase = module.get(GetTopAssetsUseCase);
        listAlertsUseCase = module.get(ListAlertsUseCase);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    const mockRequest = { user: { id: 'user-123' } };

    describe('getSummary', () => {
        it('should call GetDashboardSummaryUseCase', async () => {
            const output = { totalAssets: 10 };
            getDashboardSummary.execute.mockResolvedValue(output as any);

            const result = await controller.getSummary(mockRequest);

            expect(getDashboardSummary.execute).toHaveBeenCalledWith('user-123');
            expect(result).toEqual(output);
        });
    });

    describe('getPerformance', () => {
        it('should call GetPortfolioPerformanceUseCase', async () => {
            const output = [{ date: '2023-01-01', value: 100 }];
            getPortfolioPerformance.execute.mockResolvedValue(output as any);

            const result = await controller.getPerformance(mockRequest, '30d');

            expect(getPortfolioPerformance.execute).toHaveBeenCalledWith('user-123', '30d');
            expect(result).toEqual({ data: output });
        });
    });

    describe('getSectors', () => {
        it('should call GetSectorDistributionUseCase', async () => {
            const output = [{ sector: 'Tech', percentage: 50 }];
            getSectorDistribution.execute.mockResolvedValue(output as any);

            const result = await controller.getSectors(mockRequest);

            expect(getSectorDistribution.execute).toHaveBeenCalledWith('user-123');
            expect(result).toEqual({ data: output });
        });
    });

    describe('getTopAssets', () => {
        it('should call GetTopAssetsUseCase', async () => {
            const output = [{ ticker: 'AAPL', value: 100 }];
            getTopAssetsUseCase.execute.mockResolvedValue(output as any);

            const result = await controller.getTopAssets(mockRequest, '10');

            expect(getTopAssetsUseCase.execute).toHaveBeenCalledWith('user-123', 10);
            expect(result).toEqual({ data: output });
        });

        it('should use default limit', async () => {
            await controller.getTopAssets(mockRequest, undefined);
            expect(getTopAssetsUseCase.execute).toHaveBeenCalledWith('user-123', 5);
        });
    });

    describe('getAlerts', () => {
        it('should call ListAlertsUseCase', async () => {
            const output = [{ id: '1', ticker: 'ABC' }];
            listAlertsUseCase.execute.mockResolvedValue(output as any);

            const result = await controller.getAlerts(mockRequest, '5');

            expect(listAlertsUseCase.execute).toHaveBeenCalledWith('user-123', 5);
            expect(result).toEqual({ data: output });
        });
    });
});
