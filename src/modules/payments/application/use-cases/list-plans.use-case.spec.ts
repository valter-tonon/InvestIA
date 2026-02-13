import { Test, TestingModule } from '@nestjs/testing';
import { ListPlansUseCase } from './list-plans.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PlanInterval } from '@prisma/client';

describe('ListPlansUseCase', () => {
    let useCase: ListPlansUseCase;
    let prismaService: jest.Mocked<PrismaService>;

    const mockPlans = [
        {
            id: 'plan-1',
            name: 'basic',
            displayName: 'Basic',
            description: 'Basic plan',
            price: 9.90,
            interval: PlanInterval.MONTHLY,
            features: { api_calls: 1000 },
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'plan-2',
            name: 'pro',
            displayName: 'Pro',
            description: 'Professional plan',
            price: 29.90,
            interval: PlanInterval.MONTHLY,
            features: { api_calls: 10000 },
            active: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: 'plan-3',
            name: 'enterprise',
            displayName: 'Enterprise',
            description: 'Enterprise plan',
            price: 99.90,
            interval: PlanInterval.MONTHLY,
            features: { api_calls: 100000 },
            active: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ListPlansUseCase,
                {
                    provide: PrismaService,
                    useValue: {
                        plan: {
                            findMany: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        useCase = module.get<ListPlansUseCase>(ListPlansUseCase);
        prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should list all plans', async () => {
            prismaService.plan.findMany.mockResolvedValue(mockPlans as any);

            const result = await useCase.execute({});

            expect(result).toEqual(mockPlans);
            expect(prismaService.plan.findMany).toHaveBeenCalledWith({
                where: undefined,
                include: undefined,
                orderBy: [
                    { active: 'desc' },
                    { price: 'asc' },
                ],
            });
        });

        it('should list only active plans when activeOnly=true', async () => {
            const activePlans = mockPlans.filter(p => p.active);
            prismaService.plan.findMany.mockResolvedValue(activePlans as any);

            const result = await useCase.execute({ activeOnly: true });

            expect(result.length).toBe(2);
            expect(result.every(p => p.active)).toBe(true);
            expect(prismaService.plan.findMany).toHaveBeenCalledWith({
                where: { active: true },
                include: undefined,
                orderBy: [
                    { active: 'desc' },
                    { price: 'asc' },
                ],
            });
        });

        it('should include subscription count when requested', async () => {
            const plansWithCount = mockPlans.map(p => ({
                ...p,
                _count: { subscriptions: 5 },
            }));
            prismaService.plan.findMany.mockResolvedValue(plansWithCount as any);

            const result = await useCase.execute({ includeSubscriptionCount: true });

            expect(result[0]._count).toBeDefined();
            expect(prismaService.plan.findMany).toHaveBeenCalledWith({
                where: undefined,
                include: {
                    _count: {
                        select: { subscriptions: true },
                    },
                },
                orderBy: [
                    { active: 'desc' },
                    { price: 'asc' },
                ],
            });
        });

        it('should combine activeOnly and includeSubscriptionCount', async () => {
            const activePlansWithCount = mockPlans
                .filter(p => p.active)
                .map(p => ({
                    ...p,
                    _count: { subscriptions: 3 },
                }));
            prismaService.plan.findMany.mockResolvedValue(activePlansWithCount as any);

            const result = await useCase.execute({
                activeOnly: true,
                includeSubscriptionCount: true,
            });

            expect(result.length).toBe(2);
            expect(result[0]._count).toBeDefined();
            expect(prismaService.plan.findMany).toHaveBeenCalledWith({
                where: { active: true },
                include: {
                    _count: {
                        select: { subscriptions: true },
                    },
                },
                orderBy: [
                    { active: 'desc' },
                    { price: 'asc' },
                ],
            });
        });

        it('should return empty array when no plans exist', async () => {
            prismaService.plan.findMany.mockResolvedValue([]);

            const result = await useCase.execute({});

            expect(result).toEqual([]);
        });
    });
});
