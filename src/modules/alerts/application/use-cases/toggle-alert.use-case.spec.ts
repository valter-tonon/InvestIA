import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ToggleAlertUseCase } from './toggle-alert.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { AlertCondition } from '../../domain/interfaces/alert.interface';

describe('ToggleAlertUseCase', () => {
    let useCase: ToggleAlertUseCase;
    let prismaService: PrismaService;

    const mockPrismaService = {
        priceAlert: {
            findUnique: jest.fn(),
            update: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ToggleAlertUseCase,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        useCase = module.get<ToggleAlertUseCase>(ToggleAlertUseCase);
        prismaService = module.get<PrismaService>(PrismaService);

        jest.clearAllMocks();
    });

    describe('execute', () => {
        const userId = 'user-123';
        const alertId = 'alert-456';

        it('should toggle alert from active to inactive', async () => {
            // Given
            const existingAlert = {
                id: alertId,
                userId,
                assetId: 'asset-1',
                targetPrice: 30.0,
                condition: AlertCondition.BELOW,
                isActive: true,
                triggeredAt: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const updatedAlert = {
                ...existingAlert,
                isActive: false,
                updatedAt: new Date(),
            };

            mockPrismaService.priceAlert.findUnique.mockResolvedValue(existingAlert);
            mockPrismaService.priceAlert.update.mockResolvedValue(updatedAlert);

            // When
            const result = await useCase.execute(userId, alertId);

            // Then
            expect(prismaService.priceAlert.findUnique).toHaveBeenCalledWith({
                where: { id: alertId },
            });
            expect(prismaService.priceAlert.update).toHaveBeenCalledWith({
                where: { id: alertId },
                data: { isActive: false },
            });
            expect(result.isActive).toBe(false);
        });

        it('should toggle alert from inactive to active', async () => {
            // Given
            const existingAlert = {
                id: alertId,
                userId,
                assetId: 'asset-1',
                targetPrice: 30.0,
                condition: AlertCondition.BELOW,
                isActive: false,
                triggeredAt: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const updatedAlert = {
                ...existingAlert,
                isActive: true,
                updatedAt: new Date(),
            };

            mockPrismaService.priceAlert.findUnique.mockResolvedValue(existingAlert);
            mockPrismaService.priceAlert.update.mockResolvedValue(updatedAlert);

            // When
            const result = await useCase.execute(userId, alertId);

            // Then
            expect(prismaService.priceAlert.update).toHaveBeenCalledWith({
                where: { id: alertId },
                data: { isActive: true },
            });
            expect(result.isActive).toBe(true);
        });

        it('should throw NotFoundException if alert does not exist', async () => {
            // Given
            mockPrismaService.priceAlert.findUnique.mockResolvedValue(null);

            // When / Then
            await expect(useCase.execute(userId, alertId)).rejects.toThrow(
                NotFoundException,
            );
            await expect(useCase.execute(userId, alertId)).rejects.toThrow(
                `Alert ${alertId} not found`,
            );
            expect(prismaService.priceAlert.update).not.toHaveBeenCalled();
        });

        it('should throw ForbiddenException if alert does not belong to user', async () => {
            // Given
            const existingAlert = {
                id: alertId,
                userId: 'different-user-999',
                assetId: 'asset-1',
                targetPrice: 30.0,
                condition: AlertCondition.BELOW,
                isActive: true,
                triggeredAt: null,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            mockPrismaService.priceAlert.findUnique.mockResolvedValue(existingAlert);

            // When / Then
            await expect(useCase.execute(userId, alertId)).rejects.toThrow(
                ForbiddenException,
            );
            await expect(useCase.execute(userId, alertId)).rejects.toThrow(
                'You can only toggle your own alerts',
            );
            expect(prismaService.priceAlert.update).not.toHaveBeenCalled();
        });
    });
});
