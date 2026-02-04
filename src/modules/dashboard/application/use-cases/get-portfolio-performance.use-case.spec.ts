import { Test, TestingModule } from '@nestjs/testing';
import { GetPortfolioPerformanceUseCase } from './get-portfolio-performance.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

describe('GetPortfolioPerformanceUseCase', () => {
    let useCase: GetPortfolioPerformanceUseCase;
    let prismaService: jest.Mocked<PrismaService>;

    beforeEach(async () => {
        const mockPrismaService = {};

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetPortfolioPerformanceUseCase,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        useCase = module.get<GetPortfolioPerformanceUseCase>(GetPortfolioPerformanceUseCase);
        prismaService = module.get(PrismaService);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    it('should return 30 data points for default period', async () => {
        const result = await useCase.execute('user-123');
        expect(result).toHaveLength(30);
    });

    it('should return 7 data points for 7d period', async () => {
        const result = await useCase.execute('user-123', '7d');
        expect(result).toHaveLength(7);
    });

    it('should return 365 data points for 1y period', async () => {
        const result = await useCase.execute('user-123', '1y');
        expect(result).toHaveLength(365);
    });
});
