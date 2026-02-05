import { Test, TestingModule } from '@nestjs/testing';
import { GetSectorDistributionUseCase } from './get-sector-distribution.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

describe('GetSectorDistributionUseCase', () => {
    let useCase: GetSectorDistributionUseCase;
    let prismaService: jest.Mocked<PrismaService>;

    beforeEach(async () => {
        const mockPrismaService = {
            asset: {
                findMany: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetSectorDistributionUseCase,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        useCase = module.get<GetSectorDistributionUseCase>(GetSectorDistributionUseCase);
        prismaService = module.get(PrismaService);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    it('should calculate sector distribution correctly', async () => {
        // Arrange
        const assets = [
            { sector: 'Technology', currentPrice: 100 },
            { sector: 'Technology', currentPrice: 50 },
            { sector: 'Finance', currentPrice: 50 },
        ]; // Total 200. Tech: 150 (75%), Finance: 50 (25%)
        prismaService.asset.findMany.mockResolvedValue(assets as any);

        // Act
        const result = await useCase.execute('user-123');

        // Assert
        expect(result).toHaveLength(2);

        const tech = result.find(r => r.sector === 'Technology');
        expect(tech).toBeDefined();
        expect(tech?.value).toBe(150);
        expect(tech?.percentage).toBe(75);
        expect(tech?.count).toBe(2);

        const finance = result.find(r => r.sector === 'Finance');
        expect(finance).toBeDefined();
        expect(finance?.value).toBe(50);
        expect(finance?.percentage).toBe(25);
        expect(finance?.count).toBe(1);
    });

    it('should handle empty assets', async () => {
        prismaService.asset.findMany.mockResolvedValue([]);
        const result = await useCase.execute('user-123');
        expect(result).toEqual([]);
    });
});
