import { Test, TestingModule } from '@nestjs/testing';
import { CreatePlanUseCase } from './create-plan.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { BadRequestException } from '@nestjs/common';
import { PlanInterval } from '@prisma/client';

describe('CreatePlanUseCase', () => {
    let useCase: CreatePlanUseCase;
    let prismaService: jest.Mocked<PrismaService>;

    const mockPlan = {
        id: 'plan-id',
        name: 'pro',
        displayName: 'Plano Pro',
        description: 'Plano profissional',
        price: 29.90,
        interval: PlanInterval.MONTHLY,
        features: { api_calls: 10000 },
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreatePlanUseCase,
                {
                    provide: PrismaService,
                    useValue: {
                        plan: {
                            findUnique: jest.fn(),
                            findFirst: jest.fn(),
                            create: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        useCase = module.get<CreatePlanUseCase>(CreatePlanUseCase);
        prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should create plan successfully', async () => {
            prismaService.plan.findUnique.mockResolvedValue(null);
            prismaService.plan.findFirst.mockResolvedValue(null);
            prismaService.plan.create.mockResolvedValue(mockPlan as any);

            const result = await useCase.execute({
                name: 'pro',
                displayName: 'Plano Pro',
                description: 'Plano profissional',
                price: 29.90,
                interval: PlanInterval.MONTHLY,
                features: { api_calls: 10000 },
            });

            expect(result).toEqual(mockPlan);
            expect(prismaService.plan.create).toHaveBeenCalledWith({
                data: {
                    name: 'pro',
                    displayName: 'Plano Pro',
                    description: 'Plano profissional',
                    price: 29.90,
                    interval: PlanInterval.MONTHLY,
                    features: { api_calls: 10000 },
                    active: true,
                },
            });
        });

        it('should throw error if plan name already exists', async () => {
            prismaService.plan.findUnique.mockResolvedValue(mockPlan as any);

            await expect(
                useCase.execute({
                    name: 'pro',
                    displayName: 'Plano Pro',
                    price: 29.90,
                    interval: PlanInterval.MONTHLY,
                }),
            ).rejects.toThrow(BadRequestException);
            expect(prismaService.plan.create).not.toHaveBeenCalled();
        });

        it('should create plan with minimal fields', async () => {
            prismaService.plan.findUnique.mockResolvedValue(null);
            prismaService.plan.create.mockResolvedValue({
                ...mockPlan,
                name: 'enterprise',
                displayName: 'Enterprise',
                price: 99.90,
                description: '',
                features: {},
            } as any);

            const result = await useCase.execute({
                name: 'enterprise',
                displayName: 'Enterprise',
                price: 99.90,
                interval: PlanInterval.MONTHLY,
            });

            expect(result).toBeDefined();
            expect(prismaService.plan.create).toHaveBeenCalled();
        });

        it('should create plan with default values', async () => {
            prismaService.plan.findUnique.mockResolvedValue(null);
            prismaService.plan.findFirst.mockResolvedValue(null);
            prismaService.plan.create.mockResolvedValue({
                ...mockPlan,
                description: '',
                features: {},
            } as any);

            await useCase.execute({
                name: 'basic',
                displayName: 'Basic',
                price: 9.90,
                interval: PlanInterval.MONTHLY,
            });

            expect(prismaService.plan.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    description: '',
                    features: {},
                    active: true,
                }),
            });
        });
    });
});
