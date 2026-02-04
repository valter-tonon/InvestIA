import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { IngestPhilosophyUseCase } from './ingest-philosophy.use-case';
import { PrismaService } from '../../../../infrastructure/database';

describe('IngestPhilosophyUseCase', () => {
    let useCase: IngestPhilosophyUseCase;
    let prismaService: jest.Mocked<PrismaService>;

    beforeEach(async () => {
        const mockPrismaService = {
            strategyProfile: {
                create: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                IngestPhilosophyUseCase,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        useCase = module.get<IngestPhilosophyUseCase>(IngestPhilosophyUseCase);
        prismaService = module.get(PrismaService);
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should ingest philosophy successfully', async () => {
            // Arrange
            const input = {
                name: 'Test Philosophy',
                description: 'Description',
                rawRules: [
                    { indicator: 'dy', operator: '>', value: 5, weight: 1, type: 'quantitative' as const },
                ],
                userId: 'user-123',
                sourceType: 'TEXT' as const,
            };

            const createdProfile = {
                id: 'profile-123',
                name: input.name,
                rules: input.rawRules,
                // ... other fields
            };

            prismaService.strategyProfile.create.mockResolvedValue(createdProfile as any);

            // Act
            const result = await useCase.execute(input);

            // Assert
            expect(result.id).toBe(createdProfile.id);
            expect(result.name).toBe(input.name);
            expect(result.rulesCount).toBe(1);
            expect(prismaService.strategyProfile.create).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({
                    name: input.name,
                    userId: input.userId,
                }),
            }));
        });

        it('should throw BadRequestException when rules are invalid', async () => {
            // Arrange
            const input = {
                name: 'Invalid Philosophy',
                rawRules: [
                    { indicator: 'dy', operator: '>', value: -1, weight: 1, type: 'quantitative' as const }, // Assuming value check logic or missing fields
                    { indicator: '', operator: '>', value: 5, weight: 1, type: 'quantitative' as const },   // Invalid indicator
                ],
                userId: 'user-123',
            };

            // Act & Assert
            await expect(useCase.execute(input)).rejects.toThrow(BadRequestException);
            expect(prismaService.strategyProfile.create).not.toHaveBeenCalled();
        });
    });
});
