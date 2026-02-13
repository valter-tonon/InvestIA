import { Test, TestingModule } from '@nestjs/testing';
import { HandleWebhookUseCase } from './handle-webhook.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';

describe('HandleWebhookUseCase', () => {
    let useCase: HandleWebhookUseCase;
    let prismaService: jest.Mocked<PrismaService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HandleWebhookUseCase,
                {
                    provide: PrismaService,
                    useValue: {
                        externalApiLog: {
                            create: jest.fn(),
                        },
                        subscription: {
                            upsert: jest.fn(),
                            updateMany: jest.fn(),
                        },
                        transaction: {
                            create: jest.fn(),
                            updateMany: jest.fn(),
                        },
                        activityLog: {
                            create: jest.fn(),
                        },
                    },
                },
            ],
        }).compile();

        useCase = module.get<HandleWebhookUseCase>(HandleWebhookUseCase);
        prismaService = module.get(PrismaService) as jest.Mocked<PrismaService>;
    });

    it('should be defined', () => {
        expect(useCase).toBeDefined();
    });

    describe('execute', () => {
        it('should log webhook event', async () => {
            const event = { type: 'unknown.event', data: { object: {} } };

            prismaService.externalApiLog.create.mockResolvedValue({} as any);

            await useCase.execute({ event, rawPayload: JSON.stringify(event) });

            expect(prismaService.externalApiLog.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    provider: 'STRIPE',
                    endpoint: '/webhooks',
                    success: true,
                }),
            });
        });

        describe('checkout.session.completed', () => {
            it('should handle checkout completed event', async () => {
                const event = {
                    type: 'checkout.session.completed',
                    data: {
                        object: {
                            customer: 'cus_123',
                            metadata: {
                                userId: 'user-id',
                                planId: 'plan-id',
                            },
                        },
                    },
                };

                prismaService.externalApiLog.create.mockResolvedValue({} as any);
                prismaService.subscription.upsert.mockResolvedValue({} as any);
                prismaService.activityLog.create.mockResolvedValue({} as any);

                await useCase.execute({ event, rawPayload: JSON.stringify(event) });

                expect(prismaService.subscription.upsert).toHaveBeenCalledWith({
                    where: { userId: 'user-id' },
                    create: expect.objectContaining({
                        userId: 'user-id',
                        planId: 'plan-id',
                        status: 'ACTIVE',
                    }),
                    update: { status: 'ACTIVE' },
                });
            });

            it('should skip if userId or planId missing', async () => {
                const event = {
                    type: 'checkout.session.completed',
                    data: {
                        object: {
                            customer: 'cus_123',
                            metadata: {},
                        },
                    },
                };

                prismaService.externalApiLog.create.mockResolvedValue({} as any);

                await useCase.execute({ event, rawPayload: JSON.stringify(event) });

                expect(prismaService.subscription.upsert).not.toHaveBeenCalled();
            });
        });

        describe('customer.subscription.created', () => {
            it('should update transaction status to SUCCEEDED', async () => {
                const event = {
                    type: 'customer.subscription.created',
                    data: {
                        object: {
                            id: 'sub_123',
                            metadata: { userId: 'user-id' },
                        },
                    },
                };

                prismaService.externalApiLog.create.mockResolvedValue({} as any);
                prismaService.transaction.updateMany.mockResolvedValue({ count: 1 } as any);

                await useCase.execute({ event, rawPayload: JSON.stringify(event) });

                expect(prismaService.transaction.updateMany).toHaveBeenCalledWith({
                    where: {
                        userId: 'user-id',
                        gatewayTxId: 'sub_123',
                        status: 'PROCESSING',
                    },
                    data: {
                        status: 'SUCCEEDED',
                        processedAt: expect.any(Date),
                    },
                });
            });
        });

        describe('customer.subscription.updated', () => {
            it('should update subscription status from Stripe status', async () => {
                const event = {
                    type: 'customer.subscription.updated',
                    data: {
                        object: {
                            id: 'sub_123',
                            status: 'active',
                            current_period_end: 1709251200,
                            metadata: { userId: 'user-id' },
                        },
                    },
                };

                prismaService.externalApiLog.create.mockResolvedValue({} as any);
                prismaService.subscription.updateMany.mockResolvedValue({ count: 1 } as any);
                prismaService.activityLog.create.mockResolvedValue({} as any);

                await useCase.execute({ event, rawPayload: JSON.stringify(event) });

                expect(prismaService.subscription.updateMany).toHaveBeenCalledWith({
                    where: { userId: 'user-id' },
                    data: {
                        status: 'ACTIVE',
                        endDate: expect.any(Date),
                    },
                });
            });

            it('should map trialing status to TRIAL', async () => {
                const event = {
                    type: 'customer.subscription.updated',
                    data: {
                        object: {
                            id: 'sub_123',
                            status: 'trialing',
                            current_period_end: 1709251200,
                            metadata: { userId: 'user-id' },
                        },
                    },
                };

                prismaService.externalApiLog.create.mockResolvedValue({} as any);
                prismaService.subscription.updateMany.mockResolvedValue({ count: 1 } as any);
                prismaService.activityLog.create.mockResolvedValue({} as any);

                await useCase.execute({ event, rawPayload: JSON.stringify(event) });

                expect(prismaService.subscription.updateMany).toHaveBeenCalledWith(
                    expect.objectContaining({
                        data: expect.objectContaining({ status: 'TRIAL' }),
                    })
                );
            });
        });

        describe('customer.subscription.deleted', () => {
            it('should cancel subscription and create transaction', async () => {
                const event = {
                    type: 'customer.subscription.deleted',
                    data: {
                        object: {
                            id: 'sub_123',
                            metadata: { userId: 'user-id' },
                        },
                    },
                };

                prismaService.externalApiLog.create.mockResolvedValue({} as any);
                prismaService.subscription.updateMany.mockResolvedValue({ count: 1 } as any);
                prismaService.transaction.create.mockResolvedValue({} as any);
                prismaService.activityLog.create.mockResolvedValue({} as any);

                await useCase.execute({ event, rawPayload: JSON.stringify(event) });

                expect(prismaService.subscription.updateMany).toHaveBeenCalledWith({
                    where: { userId: 'user-id' },
                    data: {
                        status: 'CANCELED',
                        endDate: expect.any(Date),
                    },
                });
                expect(prismaService.transaction.create).toHaveBeenCalled();
            });
        });

        describe('invoice.payment_succeeded', () => {
            it('should create renewal transaction', async () => {
                const event = {
                    type: 'invoice.payment_succeeded',
                    data: {
                        object: {
                            id: 'in_123',
                            amount_paid: 2990,
                            currency: 'brl',
                            subscription: 'sub_123',
                            subscription_details: {
                                metadata: { userId: 'user-id' },
                            },
                        },
                    },
                };

                prismaService.externalApiLog.create.mockResolvedValue({} as any);
                prismaService.transaction.create.mockResolvedValue({} as any);
                prismaService.activityLog.create.mockResolvedValue({} as any);

                await useCase.execute({ event, rawPayload: JSON.stringify(event) });

                expect(prismaService.transaction.create).toHaveBeenCalledWith({
                    data: expect.objectContaining({
                        amount: 29.90,
                        currency: 'BRL',
                        status: 'SUCCEEDED',
                        type: 'SUBSCRIPTION_RENEW',
                    }),
                });
            });
        });

        describe('invoice.payment_failed', () => {
            it('should create failed transaction and expire subscription', async () => {
                const event = {
                    type: 'invoice.payment_failed',
                    data: {
                        object: {
                            id: 'in_123',
                            amount_due: 2990,
                            currency: 'brl',
                            subscription: 'sub_123',
                            subscription_details: {
                                metadata: { userId: 'user-id' },
                            },
                        },
                    },
                };

                prismaService.externalApiLog.create.mockResolvedValue({} as any);
                prismaService.transaction.create.mockResolvedValue({} as any);
                prismaService.subscription.updateMany.mockResolvedValue({ count: 1 } as any);
                prismaService.activityLog.create.mockResolvedValue({} as any);

                await useCase.execute({ event, rawPayload: JSON.stringify(event) });

                expect(prismaService.transaction.create).toHaveBeenCalledWith({
                    data: expect.objectContaining({
                        status: 'FAILED',
                        errorMessage: 'Payment failed',
                    }),
                });
                expect(prismaService.subscription.updateMany).toHaveBeenCalledWith({
                    where: { userId: 'user-id' },
                    data: { status: 'EXPIRED' },
                });
            });
        });
    });
});
