import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindUserUseCase } from './find-user.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

describe('FindUserUseCase', () => {
    let useCase: FindUserUseCase;
    let prismaService: jest.Mocked<PrismaService>;

    beforeEach(async () => {
        const mockPrismaService = {
            user: {
                findUnique: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FindUserUseCase,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        useCase = module.get<FindUserUseCase>(FindUserUseCase);
        prismaService = module.get(PrismaService);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should return user when found', async () => {
            // Arrange
            const userId = 'uuid-123';
            const user = {
                id: userId,
                email: 'test@example.com',
                name: 'Test User',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            prismaService.user.findUnique.mockResolvedValue(user);

            // Act
            const result = await useCase.execute(userId);

            // Assert
            expect(result.id).toBe(userId);
            expect(result.email).toBe(user.email);
            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: { id: userId },
            });
        });

        it('should throw NotFoundException when user not found', async () => {
            // Arrange
            const userId = 'non-existent-id';
            prismaService.user.findUnique.mockResolvedValue(null);

            // Act & Assert
            await expect(useCase.execute(userId)).rejects.toThrow(NotFoundException);
        });
    });
});
