import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { UpdateAlertUseCase } from './update-alert.use-case';
import { PrismaService } from '../../../../infrastructure/database/prisma.service';
import { UpdateAlertDto } from '../dto/update-alert.dto';
import { AlertCondition } from '../../domain/interfaces/alert.interface';

describe('UpdateAlertUseCase', () => {
    let useCase: UpdateAlertUseCase;
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
                UpdateAlertUseCase,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        useCase = module.get<UpdateAlertUseCase>(UpdateAlertUseCase);
        prismaService = module.get<PrismaService>(PrismaService);

        jest.clearAllMocks();
    });

    describe('execute', () => {
        const userId = 'user-123';
        const alertId = 'alert-456';
        const input: UpdateAlertDto = {
            targetPrice: 35.0,
            condition: AlertCondition.ABOVE,
        };

        it('should update alert successfully', async () => {
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
                targetPrice: 35.0,
                condition: AlertCondition.ABOVE,
                updatedAt: new Date(),
            };

            mockPrismaService.priceAlert.findUnique.mockResolvedValue(existingAlert);
            mockPrismaService.priceAlert.update.mockResolvedValue(updatedAlert);

            // When
            const result = await useCase.execute(userId, alertId, input);

            // Then
            expect(prismaService.priceAlert.findUnique).toHaveBeenCalledWith({
                where: { id: alertId },
            });
            expect(prismaService.priceAlert.update).toHaveBeenCalledWith({
                where: { id: alertId },
                data: input,
            });
            expect(result.targetPrice).toBe(35.0);
            expect(result.condition).toBe(AlertCondition.ABOVE);
        });

        it('should throw NotFoundException if alert does not exist', async () => {
            // Given
            mockPrismaService.priceAlert.findUnique.mockResolvedValue(null);

            // When / Then
            await expect(useCase.execute(userId, alertId, input)).rejects.toThrow(
                NotFoundException,
            );
            await expect(useCase.execute(userId, alertId, input)).rejects.toThrow(
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
            await expect(useCase.execute(userId, alertId, input)).rejects.toThrow(
                ForbiddenException,
            );
            await expect(useCase.execute(userId, alertId, input)).rejects.toThrow(
                'You can only update your own alerts',
            );
            expect(prismaService.priceAlert.update).not.toHaveBeenCalled();
        });
    });
});
