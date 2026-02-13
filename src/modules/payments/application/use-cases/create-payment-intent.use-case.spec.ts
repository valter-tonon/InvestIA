import { Test, TestingModule } from '@nestjs/testing';
import { CreatePaymentIntentUseCase } from './create-payment-intent.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { PaymentGatewayFactory } from '../../infrastructure/factories/payment-gateway.factory';
import { BadRequestException } from '@nestjs/common';

describe('CreatePaymentIntentUseCase', () => {
    let useCase: CreatePaymentIntentUseCase;
    let prismaService: jest.Mocked<PrismaService>;
    let gatewayFactory: jest.Mocked<PaymentGatewayFactory>;

    const mockPlan = {
        id: 'plan-id',
        name: 'Plano Pro',
        displayName: 'Plano Pro',
        description: 'Plano profissional',
        price: 29.90,
        interval: 'MONTHLY',
        features: {},
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockTransaction = {
        id: 'tx-id',
        userId: 'user-id',
        subscriptionId: null,
        gateway: 'STRIPE',
        gatewayTxId: 'pi_xxx',
        amount: 29.90,
        currency: 'BRL',
        status: 'PROCESSING',
        type: 'SUBSCRIPTION_CREATE',
        metadata: {},
        errorMessage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        processedAt: null,
    };

    const mockGateway = {
        createPaymentIntent: jest.fn().mockResolvedValue({
            id: 'pi_xxx',
            clientSecret: 'pi_xxx_secret_yyy',
            status: 'requires_payment_method',
            amount: 29.90,
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreatePaymentIntentUseCase,
                {
                    provide: PrismaService,
                    useValue: {
                        plan: {
                            findUnique: jest.fn(),
                        },
                        transaction: {
                            create: jest.fn(),
                            update: jest.fn(),
                        },
                    },
                },
                {
                    provide: PaymentGatewayFactory,
                    useValue: {
                        getActiveGatewayType: jest.fn().mockResolvedValue('STRIPE'),
                        getActive: jest.fn().mockResolvedValue(mockGateway),
                    },
                },
            ],
        }).compile();

        useCase = module.get<CreatePaymentIntentUseCase>(CreatePaymentIntentUseCase);
        prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
        gatewayFactory = module.get(PaymentGatewayFactory) as jest.Mocked<PaymentGatewayFactory>;
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should create payment intent successfully', async () => {
            prismaService.plan.findUnique.mockResolvedValue(mockPlan as any);
            prismaService.transaction.create.mockResolvedValue(mockTransaction as any);
            prismaService.transaction.update.mockResolvedValue({ ...mockTransaction, gatewayTxId: 'pi_xxx', status: 'PROCESSING' } as any);

            const result = await useCase.execute({
                userId: 'user-id',
                planId: 'plan-id',
            });

            expect(result).toEqual({
                clientSecret: 'pi_xxx_secret_yyy',
                paymentIntentId: 'pi_xxx',
                amount: 29.90,
                currency: 'BRL',
            });

            expect(prismaService.plan.findUnique).toHaveBeenCalledWith({
                where: { id: 'plan-id' },
            });

            expect(prismaService.transaction.create).toHaveBeenCalled();
            expect(mockGateway.createPaymentIntent).toHaveBeenCalled();
        });

        it('should throw error if plan not found', async () => {
            prismaService.plan.findUnique.mockResolvedValue(null);

            await expect(
                useCase.execute({
                    userId: 'user-id',
                    planId: 'invalid-plan',
                }),
            ).rejects.toThrow(BadRequestException);
        });

        it('should throw error if plan is inactive', async () => {
            prismaService.plan.findUnique.mockResolvedValue({
                ...mockPlan,
                active: false,
            } as any);

            await expect(
                useCase.execute({
                    userId: 'user-id',
                    planId: 'plan-id',
                }),
            ).rejects.toThrow(BadRequestException);
        });

        it('should mark transaction as FAILED on gateway error', async () => {
            prismaService.plan.findUnique.mockResolvedValue(mockPlan as any);
            prismaService.transaction.create.mockResolvedValue(mockTransaction as any);

            const error = new Error('Payment gateway error');
            mockGateway.createPaymentIntent.mockRejectedValue(error);

            await expect(
                useCase.execute({
                    userId: 'user-id',
                    planId: 'plan-id',
                }),
            ).rejects.toThrow('Payment gateway error');

            expect(prismaService.transaction.update).toHaveBeenCalledWith({
                where: { id: mockTransaction.id },
                data: expect.objectContaining({
                    status: 'FAILED',
                    errorMessage: 'Payment gateway error',
                }),
            });
        });
    });
});
