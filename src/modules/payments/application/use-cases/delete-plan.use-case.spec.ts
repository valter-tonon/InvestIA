import { Test, TestingModule } from '@nestjs/testing';
import { DeletePlanUseCase } from './delete-plan.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PlanInterval } from '@prisma/client';

describe('DeletePlanUseCase', () => {
    let useCase: DeletePlanUseCase;
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
        _count: {
            subscriptions: 0,
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeletePlanUseCase,
                {
                    provide: PrismaService,
                    useValue: {
                        plan: {
                            findUnique: jest.fn(),
                            update: jest.fn(),
                            delete: jest.fn(),
                        },
                        subscription: {
                            count: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        useCase = module.get<DeletePlanUseCase>(DeletePlanUseCase);
        prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should hard delete plan with no subscriptions', async () => {
            prismaService.plan.findUnique.mockResolvedValue(mockPlan as any);
            prismaService.subscription.count.mockResolvedValue(0);
            prismaService.plan.delete.mockResolvedValue(mockPlan as any);

            const result = await useCase.execute({
                planId: 'plan-id',
            });

            expect(result.deleted).toBe(true);
            expect(result.deactivated).toBe(false);
            expect(prismaService.plan.delete).toHaveBeenCalledWith({
                where: { id: 'plan-id' },
            });
        });

        it('should throw NotFoundException if plan does not exist', async () => {
            prismaService.plan.findUnique.mockResolvedValue(null);

            await expect(
                useCase.execute({
                    planId: 'non-existent-id',
                }),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException if plan has active subscriptions without force', async () => {
            prismaService.plan.findUnique.mockResolvedValue({
                ...mockPlan,
                _count: { subscriptions: 5 },
            } as any);
            prismaService.subscription.count.mockResolvedValue(3);

            await expect(
                useCase.execute({
                    planId: 'plan-id',
                }),
            ).rejects.toThrow(BadRequestException);
            expect(prismaService.plan.delete).not.toHaveBeenCalled();
        });

        it('should soft delete (deactivate) plan with subscriptions when force=true', async () => {
            const planWithSubs = {
                ...mockPlan,
                _count: { subscriptions: 5 },
            };
            prismaService.plan.findUnique.mockResolvedValue(planWithSubs as any);
            prismaService.subscription.count.mockResolvedValue(3);
            prismaService.plan.update.mockResolvedValue({
                ...planWithSubs,
                active: false,
            } as any);

            const result = await useCase.execute({
                planId: 'plan-id',
                force: true,
            });

            expect(result.deleted).toBe(false);
            expect(result.deactivated).toBe(true);
            expect(result.plan.active).toBe(false);
            expect(prismaService.plan.update).toHaveBeenCalledWith({
                where: { id: 'plan-id' },
                data: { active: false },
            });
            expect(prismaService.plan.delete).not.toHaveBeenCalled();
        });

        it('should soft delete plan with inactive subscriptions when force=true', async () => {
            const planWithInactiveSubs = {
                ...mockPlan,
                _count: { subscriptions: 2 },
            };
            prismaService.plan.findUnique.mockResolvedValue(planWithInactiveSubs as any);
            prismaService.subscription.count.mockResolvedValue(0); // No active subscriptions
            prismaService.plan.update.mockResolvedValue({
                ...planWithInactiveSubs,
                active: false,
            } as any);

            const result = await useCase.execute({
                planId: 'plan-id',
                force: true,
            });

            expect(result.deleted).toBe(false);
            expect(result.deactivated).toBe(true);
            expect(prismaService.plan.delete).not.toHaveBeenCalled();
        });
    });
});
