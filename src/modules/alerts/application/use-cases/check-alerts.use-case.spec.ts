import { Test, TestingModule } from '@nestjs/testing';
import { CheckAlertsUseCase } from './check-alerts.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { EmailNotificationService } from '../../infrastructure/services/email-notification.service';
import { AlertCondition } from '../../domain/interfaces/alert.interface';

describe('CheckAlertsUseCase', () => {
    let useCase: CheckAlertsUseCase;
    let prismaService: PrismaService;
    let notificationService: EmailNotificationService;

    const mockPrismaService = {
        priceAlert: {
            findMany: jest.fn(),
            update: jest.fn(),
        },
    };

    const mockNotificationService = {
        sendPriceAlert: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CheckAlertsUseCase,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
                {
                    provide: EmailNotificationService,
                    useValue: mockNotificationService,
                },
            ],
        }).compile();

        useCase = module.get<CheckAlertsUseCase>(CheckAlertsUseCase);
        prismaService = module.get<PrismaService>(PrismaService);
        notificationService = module.get<EmailNotificationService>(
            EmailNotificationService,
        );

        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('should trigger alert when price is ABOVE target', async () => {
            // Given
            const mockAlerts = [
                {
                    id: 'alert-1',
                    userId: 'user-1',
                    assetId: 'asset-1',
                    targetPrice: 30.0,
                    condition: AlertCondition.ABOVE,
                    isActive: true,
                    triggeredAt: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    asset: {
                        ticker: 'PETR4',
                        name: 'Petrobras',
                        currentPrice: 32.0, // Above target
                    },
                    user: {
                        id: 'user-1',
                        email: 'user@example.com',
                        name: 'Test User',
                    },
                },
            ];

            mockPrismaService.priceAlert.findMany.mockResolvedValue(mockAlerts);
            mockPrismaService.priceAlert.update.mockResolvedValue({});

            // When
            await useCase.execute();

            // Then
            expect(notificationService.sendPriceAlert).toHaveBeenCalledWith(
                'user@example.com',
                'Test User',
                'PETR4',
                32.0,
                30.0,
                AlertCondition.ABOVE,
            );
            expect(prismaService.priceAlert.update).toHaveBeenCalledWith({
                where: { id: 'alert-1' },
                data: {
                    isActive: false,
                    triggeredAt: expect.any(Date),
                },
            });
        });

        it('should trigger alert when price is BELOW target', async () => {
            // Given
            const mockAlerts = [
                {
                    id: 'alert-2',
                    userId: 'user-1',
                    assetId: 'asset-1',
                    targetPrice: 30.0,
                    condition: AlertCondition.BELOW,
                    isActive: true,
                    triggeredAt: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    asset: {
                        ticker: 'VALE3',
                        name: 'Vale',
                        currentPrice: 28.0, // Below target
                    },
                    user: {
                        id: 'user-1',
                        email: 'user@example.com',
                        name: 'Test User',
                    },
                },
            ];

            mockPrismaService.priceAlert.findMany.mockResolvedValue(mockAlerts);
            mockPrismaService.priceAlert.update.mockResolvedValue({});

            // When
            await useCase.execute();

            // Then
            expect(notificationService.sendPriceAlert).toHaveBeenCalledWith(
                'user@example.com',
                'Test User',
                'VALE3',
                28.0,
                30.0,
                AlertCondition.BELOW,
            );
            expect(prismaService.priceAlert.update).toHaveBeenCalled();
        });

        it('should trigger alert when price is EQUAL to target (within ±0.01)', async () => {
            // Given
            const mockAlerts = [
                {
                    id: 'alert-3',
                    userId: 'user-1',
                    assetId: 'asset-1',
                    targetPrice: 30.0,
                    condition: AlertCondition.EQUAL,
                    isActive: true,
                    triggeredAt: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    asset: {
                        ticker: 'ITUB4',
                        name: 'Itaú',
                        currentPrice: 30.005, // Equal within tolerance
                    },
                    user: {
                        id: 'user-1',
                        email: 'user@example.com',
                        name: 'Test User',
                    },
                },
            ];

            mockPrismaService.priceAlert.findMany.mockResolvedValue(mockAlerts);
            mockPrismaService.priceAlert.update.mockResolvedValue({});

            // When
            await useCase.execute();

            // Then
            expect(notificationService.sendPriceAlert).toHaveBeenCalled();
            expect(prismaService.priceAlert.update).toHaveBeenCalled();
        });

        it('should NOT trigger alert if condition is not met', async () => {
            // Given
            const mockAlerts = [
                {
                    id: 'alert-4',
                    userId: 'user-1',
                    assetId: 'asset-1',
                    targetPrice: 30.0,
                    condition: AlertCondition.ABOVE,
                    isActive: true,
                    triggeredAt: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    asset: {
                        ticker: 'PETR4',
                        name: 'Petrobras',
                        currentPrice: 28.0, // Below target, but condition is ABOVE
                    },
                    user: {
                        id: 'user-1',
                        email: 'user@example.com',
                        name: 'Test User',
                    },
                },
            ];

            mockPrismaService.priceAlert.findMany.mockResolvedValue(mockAlerts);

            // When
            await useCase.execute();

            // Then
            expect(notificationService.sendPriceAlert).not.toHaveBeenCalled();
            expect(prismaService.priceAlert.update).not.toHaveBeenCalled();
        });

        it('should deactivate alert after triggering', async () => {
            // Given
            const mockAlerts = [
                {
                    id: 'alert-5',
                    userId: 'user-1',
                    assetId: 'asset-1',
                    targetPrice: 30.0,
                    condition: AlertCondition.BELOW,
                    isActive: true,
                    triggeredAt: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    asset: {
                        ticker: 'PETR4',
                        name: 'Petrobras',
                        currentPrice: 28.0,
                    },
                    user: {
                        id: 'user-1',
                        email: 'user@example.com',
                        name: 'Test User',
                    },
                },
            ];

            mockPrismaService.priceAlert.findMany.mockResolvedValue(mockAlerts);
            mockPrismaService.priceAlert.update.mockResolvedValue({});

            // When
            await useCase.execute();

            // Then
            expect(prismaService.priceAlert.update).toHaveBeenCalledWith({
                where: { id: 'alert-5' },
                data: {
                    isActive: false,
                    triggeredAt: expect.any(Date),
                },
            });
        });

        it('should send email notification when alert is triggered', async () => {
            // Given
            const mockAlerts = [
                {
                    id: 'alert-6',
                    userId: 'user-1',
                    assetId: 'asset-1',
                    targetPrice: 50.0,
                    condition: AlertCondition.ABOVE,
                    isActive: true,
                    triggeredAt: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    asset: {
                        ticker: 'BBAS3',
                        name: 'Banco do Brasil',
                        currentPrice: 55.0,
                    },
                    user: {
                        id: 'user-1',
                        email: 'investor@example.com',
                        name: 'John Doe',
                    },
                },
            ];

            mockPrismaService.priceAlert.findMany.mockResolvedValue(mockAlerts);
            mockPrismaService.priceAlert.update.mockResolvedValue({});

            // When
            await useCase.execute();

            // Then
            expect(notificationService.sendPriceAlert).toHaveBeenCalledWith(
                'investor@example.com',
                'John Doe',
                'BBAS3',
                55.0,
                50.0,
                AlertCondition.ABOVE,
            );
        });

        it('should ignore inactive alerts', async () => {
            // Given
            const mockAlerts = []; // findMany filters by isActive: true

            mockPrismaService.priceAlert.findMany.mockResolvedValue(mockAlerts);

            // When
            await useCase.execute();

            // Then
            expect(prismaService.priceAlert.findMany).toHaveBeenCalledWith({
                where: {
                    isActive: true,
                    asset: {
                        currentPrice: { not: null },
                    },
                },
                include: {
                    asset: true,
                    user: true,
                },
            });
            expect(notificationService.sendPriceAlert).not.toHaveBeenCalled();
        });

        it('should ignore assets without price', async () => {
            // Given - findMany already filters assets with currentPrice: null
            mockPrismaService.priceAlert.findMany.mockResolvedValue([]);

            // When
            await useCase.execute();

            // Then
            expect(prismaService.priceAlert.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        asset: {
                            currentPrice: { not: null },
                        },
                    }),
                }),
            );
        });
    });
});
