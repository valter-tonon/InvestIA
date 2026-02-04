import { Test, TestingModule } from '@nestjs/testing';
import { ListPhilosophiesUseCase } from './list-philosophies.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

describe('ListPhilosophiesUseCase', () => {
    let useCase: ListPhilosophiesUseCase;
    let prismaService: jest.Mocked<PrismaService>;

    beforeEach(async () => {
        const mockPrismaService = {
            philosophy: {
                findMany: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ListPhilosophiesUseCase,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        useCase = module.get<ListPhilosophiesUseCase>(ListPhilosophiesUseCase);
        prismaService = module.get(PrismaService);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    it('should list philosophies for user', async () => {
        // Arrange
        const userId = 'user-123';
        const philosophies = [
            { id: '1', title: 'P1', createdAt: new Date() },
            { id: '2', title: 'P2', createdAt: new Date() },
        ];
        prismaService.philosophy.findMany.mockResolvedValue(philosophies as any);

        // Act
        const result = await useCase.execute(userId);

        // Assert
        expect(result).toHaveLength(2);
        expect(result[0].id).toBe('1');
        expect(prismaService.philosophy.findMany).toHaveBeenCalledWith({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    });
});
