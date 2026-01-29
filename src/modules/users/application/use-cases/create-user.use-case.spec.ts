import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreateUserUseCase } from './create-user.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

describe('CreateUserUseCase', () => {
    let useCase: CreateUserUseCase;
    let prismaService: jest.Mocked<PrismaService>;

    beforeEach(async () => {
        const mockPrismaService = {
            user: {
                findUnique: jest.fn(),
                create: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateUserUseCase,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
        prismaService = module.get(PrismaService);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should create user successfully when email is unique', async () => {
            // Arrange
            const input = { email: 'test@example.com', name: 'Test User' };
            const createdUser = {
                id: 'uuid-123',
                email: input.email,
                name: input.name,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            prismaService.user.findUnique.mockResolvedValue(null);
            prismaService.user.create.mockResolvedValue(createdUser);

            // Act
            const result = await useCase.execute(input);

            // Assert
            expect(result.email).toBe(input.email);
            expect(result.name).toBe(input.name);
            expect(prismaService.user.findUnique).toHaveBeenCalledWith({
                where: { email: input.email },
            });
            expect(prismaService.user.create).toHaveBeenCalledWith({
                data: { email: input.email, name: input.name },
            });
        });

        it('should throw ConflictException when email already exists', async () => {
            // Arrange
            const input = { email: 'existing@example.com', name: 'Test' };
            const existingUser = {
                id: 'uuid-456',
                email: input.email,
                name: 'Existing User',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            prismaService.user.findUnique.mockResolvedValue(existingUser);

            // Act & Assert
            await expect(useCase.execute(input)).rejects.toThrow(ConflictException);
            expect(prismaService.user.create).not.toHaveBeenCalled();
        });

        it('should create user without name when name is not provided', async () => {
            // Arrange
            const input = { email: 'noname@example.com' };
            const createdUser = {
                id: 'uuid-789',
                email: input.email,
                name: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            prismaService.user.findUnique.mockResolvedValue(null);
            prismaService.user.create.mockResolvedValue(createdUser);

            // Act
            const result = await useCase.execute(input);

            // Assert
            expect(result.email).toBe(input.email);
            expect(result.name).toBeNull();
        });
    });
});
