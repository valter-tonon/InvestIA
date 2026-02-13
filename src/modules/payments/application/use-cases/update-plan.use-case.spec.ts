import { Test, TestingModule } from '@nestjs/testing';
import { UpdatePlanUseCase } from './update-plan.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { PlanInterval } from '@prisma/client';

describe('UpdatePlanUseCase', () => {
    let useCase: UpdatePlanUseCase;
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
                UpdatePlanUseCase,
                {
                    provide: PrismaService,
                    useValue: {
                        plan: {
                            findUnique: jest.fn(),
                            update: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        useCase = module.get<UpdatePlanUseCase>(UpdatePlanUseCase);
        prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should update plan successfully', async () => {
            prismaService.plan.findUnique.mockResolvedValue(mockPlan as any);
            const updatedPlan = { ...mockPlan, displayName: 'Pro Plus', price: 39.90 };
            prismaService.plan.update.mockResolvedValue(updatedPlan as any);

            const result = await useCase.execute({
                planId: 'plan-id',
                displayName: 'Pro Plus',
                price: 39.90,
            });

            expect(result.displayName).toBe('Pro Plus');
            expect(result.price).toBe(39.90);
            expect(prismaService.plan.update).toHaveBeenCalledWith({
                where: { id: 'plan-id' },
                data: {
                    displayName: 'Pro Plus',
                    price: 39.90,
                },
            });
        });

        it('should throw NotFoundException if plan does not exist', async () => {
            prismaService.plan.findUnique.mockResolvedValue(null);

            await expect(
                useCase.execute({
                    planId: 'non-existent-id',
                    displayName: 'Updated Name',
                }),
            ).rejects.toThrow(NotFoundException);
            expect(prismaService.plan.update).not.toHaveBeenCalled();
        });

        it('should update only provided fields', async () => {
            prismaService.plan.findUnique.mockResolvedValue(mockPlan as any);
            const updatedPlan = { ...mockPlan, features: { api_calls: 20000 } };
            prismaService.plan.update.mockResolvedValue(updatedPlan as any);

            await useCase.execute({
                planId: 'plan-id',
                features: { api_calls: 20000 },
            });

            expect(prismaService.plan.update).toHaveBeenCalledWith({
                where: { id: 'plan-id' },
                data: {
                    features: { api_calls: 20000 },
                },
            });
        });

        it('should allow setting description to empty string', async () => {
            prismaService.plan.findUnique.mockResolvedValue(mockPlan as any);
            const updatedPlan = { ...mockPlan, description: '' };
            prismaService.plan.update.mockResolvedValue(updatedPlan as any);

            await useCase.execute({
                planId: 'plan-id',
                description: '',
            });

            expect(prismaService.plan.update).toHaveBeenCalledWith({
                where: { id: 'plan-id' },
                data: {
                    description: '',
                },
            });
        });

        it('should toggle plan active status', async () => {
            prismaService.plan.findUnique.mockResolvedValue(mockPlan as any);
            const updatedPlan = { ...mockPlan, active: false };
            prismaService.plan.update.mockResolvedValue(updatedPlan as any);

            await useCase.execute({
                planId: 'plan-id',
                active: false,
            });

            expect(prismaService.plan.update).toHaveBeenCalledWith({
                where: { id: 'plan-id' },
                data: {
                    active: false,
                },
            });
        });
    });
});
