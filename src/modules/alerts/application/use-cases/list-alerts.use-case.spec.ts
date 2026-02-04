import { Test, TestingModule } from '@nestjs/testing';
import { ListAlertsUseCase } from './list-alerts.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { AlertCondition } from '../../domain/interfaces/alert.interface';

describe('ListAlertsUseCase', () => {
    let useCase: ListAlertsUseCase;
    let prismaService: PrismaService;

    const mockPrismaService = {
        priceAlert: {
            findMany: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ListAlertsUseCase,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        useCase = module.get<ListAlertsUseCase>(ListAlertsUseCase);
        prismaService = module.get<PrismaService>(PrismaService);

        jest.clearAllMocks();
    });

    describe('execute', () => {
        const userId = 'user-123';

        it('should list alerts for the user', async () => {
            // Given
            const mockAlerts = [
                {
                    id: 'alert-1',
                    userId,
                    assetId: 'asset-1',
                    targetPrice: 30.5,
                    condition: AlertCondition.BELOW,
                    isActive: true,
                    triggeredAt: null,
                    createdAt: new Date('2024-01-01'),
                    updatedAt: new Date('2024-01-01'),
                    asset: {
                        ticker: 'PETR4',
                        name: 'Petrobras',
                        currentPrice: 28.0,
                    },
                },
                {
                    id: 'alert-2',
                    userId,
                    assetId: 'asset-2',
                    targetPrice: 50.0,
                    condition: AlertCondition.ABOVE,
                    isActive: false,
                    triggeredAt: new Date('2024-01-02'),
                    createdAt: new Date('2024-01-01'),
                    updatedAt: new Date('2024-01-02'),
                    asset: {
                        ticker: 'VALE3',
                        name: 'Vale',
                        currentPrice: 52.0,
                    },
                },
            ];

            mockPrismaService.priceAlert.findMany.mockResolvedValue(mockAlerts);

            // When
            const result = await useCase.execute(userId);

            // Then
            expect(prismaService.priceAlert.findMany).toHaveBeenCalledWith({
                where: { userId },
                include: {
                    asset: {
                        select: {
                            ticker: true,
                            name: true,
                            currentPrice: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: undefined,
            });
            expect(result).toHaveLength(2);
            expect(result[0].id).toBe('alert-1');
            expect(result[0].asset.ticker).toBe('PETR4');
            expect(result[1].id).toBe('alert-2');
        });

        it('should return empty array if user has no alerts', async () => {
            // Given
            mockPrismaService.priceAlert.findMany.mockResolvedValue([]);

            // When
            const result = await useCase.execute(userId);

            // Then
            expect(result).toEqual([]);
            expect(result).toHaveLength(0);
        });

        it('should include asset information in the response', async () => {
            // Given
            const mockAlerts = [
                {
                    id: 'alert-1',
                    userId,
                    assetId: 'asset-1',
                    targetPrice: 30.5,
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
                },
            ];

            mockPrismaService.priceAlert.findMany.mockResolvedValue(mockAlerts);

            // When
            const result = await useCase.execute(userId);

            // Then
            expect(result[0].asset).toBeDefined();
            expect(result[0].asset.ticker).toBe('PETR4');
            expect(result[0].asset.name).toBe('Petrobras');
            expect(result[0].asset.currentPrice).toBe(28.0);
        });

        it('should respect limit parameter', async () => {
            // Given
            mockPrismaService.priceAlert.findMany.mockResolvedValue([]);

            // When
            await useCase.execute(userId, 10);

            // Then
            expect(prismaService.priceAlert.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    take: 10,
                }),
            );
        });
    });
});
