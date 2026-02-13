import { Test, TestingModule } from '@nestjs/testing';
import { CreateSubscriptionUseCase } from './create-subscription.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PaymentGatewayFactory } from '../../infrastructure/factories/payment-gateway.factory';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PlanInterval, PaymentGateway } from '@prisma/client';

describe('CreateSubscriptionUseCase', () => {
    let useCase: CreateSubscriptionUseCase;
    let prismaService: jest.Mocked<PrismaService>;
    let gatewayFactory: jest.Mocked<PaymentGatewayFactory>;

    const mockUser = {
        id: 'user-id',
        email: 'user@example.com',
        subscription: null,
    };

    const mockPlan = {
        id: 'plan-id',
        name: 'pro',
        displayName: 'Pro Plan',
        price: 29.90,
        interval: PlanInterval.MONTHLY,
        active: true,
    };

    const mockGateway = {
        createCustomer: jest.fn(),
        createSubscription: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateSubscriptionUseCase,
                {
                    provide: PrismaService,
                    useValue: {
                        user: {
                            findUnique: jest.fn(),
                        },
                        plan: {
                            findUnique: jest.fn(),
                        },
                        transaction: {
                            create: jest.fn(),
                            update: jest.fn(),
                        },
                        subscription: {
                            upsert: jest.fn(),
                        },
                        activityLog: {
                            create: jest.fn(),
                        },
                    },
                },
                {
                    provide: PaymentGatewayFactory,
                    useValue: {
                        getActiveGatewayType: jest.fn().mockResolvedValue(PaymentGateway.STRIPE),
                        getActive: jest.fn(),
                    },
                },
            ],
        }).compile();

        useCase = module.get<CreateSubscriptionUseCase>(CreateSubscriptionUseCase);
        prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
        gatewayFactory = module.get(PaymentGatewayFactory) as jest.Mocked<PaymentGatewayFactory>;
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should create subscription successfully', async () => {
            const mockTransaction = { id: 'tx-id' };
            const mockCustomer = { id: 'cus_123' };
            const mockGatewaySubscription = {
                id: 'sub_123',
                status: 'active',
                currentPeriodEnd: new Date('2024-03-01'),
            };
            const mockSubscription = { id: 'sub-db-id' };

            prismaService.user.findUnique.mockResolvedValue(mockUser as any);
            prismaService.plan.findUnique.mockResolvedValue(mockPlan as any);
            prismaService.transaction.create.mockResolvedValue(mockTransaction as any);
            prismaService.transaction.update.mockResolvedValue({} as any);
            prismaService.subscription.upsert.mockResolvedValue(mockSubscription as any);
            prismaService.activityLog.create.mockResolvedValue({} as any);

            mockGateway.createCustomer.mockResolvedValue(mockCustomer);
            mockGateway.createSubscription.mockResolvedValue(mockGatewaySubscription);
            gatewayFactory.getActive.mockResolvedValue(mockGateway as any);

            const result = await useCase.execute({
                userId: 'user-id',
                planId: 'plan-id',
                paymentMethodId: 'pm_123',
            });

            expect(result.subscriptionId).toBe('sub_123');
            expect(result.status).toBe('active');
            expect(mockGateway.createCustomer).toHaveBeenCalledWith('user-id', 'user@example.com');
            expect(prismaService.subscription.upsert).toHaveBeenCalled();
        });

        it('should throw NotFoundException if user not found', async () => {
            prismaService.user.findUnique.mockResolvedValue(null);
            prismaService.plan.findUnique.mockResolvedValue(mockPlan as any);

            await expect(
                useCase.execute({
                    userId: 'non-existent',
                    planId: 'plan-id',
                    paymentMethodId: 'pm_123',
                }),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException if plan not found', async () => {
            prismaService.user.findUnique.mockResolvedValue(mockUser as any);
            prismaService.plan.findUnique.mockResolvedValue(null);

            await expect(
                useCase.execute({
                    userId: 'user-id',
                    planId: 'non-existent',
                    paymentMethodId: 'pm_123',
                }),
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if plan is inactive', async () => {
            prismaService.user.findUnique.mockResolvedValue(mockUser as any);
            prismaService.plan.findUnique.mockResolvedValue({
                ...mockPlan,
                active: false,
            } as any);

            await expect(
                useCase.execute({
                    userId: 'user-id',
                    planId: 'plan-id',
                    paymentMethodId: 'pm_123',
                }),
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if user already has active subscription', async () => {
            prismaService.user.findUnique.mockResolvedValue({
                ...mockUser,
                subscription: { status: 'ACTIVE' },
            } as any);
            prismaService.plan.findUnique.mockResolvedValue(mockPlan as any);

            await expect(
                useCase.execute({
                    userId: 'user-id',
                    planId: 'plan-id',
                    paymentMethodId: 'pm_123',
                }),
            ).rejects.toThrow(BadRequestException);
        });

        it('should create subscription with trial period', async () => {
            const mockTransaction = { id: 'tx-id' };
            const mockCustomer = { id: 'cus_123' };
            const mockGatewaySubscription = {
                id: 'sub_123',
                status: 'trialing',
                currentPeriodEnd: new Date('2024-03-15'),
            };
            const mockSubscription = { id: 'sub-db-id' };

            prismaService.user.findUnique.mockResolvedValue(mockUser as any);
            prismaService.plan.findUnique.mockResolvedValue(mockPlan as any);
            prismaService.transaction.create.mockResolvedValue(mockTransaction as any);
            prismaService.transaction.update.mockResolvedValue({} as any);
            prismaService.subscription.upsert.mockResolvedValue(mockSubscription as any);
            prismaService.activityLog.create.mockResolvedValue({} as any);

            mockGateway.createCustomer.mockResolvedValue(mockCustomer);
            mockGateway.createSubscription.mockResolvedValue(mockGatewaySubscription);
            gatewayFactory.getActive.mockResolvedValue(mockGateway as any);

            await useCase.execute({
                userId: 'user-id',
                planId: 'plan-id',
                paymentMethodId: 'pm_123',
                trialDays: 14,
            });

            expect(mockGateway.createSubscription).toHaveBeenCalledWith(
                expect.objectContaining({
                    trialDays: 14,
                })
            );
            expect(prismaService.subscription.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    create: expect.objectContaining({ status: 'TRIAL' }),
                })
            );
        });

        it('should mark transaction as FAILED on gateway error', async () => {
            const mockTransaction = { id: 'tx-id' };
            const error = new Error('Gateway error');

            prismaService.user.findUnique.mockResolvedValue(mockUser as any);
            prismaService.plan.findUnique.mockResolvedValue(mockPlan as any);
            prismaService.transaction.create.mockResolvedValue(mockTransaction as any);
            prismaService.transaction.update.mockResolvedValue({} as any);

            mockGateway.createCustomer.mockRejectedValue(error);
            gatewayFactory.getActive.mockResolvedValue(mockGateway as any);

            await expect(
                useCase.execute({
                    userId: 'user-id',
                    planId: 'plan-id',
                    paymentMethodId: 'pm_123',
                }),
            ).rejects.toThrow(error);

            expect(prismaService.transaction.update).toHaveBeenCalledWith({
                where: { id: 'tx-id' },
                data: {
                    status: 'FAILED',
                    errorMessage: error.message,
                },
            });
        });
    });
});
