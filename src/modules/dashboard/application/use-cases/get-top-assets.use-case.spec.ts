import { Test, TestingModule } from '@nestjs/testing';
import { GetTopAssetsUseCase } from './get-top-assets.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

describe('GetTopAssetsUseCase', () => {
    let useCase: GetTopAssetsUseCase;
    let prismaService: jest.Mocked<PrismaService>;

    beforeEach(async () => {
        const mockPrismaService = {
            asset: {
                findMany: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetTopAssetsUseCase,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        useCase = module.get<GetTopAssetsUseCase>(GetTopAssetsUseCase);
        prismaService = module.get(PrismaService);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    it('should return top assets with percentages', async () => {
        // Arrange
        const assets = [
            { ticker: 'A', name: 'Asset A', currentPrice: 100 },
            { ticker: 'B', name: 'Asset B', currentPrice: 100 },
        ]; // Total 200, 50% each
        prismaService.asset.findMany.mockResolvedValue(assets as any);

        // Act
        const result = await useCase.execute('user-123', 5);

        // Assert
        expect(prismaService.asset.findMany).toHaveBeenCalledWith(expect.objectContaining({
            take: 5,
            orderBy: { currentPrice: 'desc' }
        }));
        expect(result).toHaveLength(2);
        expect(result[0].percentage).toBe(50);
        expect(result[1].percentage).toBe(50);
    });
});
