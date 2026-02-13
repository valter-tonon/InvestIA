import { Test, TestingModule } from '@nestjs/testing';
import { CancelSubscriptionUseCase } from './cancel-subscription.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PaymentGatewayFactory } from '../../infrastructure/factories/payment-gateway.factory';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PlanInterval, PaymentGateway } from '@prisma/client';

describe('CancelSubscriptionUseCase', () => {
    let useCase: CancelSubscriptionUseCase;
    let prismaService: jest.Mocked<PrismaService>;
    let gatewayFactory: jest.Mocked<PaymentGatewayFactory>;

    const mockPlan = {
        id: 'plan-id',
        name: 'pro',
        displayName: 'Pro Plan',
        price: 29.90,
        interval: PlanInterval.MONTHLY,
        active: true,
    };

    const mockUser = {
        id: 'user-id',
        email: 'user@example.com',
    };

    const mockSubscription = {
        id: 'sub-id',
        userId: 'user-id',
        planId: 'plan-id',
        status: 'ACTIVE',
        plan: mockPlan,
        user: mockUser,
    };

    const mockTransaction = {
        id: 'tx-id',
        userId: 'user-id',
        subscriptionId: 'sub-id',
        gatewayTxId: 'sub_stripe_123',
        type: 'SUBSCRIPTION_CREATE',
        createdAt: new Date(),
    };

    const mockGateway = {
        cancelSubscription: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CancelSubscriptionUseCase,
                {
                    provide: PrismaService,
                    useValue: {
                        subscription: {
                            findUnique: jest.fn(),
                            update: jest.fn(),
                        },
                        transaction: {
                            findFirst: jest.fn(),
                            create: jest.fn(),
                            update: jest.fn(),
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

        useCase = module.get<CancelSubscriptionUseCase>(CancelSubscriptionUseCase);
        prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
        gatewayFactory = module.get(PaymentGatewayFactory) as jest.Mocked<PaymentGatewayFactory>;
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should cancel subscription successfully', async () => {
            const newTransaction = { id: 'cancel-tx-id' };

            prismaService.subscription.findUnique.mockResolvedValue(mockSubscription as any);
            prismaService.transaction.findFirst.mockResolvedValue(mockTransaction as any);
            prismaService.transaction.create.mockResolvedValue(newTransaction as any);
            prismaService.transaction.update.mockResolvedValue({} as any);
            prismaService.subscription.update.mockResolvedValue({} as any);
            prismaService.activityLog.create.mockResolvedValue({} as any);

            mockGateway.cancelSubscription.mockResolvedValue(undefined);
            gatewayFactory.getActive.mockResolvedValue(mockGateway as any);

            await useCase.execute({
                userId: 'user-id',
                reason: 'Too expensive',
            });

            expect(mockGateway.cancelSubscription).toHaveBeenCalledWith('sub_stripe_123');
            expect(prismaService.subscription.update).toHaveBeenCalledWith({
                where: { id: 'sub-id' },
                data: {
                    status: 'CANCELED',
                    endDate: expect.any(Date),
                },
            });
            expect(prismaService.activityLog.create).toHaveBeenCalled();
        });

        it('should throw NotFoundException if subscription not found', async () => {
            prismaService.subscription.findUnique.mockResolvedValue(null);

            await expect(
                useCase.execute({
                    userId: 'user-id',
                }),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException if subscription already canceled', async () => {
            prismaService.subscription.findUnique.mockResolvedValue({
                ...mockSubscription,
                status: 'CANCELED',
            } as any);

            await expect(
                useCase.execute({
                    userId: 'user-id',
                }),
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if subscription already expired', async () => {
            prismaService.subscription.findUnique.mockResolvedValue({
                ...mockSubscription,
                status: 'EXPIRED',
            } as any);

            await expect(
                useCase.execute({
                    userId: 'user-id',
                }),
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if no gateway subscription found', async () => {
            prismaService.subscription.findUnique.mockResolvedValue(mockSubscription as any);
            prismaService.transaction.findFirst.mockResolvedValue(null);

            await expect(
                useCase.execute({
                    userId: 'user-id',
                }),
            ).rejects.toThrow(BadRequestException);
        });

        it('should mark transaction as FAILED on gateway error', async () => {
            const newTransaction = { id: 'cancel-tx-id' };
            const error = new Error('Gateway cancellation failed');

            prismaService.subscription.findUnique.mockResolvedValue(mockSubscription as any);
            prismaService.transaction.findFirst.mockResolvedValue(mockTransaction as any);
            prismaService.transaction.create.mockResolvedValue(newTransaction as any);
            prismaService.transaction.update.mockResolvedValue({} as any);

            mockGateway.cancelSubscription.mockRejectedValue(error);
            gatewayFactory.getActive.mockResolvedValue(mockGateway as any);

            await expect(
                useCase.execute({
                    userId: 'user-id',
                }),
            ).rejects.toThrow(error);

            expect(prismaService.transaction.update).toHaveBeenCalledWith({
                where: { id: 'cancel-tx-id' },
                data: {
                    status: 'FAILED',
                    errorMessage: error.message,
                },
            });
        });

        it('should include cancellation reason in transaction metadata', async () => {
            const newTransaction = { id: 'cancel-tx-id' };
            const reason = 'Service no longer needed';

            prismaService.subscription.findUnique.mockResolvedValue(mockSubscription as any);
            prismaService.transaction.findFirst.mockResolvedValue(mockTransaction as any);
            prismaService.transaction.create.mockResolvedValue(newTransaction as any);
            prismaService.transaction.update.mockResolvedValue({} as any);
            prismaService.subscription.update.mockResolvedValue({} as any);
            prismaService.activityLog.create.mockResolvedValue({} as any);

            mockGateway.cancelSubscription.mockResolvedValue(undefined);
            gatewayFactory.getActive.mockResolvedValue(mockGateway as any);

            await useCase.execute({
                userId: 'user-id',
                reason,
            });

            expect(prismaService.transaction.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    metadata: expect.objectContaining({
                        reason,
                    }),
                }),
            });
        });
    });
});
