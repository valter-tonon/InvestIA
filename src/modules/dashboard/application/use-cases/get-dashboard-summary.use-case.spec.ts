import { Test, TestingModule } from '@nestjs/testing';
import { GetDashboardSummaryUseCase } from './get-dashboard-summary.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

describe('GetDashboardSummaryUseCase', () => {
    let useCase: GetDashboardSummaryUseCase;
    let prismaService: jest.Mocked<PrismaService>;

    beforeEach(async () => {
        const mockPrismaService = {
            asset: {
                count: jest.fn(),
                findMany: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetDashboardSummaryUseCase,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        useCase = module.get<GetDashboardSummaryUseCase>(GetDashboardSummaryUseCase);
        prismaService = module.get(PrismaService);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    it('should return dashboard summary correctly', async () => {
        // Arrange
        const userId = 'user-123';
        const assets = [
            { currentPrice: 100, ticker: 'AAA' },
            { currentPrice: 50, ticker: 'BBB' },
        ];
        prismaService.asset.count.mockResolvedValue(2);
        prismaService.asset.findMany.mockResolvedValueOnce(assets as any); // for totalValue
        prismaService.asset.findMany.mockResolvedValueOnce(assets as any); // for topAssets

        // Act
        const result = await useCase.execute(userId);

        // Assert
        expect(prismaService.asset.count).toHaveBeenCalled();
        expect(result.totalAssets).toBe(2);
        expect(result.totalValue).toBe(150);
        expect(result.topGainer?.ticker).toBe('AAA');
    });

    it('should handle empty asset list', async () => {
        // Arrange
        const userId = 'user-123';
        prismaService.asset.count.mockResolvedValue(0);
        prismaService.asset.findMany.mockResolvedValue([]);

        // Act
        const result = await useCase.execute(userId);

        // Assert
        expect(result.totalAssets).toBe(0);
        expect(result.totalValue).toBe(0);
        expect(result.topGainer).toBeUndefined();
    });
});
