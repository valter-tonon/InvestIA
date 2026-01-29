import { Test, TestingModule } from '@nestjs/testing';
import { ListUsersUseCase } from './list-users.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

describe('ListUsersUseCase', () => {
    let useCase: ListUsersUseCase;
    let prismaService: jest.Mocked<PrismaService>;

    beforeEach(async () => {
        const mockPrismaService = {
            user: {
                findMany: jest.fn(),
                count: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ListUsersUseCase,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        useCase = module.get<ListUsersUseCase>(ListUsersUseCase);
        prismaService = module.get(PrismaService);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should return paginated users with default options', async () => {
            // Arrange
            const users = [
                {
                    id: 'uuid-1',
                    email: 'user1@example.com',
                    name: 'User 1',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: 'uuid-2',
                    email: 'user2@example.com',
                    name: 'User 2',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            prismaService.user.findMany.mockResolvedValue(users);
            prismaService.user.count.mockResolvedValue(2);

            // Act
            const result = await useCase.execute();

            // Assert
            expect(result.data).toHaveLength(2);
            expect(result.meta.total).toBe(2);
            expect(result.meta.page).toBe(1);
            expect(result.meta.perPage).toBe(20);
            expect(prismaService.user.findMany).toHaveBeenCalledWith({
                skip: 0,
                take: 20,
                orderBy: { createdAt: 'desc' },
            });
        });

        it('should return empty list when no users exist', async () => {
            // Arrange
            prismaService.user.findMany.mockResolvedValue([]);
            prismaService.user.count.mockResolvedValue(0);

            // Act
            const result = await useCase.execute();

            // Assert
            expect(result.data).toHaveLength(0);
            expect(result.meta.total).toBe(0);
            expect(result.meta.lastPage).toBe(0);
        });

        it('should respect custom pagination options', async () => {
            // Arrange
            prismaService.user.findMany.mockResolvedValue([]);
            prismaService.user.count.mockResolvedValue(50);

            // Act
            const result = await useCase.execute({ page: 2, perPage: 10 });

            // Assert
            expect(result.meta.page).toBe(2);
            expect(result.meta.perPage).toBe(10);
            expect(result.meta.lastPage).toBe(5);
            expect(prismaService.user.findMany).toHaveBeenCalledWith({
                skip: 10,
                take: 10,
                orderBy: { createdAt: 'desc' },
            });
        });

        it('should limit perPage to maximum of 100', async () => {
            // Arrange
            prismaService.user.findMany.mockResolvedValue([]);
            prismaService.user.count.mockResolvedValue(0);

            // Act
            await useCase.execute({ perPage: 200 });

            // Assert
            expect(prismaService.user.findMany).toHaveBeenCalledWith({
                skip: 0,
                take: 100,
                orderBy: { createdAt: 'desc' },
            });
        });
    });
});
