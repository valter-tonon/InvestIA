import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { DeleteAlertUseCase } from './delete-alert.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { AlertCondition } from '../../domain/interfaces/alert.interface';

describe('DeleteAlertUseCase', () => {
    let useCase: DeleteAlertUseCase;
    let prismaService: PrismaService;

    const mockPrismaService = {
        priceAlert: {
            findUnique: jest.fn(),
            delete: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DeleteAlertUseCase,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        useCase = module.get<DeleteAlertUseCase>(DeleteAlertUseCase);
        prismaService = module.get<PrismaService>(PrismaService);

        jest.clearAllMocks();
    });

    describe('execute', () => {
        const userId = 'user-123';
        const alertId = 'alert-456';

        it('should delete alert successfully', async () => {
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

            mockPrismaService.priceAlert.findUnique.mockResolvedValue(existingAlert);
            mockPrismaService.priceAlert.delete.mockResolvedValue(existingAlert);

            // When
            await useCase.execute(userId, alertId);

            // Then
            expect(prismaService.priceAlert.findUnique).toHaveBeenCalledWith({
                where: { id: alertId },
            });
            expect(prismaService.priceAlert.delete).toHaveBeenCalledWith({
                where: { id: alertId },
            });
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
            expect(prismaService.priceAlert.delete).not.toHaveBeenCalled();
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
                'You can only delete your own alerts',
            );
            expect(prismaService.priceAlert.delete).not.toHaveBeenCalled();
        });
    });
});
